import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const contractAddress = process.env.CERTAFORGE_CONTRACT_ADDRESS;
const signerKey = process.env.CERTAFORGE_E2E_KEY;
const commit = process.env.CERTAFORGE_E2E_COMMIT;
const baseline = process.env.CERTAFORGE_E2E_BASELINE;
const repository = process.env.CERTAFORGE_E2E_REPOSITORY || "zoefunds/Certaforge";
const ref = process.env.CERTAFORGE_E2E_REF || "main";
const scopePath = process.env.CERTAFORGE_E2E_SCOPE || "scripts/deploy.mjs";
const obligation = process.env.CERTAFORGE_E2E_OBLIGATION ||
  "The deployment workflow requires finalized majority consensus and verifies byte-for-byte equality between local and deployed contract source.";
const requiredCheckName = process.env.CERTAFORGE_E2E_REQUIRED_CHECK || "tests";
if (!contractAddress || !signerKey || !commit || !baseline) {
  throw new Error("contract address, signer key, commit, and baseline are required");
}
if (![commit, baseline].every((value) => /^[0-9a-f]{40}$/.test(value))) {
  throw new Error("commit and baseline must be lowercase Git commit SHAs");
}

const writer = createClient({ chain: studionet, account: createAccount(signerKey) });
const reader = createClient({ chain: studionet });
const transactions = [];
const startedAt = new Date().toISOString();
const amount = 10n ** 18n;
const safe = (value) => JSON.parse(JSON.stringify(value, (_, item) =>
  typeof item === "bigint" ? item.toString() : item));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForFinalized(hash, label) {
  const receipt = await writer.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    retries: 180,
    interval: 5000,
  });
  const consensus = receipt.result_name ?? receipt.resultName;
  const reportedExecution = receipt.tx_execution_result_name ?? receipt.txExecutionResultName;
  const transaction = await writer.getTransaction({ hash });
  const executionHash = transaction.tx_execution_hash ?? transaction.txExecutionHash;
  const execution = reportedExecution ||
    (transaction.statusName === "FINALIZED" && executionHash
      ? "FINALIZED_WITH_EXECUTION_HASH"
      : "");
  if (consensus !== "MAJORITY_AGREE") throw new Error(`${label}: consensus ${consensus}`);
  if (execution !== ExecutionResult.FINISHED_WITH_RETURN && execution !== "FINALIZED_WITH_EXECUTION_HASH") {
    throw new Error(`${label}: execution ${execution || "missing proof"}`);
  }
  transactions.push({
    label,
    hash,
    consensus,
    execution,
    executionHash,
    finalizedAt: new Date().toISOString(),
  });
  return receipt;
}

async function write(label, functionName, args = [], value = 0n) {
  const hash = await writer.writeContract({
    address: contractAddress,
    functionName,
    args,
    value,
  });
  console.log(`${label} submitted ${hash}`);
  await waitForFinalized(hash, label);
  console.log(`${label} finalized`);
  return hash;
}

async function call(functionName, args = []) {
  return reader.readContract({ address: contractAddress, functionName, args });
}

async function release(releaseId) {
  const raw = await call("get_release", [BigInt(releaseId)]);
  return raw ? JSON.parse(raw) : null;
}

async function nativeBalance(address) {
  return BigInt(await reader.request({ method: "eth_getBalance", params: [address, "latest"] }));
}

const deployment = JSON.parse(await readFile(
  new URL("../artifacts/deployment.studionet.json", import.meta.url), "utf8"));
if (deployment.contractAddress.toLowerCase() !== contractAddress.toLowerCase()) {
  throw new Error("configured contract does not match the verified deployment record");
}
const source = await readFile(new URL("../contracts/certaforge.py", import.meta.url));
const sourceSha256 = createHash("sha256").update(source).digest("hex");
if (sourceSha256 !== deployment.sourceSha256 || !deployment.sourceEquivalent) {
  throw new Error("local contract source does not match the deployed-source record");
}

const signer = writer.account.address;
const balanceBefore = await nativeBalance(signer);
const nextBefore = Number(await call("get_next_id"));
const sealBy = Math.floor(Date.now() / 1000) + 420;
const obligations = [obligation];
const scope = [scopePath];
const requiredChecks = [{ name: requiredCheckName, app_slug: "github-actions" }];

await write("open release", "open_release", [
  repository,
  ref,
  baseline,
  signer,
  "Verified CertaForge Studionet deployment workflow",
  JSON.stringify(obligations),
  JSON.stringify(scope),
  JSON.stringify(requiredChecks),
  BigInt(sealBy),
]);
const releaseId = nextBefore;
await write("deposit escrow funding", "deposit_funding", [], amount);
await write("allocate sponsor escrow", "sponsor", [BigInt(releaseId), amount]);
await write("seal GitHub release", "seal_release", [BigInt(releaseId), commit]);

const sealed = await release(releaseId);
if (sealed.state !== "SEALED" || sealed.seal?.commit !== commit || sealed.escrow !== Number(amount)) {
  throw new Error("sealed release state does not match the intended commit and escrow");
}
const sealWaitMs = Math.max(0, (sealBy + 5) * 1000 - Date.now());
console.log(`waiting ${Math.ceil(sealWaitMs / 1000)} seconds for the real sealing deadline`);
await sleep(sealWaitMs);

await write("begin sealed inventory", "begin_inventory", [BigInt(releaseId)]);
await write("discover complete inventory", "discover_inventory", [BigInt(releaseId)]);
await write("close inventory", "close_inventory", [BigInt(releaseId)]);
const inventoried = await release(releaseId);
if (inventoried.inventory_count < 1) throw new Error("sealed scope produced no inventory");
for (let index = 0; index < inventoried.inventory_count; index += 1) {
  await write(`materialize inventory entry ${index}`, "materialize", [BigInt(releaseId), index]);
}
await write("build dependency review graph", "build_review_graph", [BigInt(releaseId)]);
const graphed = await release(releaseId);
for (let index = 0; index < graphed.component_count; index += 1) {
  await write(`assess component ${index}`, "assess_component", [BigInt(releaseId), index]);
}
for (let index = 0; index < graphed.edge_count; index += 1) {
  await write(`review dependency edge ${index}`, "review_edge", [BigInt(releaseId), index]);
}
await write("propose certificate", "propose", [BigInt(releaseId)]);
const proposed = await release(releaseId);
if (proposed.certificate?.outcome !== "ACCEPTED") {
  throw new Error(`expected ACCEPTED certificate, received ${proposed.certificate?.outcome}`);
}
const challengeUntil = Number(proposed.challenge_until);
const challengeWaitMs = Math.max(0, (challengeUntil + 5) * 1000 - Date.now());
console.log(`waiting ${Math.ceil(challengeWaitMs / 1000)} seconds for the real challenge deadline`);
await sleep(challengeWaitMs);

await write("finalize accepted certificate", "finalize", [BigInt(releaseId)]);
const credited = BigInt(await call("get_balance", [signer]));
if (credited !== amount) throw new Error(`expected ${amount} credited, received ${credited}`);
await write("withdraw settled escrow", "withdraw");

const finalRelease = await release(releaseId);
const finalCredit = BigInt(await call("get_balance", [signer]));
const fundingCredit = BigInt(await call("get_funding_balance", [signer]));
const nextAfter = Number(await call("get_next_id"));
const balanceAfter = await nativeBalance(signer);
if (finalRelease.state !== "ACCEPTED" || finalCredit !== 0n || fundingCredit !== 0n) {
  throw new Error("terminal state or post-withdraw balances are incorrect");
}

const report = {
  schema: "certaforge.live-e2e/v1",
  network: "GenLayer Studionet",
  chainId: 61999,
  contractAddress,
  deploymentTransaction: deployment.txHash,
  deployedSourceSha256: deployment.deployedSourceSha256,
  repository: `https://github.com/${repository}`,
  baseline,
  commit,
  signer,
  releaseId,
  title: sealed.title,
  obligations,
  scope,
  requiredChecks,
  sealBy,
  seal: sealed.seal,
  certificate: finalRelease.certificate,
  terminalState: finalRelease.state,
  escrowWei: amount.toString(),
  creditedBeforeWithdrawWei: credited.toString(),
  contractCreditAfterWithdrawWei: finalCredit.toString(),
  fundingCreditAfterWithdrawWei: fundingCredit.toString(),
  signerNativeBalance: {
    beforeWei: balanceBefore.toString(),
    afterWei: balanceAfter.toString(),
    deltaWei: (balanceAfter - balanceBefore).toString(),
  },
  nextId: { before: nextBefore, after: nextAfter },
  coverage: finalRelease.certificate.coverage,
  blockers: finalRelease.certificate.blockers,
  transactions,
  startedAt,
  completedAt: new Date().toISOString(),
};
await mkdir(new URL("../artifacts", import.meta.url), { recursive: true });
await writeFile(
  new URL("../artifacts/live-e2e.studionet.json", import.meta.url),
  `${JSON.stringify(safe(report), null, 2)}\n`,
);
console.log(JSON.stringify(safe(report), null, 2));
