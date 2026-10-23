/** Render sector evidence HTML; the controller supplies transient view state. */
function renderSectorEvidenceMarkup(o, r, s) {
  return /* HTML */ `<div class="grid">
    <div>
      <section class="panel evidence">
        <span class="badge">SYNTHETIC OBSERVATION · 2026 Q3</span>
        <h3 style="margin-top:15px">${s.metric} in ${r.name}</h3>
        <p>Baseline: ${o.baseline} ${s.unit}. Planning target: ${s.target} ${s.unit}.</p>
        <p>${s.source}. 37 state aggregates; underlying individual records are not represented.</p>
      </section>
      <section class="panel evidence">
        <span class="badge">MODEL ASSUMPTION</span>
        <h3 style="margin-top:15px">Investment-to-capacity response</h3>
        <p>
          ${s.actions.map(([name, c]) => `${name}: ${c} ${s.unit === "%" ? "percentage points" : "minutes reduced"} per A₦ million at full delivery`).join("<br>")}
        </p>
        <p>
          Linear response with a physical limit of ${s.higher ? "100%" : "zero minutes"}. Delivery
          effectiveness scales the estimated change. Coefficients are illustrative, not empirically
          fitted.
        </p>
      </section>
    </div>
    <section class="panel full">
      <h2>Evidence gaps & review</h2>
      <p>${s.gap}</p>
      <p>
        Baseline owner: fictional ${s.name} Planning Directorate. Reviewer: National Planning
        Office. Baseline vintage: Q3 2026.
      </p>
      <p class="amber">
        No causal validation or measured intervention outcomes are available. Obtain facility and
        household evidence before making a real decision.
      </p>
    </section>
  </div>`;
}
