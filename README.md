# [A]RGUS

Trustless JWKS Registry on Starknet — permissionless RSA public key registration via zkTLS proofs.

Google, Apple, and Firebase rotate their RSA signing keys periodically. Argus lets anyone register those keys on-chain by submitting a [Reclaim Protocol](https://reclaimprotocol.org) zkTLS proof that cryptographically attests the key was fetched over TLS from the declared HTTPS endpoint. No admin, no trust required.

---

## How It Works

1. **JWKS Endpoint** — Google/Apple/Firebase publish RSA public keys at standard HTTPS endpoints.
2. **zkTLS Proof via Reclaim** — Reclaim Protocol generates a cryptographic proof that the HTTP response is authentic, without trusting any intermediary server.
3. **On-chain RSA Verification** — Argus verifies the proof on-chain using 2048-bit Montgomery arithmetic, then writes the verified key to the JWKSRegistry contract. Anyone can submit.

## Security Model

- **Provider identity** — verified by Poseidon hash of the JWKS endpoint URL extracted from the Reclaim proof parameters. Only hardcoded endpoints are accepted; the URL never changes.
- **kid and RSA modulus n** — parsed from the proof context and asserted against the submitted key.
- **Montgomery constants** — `n_prime` and `r_sq` are verified mathematically on-chain, preventing griefing via malformed constants.
- **zkTLS proof** — Reclaim Protocol cryptographically attests that the JWKS response was fetched over TLS from the declared URL.

---

## Contracts

### Addresses

| Network | Contract | Address |
|---------|----------|---------|
| Mainnet | Argus | `0x058b886f831d15a865f6e007f21eb1c77a6a4e943f867e23c5293289c969d101` |
| Mainnet | JWKSRegistry | `0x04dc4a75126ad6b26eae2e1e5d17f7e5436cfe7a2e168b1326d0ac1704aa563e` |
| Sepolia | Argus | `0x065a77e8b23a20a804124dc33040b7a0e36c17f34596124caf81f64a27815b56` |
| Sepolia | JWKSRegistry | `0x0514157c3e910e6b733af913eddf1a38c63ea1e31be338bebc622265218f5bb4` |

Latest class hash: `0x24c091963cb42fdeed6b381d70c90cbdea4730f4fecfb38f5471868fb4236c7`

### Supported Providers

| Provider | JWKS URL | On-chain label |
|----------|----------|----------------|
| Google | `https://www.googleapis.com/oauth2/v3/certs` | `0x676f6f676c65` |
| Apple | `https://appleid.apple.com/auth/keys` | `0x6170706c65` |
| Firebase | `https://cavos.xyz/.well-known/jwks.json` | `0x6669726562617365` |

### Build

```bash
cd contracts
scarb build
```

Requires [Scarb](https://docs.swmansion.com/scarb/) with Cairo edition `2024_07`, starknet `2.14.0`.

### Structure

```
contracts/
├── Scarb.toml
└── src/
    ├── lib.cairo
    ├── argus.cairo          # Main contract — register_key, upgrade
    ├── jwks_registry.cairo  # JWKSRegistry — set_key, get_key, is_key_valid
    ├── rsa/
    │   ├── bignum.cairo     # 2048-bit Montgomery arithmetic
    │   └── rsa_verify.cairo # RSA-SHA256 PKCS#1 v1.5 verification
    ├── jwt/
    │   └── base64.cairo     # Base64URL decoder
    └── utils/
        └── base64url.cairo  # Re-exports from jwt/base64
```

### Key Interfaces

```cairo
// Register a JWK backed by a Reclaim proof — permissionless
fn register_key(ref self: TContractState, proof: Proof, kid: felt252, key: JWKSKey);

// Check if a key is valid (exists, active, not expired)
fn is_key_valid(self: @TContractState, kid: felt252) -> bool;

// Get a key by kid, asserting validity — single call for JWT verification
fn get_key_if_valid(self: @TContractState, kid: felt252) -> JWKSKey;
```

---

## Website

```bash
cd web
npm install
npm run dev
```

- `/` — Landing page with how it works, supported providers, and contract addresses
- `/registry` — Live table of all kids from Google/Apple/Firebase with on-chain validity status (Sepolia + Mainnet)
- `/docs` — Contract addresses, ABIs, starknet.js code example, and security model

### Reading a key with starknet.js

```typescript
import { RpcProvider, Contract } from 'starknet';

function kidToFelt(kid: string): string {
  const bytes = Buffer.from(kid, 'utf8');
  let felt = 0n;
  for (let i = 0; i < Math.min(bytes.length, 31); i++) {
    felt = felt * 256n + BigInt(bytes[i]);
  }
  return '0x' + felt.toString(16);
}

const provider = new RpcProvider({ nodeUrl: 'https://rpc.starknet.lava.build' });
const contract = new Contract(abi, '0x04dc4a75126ad6b26eae2e1e5d17f7e5436cfe7a2e168b1326d0ac1704aa563e', provider);

const isValid = await contract.is_key_valid(kidToFelt(kid));
```

---

## Repository Structure

```
argus/
├── contracts/   # Scarb project — Cairo contracts
└── web/         # Next.js 15 website
```

---

Built by [Cavos](https://cavos.xyz).
