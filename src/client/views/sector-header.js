/** Render sector header HTML; the controller supplies transient view state. */
function renderSectorHeaderMarkup(s) {
  return /* HTML */ `<div class="sector-toolbar">
      <div class="sector-tabs">
        ${["overview", "evidence", "simulator", "people"].map((t) => `<button class="btn ${t === sectorTab ? "primary" : ""}" data-sector-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}
      </div>
      <select id="sector-region" aria-label="Sector region">
        ${regions.map((r, i) => `<option value="${i}" ${selected === i ? "selected" : ""}>${r.name}</option>`).join("")}
      </select>
    </div>
    <div class="notice">
      ${s.name.toUpperCase()} · Synthetic baseline and illustrative capacity model. Each sector has
      its own inputs, units and intervention coefficients. Cross-sector links below describe
      hypotheses; their effects are not added to model results.
    </div>`;
}
