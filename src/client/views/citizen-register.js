/** Render citizen register HTML; the controller supplies transient view state. */
function renderCitizenRegisterMarkup(rows, scope, start) {
  return /* HTML */ `<div class="notice">
      ALL RECORDS ARE FICTIONAL · 24.6 million unique citizen IDs are available through
      deterministic generation. Records are computed on demand, not stored as a database of 24.6
      million rows. Demographics are illustrative and are not calibrated to the national dashboard;
      access probabilities use state baselines. Religion, language, disability, education,
      employment, housing, digital access and climate exposure are fictional attributes. Religion is
      not an input to policy scoring or benefit allocation. No real personal information is used.
    </div>
    <div class="stats">
      ${stat("Population coverage", "24.6M", "Unique reproducible citizen IDs")}${stat("Jurisdictions", "37", "36 states + capital territory")}${stat("Household structure", "Up to 4", "Synthetic groups within each state")}${stat("Generator version", "v2", "Fixed seed · reference year 2026")}
    </div>
    <div class="sector-toolbar">
      <select id="citizen-state" aria-label="Citizen state">
        <option value="all">All states & territories</option>
        ${citizenStates.map((s) => `<option value="${s.id}" ${s.id === citizenState ? "selected" : ""}>${s.name}</option>`).join("")}
      </select>
      <form id="citizen-lookup" style="display:flex;gap:8px">
        <input
          type="text"
          id="citizen-id"
          aria-label="Citizen ID"
          placeholder="AD-C-00000001"
          pattern="AD-C-[0-9]{8}"
          required
        /><button class="btn">Find ID</button>
      </form>
    </div>
    <section class="panel">
      ${panelHead("Population records", `<small>${scope.count.toLocaleString()} IN SCOPE</small>`)}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Citizen ID</th>
              <th>Fictional name</th>
              <th>Age</th>
              <th>State</th>
              <th>Settlement</th>
              <th>Occupation / life stage</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((c, i) => `<tr><td><button class="text-btn" data-citizen="${start + i}">${c.id}</button></td><td>${c.name}</td><td>${c.age}</td><td>${c.state}</td><td>${c.settlement}</td><td>${c.occupation}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="full" style="display:flex;justify-content:space-between;align-items:center">
        <button class="btn" id="citizen-prev" ${citizenPage === 0 ? "disabled" : ""}>
          ← Previous</button
        ><small
          >Page ${(citizenPage + 1).toLocaleString()} of
          ${Math.ceil(scope.count / citizenPageSize).toLocaleString()}</small
        ><button
          class="btn"
          id="citizen-next"
          ${(citizenPage + 1) * citizenPageSize >= scope.count ? "disabled" : ""}
        >
          Next →
        </button>
      </div>
      <form id="citizen-jump" class="full" style="display:flex;gap:10px;align-items:center">
        <label for="citizen-page">Jump to page</label
        ><input
          id="citizen-page"
          type="number"
          min="1"
          max="${Math.ceil(scope.count / citizenPageSize)}"
          required
          style="max-width:160px"
          value="${citizenPage + 1}"
        /><button class="btn">Go</button>
      </form>
    </section>
    <p>
      For the full population file, use the streaming export command documented in README.md.
      Browser exports contain up to 1,000 records starting at the displayed page and preserve the
      current state filter.
    </p>`;
}
