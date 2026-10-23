/** Ordered source assembly is shared by build preparation and dataset generation. */
const fs = require("node:fs");
const path = require("node:path");
const base = path.resolve(__dirname, "..");
const features = require("../src/client/feature-order.json");
const views = fs
  .readdirSync(path.join(base, "src/client/views"))
  .filter((f) => f.endsWith(".js"))
  .sort();
const readFeature = (name) =>
  fs.readFileSync(path.join(base, "src/client/features", name + ".js"), "utf8");
const readViews = () =>
  views
    .map((file) => fs.readFileSync(path.join(base, "src/client/views", file), "utf8"))
    .join("\n");
module.exports = { base, features, readFeature, readViews };
