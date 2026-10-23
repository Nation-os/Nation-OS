/** Render legacy economic summary HTML; the controller supplies transient view state. */
function renderLegacyEconomicSummaryMarkup(e, state, stateGDP) {
  return /* HTML */ `<div class="title-row" style="margin-top:30px">
      <div>
        <p class="eyebrow">ECONOMY & PUBLIC FINANCES · 2026</p>
        <h2>National income, resources and the annual budget</h2>
        <p>Fictional economic accounts · All amounts in Aderin naira · No exchange rate assumed</p>
      </div>
      <button class="btn" id="economy-download">Download economic accounts ↓</button>
    </div>
    <div class="stats">
      ${stat("Nominal GDP", "A₦ 1.80T", "2026 current-price baseline", "blue")}${stat("GDP per resident", `A₦ ${Math.round((e.gdp * 1e6) / e.population).toLocaleString()}`, "GDP ÷ population; not personal income", "blue")}${stat("Annual public budget", "A₦ 315B", "Consolidated public-sector spending", "blue")}${stat("Public debt / GDP", `${((e.debt / e.gdp) * 100).toFixed(1)}%`, "A₦ 810B baseline debt stock", "blue")}
    </div>
    <div class="lower">
      <section class="panel">
        ${panelHead("Macroeconomic baseline", "<small>ILLUSTRATIVE ANNUAL ACCOUNTS</small>")}
        <div class="full">
          ${[
            ["Real GDP growth", e.realGrowth + "%"],
            ["Consumer price inflation", e.inflation + "%"],
            ["Unemployment rate", e.unemployment + "%"],
            ["Annual government revenue", moneyM(e.revenue)],
            ["Annual government spending", moneyM(e.spending)],
            ["Budget deficit", moneyM(e.spending - e.revenue)],
            ["Deficit / GDP", (((e.spending - e.revenue) / e.gdp) * 100).toFixed(1) + "%"],
            ["Exports of goods & services", moneyM(e.exports)],
            ["Imports of goods & services", moneyM(e.imports)],
            ["Trade balance", moneyM(e.exports - e.imports)],
          ]
            .map(([l, v]) => `<div class="metric"><span>${l}</span><b>${v}</b></div>`)
            .join("")}
          <p>
            GDP measures economic output, not government cash or household income. Resource revenue
            is included in government revenue; it must not be added again.
          </p>
        </div>
      </section>
      <section class="panel">
        ${panelHead("Annual budget allocation", "<small>A₦ 315,000M TOTAL</small>")}
        <div class="full">
          ${e.allocations.map(([name, value]) => `<div class="bar-row"><span>${name}</span><b>${moneyM(value)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${(value / e.spending) * 100}%"></div></div>`).join("")}
          <p>
            The A₦ 3,000M planning envelope is available for proposed investments and is already
            included in annual spending. Proposed costs above this envelope need additional funding.
          </p>
          <h3>Revenue sources</h3>
          ${e.revenueSources.map(([name, value]) => `<div class="metric"><span>${name}</span><b>${moneyM(value)}</b></div>`).join("")}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:24px">
      ${panelHead("Natural resource register", "<small>FICTIONAL ENDOWMENTS & ANNUAL FLOWS</small>")}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Location</th>
              <th>Stock / potential</th>
              <th>Annual output / capacity</th>
              <th>Public revenue</th>
              <th>Planning considerations</th>
            </tr>
          </thead>
          <tbody>
            ${EconomyEngine.resources.map((r) => `<tr><td>${r.name}</td><td>${r.zones.map((z) => administrativeZones[z].name).join(", ")}</td><td>${r.stock}</td><td>${r.output}</td><td>${r.revenue ? moneyM(r.revenue) : "Not separately modelled"}</td><td>${r.risk}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="map-caption" style="margin-top:16px">
        Stocks, technical potential, annual production and installed capacity are different
        measures. None is an estimate of immediately spendable wealth. Reserves are fictional
        assumptions, not surveyed deposits.
      </p>
    </section>
    <section class="panel full" style="margin-top:24px">
      <p class="eyebrow">SELECTED STATE · ECONOMIC CONTEXT</p>
      <h2>${state.name}</h2>
      <div class="metric"><span>Illustrative state GDP</span><b>${moneyM(stateGDP)}</b></div>
      <div class="metric">
        <span>Share of national GDP</span><b>${((stateGDP / e.gdp) * 100).toFixed(2)}%</b>
      </div>
      <div class="metric">
        <span>Zone resource endowments</span
        ><b
          >${EconomyEngine.resources
            .filter((r) => r.zones.includes(state.parentZone))
            .map((r) => r.name)
            .join(" · ")}</b
        >
      </div>
      <p>
        State GDP is allocated from fictional zone output shares by population, not independently
        estimated. Resource locations describe the zone, not a confirmed deposit in every state.
        State-level revenue and budgets are not yet modelled.
      </p>
    </section>`;
}
