# Live Studionet end-to-end verification

## Result

A complete funded CertaForge lifecycle ran on GenLayer Studionet on
28 October 2026. It used real wall-clock protocol windows, real GitHub evidence,
GenVM validator consensus, and a 1 GEN escrow deposit. No simulated VM, mocked
web response, synthetic time warp, or manually injected source inventory was
used.

| Field | Verified value |
| --- | --- |
| Contract | `0x7C20CF9737F69480Ad7C22c4cF6f5F5574f4e204` |
| Release ID | `1` |
| Signer/sponsor/implementer | `0x9e75694e204B03997D55B5A664a924aDaE3F43D1` |
| Escrow | `1,000,000,000,000,000,000 wei` (1 GEN) |
| Evidence repository | `actions/checkout` |
| Baseline | `12cd2235efa0937479335606d7c3ac9f6c0973b1` |
| Sealed commit | `28802689a136bfcdb721715abd713740beecbe07` |
| Observed branch head | `f548e57e544e1ff5a4c46bf1e1b8685f8e4a348a` |
| Scoped path | `action.yml` |
| GitHub checks | 11 completed, 11 successful |
| Required check | `build` from `github-actions` |
| Inventory/components/edges | 1 / 1 / 0 |
| Certificate coverage | `[1, 1, 1, 1, 0, 0]` |
| Certificate blockers | none |
| Certificate outcome | `ACCEPTED` |
| Terminal release state | `ACCEPTED` |
| Contract credit after withdrawal | `0` |
| Funding credit after withdrawal | `0` |
| Transactions | 13 finalized with `MAJORITY_AGREE` |
| Runtime | 33 minutes 6 seconds |

The tested obligation was:

> The action manifest defines a deterministic GitHub repository checkout
> interface with explicit inputs and a declared Node runtime.

The contract independently fetched and froze the GitHub branch, commit, baseline,
tree, check runs, recursive inventory, and Git blob. The runner supplied only the
agreement terms and transaction triggers; it did not supply source bytes or an
inventory list.

## Transactions

| Step | Finalized Studionet transaction |
| --- | --- |
| Open release | [`0x8a16d6…ff6a6d`](https://explorer-studio.genlayer.com/tx/0x8a16d6a81b338ac0f4af4314d57a1b5a8b04a0abc948426459da8f9f79ff6a6d) |
| Deposit 1 GEN | [`0x8701ce…168cd47`](https://explorer-studio.genlayer.com/tx/0x8701cee1c4d1cc58cc44fafea4f1363d191e5de9d885a9fe7447159ee168cd47) |
| Allocate sponsor escrow | [`0x7f5acd…11093d`](https://explorer-studio.genlayer.com/tx/0x7f5acd7b3af15cdc2c6f182b01ea8edd70eaacf3fc3db0664b59969ecf11093d) |
| Seal GitHub release | [`0xd30328…fe6787`](https://explorer-studio.genlayer.com/tx/0xd3032812d7100f77c75422d977bfa2b159dc10931c9b056fe1a51bbfb0fe6787) |
| Begin inventory | [`0x2b8159…dee2f0`](https://explorer-studio.genlayer.com/tx/0x2b8159a7a66e1843e0fa35aa2faef8fab1493d930a446ee556a9b1f24bdee2f0) |
| Discover inventory | [`0x48fa4f…d10fe`](https://explorer-studio.genlayer.com/tx/0x48fa4f825bf683bf893598681b5814cbb66757a6609816c9f61f8ebff5ed10fe) |
| Close inventory | [`0xe27b41…fd7f0`](https://explorer-studio.genlayer.com/tx/0xe27b41d9d611d11f34b64b1bad6ac59462d3b1d8667f7e7c3a6b1c21a0afd7f0) |
| Materialize scoped blob | [`0x77e4aa…afd12`](https://explorer-studio.genlayer.com/tx/0x77e4aa57694812676d0583d271f5b3c4be5c6250bdf502dda2a618834f4afd12) |
| Build review graph | [`0x143846…13a10`](https://explorer-studio.genlayer.com/tx/0x1438468e2f6e64507df4c6a7663fdcddf221e5162157a54d20eea8d34dd13a10) |
| Assess component | [`0xd2f576…85c60`](https://explorer-studio.genlayer.com/tx/0xd2f5760b9b0233509a5f046de1ed49c66f00afae904260e04b0e271a65f85c60) |
| Propose certificate | [`0x81842e…686b`](https://explorer-studio.genlayer.com/tx/0x81842eb5aa4fe139db097b0b7a2ee6be1935955ad408df97c745425eb020686b) |
| Finalize after challenge window | [`0x3870c8…99d1d`](https://explorer-studio.genlayer.com/tx/0x3870c84bfa4628ada757b2ed6ba597e467df9035beacb1b2753165fcfa999d1d) |
| Withdraw settled escrow | [`0xadf320…ecd19`](https://explorer-studio.genlayer.com/tx/0xadf320482783858beedc20fbc94c9f88356476e18f4e486dba17ea1e625ecd19) |

## Timing and settlement

- Started: `2026-10-28T08:11:02.348Z`
- Certificate proposed: `2026-10-28T08:23:15.099Z`
- Certificate finalized: `2026-10-28T08:43:21.328Z`
- Withdrawal finalized: `2026-10-28T08:44:02.435Z`
- Evidence capture completed: `2026-10-28T08:44:08.097Z`

The runner waited for both real deadlines: the sealing deadline before inventory
and the full 20-minute certificate challenge window before finalization. The
accepted release credited exactly 1 GEN, withdrawal cleared that credit, and the
signer's before/after native balance was conserved at 3 GEN because the escrow
principal was returned after acceptance.

## GitHub check and hosted-CI context

The CertaForge repository's `tests` workflow is configured on pushes, but the
observed hosted jobs have been failed by GitHub before executing any step. Those
jobs contain zero steps and no log, which indicates account-level Actions
unavailability, not a test execution. This status is neither hidden nor described
as green CI. Because CertaForge correctly rejects any commit carrying a failed
check run, the live lifecycle did not weaken or bypass that invariant.

Instead, the evidence target was the public `actions/checkout` commit above,
which had 11 completed successful GitHub check runs. The CertaForge repository's
own source was separately verified locally immediately before the run: 60 tests
passed and GenVM lint passed all 3 checks.

## Reverification

The full machine-readable record is
`artifacts/live-e2e.studionet.json`. Re-fetch all 13 transactions and the current
release state directly from Studionet with:

```sh
npm install
npm run verify:e2e
```

The independent verifier checks the committed deployment identity and source
hash, re-fetches all 13 transactions, matches every live execution hash, reads
release `1` directly from the contract, confirms its `ACCEPTED` terminal state,
and confirms both post-withdraw credit balances remain zero.
