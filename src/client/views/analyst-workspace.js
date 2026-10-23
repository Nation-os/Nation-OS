/** Render analyst workspace HTML; the controller supplies transient view state. */
function renderAnalystWorkspaceMarkup() {
  return /* HTML */ `<div class="notice">
      ${analystStatus.configured ? `Live AI configured · ${escapeHtml(analystStatus.model)}. Provider access is verified when a request succeeds.` : "Automated analysis is ready. No API key or model download is needed. Live generative AI is optional and is not configured."}
      Automated analysis runs locally without a model download or API key. If you choose Live AI,
      only aggregate synthetic records selected for the question are sent to OpenAI; no individual
      citizen profiles or saved decisions are included.
    </div>
    <div class="grid">
      <section class="panel">
        ${panelHead("Ask about Aderin", "<small>GROUNDED IN LOCAL RECORDS</small>")}
        <form id="analyst-form" class="full">
          <div class="field">
            <label for="analyst-question">Question or proposal request</label
            ><textarea
              id="analyst-question"
              required
              maxlength="4000"
              placeholder="What might explain low school attendance, and what should we investigate?"
            >
${escapeHtml(analystQuestion)}</textarea>
          </div>
          <div class="field">
            <label for="analyst-scope">Evidence scope</label
            ><select id="analyst-scope">
              <option value="all">Whole country / detect state in question</option>
              ${regions.map((s) => `<option value="${s.id}" ${analystScope === s.id ? "selected" : ""}>${s.name}</option>`).join("")}
            </select>
          </div>
          <div class="actions" style="justify-content:flex-start">
            <button class="btn primary" type="submit" ${analystBusy ? "disabled" : ""}>
              ${analystBusy ? "Analysing…" : "Analyse question"}</button
            ><button
              class="btn"
              type="button"
              id="analyst-live"
              ${analystBusy || !analystStatus.configured ? "disabled" : ""}
            >
              Ask live AI</button
            ><button class="btn" type="button" id="analyst-search" ${analystBusy ? "disabled" : ""}>
              Search evidence
            </button>
          </div>
          <p id="analyst-error" role="alert" class="amber">${escapeHtml(analystError)}</p>
        </form>
      </section>
      <section class="panel full">
        <h2>What the analyst can do</h2>
        <p>
          Explain state indicators, rank service gaps, compare economic accounts and prepare a draft
          annual investment package with a five- or ten-year roadmap.
        </p>
        <p>
          The numerical planner evaluates a proposal’s five- or ten-year service and fiscal paths.
          You review the proposal before saving a decision.
        </p>
        <p class="analyst-note">
          Live AI can make mistakes. Retrieved records are evidence of the fictional baseline, not
          proof that an intervention will work.
        </p>
        <button class="text-btn" id="analyst-setup">Optional live AI setup</button>
      </section>
    </div>
    <div style="margin-top:22px">${analystResults()}</div>`;
}
