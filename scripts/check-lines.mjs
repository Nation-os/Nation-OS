/** Enforce the user's limit on maintained code, documentation and canonical seed shards. */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib", "src", "scripts", "tests", "docs", "data"];
const files = [
  "README.md",
  "package.json",
  "next.config.mjs",
  ".gitignore",
  ".env.example",
  ".prettierrc.json",
  ".prettierignore",
];
const maintained = /\.(?:js|jsx|mjs|cjs|css|json|md|html|sql|ya?ml)$/;

function visit(directory) {
  if (!existsSync(directory)) return;
  for (const item of readdirSync(directory)) {
    const file = path.join(directory, item);
    if (statSync(file).isDirectory()) visit(file);
    else if (maintained.test(file)) files.push(file);
  }
}

roots.forEach(visit);
let longest = { lines: 0, file: "" };
const violations = [];
for (const file of files.filter(existsSync)) {
  const text = readFileSync(file, "utf8").replaceAll("\r\n", "\n");
  const lines = text ? text.split("\n").length - Number(text.endsWith("\n")) : 0;
  if (lines > longest.lines) longest = { file, lines };
  if (lines >= 300) violations.push(`${file}: ${lines} lines (maximum 299)`);
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Line policy passed: ${files.filter(existsSync).length} maintained files; longest ${longest.file} (${longest.lines} lines).`,
  );
}

// Dependency lockfiles, dependency caches, compiled bundles and NDJSON exports are machine output,
// not maintained modules. Their directories are deliberately absent from the roots above.
