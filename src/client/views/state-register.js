/** Render state register HTML; the controller supplies transient view state. */
function renderStateRegisterMarkup(filtered) {
  return /* HTML */ `<div class="notice">
      Fictional Aderin dataset · Q3 2026. Open a state profile for its full available record,
      including economic context and zone resources. GDP is an illustrative allocation; service
      indicators are synthetic baselines.
    </div>
    <div class="stats">
      ${stat("States", "36", "Six per administrative zone")}${stat("Capital territories", "1", "Ayara Capital Territory")}${stat("Total population", "24.6M", "Across all jurisdictions")}${stat("Administrative zones", "6", "Highlands, plains, central, western, eastern & coastal")}
    </div>
    <div class="sector-toolbar">
      <input
        type="text"
        id="state-search"
        aria-label="Search states"
        placeholder="Search state, capital or zone"
        value="${escapeHtml(stateSearch)}"
        style="max-width:360px"
      /><select id="zone-filter" aria-label="Filter by zone">
        <option value="all">All administrative zones</option>
        ${administrativeZones.map((z, i) => `<option value="${i}" ${zoneFilter === String(i) ? "selected" : ""}>${z.name}</option>`).join("")}
      </select>
    </div>
    <section class="panel">
      ${panelHead("State data", `<small>${filtered.length} JURISDICTIONS</small>`)}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>State / territory</th>
              <th>Zone / capital</th>
              <th>Population</th>
              <th>GDP (A₦ M)</th>
              <th>School attendance</th>
              <th>Primary care</th>
              <th>Electricity</th>
              <th>Safe water</th>
              <th>Journey time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map((r) => {
                const d = stateRegisterData(r.index);
                return `<tr><td>${r.name}<br><small style="color:var(--muted)">${r.id} · ${r.type}</small></td><td>${r.zone}<br><small>${r.capital}</small></td><td>${d.population.toLocaleString()}</td><td>${d.gdpMillions === null ? "Not supplied" : d.gdpMillions.toLocaleString("en-GB", { maximumFractionDigits: 1 })}</td><td>${d.schoolAttendancePercent}%</td><td>${d.primaryCarePercent}%</td><td>${d.electricityPercent}%</td><td>${d.safeWaterPercent}%</td><td>${d.journeyMinutes} min</td><td><button class="text-btn" data-open-state="${r.index}">View profile</button></td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
        ${filtered.length ? "" : '<p class="empty">No states match your search.</p>'}
      </div>
    </section>
    <p>
      Sources: synthetic state register, school census, facility census, utility register,
      water-point audit and mobility survey. Percentages describe different service measures and do
      not establish quality. Missing state financial accounts are labelled in each profile.
    </p>`;
}
