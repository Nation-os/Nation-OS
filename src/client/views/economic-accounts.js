/** Render economic accounts HTML; the controller supplies transient view state. */
function renderEconomicAccountsMarkup(account, deficit, label, metrics, national, resourceRows) {
  return /* HTML */ `<div class="title-row" style="margin-top:30px">
      <div>
        <p class="eyebrow">ECONOMIC ACCOUNTS · 2026</p>
        <h2>Economy & public finances</h2>
        <p>Choose the national summary or an individual jurisdiction.</p>
      </div>
      <select id="economic-scope" aria-label="Economic account scope">
        <option value="all" ${national ? "selected" : ""}>Whole country · General summary</option>
        ${economicAccounts.states.map((s) => `<option value="${s.id}" ${economicScope === s.id ? "selected" : ""}>${s.name}</option>`).join("")}</select
      ><button class="btn" id="economy-download">Download accounts ↓</button>
    </div>
    <div class="notice">
      <b>${label}</b> ·
      ${national ? "Consolidated national figures include federal and state governments. Selecting a state on the map opens its economic accounts below." : "These are this jurisdiction’s synthetic figures, not national totals. State government accounts exclude federal revenue, expenditure and debt."}
      GDP and trade sum across states; state government accounts plus the federal residual reconcile
      nationally. All numbers are fictional.
    </div>
    <div class="stats">
      ${stat(national ? "National GDP" : "State GDP", moneyM(account.gdp), "2026 current-price baseline", "blue")}${stat("GDP per resident", `A₦ ${Math.round((account.gdp * 1e6) / account.population).toLocaleString()}`, "Economic output, not household income", "blue")}${stat(national ? "Consolidated annual budget" : "State annual budget", moneyM(account.spending), "2026 government spending", "blue")}${stat("Population", account.population.toLocaleString(), national ? "All states and capital territory" : account.zone, "blue")}
    </div>
    <div class="lower">
      <section class="panel">
        ${panelHead(national ? "National macroeconomic baseline" : `${account.name} · Economic baseline`, "<small>2026 SYNTHETIC ACCOUNTS</small>")}
        <div class="full">
          ${metrics.map(([k, v]) => `<div class="metric"><span>${k}</span><b>${v}</b></div>`).join("")}
          <p>
            ${national ? "Inflation and unemployment are population-weighted synthetic averages; national growth is GDP-weighted." : "State output varies by population and assumed productivity; revenue, spending and debt use separate synthetic weights. State unemployment and inflation are distinct assumptions."}
          </p>
        </div>
      </section>
      <section class="panel">
        ${panelHead(national ? "National annual budget" : "State annual budget", "<small>REVENUE & FUNDING</small>")}
        <div class="full">
          ${[
            ["Annual revenue", account.revenue],
            ["Annual spending", account.spending],
            ["Deficit / funding requirement", deficit],
            ["Available investment envelope", account.planningEnvelope],
          ]
            .map(([k, v]) => `<div class="metric"><span>${k}</span><b>${moneyM(v)}</b></div>`)
            .join(
              "",
            )}${national ? `<h3 style="margin-top:24px">National spending allocation</h3>${EconomyEngine.baseline.allocations.map(([k, v]) => `<div class="metric"><span>${k}</span><b>${moneyM(v)}</b></div>`).join("")}<h3 style="margin-top:24px">Federal / state reconciliation</h3><p>State governments: 60% of revenue, 65% of spending and 55% of debt. The federal account holds the remainder. These shares define this fictional baseline, not a real fiscal system.</p>` : "<p>Detailed state spending categories are not estimated. This state’s investment envelope is part of its budget, not additional revenue. The long-term fiscal model continues to use the consolidated national budget.</p>"}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:24px">
      ${panelHead("Natural resource register", `<small>${national ? "NATIONAL ENDOWMENTS" : "RESOURCES IN THE STATE’S ZONE"}</small>`)}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Location</th>
              <th>Stock / potential</th>
              <th>Annual output / capacity</th>
              <th>National public revenue</th>
            </tr>
          </thead>
          <tbody>
            ${resourceRows.map((r) => `<tr><td>${r.name}</td><td>${r.zones.map((z) => administrativeZones[z].name).join(", ")}</td><td>${r.stock}</td><td>${r.output}</td><td>${r.revenue ? moneyM(r.revenue) : "Not separately modelled"}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <p class="map-caption" style="margin-top:16px">
        Resource reserves, production and revenues shown here remain national or zone-level records.
        They are not claimed as this state’s deposits or receipts. Reserves are not spendable cash.
      </p>
    </section>`;
}
