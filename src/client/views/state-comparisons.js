/** Render state comparisons HTML; the controller supplies transient view state. */
function renderStateComparisonsMarkup(
  a,
  b,
  leader,
  leaders,
  national,
  options,
  priorities,
  rows,
  weightSum,
) {
  return /* HTML */ `<div class="notice">
      “Best” means highest on the selected indicators and weights, not best governed or best for
      every resident. These synthetic cross-sectional data explain score differences, not their
      causes. GDP, religion, ownership and population size do not contribute to the overall service
      score.
    </div>
    <div class="sector-toolbar">
      <select id="comparison-metric" aria-label="Ranking indicator">
        <option value="overall">Overall service score</option>
        ${Object.entries(ComparisonEngine.metrics)
          .map(
            ([k, d]) =>
              `<option value="${k}" ${comparisonMetric === k ? "selected" : ""}>${d.name}</option>`,
          )
          .join("")}</select
      ><label style="font-size:12px"
        ><input id="comparison-territory" type="checkbox" ${includeCapital ? "checked" : ""} />
        Include capital territory</label
      >
    </div>
    <div class="stats">
      ${stat(leaders.length > 1 ? "Joint leaders" : "Highest ranked", leaders.length > 1 ? leaders.length + " jurisdictions" : leader.name, `${leader.score.toFixed(1)} / 100 · ${comparisonMetric === "overall" ? "weighted service score" : ComparisonEngine.metrics[comparisonMetric].name}`)}${stat("Population-weighted mean", national.toFixed(1) + " / 100", "Across included jurisdictions", "blue")}${stat("Jurisdictions compared", rows.length, includeCapital ? "36 states + capital territory" : "States only", "blue")}${stat("Reference period", "Q3 2026", "Synthetic baseline · not a trend", "blue")}
    </div>
    <div class="grid">
      <section class="panel full">
        <h2>
          ${leaders.length > 1 ? "Why the joint leaders score highly" : "Why " + leader.name + " scores highly"}
        </h2>
        <p>
          ${comparisonMetric === "overall" ? "The overall score is the weighted average of six target-attainment scores. It uses rates and journey times, not raw population or GDP." : `This ranking uses ${ComparisonEngine.metrics[comparisonMetric].label.toLowerCase()} only. The overall weights do not affect this sector ranking.`}
        </p>
        ${(comparisonMetric === "overall"
          ? Object.keys(ComparisonEngine.metrics)
              .sort((x, y) => leader.contributions[y] - leader.contributions[x])
              .slice(0, 3)
          : [comparisonMetric]
        )
          .map(
            (k) =>
              `<div class="metric"><span>${ComparisonEngine.metrics[k].label}</span><b>${comparisonFormat(k, leader.baselines[k])} · ${leader.components[k].toFixed(1)}/100</b></div>`,
          )
          .join(
            "",
          )}${leaders.length > 1 ? `<p>Joint first place: ${leaders.map((s) => s.name).join(", ")}. The listed indicator examples describe ${leader.name}; inspect other leaders below.</p>` : ""}
        <p>
          These indicators account for the score. The data do not show whether management,
          investment, geography or historical advantages caused the results.
        </p>
      </section>
      <section class="panel full">
        <h2>What the score includes</h2>
        <details open>
          <summary class="text-btn">Weights & methodology</summary>
          <form id="comparison-weights">
            ${Object.entries(ComparisonEngine.metrics)
              .map(
                ([k, d]) =>
                  `<div class="metric"><label for="weight-${k}">${d.name}</label><input id="weight-${k}" type="number" min="0" max="5" step="1" required value="${comparisonWeights[k]}" style="width:65px"></div>`,
              )
              .join("")}
            <p>
              Default: equal weights. Weights are normalized to sum to 100%; at least one must be
              positive.
            </p>
            <button class="btn">Apply weights</button>
            <button type="button" class="text-btn" id="comparison-reset">Reset</button>
            <p id="comparison-error" class="amber" role="alert"></p>
          </form>
          <p>
            Access/attendance score = min(100, baseline ÷ target × 100). Lower-is-better score =
            min(100, target ÷ baseline × 100). Zero pressure or journey time scores 100. Scores
            above target are capped; ties share a rank.
          </p>
        </details>
      </section>
    </div>
    <section class="panel" style="margin-top:24px">
      ${panelHead("Compare two jurisdictions", "<small>BASELINE VALUES · DIRECTION MATTERS</small>")}
      <div class="full" style="display:flex;gap:14px;flex-wrap:wrap">
        <select id="compare-left" aria-label="First state">
          ${options(compareLeft)}</select
        ><select id="compare-right" aria-label="Second state">
          ${options(compareRight)}
        </select>
      </div>
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Indicator</th>
              <th>${a.name}</th>
              <th>${b.name}</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(ComparisonEngine.metrics)
              .map(([k, d]) => {
                const diff = a.baselines[k] - b.baselines[k],
                  ahead =
                    Math.abs(diff) < 1e-9
                      ? "Equal"
                      : (d.higher ? diff > 0 : diff < 0)
                        ? a.name
                        : b.name;
                return `<tr><td>${d.label}<br><small>${d.higher ? "Higher" : "Lower"} is better · target ${d.target}${d.unit}</small></td><td>${comparisonFormat(k, a.baselines[k])}</td><td>${comparisonFormat(k, b.baselines[k])}</td><td>${Math.abs(diff).toFixed(1)} ${d.unit === "%" ? "percentage points" : "minutes"}<br><small>${ahead === "Equal" ? "Equal baseline" : ahead + " has the stronger baseline"}</small></td></tr>`;
              })
              .join("")}
            <tr>
              <td>Overall service score</td>
              <td>${a.overall.toFixed(1)}/100</td>
              <td>${b.overall.toFixed(1)}/100</td>
              <td>${Math.abs(a.overall - b.overall).toFixed(1)} points</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="map-caption" style="margin-top:16px">
        Comparing rates avoids rewarding a state simply for having more residents. It does not
        control for rurality, income, geography or historical investment.
      </p>
    </section>
    <section class="panel" style="margin-top:24px">
      ${panelHead("Economic & business context", "<small>EXCLUDED FROM THE SERVICE SCORE</small>")}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Indicator</th>
              <th>${a.name}</th>
              <th>${b.name}</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              const ea = economicAccounts.states.find((s) => s.id === a.id),
                eb = economicAccounts.states.find((s) => s.id === b.id),
                ca = commerce.summary.find((s) => s.stateId === a.id),
                cb = commerce.summary.find((s) => s.stateId === b.id),
                ai = regions.findIndex((s) => s.id === a.id),
                bi = regions.findIndex((s) => s.id === b.id);
              return [
                ["Population", a.population.toLocaleString(), b.population.toLocaleString()],
                ["GDP", moneyM(ea.gdp), moneyM(eb.gdp)],
                [
                  "GDP per resident",
                  "ADN " + Math.round((ea.gdp * 1e6) / a.population).toLocaleString(),
                  "ADN " + Math.round((eb.gdp * 1e6) / b.population).toLocaleString(),
                ],
                [
                  "Unemployment",
                  ea.unemployment.toFixed(1) + "%",
                  eb.unemployment.toFixed(1) + "%",
                ],
                [
                  "Below demo poverty threshold",
                  regions[ai].poverty + "%",
                  regions[bi].poverty + "%",
                ],
                ["State annual budget", moneyM(ea.spending), moneyM(eb.spending)],
                [
                  "Registered businesses",
                  ca.businesses.toLocaleString(),
                  cb.businesses.toLocaleString(),
                ],
                [
                  "Registered firms per 1,000 residents",
                  ((ca.businesses / a.population) * 1000).toFixed(2),
                  ((cb.businesses / b.population) * 1000).toFixed(2),
                ],
                [
                  "Bank branches per 100,000 residents",
                  (
                    (commerce.banks.reduce((n, s) => n + s.branchesByState[ai], 0) / a.population) *
                    100000
                  ).toFixed(2),
                  (
                    (commerce.banks.reduce((n, s) => n + s.branchesByState[bi], 0) / b.population) *
                    100000
                  ).toFixed(2),
                ],
              ]
                .map(([k, x, y]) => `<tr><td>${k}</td><td>${x}</td><td>${y}</td></tr>`)
                .join("");
            })()}
          </tbody>
        </table>
      </div>
      <p class="map-caption" style="margin-top:16px">
        GDP is output, not personal income. Firm counts are population-allocated and do not prove
        business dynamism; economic and employment data are synthetic assumptions. These contextual
        indicators do not alter the service ranking.
      </p>
    </section>
    <section class="panel" style="margin-top:24px">
      ${panelHead("Where " + a.name + " could improve", "<small>INVESTIGATE → VALIDATE → MODEL</small>")}
      <div class="recommendation-grid">
        ${priorities.length ? priorities.map((p) => `<article class="recommendation-card"><span class="badge">${ComparisonEngine.metrics[p.sector].name.toUpperCase()}</span><h3>${p.gap.toFixed(1)} ${ComparisonEngine.metrics[p.sector].unit === "%" ? "percentage-point gap" : "minute gap"}</h3><p>${improvementOptions[p.sector][0]}</p><p>${improvementOptions[p.sector][1]}</p><p>${p.peer ? `Benchmark: ${p.peer.name}, ${comparisonFormat(p.sector, p.peer.baseline)}. ${p.peer.sameZone ? "Same-zone peer." : "Cross-zone benchmark; context may differ."}` : "No stronger peer baseline is available."}</p><p>Success measure: ${ComparisonEngine.metrics[p.sector].label.toLowerCase()}; verify actual delivery and service quality.</p></article>`).join("") : '<p class="full">All positively weighted targets are met. Review service quality, equity and resilience rather than assuming no further needs exist.</p>'}
      </div>
      <div class="full">
        <label for="comparison-horizon">Draft horizon </label
        ><select id="comparison-horizon">
          <option value="5">5 years</option>
          <option value="10">10 years</option>
        </select>
        <button class="btn primary" id="comparison-plan" ${priorities.length ? "" : "disabled"}>
          Review an improvement plan →
        </button>
        <p>
          Starts with A₦ 100M/year divided across the three priority sectors according to weighted
          score shortfalls. This is a transparent starting allocation, not an optimized or approved
          investment.
        </p>
      </div>
    </section>
    <section class="panel" style="margin-top:24px">
      ${panelHead("All-state ranking", `<small>${comparisonMetric === "overall" ? "WEIGHTED SERVICE SCORE" : ComparisonEngine.metrics[comparisonMetric].name.toUpperCase()}</small>`)}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Jurisdiction</th>
              <th>Score / 100</th>
              ${Object.entries(ComparisonEngine.metrics)
                .map(
                  ([k, d]) =>
                    `<th>${d.name}<br><small>${(comparisonWeights[k] / weightSum) * 100}% overall weight</small></th>`,
                )
                .join("")}
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (s) =>
                  `<tr><td>${s.rank}</td><td>${s.name}<br><small>${s.zone}</small></td><td><b>${s.score.toFixed(1)}</b></td>${Object.keys(
                    ComparisonEngine.metrics,
                  )
                    .map((k) => `<td>${comparisonFormat(k, s.baselines[k])}</td>`)
                    .join(
                      "",
                    )}<td><button class="text-btn" data-compare-state="${s.id}">Inspect</button></td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}
