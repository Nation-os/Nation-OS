/** Keep national accounts distinct from state accounts. Map selection changes displayed scope, not the underlying canonical data. */
const economicAccounts = EconomyEngine.stateAccounts(regions);
let economicScope = "all",
  lastEconomicState = selected;
function scopedEconomicProfile() {
  const national = economicScope === "all",
    account = national
      ? EconomyEngine.baseline
      : economicAccounts.states.find((s) => s.id === economicScope),
    label = national ? "Whole country · Republic of Aderin" : account.name,
    deficit = account.spending - account.revenue;
  const metrics = [
    ["Real GDP growth", account.realGrowth.toFixed(1) + "%"],
    ["Consumer price inflation", account.inflation.toFixed(1) + "%"],
    ["Unemployment rate", account.unemployment.toFixed(1) + "%"],
    [
      national ? "Consolidated government revenue" : "State government revenue",
      moneyM(account.revenue),
    ],
    [
      national ? "Consolidated government spending" : "State government spending",
      moneyM(account.spending),
    ],
    ["Budget deficit", moneyM(deficit)],
    ["Deficit / GDP", ((deficit / account.gdp) * 100).toFixed(2) + "%"],
    ["Public debt", moneyM(account.debt)],
    ["Debt / GDP", ((account.debt / account.gdp) * 100).toFixed(1) + "%"],
    ["Exports of goods & services", moneyM(account.exports)],
    ["Imports of goods & services", moneyM(account.imports)],
    ["Trade balance", moneyM(account.exports - account.imports)],
  ];
  const resourceRows = EconomyEngine.resources.filter(
    (r) => national || r.zones.includes(account.parentZone),
  );
  return renderEconomicAccountsMarkup(account, deficit, label, metrics, national, resourceRows);
}
economyProfile = scopedEconomicProfile;
const registerBeforeAccounts = stateRegisterData;
stateRegisterData = function (index) {
  const data = registerBeforeAccounts(index),
    a = economicAccounts.states[index];
  return {
    ...data,
    gdpMillions: a.gdp,
    budget: moneyM(a.spending),
    annualRevenueMillions: a.revenue,
    annualSpendingMillions: a.spending,
    publicDebtMillions: a.debt,
    gdpGrowthPercent: a.realGrowth,
    inflationPercent: a.inflation,
    unemploymentPercent: a.unemployment,
  };
};
const stateProfileBeforeAccounts = stateProfile;
stateProfile = function (index) {
  stateProfileBeforeAccounts(index);
  const a = economicAccounts.states[index];
  let content = $("#modalContent").innerHTML;
  content = content
    .replace(
      "State GDP is allocated from zone output shares by population.",
      "State GDP uses population and synthetic productivity weights within each zone.",
    )
    .replace(
      "State revenue, spending and debt are not separately modelled.",
      "State accounts are distinct from federal accounts and reconcile with national totals.",
    );
  $("#modalContent").innerHTML =
    content +
    `<h3 style="margin-top:24px">State economic accounts</h3>${[
      ["Annual revenue", moneyM(a.revenue)],
      ["Annual spending", moneyM(a.spending)],
      ["Budget deficit", moneyM(a.deficit)],
      ["Public debt", moneyM(a.debt)],
      ["Real GDP growth", a.realGrowth.toFixed(1) + "%"],
      ["Inflation", a.inflation.toFixed(1) + "%"],
      ["Unemployment", a.unemployment.toFixed(1) + "%"],
    ]
      .map(([k, v]) => `<div class="metric"><span>${k}</span><b>${v}</b></div>`)
      .join("")}`;
};
const renderBeforeScopes = render;
render = function () {
  if (page === "overview" && selected !== lastEconomicState) {
    economicScope = regions[selected].id;
    lastEconomicState = selected;
  }
  renderBeforeScopes();
  if (page === "overview") {
    $("#economic-scope").onchange = (e) => {
      economicScope = e.target.value;
      if (economicScope !== "all") {
        selected = regions.findIndex((s) => s.id === economicScope);
        lastEconomicState = selected;
      }
      render();
    };
    $("#economy-download").onclick = () =>
      download(
        "aderin-economic-accounts.json",
        JSON.stringify(
          {
            scope: economicScope,
            baseline: EconomyEngine.baseline,
            accounts:
              economicScope === "all"
                ? economicAccounts
                : economicAccounts.states.find((s) => s.id === economicScope),
            resources: EconomyEngine.resources,
            synthetic: true,
          },
          null,
          2,
        ),
      );
  }
};
render();
