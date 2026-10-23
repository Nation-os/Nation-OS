/** Render food simulator HTML; the controller supplies transient view state. */
function renderFoodSimulatorMarkup() {
  return /* HTML */ `<div class="notice">
      CONDITIONAL SIMULATION · Results use illustrative formulas. They are neither observed impacts
      nor validated forecasts. A₦ is fictional.
    </div>
    <div class="grid">
      <section class="panel">
        ${panelHead("Build an intervention package", "<small>BUDGET ALLOCATION</small>")}
        <div class="full">
          ${[
            ["roads", "Freight corridor repairs", "Faster distribution · 6–12 months"],
            ["storage", "Regional storage investment", "Lower post-harvest losses · 9–18 months"],
            ["support", "Targeted household support", "Immediate purchasing support · 1–3 months"],
          ]
            .map(
              ([key, l, d]) =>
                `<div class="slider-row"><label for="${key}">${l}<strong id="${key}-value">A₦ ${values[key]}M</strong></label><input type="range" id="${key}" min="0" max="100" step="5" value="${values[key]}"><small>${d}</small></div>`,
            )
            .join("")}
          <p style="font-size:11px">
            Assumptions: normal rainfall, stable fuel costs, full delivery and no major
            displacement. Total package limit: A₦ 200M.
          </p>
          <button class="btn primary" id="save">Save decision & roadmap →</button>
        </div>
      </section>
      <section class="panel">
        ${panelHead("Conditional impact", '<span class="pill">ILLUSTRATIVE</span>')}
        <div class="full" id="results"></div>
      </section>
    </div>
    <section class="panel" style="margin-top:20px">
      ${panelHead("Compare response options", "<small>IDENTICAL BASELINE ASSUMPTIONS</small>")}
      <table class="compare">
        <thead>
          <tr>
            <th>Policy package</th>
            <th>Cost</th>
            <th>Basket cost relief*</th>
            <th>People reached*</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${[
            ["Distribution first", 70, 20, 10],
            ["Household first", 15, 15, 70],
            ["Balanced response", 40, 30, 20],
          ]
            .map(([n, a, b, c]) => {
              const o = outcome({ roads: a, storage: b, support: c });
              return `<tr><td>${n}</td><td>A₦ ${o.cost}M</td><td>${o.relief.toFixed(1)}%</td><td>${o.people}M</td><td><button class="text-btn" data-preset="${a},${b},${c}">Apply →</button></td></tr>`;
            })
            .join("")}
        </tbody>
      </table>
      <p class="map-caption" style="margin-top:14px">
        *Modelled values under stated assumptions. Reach is an illustrative count of unique
        beneficiaries.
      </p>
    </section>`;
}
