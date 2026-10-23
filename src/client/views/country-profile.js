/** Render country profile HTML; the controller supplies transient view state. */
function renderCountryProfileMarkup(average, state) {
  return /* HTML */ `<div class="notice">
      FICTIONAL COUNTRY · This profile describes the simulated Republic of Aderin. All places,
      demographics and economic figures are illustrative. Reference period: Q3 2026.
    </div>
    <div class="stats">
      ${stat("Population", "24.6M", "Across six administrative zones", "blue")}${stat("Administrative divisions", "36 + 1", "States + capital territory", "blue")}${stat("Capital city", "Ayara", "Federal seat of government", "blue")}${stat("Land area", "284,000 km²", "Fictional geographic assumption", "blue")}
    </div>
    <div class="grid">
      <section class="panel map-panel">
        ${panelHead("Administrative geography", "<small>36 STATES · 1 CAPITAL TERRITORY</small>")}
        <div class="map-top">
          <span>Six administrative zones</span><span>Select a state to view its profile</span>
        </div>
        ${map()}
        <p class="map-caption">
          Fictional country map with 37 selectable boundaries. State shapes are illustrative, not
          surveyed geography.
        </p>
      </section>
      <section class="panel full">
        <p class="eyebrow">ABOUT THE COUNTRY</p>
        <h2>Geography & economic activity</h2>
        <p>
          Aderin extends from the Kora Highlands and agricultural Sava Plains to western
          manufacturing towns, eastern river communities and the Azure Coast.
        </p>
        <p>
          Ayara sits in the Central District, the country’s administrative and logistics centre.
          Farming, manufacturing, trade and coastal services connect its six zones.
        </p>
        <div class="metric"><span>Government</span><b>Federal republic</b></div>
        <div class="metric"><span>Currency</span><b>Aderin naira · A₦</b></div>
        <div class="metric"><span>Landscape</span><b>Highlands, plains, rivers & coast</b></div>
        <div class="metric"><span>Southern boundary</span><b>Fictional Southern Ocean</b></div>
      </section>
    </div>
    <div class="lower">
      <section class="panel">
        ${panelHead("People & public services", "<small>POPULATION-WEIGHTED STATE BASELINES</small>")}
        <div class="full">
          ${[
            ["education", "School attendance"],
            ["health", "Primary care access"],
            ["energy", "Electricity access"],
            ["water", "Basic safe-water access"],
          ]
            .map(
              ([k, label]) =>
                `<div class="bar-row"><span>${label}</span><b>${average(k).toFixed(1)}%</b></div><div class="bar-track"><div class="bar-fill" style="width:${average(k)}%"></div></div>`,
            )
            .join("")}
          <p style="font-size:10px">
            Synthetic service indicators. Attendance covers school-age children; access indicators
            describe population coverage. These measures do not establish service quality.
          </p>
        </div>
      </section>
      <section class="panel">
        ${panelHead("Economic structure", "<small>ILLUSTRATIVE OUTPUT SHARE</small>")}
        <div class="full">
          ${[
            ["Agriculture & fisheries", 28],
            ["Industry & construction", 24],
            ["Trade & other services", 48],
          ]
            .map(
              ([name, value]) =>
                `<div class="bar-row"><span>${name}</span><b>${value}%</b></div><div class="bar-track"><div class="bar-fill" style="width:${value}%;background:var(--blue)"></div></div>`,
            )
            .join("")}
          <p style="font-size:10px">
            Scenario-setting assumptions, not measured national accounts. The country uses a
            fictional currency; no exchange rate is assumed.
          </p>
        </div>
      </section>
    </div>
    <div class="lower">
      <section class="panel">
        ${panelHead("Administrative zones", "<small>POPULATION DISTRIBUTION</small>")}
        <table class="compare">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Population</th>
              <th>Principal activity</th>
            </tr>
          </thead>
          <tbody>
            ${administrativeZones.map((z) => `<tr><td>${z.name}</td><td>${z.pop.toFixed(1)}M</td><td>${z.role}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>
      <section class="panel full">
        <p class="eyebrow">SELECTED STATE / TERRITORY</p>
        <h1>${state.name}</h1>
        <p>${state.desc}</p>
        <div class="metric"><span>Administrative zone</span><b>${state.zone}</b></div>
        <div class="metric"><span>State capital</span><b>${state.capital}</b></div>
        <div class="metric">
          <span>Population</span><b>${Math.round(state.pop * 1e6).toLocaleString()}</b>
        </div>
        <div class="metric"><span>Economic role</span><b>${state.role}</b></div>
        <div class="metric"><span>Administrative code</span><b>${state.id}</b></div>
      </section>
    </div>`;
}
