/** Attach the independent treasury projection to service-model results. GDP growth remains an assumption, not an intervention return. */
function moneyM(n) {
  return `A₦ ${Number(n).toLocaleString("en-GB", { maximumFractionDigits: 1 })}M`;
}
function economyProfile() {
  const e = EconomyEngine.baseline,
    zoneShares = [0.14, 0.18, 0.15, 0.24, 0.12, 0.17],
    state = regions[selected],
    stateGDP =
      (e.gdp * zoneShares[state.parentZone] * state.pop) /
      administrativeZones[state.parentZone].pop;
  return renderLegacyEconomicSummaryMarkup(e, state, stateGDP);
}
const profileBeforeEconomy = countryProfile;
countryProfile = function () {
  return profileBeforeEconomy() + economyProfile();
};
const projectBeforeFiscal = PlanningEngine.project;
PlanningEngine.project = function (states, config) {
  const result = projectBeforeFiscal(states, config);
  result.fiscal = EconomyEngine.fiscalPlan(result.annualCost, config.years);
  return result;
};
function fiscalPanel(result) {
  const f = result.fiscal,
    last = f.rows.at(-1);
  return renderFiscalOutlookMarkup(f, last);
}
const recommendationsBeforeFiscal = renderRecommendations;
renderRecommendations = function () {
  recommendationsBeforeFiscal();
  $("#content").insertAdjacentHTML("beforeend", fiscalPanel(planResult));
};
const renderBeforeEconomy = render;
render = function () {
  renderBeforeEconomy();
  if (page === "overview")
    $("#economy-download").onclick = () =>
      download(
        "aderin-economic-accounts.json",
        JSON.stringify(
          { baseline: EconomyEngine.baseline, resources: EconomyEngine.resources, synthetic: true },
          null,
          2,
        ),
      );
};
render();
