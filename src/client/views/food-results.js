/** Render food results HTML; the controller supplies transient view state. */
function renderFoodResultsMarkup(o) {
  return /* HTML */ `<span class="stat-label">Modelled staple basket cost relief</span>
    <div class="scenario-result green">
      ${o.relief.toFixed(1)}%
      <span style="font-size:13px;font-weight:400">vs. no intervention</span>
    </div>
    <p style="font-size:11px">
      Illustrative sensitivity range:
      ${(o.relief * 0.65).toFixed(1)}–${(o.relief * 1.15).toFixed(1)}%. This range varies delivery
      effectiveness only.
    </p>
    <div class="metric">
      <span>Package cost</span><b class="${o.cost > 200 ? "amber" : ""}">A₦ ${o.cost}M / 200M</b>
    </div>
    <div class="metric"><span>People potentially reached</span><b>${o.people}M</b></div>
    <div class="metric"><span>Initial review point</span><b>Month 3</b></div>
    <div class="metric"><span>Capital delivery estimate</span><b>${o.months} months</b></div>
    <p style="font-size:11px;color:var(--amber)">
      ${o.cost > 200 ? "Budget exceeded. Reduce allocations before saving." : "Trade-off: infrastructure takes time; cash support requires recurring funding and beneficiary verification."}
    </p>
    <details>
      <summary class="text-btn">View model formulas</summary>
      <p style="font-size:11px">
        Relief (%) = min(18, roads × 0.07 + storage × 0.09 + support × 0.045). Reach (millions) =
        roads × 0.009 + storage × 0.012 + support × 0.035. Inputs are A₦ millions. No intervention
        feedback loops or general-equilibrium effects are modelled.
      </p>
    </details>`;
}
