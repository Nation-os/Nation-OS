/** Render legacy overview HTML; the controller supplies transient view state. */
function renderLegacyOverviewMarkup(r) {
  return /* HTML */ `<div class="stats">
      ${stat("Total population", "24.6M", "Across 6 regions")}${stat("Staple basket price change", "+21.0%", "Synthetic quarterly increase", "amber")}${stat("People under food pressure", "10.5M", "42.7% · modelled estimate", "amber")}${stat("Active decision records", String(records.length), "Preserved in this browser")}
    </div>
    <div class="grid">
      <section class="panel map-panel">
        ${panelHead("One country. Connected challenges.", "<small>REGIONAL INTELLIGENCE</small>")}
        <div class="map-top">
          <span>Food affordability pressure</span><span>6 regions · Click to explore</span>
        </div>
        ${map()}
        <p class="map-caption" id="region-caption">
          <b>${r.name}</b> · ${r.pop}M people · Food prices +${r.price}% · ${r.role}
        </p>
        <div class="legend">
          <span><b class="swatch" style="background:#29443e"></b>Lower pressure</span
          ><span><b class="swatch" style="background:#557f66"></b>Higher pressure</span
          ><span>┄ Trade corridor</span><span>Fictional geography</span>
        </div>
      </section>
      <div class="right-stack">
        <section class="panel">
          ${panelHead("Priority signal", '<span class="pill">● NEEDS ATTENTION</span>')}
          <div class="alert-body">
            <h3>Food is getting harder to afford<br />in the Central District.</h3>
            <p>
              Staple basket prices rose 26% this quarter. Transport disruption and storage losses
              are possible contributing factors.
            </p>
            <div class="alert-meta">
              <span>◎ 5 synthetic evidence records</span><span>2 evidence gaps</span>
            </div>
            <button class="text-btn" data-go="evidence">
              Investigate the evidence <span>→</span>
            </button>
          </div>
        </section>
        <section class="panel">
          ${panelHead("Where pressure is highest", "<small>PRICE CHANGE</small>")}
          <div class="bars">
            ${[regions[3], regions[0], regions[5]].map((r, i) => `<div class="bar-row"><span>${r.name}</span><span>+${r.price}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${(r.price / 30) * 100}%;background:${["#e4b471", "#7bd8b5", "#63a8d5"][i]}"></div></div>`).join("")}<button
              class="text-btn"
              data-go="people"
            >
              Explore people & places →
            </button>
          </div>
        </section>
      </div>
    </div>
    <div class="lower">
      <section class="panel">
        ${panelHead("The cost of a staple food basket", '<small><span class="green">● National index</span> &nbsp; ┄ Prior baseline</small>')}${chart()}
        <p class="map-caption">
          Synthetic index · April = 100 · Baseline is an illustrative comparison
        </p>
      </section>
      <section class="panel">
        ${panelHead("From insight to action", "<small>DECISION WORKFLOW</small>")}
        <div class="record">
          <span class="record-icon">◎</span>
          <div>
            <h3>Understand the food-price signal</h3>
            <p>Review sources, assumptions and missing evidence</p>
          </div>
          <button class="text-btn" data-go="evidence">↗</button>
        </div>
        <div class="record">
          <span class="record-icon">⌘</span>
          <div>
            <h3>Compare possible responses</h3>
            <p>Explore costs, people affected and trade-offs</p>
          </div>
          <button class="text-btn" data-go="scenarios">↗</button>
        </div>
        <div class="record">
          <span class="record-icon">▤</span>
          <div>
            <h3>Leave a record for the next administration</h3>
            <p>Preserve the reasoning, milestones and outcomes</p>
          </div>
          <button class="text-btn" data-go="decisions">↗</button>
        </div>
      </section>
    </div>`;
}
