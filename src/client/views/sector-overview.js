/** Render sector overview HTML; the controller supplies transient view state. */
function renderSectorOverviewMarkup(o, r, s) {
  return /* HTML */ `<div class="stats">
      ${stat(s.metric, `${o.baseline}${s.unit}`, r.name, "blue")}${stat("Planning target", `${s.target}${s.unit}`, "Illustrative policy ambition")}${stat("Population in scope", `${(o.eligiblePopulation / 1e6).toFixed(2)}M`, s.people)}${stat("Regional records", "6", "2026 Q3 · synthetic observations")}
    </div>
    <div class="grid">
      <section class="panel">
        ${panelHead(`${s.name} across Aderin`)}
        <table class="compare">
          <thead>
            <tr>
              <th>Region</th>
              <th>${s.metric}</th>
              <th>Gap to target</th>
            </tr>
          </thead>
          <tbody>
            ${regions.map((r, i) => `<tr><td><button class="text-btn" data-sector-region="${i}">${r.name}</button></td><td>${s.baseline[i]} ${s.unit}</td><td>${Math.max(0, s.higher ? s.target - s.baseline[i] : s.baseline[i] - s.target)} ${s.unit === "%" ? "percentage points" : "minutes"}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>
      <section class="panel full">
        <h2>Connected consequences</h2>
        <p>${s.impact}</p>
        <div class="timeline">
          ${s.links
            .split(" · ")
            .map(
              (x) =>
                `<h3>${x}</h3><p>Potential relationship for investigation, not an estimated causal effect.</p>`,
            )
            .join("")}
        </div>
        <button class="btn primary" id="sector-start">Compare interventions →</button>
      </section>
    </div>`;
}
