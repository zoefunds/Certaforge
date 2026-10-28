# Studionet deployment

## Current deployment

CertaForge was finalized on GenLayer Studionet on 28 October 2026.

| Field | Value |
| --- | --- |
| Chain ID | `61999` |
| Contract address | `0x7C20CF9737F69480Ad7C22c4cF6f5F5574f4e204` |
| Deployment transaction | `0xb03e901899283a0963fcaf77f05503780bc719b20a9fee6671b6b3e0264f4e05` |
| GenVM execution hash | `0xc6b7b8521d91486ccf11491e4ac825253ff8cad877c600d9c45236efd6e34e04` |
| Deployer | `0x9e75694e204B03997D55B5A664a924aDaE3F43D1` |
| Consensus | `MAJORITY_AGREE` |
| Transaction status | `FINALIZED` |
| Source bytes | `45,552` |
| Local source SHA-256 | `aa1255c639da0939bdcabaaf8c6030017f5891111ab57e072e959bf9eb3a0981` |
| Deployed source SHA-256 | `aa1255c639da0939bdcabaaf8c6030017f5891111ab57e072e959bf9eb3a0981` |

[Inspect the finalized transaction](https://explorer-studio.genlayer.com/tx/0xb03e901899283a0963fcaf77f05503780bc719b20a9fee6671b6b3e0264f4e05).

The matching hashes prove that the finalized transaction contains the exact
UTF-8 bytes from `contracts/certaforge.py`. The complete machine-readable record
is in `artifacts/deployment.studionet.json`.

## Reproducible deployment procedure

1. Run the complete local verification commands documented in `README.md`.
2. Install the dependency from `package.json` with `npm install`.
3. Export a funded Studionet private key as `CERTAFORGE_DEPLOYER_KEY` without
   writing it into the repository.
4. Run `npm run deploy:studionet`.
5. Wait for `FINALIZED` status and `MAJORITY_AGREE` consensus.
6. Confirm that `sourceEquivalent` is `true` in the generated artifact.
7. Review and commit the deployment artifact without committing signing
   material or local dependency directories.

Each deployment creates a new contract address. When replacing the current
deployment, update the README, this document, and the machine-readable artifact
together; do not retain an older address as though it were current.

## Secret handling

The funded signer is an operational secret. It is consumed from the process
environment and is excluded from version control. Public deployment evidence
contains only the deployer address, transaction identifiers, contract address,
status, consensus result, timestamps, and hashes.
