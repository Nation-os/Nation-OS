/** Render sector decision form HTML; the controller supplies transient view state. */
function renderSectorDecisionFormMarkup(s) {
  return /* HTML */ `<p class="eyebrow">${s.name.toUpperCase()} · DRAFT DECISION</p>
    <h1>Preserve the reasoning.</h1>
    <form id="sector-decision-form">
      <div class="field">
        <label for="sector-title">Title</label
        ><input
          id="sector-title"
          name="title"
          required
          maxlength="140"
          value="${s.name} investment in ${regions[selected].name}"
        />
      </div>
      <div class="field">
        <label for="sector-reason">Reasoning and accepted trade-offs</label
        ><textarea id="sector-reason" name="reason" required maxlength="3000"></textarea>
      </div>
      <div class="field">
        <label for="sector-reviewer">Responsible reviewer</label
        ><input
          id="sector-reviewer"
          name="reviewer"
          required
          maxlength="100"
          value="${s.name} Planning Directorate"
        />
      </div>
      <p>
        Includes regional baseline, allocations, model version, delivery assumptions, evidence gaps
        and review milestones. No outcomes have been measured.
      </p>
      <button class="btn primary">Save draft</button>
    </form>`;
}
