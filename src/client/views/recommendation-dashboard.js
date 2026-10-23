/** Render recommendation dashboard HTML; the controller supplies transient view state. */
function renderRecommendationDashboardMarkup(defs, end, first, result) {
  return /* HTML */ `<div class="notice">
      RULE-BASED RECOMMENDATIONS · Suggestions prioritize aggregate service gaps and population, not
      religion or personal identity. Projections are conditional scenarios with explicit
      illustrative assumptions; they do not predict what will actually happen.
    </div>
    <section class="panel">
      ${panelHead("System recommendations", "<small>GAP-BASED · HUMAN REVIEW REQUIRED</small>")}
      <div class="recommendation-grid">
        ${PlanningEngine.recommend(planningStates)
          .map(
            (rec, i) =>
              `<article class="recommendation-card"><span class="badge">PRIORITY ${i + 1} · ${defs[rec.sector].name}</span><h3>${rec.state}</h3><p>${rec.reason}</p><button class="text-btn" data-use-recommendation="${i}">Model this recommendation →</button></article>`,
          )
          .join("")}
      </div>
    </section>
    <div class="grid" style="margin-top:20px">
      <section class="panel">
        ${panelHead("Proposal & assumptions", `<small>${escapeHtml(proposalOrigin)}</small>`)}
        <form class="full" id="plan-form">
          <div class="field">
            <label for="plan-title">Proposal title</label
            ><input
              id="plan-title"
              name="title"
              required
              maxlength="160"
              value="${escapeHtml(proposalTitle)}"
            />
          </div>
          <div class="field">
            <label for="plan-reason">Reasoning, affected communities and accepted trade-offs</label
            ><textarea id="plan-reason" maxlength="3000">${escapeHtml(proposalReason)}</textarea>
          </div>
          <div class="region-details" style="grid-template-columns:1fr 1fr">
            <div class="field">
              <label for="plan-years">Planning horizon</label
              ><select id="plan-years">
                <option value="5" ${planConfig.years === 5 ? "selected" : ""}>
                  5 years · 2031
                </option>
                <option value="10" ${planConfig.years === 10 ? "selected" : ""}>
                  10 years · 2036
                </option>
              </select>
            </div>
            <div class="field">
              <label for="plan-scope">Investment scope</label
              ><select id="plan-scope">
                <option value="all">Whole country</option>
                ${planningStates.map((s) => `<option value="${s.id}" ${planConfig.scope === s.id ? "selected" : ""}>${s.name}</option>`).join("")}
              </select>
            </div>
          </div>
          <h3>Annual allocations · A₦ millions</h3>
          <p style="font-size:11px">
            Budgets repeat every year. National allocations are distributed by population within the
            selected scope.
          </p>
          ${Object.entries(defs)
            .map(
              ([k, d]) =>
                `<div class="metric"><label for="budget-${k}">${d.name}</label><input id="budget-${k}" type="number" min="0" max="2000" step="0.01" required value="${planConfig.budgets[k]}" style="width:110px"></div>`,
            )
            .join("")}
          <div class="region-details" style="grid-template-columns:1fr 1fr">
            <div class="field">
              <label for="plan-growth">Annual population growth (%)</label
              ><input
                id="plan-growth"
                type="number"
                min="0"
                max="5"
                step=".1"
                required
                value="${planConfig.growth}"
              />
            </div>
            <div class="field">
              <label for="plan-delivery">Delivery effectiveness (%)</label
              ><input
                id="plan-delivery"
                type="number"
                min="0"
                max="100"
                required
                value="${planConfig.delivery}"
              />
            </div>
            <div class="field">
              <label for="plan-maintenance">Budget reserved for upkeep (%)</label
              ><input
                id="plan-maintenance"
                type="number"
                min="0"
                max="50"
                required
                value="${planConfig.maintenance}"
              />
            </div>
          </div>
          <button class="btn primary" type="submit">Recalculate proposal →</button>
          <p id="plan-error" class="amber" role="alert"></p>
        </form>
      </section>
      <div>
        <section class="panel">
          ${panelHead("Country-level effects", '<span class="pill">CONDITIONAL PROJECTION</span>')}
          <div class="full">
            <div class="metric">
              <span>Annual cost</span><b>A₦ ${result.annualCost.toLocaleString()}M</b>
            </div>
            <div class="metric">
              <span>${planConfig.years}-year cumulative cost</span
              ><b>A₦ ${result.totalCost.toLocaleString()}M</b>
            </div>
            <div class="metric">
              <span>Projected national population</span><b>${(end.population / 1e6).toFixed(2)}M</b>
            </div>
            <p style="font-size:11px">
              ${planConfig.scope === "all" ? "Whole-country investment." : "Investment is limited to " + planningStates.find((s) => s.id === planConfig.scope).name + ". Other states follow the baseline path; national results include all states."}
              Costs are constant real 2026 A₦. A separate treasury scenario below compares them with
              the budget.
            </p>
            <select id="plan-focus" aria-label="Chart metric">
              ${Object.entries(defs)
                .map(
                  ([k, d]) =>
                    `<option value="${k}" ${k === planFocus ? "selected" : ""}>${d.metric}</option>`,
                )
                .join("")}</select
            >${planChart(result, planFocus)}<small
              ><span class="green">━ Proposed plan</span> ·
              <span class="amber">┄ No additional investment</span><br />Muted lines: delivery ±20
              percentage points, bounded 0–100. Sensitivity paths, not confidence intervals.</small
            >
          </div>
        </section>
        <section class="panel full" style="margin-top:20px">
          <h2>How this plan works</h2>
          <div class="timeline">
            <h3>Year 1 · Validate & establish delivery</h3>
            <p>
              Verify state baselines, consult affected communities, establish procurement and assign
              sector owners.
            </p>
            <h3>Years 2–3 · Deliver & measure</h3>
            <p>
              Fund selected interventions annually, reserve upkeep funding and compare measured
              access with modelled milestones.
            </p>
            <h3>Year 5 · Independent review</h3>
            <p>
              Review costs, distribution and service quality before continuing or changing
              investment.
            </p>
            ${planConfig.years === 10 ? "<h3>Years 6–10 · Renew & adapt</h3><p>Refresh baseline data, inspect asset condition and re-authorize budgets. Year 10 is a final evaluation checkpoint.</p>" : ""}
          </div>
          <p class="amber">
            No modelled improvement establishes project success. Outcomes remain unverified until
            measured.
          </p>
        </section>
      </div>
    </div>
    <section class="panel" style="margin-top:20px">
      ${panelHead(`National service indicators in ${end.year}`, "<small>COUNTRY-WIDE AGGREGATES</small>")}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Metric</th>
              <th>2026 baseline</th>
              <th>No new investment</th>
              <th>Proposed plan</th>
              <th>Increment vs. baseline path</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(defs)
              .map(
                ([k, d]) =>
                  `<tr><td>${d.metric}</td><td>${displayPlanValue(first.national[k].with, k)}</td><td>${displayPlanValue(end.national[k].no, k)}</td><td>${displayPlanValue(end.national[k].with, k)}</td><td>${(end.national[k].with - end.national[k].no).toFixed(2)} ${d.unit === "%" ? "pp" : "min"}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel" style="margin-top:20px">
      ${panelHead("Annual roadmap · " + defs[planFocus].metric, "<small>REVIEW TARGETS, NOT MEASURED OUTCOMES</small>")}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Year</th>
              <th>Population</th>
              <th>No new investment</th>
              <th>Proposed plan</th>
              <th>Annual cost</th>
              <th>Cumulative cost</th>
            </tr>
          </thead>
          <tbody>
            ${result.years.map((y) => `<tr><td>${y.year}</td><td>${(y.population / 1e6).toFixed(2)}M</td><td>${displayPlanValue(y.national[planFocus].no, planFocus)}</td><td>${displayPlanValue(y.national[planFocus].with, planFocus)}</td><td>A₦ ${y.annualCost.toLocaleString()}M</td><td>A₦ ${y.cumulativeCost.toLocaleString()}M</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
    <section class="panel full" style="margin-top:20px">
      <h2>Assumptions, inclusion & model limits</h2>
      <p>
        Model: ${result.version}. Annual change uses sector investment per million projected
        residents, a sector cost coefficient, delivery effectiveness and remaining capacity.
        Population growth increases demand; maintenance affects how much of past improvement is
        retained.
      </p>
      <details>
        <summary class="text-btn">Inspect formulas and coefficients</summary>
        <p>${escapeHtml(result.assumptions.formula)}</p>
        <p>${escapeHtml(result.assumptions.maintenance)}</p>
        <p>
          ${Object.entries(defs)
            .map(
              ([k, d]) =>
                `${d.name}: A₦ ${d.cost}M per unit of improvement per million people before delivery and capacity adjustments; annual drift ${d.drift} × (1 + growth / 2).`,
            )
            .join("<br>")}
        </p>
      </details>
      <p>
        Consult language groups and religious communities about service accessibility and
        scheduling. Audit disability access, rural coverage, income affordability and digital
        exclusion. The model does not assign different benefits by religion or simulate these
        subgroup effects.
      </p>
      <p>
        ${result.limitations.map(escapeHtml).join(" · ")}. Effects across sectors are projected
        independently; no GDP, job or causal spillover estimates are claimed.
      </p>
    </section>
    <section class="panel" style="margin-top:20px">
      ${panelHead("Proposed decisions & saved plans", `<small>${savedPlans.length} SAVED IN THIS BROWSER</small>`)}${savedPlans.length ? savedPlans.map((p, i) => `<div class="record"><span class="record-icon">▤</span><div><h3>${escapeHtml(p.title)}</h3><p>${p.result.config.years}-year plan · ${escapeHtml(p.origin)} · ${escapeHtml(p.date)} · ${p.reviewed ? "Reviewed for handover" : "Draft; not approved"}</p><p>${escapeHtml(p.reason)}</p><button class="text-btn" data-load-plan="${i}">Inspect plan →</button> <button class="text-btn" data-export-plan="${i}">Download snapshot ↓</button> <button class="text-btn" data-review-plan="${i}">Toggle handover review</button></div></div>`).join("") : '<p class="full">Recalculate a proposal, then save its assumptions and annual roadmap for review.</p>'}
    </section>`;
}
