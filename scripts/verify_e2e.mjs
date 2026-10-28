import { readFile } from "node:fs/promises";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const report = JSON.parse(await readFile(
  new URL("../artifacts/live-e2e.studionet.json", import.meta.url), "utf8"));
const deployment = JSON.parse(await readFile(
  new URL("../artifacts/deployment.studionet.json", import.meta.url), "utf8"));
const client = createClient({ chain: studionet });

if (report.contractAddress.toLowerCase() !== deployment.contractAddress.toLowerCase()) {
  throw new Error("E2E report targets a different contract from the deployment record");
}
if (report.deployedSourceSha256 !== deployment.deployedSourceSha256) {
  throw new Error("E2E report source hash differs from the deployment record");
}
if (report.terminalState !== "ACCEPTED" || report.certificate.outcome !== "ACCEPTED") {
  throw new Error("E2E report is not an accepted terminal lifecycle");
}
if (report.blockers.length !== 0 || JSON.stringify(report.coverage) !== "[1,1,1,1,0,0]") {
  throw new Error("E2E report does not show complete blocker-free coverage");
}
if (report.escrowWei !== "1000000000000000000" ||
    report.creditedBeforeWithdrawWei !== report.escrowWei ||
    report.contractCreditAfterWithdrawWei !== "0" ||
    report.fundingCreditAfterWithdrawWei !== "0") {
  throw new Error("E2E escrow settlement is inconsistent");
}

for (const item of report.transactions) {
  const transaction = await client.getTransaction({ hash: item.hash });
  if (transaction.statusName !== "FINALIZED") {
    throw new Error(`${item.label} is not finalized on Studionet`);
  }
  const executionHash = transaction.tx_execution_hash ?? transaction.txExecutionHash;
  if (executionHash !== item.executionHash) {
    throw new Error(`${item.label} execution hash differs from live Studionet`);
  }
}

const rawRelease = await client.readContract({
  address: report.contractAddress,
  functionName: "get_release",
  args: [BigInt(report.releaseId)],
});
const release = JSON.parse(rawRelease);
if (release.state !== "ACCEPTED" || release.certificate?.outcome !== "ACCEPTED") {
  throw new Error("live Studionet release is not ACCEPTED");
}
if (release.seal?.commit !== report.commit ||
    JSON.stringify(release.certificate.coverage) !== JSON.stringify(report.coverage) ||
    JSON.stringify(release.certificate.blockers) !== JSON.stringify(report.blockers)) {
  throw new Error("live release evidence differs from the committed E2E report");
}
for (const [functionName, expected] of [
  ["get_balance", "0"],
  ["get_funding_balance", "0"],
]) {
  const value = await client.readContract({
    address: report.contractAddress,
    functionName,
    args: [report.signer],
  });
  if (BigInt(value).toString() !== expected) {
    throw new Error(`${functionName} did not return ${expected}`);
  }
}

console.log(JSON.stringify({
  verified: true,
  network: report.network,
  contractAddress: report.contractAddress,
  releaseId: report.releaseId,
  terminalState: release.state,
  outcome: release.certificate.outcome,
  coverage: release.certificate.coverage,
  blockers: release.certificate.blockers,
  transactionsReverified: report.transactions.length,
}, null, 2));
