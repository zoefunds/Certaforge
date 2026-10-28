# CertaForge

CertaForge is a standalone GenLayer intelligent contract for escrow-backed,
pre-sealed software release attestations. It freezes a repository release,
verifies scoped source inventory and required runtime checks, evaluates every
dependency component, supports certificate challenges, and settles escrow only
after complete evidence coverage.

## Current release

The current production source is [`contracts/certaforge.py`](contracts/certaforge.py),
whose contract class is `CertaForge`.

| Item | Current value |
| --- | --- |
| Network | GenLayer Studionet |
| Chain ID | `61999` |
| Contract | `0x7C20CF9737F69480Ad7C22c4cF6f5F5574f4e204` |
| Deployment transaction | `0xb03e901899283a0963fcaf77f05503780bc719b20a9fee6671b6b3e0264f4e05` |
| Deployment consensus | `MAJORITY_AGREE` |
| Transaction status | `FINALIZED` |
| Source SHA-256 | `aa1255c639da0939bdcabaaf8c6030017f5891111ab57e072e959bf9eb3a0981` |
| Source equivalence | Local and deployed source hashes match |
| Latest verification | 60 tests passed; GenVM lint passed |

- [View the deployment transaction](https://explorer-studio.genlayer.com/tx/0xb03e901899283a0963fcaf77f05503780bc719b20a9fee6671b6b3e0264f4e05)
- [Deployment procedure and evidence](docs/DEPLOYMENT.md)
- [Verification status](docs/VERIFICATION.md)
- [Machine-readable deployment record](artifacts/deployment.studionet.json)

## Contract lifecycle

1. A sponsor opens a release with immutable repository, baseline, obligations,
   scope, required checks, implementer, and sealing deadline.
2. Funds are deposited and allocated to the draft release.
3. The implementer seals a commit while the sealing window is open.
4. The contract inventories the sealed tree and verifies scoped file contents.
5. It builds and reviews a deterministic dependency graph.
6. Every component is assessed against every obligation and runtime check.
7. A certificate enters a challenge window before acceptance, rejection, or
   an indeterminate refund becomes settleable.
8. Entitled accounts withdraw credited funds.

## Local verification

Use a Python environment supported by the pinned dependencies in
`requirements.txt`:

```sh
python3 -m pip install -r requirements.txt
pytest -q
genvm-lint contracts/certaforge.py
```

The suite covers the release lifecycle, escrow accounting, source sealing,
inventory and blob verification, deterministic import resolution, complete
obligation coverage, challenges, refunds, and project identity controls.

## Deployment

Install the Node dependency declared in `package.json`, provide the funded
signer only through the process environment, and run:

```sh
npm install
CERTAFORGE_DEPLOYER_KEY=<private-key> npm run deploy:studionet
```

Never commit a private key or `.env` file. The deployment tool waits for
finalization, requires majority consensus, compares the deployed contract bytes
with the local source, and writes `artifacts/deployment.studionet.json`.

## Repository layout

- `contracts/certaforge.py` — deployable contract source.
- `tests/direct/` — end-to-end Direct Mode lifecycle tests.
- `tests/test_resolver.py` — deterministic dependency resolver tests.
- `tests/test_source_guards.py` — protocol invariant guards.
- `tests/test_identity.py` — project identity guard.
- `scripts/deploy.mjs` — verified Studionet deployment workflow.
- `artifacts/deployment.studionet.json` — finalized deployment evidence.
- `docs/` — deployment and verification documentation.
