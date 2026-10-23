import assert from "node:assert/strict";
import { workspaceRoutes } from "../lib/routes.mjs";
const base = process.env.NATIONOS_TEST_URL || "http://localhost:4173";
let home = "";
for (const path of Object.values(workspaceRoutes)) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert(html.includes("_next/static/"), path);
  assert(html.includes('id="content"'), path);
  if (path === "/") home = html;
}
const scripts = [
  ...home.matchAll(/src="([^"]+\/_next\/static\/[^" ]+|\/_next\/static\/[^" ]+)"/g),
].map((m) => m[1]);
assert(scripts.length > 0);
for (const script of scripts) {
  const response = await fetch(new URL(script, base));
  assert.equal(response.status, 200, script);
}
const status = await fetch(base + "/api/ai/status");
assert.equal(status.status, 200);
assert.equal((await status.json()).automatedAnalysis, true);
const body = {
  question: "Draft a 10-year education plan in Kora State with 120 million",
  scope: "all",
  mode: "local",
};
const analysis = await fetch(base + "/api/ai/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
assert.equal(analysis.status, 200);
const report = await analysis.json();
assert.equal(report.mode, "local");
assert.equal(report.modelResult.totalCost, 1200);
assert.equal(report.modelResult.years.at(-1).year, 2036);
const cross = await fetch(base + "/api/ai/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: "https://unrelated.example" },
  body: "{}",
});
assert.equal(cross.status, 403);
assert.equal((await fetch(base + "/api/ai/analyze")).status, 405);
assert.equal((await fetch(base + "/.env")).status, 404);
assert.equal((await fetch(base + "/missing-page")).status, 404);
console.log(
  "Passed: all 13 Next.js workspace URLs, compiled script assets, analyst status, ten-year local projection, API origin/method checks and missing/private paths.",
);
