/// Argus — Trustless JWKS Registry v2
///
/// Permissionless registration of RSA public keys via Reclaim Protocol proofs.
///
/// Upgradeability: a single `upgrade_admin` address can call `replace_class`
/// This will be deleted for mainnet deployment, the contract will only support
/// Google and Apple.
///
/// TODO: support Firebase from Cavos official website for Email and password authentication
///
/// Security model:
///   - Provider identity is verified by comparing the Reclaim proof's JWKS URL hash
///     against hardcoded Poseidon hashes for Google, Apple, and Cavos Firebase.
///   - kid and RSA modulus n are verified against proof context fields.
///   - Montgomery constants removed (Tier 5): RSA witnesses are provided in calldata
///     and verified on-chain using Schwartz-Zippel polynomial identity testing.

use starknet::ContractAddress;

// ── Reclaim Protocol types

#[derive(Serde, Drop, Debug)]
pub struct ClaimInfo {
    pub provider: ByteArray,
    pub parameters: ByteArray,
    pub context: ByteArray,
}

#[derive(Serde, Drop, Debug)]
pub struct ReclaimSignature {
    pub r: u256,
    pub s: u256,
    pub v: u32,
}

#[derive(Serde, Drop, Debug)]
pub struct CompleteClaimData {
    pub identifier: u256,
    pub byte_identifier: ByteArray,
    pub owner: ByteArray,
    pub epoch: ByteArray,
    pub timestamp_s: ByteArray,
}

#[derive(Serde, Drop, Debug)]
pub struct SignedClaim {
    pub claim: CompleteClaimData,
    pub signatures: Array<ReclaimSignature>,
}

#[derive(Serde, Drop, Debug)]
pub struct Proof {
    pub id: felt252,
    pub claim_info: ClaimInfo,
    pub signed_claim: SignedClaim,
}

#[starknet::interface]
trait IReclaim<TContractState> {
    fn verify_proof(ref self: TContractState, proof: Proof);
}
use starknet::ClassHash;

// ── Argus interface
// ────────────────────────────────────────────────────────────

use crate::jwks_registry::JWKSKey;

#[starknet::interface]
pub trait IArgus<TContractState> {
    /// Register a JWK backed by a Reclaim proof. Permissionless — any caller may submit.
    ///
    /// The proof's providerHash must match one of the hardcoded Google or Apple provider IDs.
    /// kid and RSA modulus n are verified against the proof context.
    fn register_key(ref self: TContractState, proof: Proof, kid: felt252, key: JWKSKey);

    /// Replace the contract's class hash. Only callable by upgrade_admin.
    /// Emergency escape hatch for provider endpoint changes.
    fn upgrade(ref self: TContractState, new_class_hash: ClassHash);

    /// Return the upgrade admin address.
    fn get_upgrade_admin(self: @TContractState) -> ContractAddress;
}

// ── Contract
// ───────────────────────────────────────────────────────────────────

#[starknet::contract]
pub mod Argus {
    use core::poseidon::poseidon_hash_span;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::syscalls::replace_class_syscall;
    use starknet::{ClassHash, ContractAddress, SyscallResultTrait, get_caller_address};
    use crate::jwks_registry::{IJWKSRegistryDispatcher, IJWKSRegistryDispatcherTrait, JWKSKey};
    use crate::jwt::base64::base64url_decode;
    use super::{IArgus, IReclaimDispatcher, IReclaimDispatcherTrait, Proof};

    // ── Hardcoded JWKS endpoint URL hashes
    // ───────────────────────────────────────────
    // Verifying by URL (extracted from proof.claim_info.parameters "url" field) instead of
    // providerHash (from proof.claim_info.context) makes the contract compatible with any
    // regex configuration — including per-kid exact-match regexes — while remaining
    // fully immutable and trustless. The JWKS endpoint URLs never change; providerHash
    // changes with every different responseMatches configuration.
    //
    // Values: poseidon_hash_span(serialize_bytearray(url_string))
    //   GOOGLE: hash_bytearray("https://www.googleapis.com/oauth2/v3/certs")
    //   APPLE:   hash_bytearray("https://appleid.apple.com/auth/keys")
    //   CAVOS:   hash_bytearray("https://cavos.xyz/.well-known/jwks.json")
    const GOOGLE_JWKS_URL_HASH: felt252 =
        0x5d0f6a0095ecd091f1fc24c38367644e4ff5f4d8facb6fb2a96cb303f1d3e58;
    const APPLE_JWKS_URL_HASH: felt252 =
        0x727dd48aaaca91fa4058b351266e69106b68058ef57cdf8e073c79fcbad4607;
    const CAVOS_FIREBASE_JWKS_URL_HASH: felt252 =
        0x5ce128d7bed38fb8a9d57e9231fe9a56685a9c8aa35b92ec9e7f313ed6f27b5;

    // Provider labels stored in JWKSKey.provider
    const PROVIDER_GOOGLE: felt252 = 0x676f6f676c65; // 'google'
    const PROVIDER_APPLE: felt252 = 0x6170706c65; // 'apple'
    const PROVIDER_FIREBASE: felt252 = 0x6669726562617365; // 'firebase'

    // ── Storage
    // ───────────────────────────────────────────────────────────────

    #[storage]
    struct Storage {
        upgrade_admin: ContractAddress,
        reclaim_contract: ContractAddress,
        jwks_registry: ContractAddress,
    }

    // ── Events
    // ────────────────────────────────────────────────────────────────

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        KeyRegistered: KeyRegistered,
        Upgraded: Upgraded,
    }

    #[derive(Drop, starknet::Event)]
    struct KeyRegistered {
        kid: felt252,
        provider: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct Upgraded {
        new_class_hash: ClassHash,
    }

    // ── Constructor
    // ───────────────────────────────────────────────────────────

    #[constructor]
    fn constructor(
        ref self: ContractState,
        upgrade_admin: ContractAddress,
        reclaim_contract: ContractAddress,
        jwks_registry: ContractAddress,
    ) {
        self.upgrade_admin.write(upgrade_admin);
        self.reclaim_contract.write(reclaim_contract);
        self.jwks_registry.write(jwks_registry);
    }

    // ── External implementation
    // ───────────────────────────────────────────────

    #[abi(embed_v0)]
    impl ArgusImpl of IArgus<ContractState> {
        fn register_key(ref self: ContractState, proof: Proof, kid: felt252, key: JWKSKey) {
            // Step 1: Extract the "url" field from proof.claim_info.parameters and verify
            // it matches one of the hardcoded Google or Apple JWKS endpoints.
            let url = find_json_string_value(@proof.claim_info.parameters, @"url");
            let url_hash = hash_bytearray(@url);
            let provider_felt: felt252 = if url_hash == GOOGLE_JWKS_URL_HASH {
                PROVIDER_GOOGLE
            } else if url_hash == APPLE_JWKS_URL_HASH {
                PROVIDER_APPLE
            } else if url_hash == CAVOS_FIREBASE_JWKS_URL_HASH {
                PROVIDER_FIREBASE
            } else {
                panic!("JWKS URL not whitelisted")
            };

            // Step 2: Parse kid from proof context and verify it matches the submitted full-string
            // hash.
            let kid_from_proof = find_json_string_value(@proof.claim_info.context, @"kid");
            let kid_felt_from_proof = hash_bytearray(@kid_from_proof);
            assert!(kid_felt_from_proof == kid, "kid mismatch: proof vs submitted");

            // Step 3: Parse the base64url-encoded RSA modulus n from the proof context.
            let n_b64 = find_json_string_value(@proof.claim_info.context, @"n");
            let n_b64_len = n_b64.len();
            let n_bytes = base64url_decode(@n_b64, 0, n_b64_len);

            // Step 4: Convert the raw modulus bytes to 17 x 123-bit limbs (little-endian).
            let computed_limbs = bytes_to_u123_limbs(@n_bytes);

            // Step 5: Assert every limb matches — the critical anti-substitution check.
            verify_n_limbs(@computed_limbs, @key);

            // Step 6: The key's declared provider must match the whitelisted label.
            assert!(key.provider == provider_felt, "key.provider mismatch");

            // Step 7: Verify the Reclaim proof cryptographically. Placed last to consume
            // `proof` after all snapshot accesses are complete.
            IReclaimDispatcher { contract_address: self.reclaim_contract.read() }
                .verify_proof(proof);

            // Step 8: Write the verified key to the JWKS registry.
            IJWKSRegistryDispatcher { contract_address: self.jwks_registry.read() }
                .set_key(kid, key);

            self.emit(KeyRegistered { kid, provider: provider_felt });
        }

        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            assert!(get_caller_address() == self.upgrade_admin.read(), "Only upgrade admin");
            replace_class_syscall(new_class_hash).unwrap_syscall();
            self.emit(Upgraded { new_class_hash });
        }

        fn get_upgrade_admin(self: @ContractState) -> ContractAddress {
            self.upgrade_admin.read()
        }
    }

    // ── Internal helpers
    // ──────────────────────────────────────────────────────

    /// Hash a `ByteArray` to a `felt252` via Poseidon for provider identity checks.
    fn hash_bytearray(s: @ByteArray) -> felt252 {
        let mut serialized: Array<felt252> = array![];
        s.serialize(ref serialized);
        poseidon_hash_span(serialized.span())
    }

    /// Find the string value of a JSON field by name.
    /// Searches for `"field":"value"` in the JSON ByteArray.
    fn find_json_string_value(json: @ByteArray, field: @ByteArray) -> ByteArray {
        let field_len = field.len();
        let json_len = json.len();
        let min_len = field_len + 4;

        let mut i: usize = 0;
        let value_start: usize = loop {
            assert!(i + min_len <= json_len, "JSON field not found");

            if json.at(i).unwrap() == '"' {
                let mut matches = true;
                let mut k: usize = 0;
                while k < field_len {
                    if json.at(i + 1 + k).unwrap() != field.at(k).unwrap() {
                        matches = false;
                        break;
                    }
                    k += 1;
                }

                if matches
                    && json.at(i + 1 + field_len).unwrap() == '"'
                    && json.at(i + 2 + field_len).unwrap() == ':'
                    && json.at(i + 3 + field_len).unwrap() == '"' {
                    break i + 4 + field_len;
                }
            }
            i += 1;
        };

        let mut value: ByteArray = "";
        let mut j: usize = value_start;
        while j < json_len {
            let c = json.at(j).unwrap();
            if c == '"' {
                break;
            }
            value.append_byte(c);
            j += 1;
        }
        value
    }

    /// Convert 256 big-endian bytes to 17 × 123-bit limbs in little-endian order.
    fn bytes_to_u123_limbs(bytes: @Array<u8>) -> Array<u128> {
        let total_bits = bytes.len() * 8;
        let limb_bits: usize = 123;
        let limb_count: usize = 17;
        let mut limbs: Array<u128> = array![];

        let mut limb_index: usize = 0;
        while limb_index < limb_count {
            let start_bit = limb_index * limb_bits;
            let mut acc: u128 = 0;
            let mut bit_weight: u128 = 1;
            let mut bit: usize = 0;

            while bit < limb_bits && start_bit + bit < total_bits {
                let absolute_bit = start_bit + bit;
                let byte_index = bytes.len() - 1 - (absolute_bit / 8);
                let bit_index_in_byte = absolute_bit % 8;
                let byte: u128 = (*bytes.at(byte_index)).into();
                let divisor: u128 = match bit_index_in_byte {
                    0 => 1,
                    1 => 2,
                    2 => 4,
                    3 => 8,
                    4 => 16,
                    5 => 32,
                    6 => 64,
                    _ => 128,
                };
                let bit_value = (byte / divisor) % 2;
                acc = acc + bit_value * bit_weight;
                bit_weight = bit_weight * 2;
                bit += 1;
            }

            limbs.append(acc);
            limb_index += 1;
        }

        limbs
    }

    /// Assert all 17 RSA modulus limbs match the submitted key.
    fn verify_n_limbs(computed: @Array<u128>, key: @JWKSKey) {
        assert!(*computed.at(0) == *key.n0, "RSA modulus limb 0 mismatch");
        assert!(*computed.at(1) == *key.n1, "RSA modulus limb 1 mismatch");
        assert!(*computed.at(2) == *key.n2, "RSA modulus limb 2 mismatch");
        assert!(*computed.at(3) == *key.n3, "RSA modulus limb 3 mismatch");
        assert!(*computed.at(4) == *key.n4, "RSA modulus limb 4 mismatch");
        assert!(*computed.at(5) == *key.n5, "RSA modulus limb 5 mismatch");
        assert!(*computed.at(6) == *key.n6, "RSA modulus limb 6 mismatch");
        assert!(*computed.at(7) == *key.n7, "RSA modulus limb 7 mismatch");
        assert!(*computed.at(8) == *key.n8, "RSA modulus limb 8 mismatch");
        assert!(*computed.at(9) == *key.n9, "RSA modulus limb 9 mismatch");
        assert!(*computed.at(10) == *key.n10, "RSA modulus limb 10 mismatch");
        assert!(*computed.at(11) == *key.n11, "RSA modulus limb 11 mismatch");
        assert!(*computed.at(12) == *key.n12, "RSA modulus limb 12 mismatch");
        assert!(*computed.at(13) == *key.n13, "RSA modulus limb 13 mismatch");
        assert!(*computed.at(14) == *key.n14, "RSA modulus limb 14 mismatch");
        assert!(*computed.at(15) == *key.n15, "RSA modulus limb 15 mismatch");
        assert!(*computed.at(16) == *key.n16, "RSA modulus limb 16 mismatch");
    }
}
