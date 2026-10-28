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
```

The on-chain source-equivalence result is independently recorded in
`artifacts/deployment.studionet.json`. A later source change invalidates the
current deployment equivalence and requires a fresh deployment before these
documents may describe the changed source as deployed.
