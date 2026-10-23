/** Render sector decision card HTML; the controller supplies transient view state. */
function renderSectorDecisionCardMarkup(i, r, s) {
  return /* HTML */ `<section class="panel evidence">
    <span class="badge"
      >${escapeHtml(s.name)} · ${escapeHtml(r.region)} · ${escapeHtml(r.date)}</span
    >
    <h3 style="margin-top:15px">${escapeHtml(r.title)}</h3>
    <p>${escapeHtml(r.reason)}</p>
    <div class="metric"><span>Reviewer</span><b>${escapeHtml(r.reviewer)}</b></div>
    <div class="metric">
      <span>Conditional ${escapeHtml(s.metric.toLowerCase())}</span
      ><b>${r.modelSnapshot.baseline} → ${r.modelSnapshot.result.toFixed(1)} ${s.unit}</b>
    </div>
    <div class="metric"><span>Budget</span><b>A₦ ${r.modelSnapshot.cost}M</b></div>
    <p>${s.actions.map(([n], j) => `${n}: A₦ ${r.allocation[j]}M`).join(" · ")}</p>
    <p>Source: ${escapeHtml(r.source)}. ${escapeHtml(r.gap)}</p>
    <p>
      Model: ${escapeHtml(r.modelSnapshot.modelVersion)} · Delivery: ${r.modelSnapshot.delivery}% ·
      12 months · stable demand and operating costs. Outcomes unverified.
    </p>
    <div class="timeline">
      ${r.milestones.map((m, j) => `<h3>Month ${[1, 3, 12][j]}</h3><p>${escapeHtml(m)}</p>`).join("")}
    </div>
    <span class="pill">${r.reviewed ? "REVIEWED FOR HANDOVER" : "DRAFT DECISION"}</span>
    <button class="btn" data-sector-review="${i}">Toggle handover review</button>
    <button class="text-btn" data-sector-download="${i}">Download record ↓</button>
  </section>`;
}
