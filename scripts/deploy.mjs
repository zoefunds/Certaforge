import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

const key = process.env.CERTAFORGE_DEPLOYER_KEY;
if (!key) throw new Error("CERTAFORGE_DEPLOYER_KEY is required");

const client = createClient({ chain: studionet, account: createAccount(key) });
const code = await readFile(new URL("../contracts/certaforge.py", import.meta.url), "utf8");
const sourceSha256 = createHash("sha256").update(code, "utf8").digest("hex");
const startedAt = new Date().toISOString();
const txHash = await client.deployContract({ code, args: [] });
console.log(`deployment submitted ${txHash}`);

const receipt = await client.waitForTransactionReceipt({
  hash: txHash,
  status: TransactionStatus.FINALIZED,
  retries: 180,
  interval: 5000,
});
const consensus = receipt.result_name ?? receipt.resultName;
const execution = receipt.tx_execution_result_name ?? receipt.txExecutionResultName;
const contractAddress = receipt.data?.contract_address ?? receipt.data?.contractAddress;
const transaction = await client.getTransaction({ hash: txHash });
const txExecutionHash = transaction.tx_execution_hash;
const executionVerified =
  execution === ExecutionResult.FINISHED_WITH_RETURN ||
  Boolean(txExecutionHash && transaction.statusName === "FINALIZED");
const deployedSource = Buffer.from(transaction.data?.contract_code || "", "base64");
const deployedSourceSha256 = createHash("sha256").update(deployedSource).digest("hex");

if (consensus !== "MAJORITY_AGREE") throw new Error(`deployment consensus ${consensus}`);
if (!executionVerified) throw new Error(`deployment execution ${execution || "missing"}`);
if (!contractAddress) throw new Error("finalized deployment returned no contract address");
if (deployedSourceSha256 !== sourceSha256) throw new Error("deployed source differs from local source");

const record = {
  schema: "certaforge.deployment/v1",
  network: "GenLayer Studionet",
  chainId: 61999,
  source: "contracts/certaforge.py",
  sourceSha256,
  deployedSourceSha256,
  sourceBytes: Buffer.byteLength(code, "utf8"),
  sourceEquivalent: deployedSourceSha256 === sourceSha256,
  deployer: client.account.address,
  startedAt,
  finalizedAt: new Date().toISOString(),
  txHash,
  contractAddress,
  consensus,
  execution: execution || "FINALIZED_WITH_EXECUTION_HASH",
  txExecutionHash,
  transactionStatus: transaction.statusName,
};
const artifact = new URL("../artifacts/deployment.studionet.json", import.meta.url);
await mkdir(new URL("../artifacts", import.meta.url), { recursive: true });
await writeFile(artifact, `${JSON.stringify(record, null, 2)}\n`);
console.log(JSON.stringify(record, null, 2));
