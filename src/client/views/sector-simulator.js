/** Render sector simulator HTML; the controller supplies transient view state. */
function renderSectorSimulatorMarkup(budget, o, r, s) {
  return /* HTML */ `<div class="grid">
    <section class="panel">
      ${panelHead(`${s.name} investment package`)}
      <div class="full">
        ${s.actions.map(([name], i) => `<div class="slider-row"><label for="sector-budget-${i}">${name}<b>A₦ ${budget[i]}M</b></label><input type="range" id="sector-budget-${i}" data-sector-budget="${i}" min="0" max="100" step="5" value="${budget[i]}"></div>`).join("")}
        <div class="slider-row">
          <label for="sector-delivery">Delivery effectiveness<b>${sectorDelivery}%</b></label
          ><input id="sector-delivery" type="range" min="0" max="100" value="${sectorDelivery}" />
        </div>
        <p>12-month horizon · A₦ 200M package ceiling · stable demand and operating costs.</p>
        <button class="btn primary" id="sector-save">
          Save ${s.name.toLowerCase()} decision →
        </button>
      </div>
    </section>
    <section class="panel">
      ${panelHead("Conditional service outcome", '<span class="pill">RULES MODEL</span>')}
      <div class="full">
        <span class="stat-label">${s.metric} · ${r.name}</span>
        <div class="scenario-result green">${o.result.toFixed(1)} ${s.unit}</div>
        <div class="metric"><span>Baseline</span><b>${o.baseline} ${s.unit}</b></div>
        <div class="metric">
          <span>Modelled ${s.higher ? "increase" : "reduction"}</span
          ><b>${o.change.toFixed(1)} ${s.unit === "%" ? "percentage points" : "minutes"}</b>
        </div>
        <div class="metric">
          <span>Cost / ceiling</span
          ><b class="${o.cost > 200 ? "amber" : ""}">A₦ ${o.cost}M / 200M</b>
        </div>
        <p>
          ${s.people}: ${(o.eligiblePopulation / 1e6).toFixed(2)}M in the region. This is the
          population in scope, not the number who will benefit.
        </p>
        <details>
          <summary class="text-btn">Inspect model formula & limitations</summary>
          <p>
            Change = sum(allocation × intervention coefficient) × delivery / 100, limited by
            remaining physical capacity.
            ${s.higher ? "Result = baseline + change." : "Result = baseline − change."} No
            diminishing returns, displacement or cross-sector multipliers are modelled.
          </p>
        </details>
        <p class="amber">
          ${o.cost > 200 ? "Budget ceiling exceeded; reduce allocations before saving." : "Operating funding, procurement and distributional effects need separate review."}
        </p>
      </div>
    </section>
  </div>`;
}
