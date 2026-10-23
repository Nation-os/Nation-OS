/** Build-only assembly: join view helpers and ordered controllers into one isolated client closure, then derive server dataset shards. */
const fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm");
const base = path.resolve(__dirname, "..");
const { features, readFeature: read, readViews } = require("./workspace-files.cjs");
const writeDatasets = require("./write-datasets.cjs");
const imports = [
  "CitizenData:citizen-engine",
  "PlanningEngine:planning-engine",
  "EconomyEngine:economy-engine",
  "CommerceEngine:commerce-engine",
  "ComparisonEngine:comparison-engine",
];
const { runtimePrefix, runtimeSuffix } = require("./runtime-wrapper.cjs");
const prefix = runtimePrefix(imports);
const code =
  readViews() +
  "\n" +
  features
    .map(
      (name) =>
        `\n// ---- ${name} ----\n` +
        read(name).replaceAll("globalThis.EconomyEngine", "EconomyEngine"),
    )
    .join("\n");
const suffix = runtimeSuffix;
fs.mkdirSync(path.join(base, "generated"), { recursive: true });
fs.writeFileSync(path.join(base, "generated/workspace-runtime.mjs"), prefix + code + suffix);
// Produce server data at build time; production requests never execute browser scripts or VM code.
const node = () => ({
  innerHTML: "",
  style: {},
  dataset: {},
  classList: { toggle() {} },
  append() {},
  prepend() {},
  insertAdjacentHTML() {},
  showModal() {},
  close() {},
});
const context = vm.createContext({
  document: { querySelector: node, querySelectorAll: () => [], createElement: node },
  localStorage: { getItem: () => null, setItem() {} },
  setTimeout() {},
  Date,
  Blob,
  URL,
});
vm.runInContext(readViews(), context);
for (const file of ["app-seed", "app", "states", "models", "sector-definitions", "sectors"])
  vm.runInContext(read(file), context);
const country = JSON.parse(
  vm.runInContext(
    "JSON.stringify({states:regions,sectors:sectorDefinitions,zones:administrativeZones})",
    context,
  ),
);
vm.runInContext(fs.readFileSync(path.join(base, "lib/domain/citizen-engine.cjs"), "utf8"), context);
vm.runInContext(read("citizens"), context);
const citizens = JSON.parse(vm.runInContext("JSON.stringify(citizenStates)", context));
writeDatasets(country, citizens);
console.log("Prepared client workspace and canonical server datasets.");
