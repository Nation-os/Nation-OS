/** Run the repository policy and regression suites sequentially so failures stop the check immediately. */
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
const policy = spawnSync(process.execPath, ["scripts/check-lines.mjs"], { stdio: "inherit" });
if (policy.status !== 0) process.exit(policy.status || 1);
const files = [
  ...readdirSync("src/client/features")
    .filter((f) => f.endsWith(".js"))
    .map((f) => "src/client/features/" + f),
  ...readdirSync("src/client/views")
    .filter((f) => f.endsWith(".js"))
    .map((f) => "src/client/views/" + f),
  "generated/workspace-runtime.mjs",
];
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
for (const file of [
  "models.cjs",
  "citizens.cjs",
  "planning.cjs",
  "economy.cjs",
  "ai.mjs",
  "commerce.cjs",
  "comparisons.mjs",
  "workspace.mjs",
]) {
  const result = spawnSync(process.execPath, ["tests/" + file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
