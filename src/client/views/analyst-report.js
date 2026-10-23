/** Render analyst report HTML; the controller supplies transient view state. */
function renderAnalystReportMarkup(r) {
  return /* HTML */ `<section class="panel">
      ${panelHead(r.mode === "ai" ? "AI analysis" : r.mode === "local" ? "Automated analysis" : "Retrieved evidence", `<small>${r.mode === "ai" ? escapeHtml(r.model) : r.mode === "local" ? "LOCAL RULES · NO MODEL DOWNLOAD" : "LOCAL SEARCH · NO AI GENERATION"}</small>`)}
      <div class="full">
        <p class="analyst-note">Question: ${escapeHtml(r.question)}</p>
        <p>${escapeHtml(r.summary)}</p>
        ${r.findings.map((f) => `<article class="analyst-finding"><p>${escapeHtml(f.text)}</p>${sourceButtons(f.sourceIds)}</article>`).join("")}
        <h3 style="margin-top:24px">Evidence gaps</h3>
        <ul>
          ${r.gaps.map((g) => `<li>${escapeHtml(g)}</li>`).join("")}
        </ul>
        <h3>Assumptions</h3>
        <ul>
          ${r.assumptions.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
        </ul>
        <p class="analyst-note">
          Source IDs are checked against retrieved records. Citation presence does not establish
          factual correctness or causal validity; review the source contents.
        </p>
        <button class="btn" id="analyst-export">Download analysis & sources ↓</button>
      </div>
    </section>
    ${
      r.proposal
        ? `<section class="panel full" style="margin-top:22px"><p class="eyebrow">${r.mode === "ai" ? "AI-DRAFTED PROPOSAL" : "AUTOMATED PROPOSAL"} · NOT APPROVED</p><h2>${escapeHtml(r.proposal.title)}</h2><p>${escapeHtml(r.proposal.reason)}</p><div class="metric"><span>Investment scope</span><b>${r.proposal.scope === "all" ? "Whole country" : escapeHtml(regions.find((s) => s.id === r.proposal.scope)?.name || r.proposal.scope)}</b></div><div class="metric"><span>Horizon / annual cost</span><b>${r.proposal.years} years · ${moneyM(r.modelResult.annualCost)} / year</b></div><div class="metric"><span>Total modelled cost</span><b>${moneyM(r.modelResult.totalCost)}</b></div><p>The server ran the deterministic service and fiscal models using the draft’s suggested inputs. All projected values come from the numerical models.</p><div style="overflow:auto"><table class="compare"><thead><tr><th>National indicator</th><th>No new investment</th><th>Draft plan in ${r.modelResult.years.at(-1).year}</th></tr></thead><tbody>${Object.entries(
            PlanningEngine.definitions,
          )
            .map(([k, d]) => {
              const v = r.modelResult.years.at(-1).national[k];
              return `<tr><td>${d.metric}</td><td>${displayPlanValue(v.no, k)}</td><td>${displayPlanValue(v.with, k)}</td></tr>`;
            })
            .join(
              "",
            )}</tbody></table></div><button class="btn primary" id="analyst-apply" style="margin-top:20px">Review & edit in recommendations →</button></section>`
        : ""
    }`;
}
