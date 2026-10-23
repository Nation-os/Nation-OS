/** Stream synthetic records with backpressure and exclusive file creation; do not buffer the complete population in memory. */
const fs = require("node:fs"),
  path = require("node:path"),
  { once } = require("node:events");
const engine = require("../lib/domain/citizen-engine.cjs");
const states = engine.prepare(require("../data/citizen-states.cjs"));
const total = states.reduce((n, s) => n + s.count, 0);
async function main() {
  const args = process.argv.slice(2),
    get = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
  const count = Number(get("--count") || 10000),
    start = Number(get("--start") || 0),
    output = path.resolve(get("--output") || "data/citizens-sample.ndjson");
  if (
    !Number.isInteger(count) ||
    !Number.isInteger(start) ||
    count < 1 ||
    start < 0 ||
    start + count > total
  )
    throw Error(`Provide an integer range within ${total} citizens.`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const stream = fs.createWriteStream(output, { flags: "wx" });
  stream.on("error", () => {});
  await once(stream, "open");
  for (let i = start; i < start + count; i++) {
    if (!stream.write(JSON.stringify(engine.citizen(i, states)) + "\n"))
      await once(stream, "drain");
    if ((i - start + 1) % 1000000 === 0) console.log(`${i - start + 1} citizens exported`);
  }
  stream.end();
  await once(stream, "finish");
  console.log(`Exported ${count.toLocaleString()} synthetic citizens to ${output}`);
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
