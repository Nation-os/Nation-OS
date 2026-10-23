/** Split generated seed records at zone boundaries instead of compressing them. */
const fs = require("node:fs");
const path = require("node:path");
const { base } = require("./workspace-files.cjs");
function write(relativePath, value) {
  const file = path.join(base, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}
module.exports = function writeDatasets(country, citizens) {
  write("data/country/zones.json", country.zones);
  for (const [name, sector] of Object.entries(country.sectors))
    write("data/country/sectors/" + name + ".json", sector);
  for (let zone = 0; zone < country.zones.length; zone++) {
    write(
      "data/country/states/zone-" + (zone + 1) + ".json",
      country.states.filter((s) => s.parentZone === zone),
    );
    write(
      "data/citizens/zone-" + (zone + 1) + ".json",
      citizens.filter((s) => s.parentZone === zone),
    );
  }
};
