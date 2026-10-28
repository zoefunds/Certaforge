# Verification status

## Current verified result

The release currently published in this repository passed the following gates
on 28 October 2026:

| Gate | Result |
| --- | --- |
| Direct Mode and source-level test suite | `60 passed` |
| GenVM contract lint | `passed (3 checks)` |
| Prohibited-identity scan of source and filenames | `passed` |
| Studionet deployment finalization | `FINALIZED` |
| Studionet validator consensus | `MAJORITY_AGREE` |
| Local/deployed source equivalence | `passed` |
| Live funded Studionet lifecycle | `ACCEPTED` |
| Live E2E coverage | `[1, 1, 1, 1, 0, 0]`, zero blockers |
| Live E2E transactions | `13 finalized`, all `MAJORITY_AGREE` |
| Live E2E settlement | 1 GEN credited and withdrawn; zero residual credits |
| Independent on-chain reverification | `passed` |
| CertaForge hosted GitHub Actions | unavailable before step execution; not green CI |

## Coverage

The automated suite verifies:

- immutable release terms and escrow allocation;
- normalized GenLayer address arguments;
- sealing deadlines, baseline ancestry, required checks, and source hashes;
- complete sealed-tree discovery and truncated-tree rejection;
- file-size, blob-hash, and inventory bounds;
- deterministic Python and JavaScript import resolution;
- unresolved local dependency rejection;
- complete component, edge, and obligation coverage;
- validator-backed semantic decisions and fail-closed malformed results;
- accepted, rejected, challenged, expired, and indeterminate outcomes;
- withdrawals, refunds, and first-credit accounting;
- source-level guards for security-critical protocol invariants; and
- absence of excluded project identities from the deliverable.

## Commands

```sh
pytest -q
genvm-lint contracts/certaforge.py
npm install
npm run verify:e2e
```

The Python suite and GenVM lint are local deterministic gates. The E2E verifier
is a read-only network gate that independently re-fetches all 13 finalized
Studionet transactions, compares their execution hashes, reads release `1`, and
checks its certificate and zero post-withdraw credit balances.

The on-chain source-equivalence result is independently recorded in
`artifacts/deployment.studionet.json`. A later source change invalidates the
current deployment equivalence and requires a fresh deployment before these
documents may describe the changed source as deployed.

The detailed funded lifecycle and every explorer-linked transaction are in
`docs/E2E.md`; the complete machine-readable record is in
`artifacts/live-e2e.studionet.json`.

## Hosted CI limitation

The repository includes `.github/workflows/ci.yml`, but GitHub currently fails
its hosted jobs before any workflow step begins. The affected jobs expose zero
steps and no log. Accordingly, this documentation does not claim a passing
CertaForge GitHub Actions run. The green public GitHub checks sealed by the live
E2E belong to the explicitly identified evidence target in `docs/E2E.md`; they
are separate from CertaForge's 60-test local result.
