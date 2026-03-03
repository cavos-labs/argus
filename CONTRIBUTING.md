# Contributing to Argus

Thanks for your interest in contributing. Argus is split into two parts — Cairo contracts (`contracts/`) and a Next.js website (`web/`). Contributions to both are welcome.

## Before You Start

- Check [open issues](../../issues) to avoid duplicate work.
- For significant changes (new providers, contract architecture changes, security-sensitive logic), open an issue first to discuss the approach before writing code.
- Security vulnerabilities should **not** be reported as public issues — see [Security](#security) below.

---

## Development Setup

### Contracts

Requires [Scarb](https://docs.swmansion.com/scarb/) ≥ 2.14.0.

```bash
cd contracts
scarb build        # compile
scarb test         # run tests (requires snforge)
```

### Website

Requires Node.js ≥ 20.

```bash
cd web
npm install
npm run dev        # starts at localhost:3000
```

The API route (`/api/keys`) calls public Starknet RPC endpoints by default. You can override them with env vars:

```bash
STARKNET_RPC_MAINNET=https://...
STARKNET_RPC_SEPOLIA=https://...
```

---

## Contribution Areas

### Contracts

- **New providers** — adding a new JWKS provider requires a new hardcoded URL hash constant in `argus.cairo` and a new provider label felt252. Open an issue first; new providers are a deliberate security decision.
- **Gas optimizations** — improvements to `rsa/bignum.cairo` (Montgomery arithmetic, schoolbook multiplication unrolling) are welcome. Include benchmarks.
- **Tests** — additional test coverage in `snforge` for edge cases, malformed proofs, or boundary conditions.
- **Bug fixes** — correctness issues in RSA verification, base64url decoding, or JSON field parsing.

### Website

- **UI improvements** — the registry table, landing page, and docs pages are all fair game.
- **API route** — improvements to key fetching, caching, or error handling.
- **Docs** — clearer explanations, better code examples, or additional integration guides.

---

## Pull Request Guidelines

1. **One concern per PR** — keep PRs focused. A PR that fixes a bug and adds a feature is harder to review.
2. **Tests for contracts** — any change to Cairo logic should include or update `snforge` tests.
3. **Build must pass**:
   ```bash
   cd contracts && scarb build
   cd web && npm run build
   ```
4. **No breaking calldata changes** without a version bump and migration notes. The `register_key` calldata format is consumed by external tooling.
5. **Describe the why** — the PR description should explain the motivation, not just what changed.

---

## Commit Style

Use short imperative subject lines:

```
fix: verify n_prime before r_sq in register_key
feat: add Firebase provider support
docs: update contract addresses for mainnet
chore: bump starknet dependency to 2.15.0
```

---

## Security

Do not open public issues for security vulnerabilities. Contact the Cavos team directly at **security@cavos.xyz** with a description of the issue and steps to reproduce. We will respond within 48 hours.

In-scope for responsible disclosure:
- Incorrect RSA verification logic in Cairo contracts
- Provider whitelisting bypass
- Montgomery constant verification gaps
- On-chain griefing vectors

---

## Code Style

### Cairo

- Follow the existing module structure (`crate::` imports, `super::` for same-file scope).
- Keep functions small and named after what they assert/compute.
- Prefer explicit `assert!` messages.

### TypeScript / Next.js

- No `any` casts without a comment explaining why.
- Server components for static content, client components only when state or browser APIs are needed.
- API routes should handle errors explicitly — avoid silently returning empty/false results.

---

## License

By submitting a pull request, you agree that your contribution will be licensed under the same license as this repository.
