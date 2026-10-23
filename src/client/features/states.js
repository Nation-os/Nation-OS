/** Expand zone seeds into unequal state populations while preserving exact integer national and zone totals. */
// Fictional administrative hierarchy: six zones, 36 states and one capital territory.
const administrativeZones = regions.map((r) => ({ ...r }));
const stateNames = [
  ["Kora", "Talun", "Meru", "Daran", "Senai", "Orun"],
  ["Sava", "Belan", "Tirra", "Noma", "Garin", "Vela"],
  ["Westmere", "Osira", "Kelun", "Arden", "Morai", "Temba"],
  ["Ayara", "Nerun", "Ivara", "Solan", "Medra", "Ulan"],
  ["Eastbank", "Ruvai", "Esan", "Dalora", "Tavun", "Isora"],
  ["Azure", "Pelara", "Navin", "Sorai", "Lumera", "Ovara"],
];
const administrativeStates = administrativeZones.flatMap((zone, z) =>
  stateNames[z].map((name, j) => {
    const variations = [-3, 2, -1, 3, -2, 1],
      shift = variations[j];
    return {
      ...zone,
      name: name + " State",
      id: `AD-${z + 1}${j + 1}`,
      zone: zone.name,
      parentZone: z,
      capital: name + " City",
      type: "State",
      pop: zone.pop / (z === 3 ? 7 : 6),
      price: zone.price + shift,
      poverty: Math.max(0, zone.poverty + shift),
      food: Math.max(0, zone.food + shift),
      power: Math.min(100, zone.power + shift),
      desc: `${name} State belongs to ${zone.name}. ${zone.desc}`,
      points: "",
      x: 0,
      y: 0,
    };
  }),
);
administrativeStates.push({
  ...administrativeZones[3],
  name: "Ayara Capital Territory",
  id: "AD-CT",
  zone: "Central District",
  parentZone: 3,
  capital: "Ayara",
  type: "Capital territory",
  pop: administrativeZones[3].pop / 7,
  desc: "The federal seat of the fictional Republic of Aderin. Its public-service demand includes residents and daily commuters.",
});
// Unequal settlement weights: larger commercial centres and a concentrated capital.
const statePopulationWeights = [
  [28, 19, 16, 14, 13, 10],
  [26, 22, 18, 14, 12, 8],
  [31, 21, 17, 13, 11, 7],
  [18, 12, 11, 10, 9, 8, 32],
  [29, 23, 18, 13, 10, 7],
  [32, 22, 16, 12, 10, 8],
];
for (let z = 0; z < 6; z++) {
  const states = administrativeStates.filter((r) => r.parentZone === z),
    weights = statePopulationWeights[z],
    total = Math.round(administrativeZones[z].pop * 1e6),
    weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / weightSum),
    counts = raw.map(Math.floor);
  let remainder = total - counts.reduce((a, b) => a + b, 0);
  const order = raw
    .map((x, i) => ({ i, fraction: x - counts[i] }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  for (let n = 0; n < remainder; n++) counts[order[n].i]++;
  states.forEach((r, i) => {
    r.populationVersion = "aderin-population-v2";
    r.citizenCount = counts[i];
    r.pop = counts[i] / 1e6;
    r.settlementProfile =
      i === 0
        ? "Regional commercial centre"
        : i === states.length - 1 && z === 3
          ? "Federal capital"
          : "Mixed rural and urban settlements";
  });
}
regions.splice(0, regions.length, ...administrativeStates);
selected = 18;
// Refresh administrative labels without changing the synthetic national totals.
const overviewBeforeStates = overview;
overview = function () {
  return overviewBeforeStates()
    .replace("Across 6 regions", "36 states + capital territory")
    .replace("6 regions · Click to explore", "37 jurisdictions · Click to explore")
    .replace("REGIONAL INTELLIGENCE", "STATE INTELLIGENCE")
    .replace("Fictional geography", "Schematic state layout");
};
let stateSearch = "",
  zoneFilter = "all";
function stateRegisterData(index) {
  const r = regions[index],
    economy = globalThis.EconomyEngine;
  const population =
    typeof citizenStates !== "undefined" ? citizenStates[index].count : Math.round(r.pop * 1e6);
  const shares = [0.14, 0.18, 0.15, 0.24, 0.12, 0.17];
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    zone: r.zone,
    capital: r.capital,
    population,
    description: r.desc,
    economicActivity: r.role,
    gdpMillions: economy
      ? (economy.baseline.gdp * shares[r.parentZone] * r.pop) /
        administrativeZones[r.parentZone].pop
      : null,
    povertyPercent: r.poverty,
    schoolAttendancePercent: sectorDefinitions.education.baseline[index],
    primaryCarePercent: sectorDefinitions.health.baseline[index],
    electricityPercent: sectorDefinitions.energy.baseline[index],
    safeWaterPercent: sectorDefinitions.water.baseline[index],
    journeyMinutes: sectorDefinitions.transport.baseline[index],
    zoneResources: economy
      ? economy.resources.filter((x) => x.zones.includes(r.parentZone)).map((x) => x.name)
      : [],
    budget: "Not separately modelled",
    referencePeriod: "2026-Q3",
    synthetic: true,
  };
}
function stateRegisterCSV() {
  const fields = [
    "id",
    "name",
    "type",
    "zone",
    "capital",
    "population",
    "economicActivity",
    "gdpMillions",
    "annualRevenueMillions",
    "annualSpendingMillions",
    "publicDebtMillions",
    "gdpGrowthPercent",
    "inflationPercent",
    "unemploymentPercent",
    "povertyPercent",
    "schoolAttendancePercent",
    "primaryCarePercent",
    "electricityPercent",
    "safeWaterPercent",
    "journeyMinutes",
    "zoneResources",
    "budget",
    "referencePeriod",
    "synthetic",
  ];
  const cell = (value) =>
    '"' +
    String(Array.isArray(value) ? value.join(" | ") : (value ?? "Not supplied")).replace(
      /"/g,
      '""',
    ) +
    '"';
  return [
    fields.join(","),
    ...regions.map((_, i) => {
      const d = stateRegisterData(i);
      return fields.map((k) => cell(d[k])).join(",");
    }),
  ].join("\n");
}
function stateProfile(index) {
  const d = stateRegisterData(index);
  const rows = [
    ["Administrative code", d.id],
    ["Jurisdiction type", d.type],
    ["Administrative zone", d.zone],
    ["Capital", d.capital],
    ["Population", d.population.toLocaleString()],
    ["Principal economic activity", d.economicActivity],
    [
      "Illustrative GDP",
      d.gdpMillions === null
        ? "Not supplied"
        : `A₦ ${d.gdpMillions.toLocaleString("en-GB", { maximumFractionDigits: 1 })}M`,
    ],
    ["State budget", d.budget],
    ["Below demo poverty threshold", d.povertyPercent + "%"],
    ["School attendance", d.schoolAttendancePercent + "%"],
    ["Primary care access", d.primaryCarePercent + "%"],
    ["Electricity access", d.electricityPercent + "%"],
    ["Basic safe-water access", d.safeWaterPercent + "%"],
    ["Essential-service journey time", d.journeyMinutes + " min"],
    ["Reference period", d.referencePeriod],
  ];
  modal(
    `<p class="eyebrow">STATE & TERRITORY REGISTER</p><h1>${d.name}</h1><p>${d.description}</p>${rows.map(([k, v]) => `<div class="metric"><span>${k}</span><b>${escapeHtml(v)}</b></div>`).join("")}<h3 style="margin-top:22px">Resources in the administrative zone</h3><p>${d.zoneResources.length ? d.zoneResources.join(" · ") : "Resource data not supplied."}</p><p>All indicators are synthetic. State GDP is allocated from zone output shares by population. Resource endowments describe the wider zone; deposits in individual states have not been specified. State revenue, spending and debt are not separately modelled.</p>`,
  );
}
function statesDirectory() {
  const filtered = regions
    .map((r, i) => ({ ...r, index: i }))
    .filter(
      (r) =>
        (zoneFilter === "all" || String(r.parentZone) === zoneFilter) &&
        (r.name + " " + r.capital + " " + r.zone).toLowerCase().includes(stateSearch.toLowerCase()),
    );
  return (
    title(
      "ADMINISTRATIVE REGISTER",
      "States & territories",
      "Population, economic activity and public-service data for all 37 jurisdictions.",
      `<button class="btn" id="states-export">Download state data ↓</button>`,
    ) + renderStateRegisterMarkup(filtered)
  );
}
