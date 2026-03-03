## What does this PR do?

<!-- A concise description of the change and why it's needed. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Gas optimization (Cairo)
- [ ] Refactor / cleanup
- [ ] Docs / website
- [ ] Tests only

## Related issue

Closes #<!-- issue number, if applicable -->

## Changes

<!-- List the key changes made. Be specific enough that a reviewer can follow without reading every line. -->

-
-

## Testing

<!-- How did you verify this works? -->

- [ ] `cd contracts && scarb build` passes
- [ ] `cd contracts && scarb test` passes (if contracts changed)
- [ ] `cd web && npm run build` passes (if web changed)
- [ ] Tested locally against Sepolia / Mainnet (if contract interaction changed)

## Notes for reviewers

<!-- Anything the reviewer should pay particular attention to, known trade-offs, or follow-up work. -->

---

**For contract changes**: if this modifies `register_key` calldata format, mark it as a breaking change and describe the migration path.
