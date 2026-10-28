# CertaForge contract

CertaForge is a standalone GenLayer intelligent contract for escrow-backed,
pre-sealed release attestations. It freezes a repository release, verifies its
scoped source inventory and runtime checks, assesses every dependency component,
and settles funds only after complete evidence coverage.

## Contract

The deployable source is `contracts/certaforge.py`; its contract class is
`CertaForge`.

## Test

Create a Python environment, install `requirements.txt`, then run:

```sh
pytest -q
```

The suite includes lifecycle coverage, deterministic resolver tests, protocol
source guards, and an identity guard that rejects legacy naming anywhere in the
project tree.

## Studionet deployment

- Contract address: `0x7C20CF9737F69480Ad7C22c4cF6f5F5574f4e204`
- Deployment transaction: `0xb03e901899283a0963fcaf77f05503780bc719b20a9fee6671b6b3e0264f4e05`
- Network: GenLayer Studionet (`61999`)
- Consensus: `MAJORITY_AGREE`
- Local/deployed source SHA-256: `aa1255c639da0939bdcabaaf8c6030017f5891111ab57e072e959bf9eb3a0981`

The complete source-equivalence record is stored in
`artifacts/deployment.studionet.json`.
