/** Bind sector tabs and sliders, then save draft records with source gaps and model assumptions. Views are pure markup helpers. */
let activeSector = "education",
  sectorTab = "overview";
const sectorBudgets = Object.fromEntries(
  Object.keys(sectorDefinitions).map((k) => [k, [40, 30, 20]]),
);
const sectorRows = Object.entries(sectorDefinitions).flatMap(([sector, s]) =>
  regions.map((r, i) => ({
    sector,
    region: r.name,
    population: r.pop * 1e6,
    baseline: s.baseline[i],
    unit: s.unit,
    period: "2026-Q3",
    source: s.source,
  })),
);
function sectorOutcome(key, index, budget, delivery = 80) {
  const s = sectorDefinitions[key],
    base = s.baseline[index],
    cost = budget.reduce((a, b) => a + b, 0),
    raw = (budget.reduce((a, b, i) => a + b * s.actions[i][1], 0) * delivery) / 100;
  const change = Math.min(raw, s.higher ? 100 - base : base);
  const result = s.higher ? base + change : base - change;
  return {
    baseline: base,
    result,
    change,
    cost,
    delivery,
    eligiblePopulation: Math.round(regions[index].pop * 1e6 * s.eligible),
    modelVersion: `${key}-capacity-rules-v1`,
    datasetVersion: "aderin-state-sectors-q3-v2",
  };
}
let sectorDelivery = 80;
const sectorNav = document.createElement("button");
sectorNav.dataset.page = "sectors";
sectorNav.innerHTML = "◈ <span>Sector planning</span>";
document.querySelector("nav").append(sectorNav);
sectorNav.onclick = () => navigate("sectors");
const previousNavigate = navigate;
navigate = function (p) {
  if (p !== "sectors") return previousNavigate(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "Sector planning";
  render();
};
function sectorCards() {
  return `<div class="sector-strip"><button class="sector-tile ${page === "scenarios" ? "chosen" : ""}" data-sector="food"><span>♧</span><b>Food affordability</b><small>Prices · supply · households</small></button>${Object.entries(
    sectorDefinitions,
  )
    .map(
      ([k, s]) =>
        `<button class="sector-tile ${activeSector === k && page === "sectors" ? "chosen" : ""}" data-sector="${k}"><span>${s.icon}</span><b>${s.name}</b><small>${s.metric}</small></button>`,
    )
    .join("")}</div>`;
}
function bindSectorCards() {
  document.querySelectorAll("[data-sector]").forEach(
    (b) =>
      (b.onclick = () => {
        if (b.dataset.sector === "food") return navigate("scenarios");
        activeSector = b.dataset.sector;
        sectorTab = "overview";
        navigate("sectors");
      }),
  );
}
function sectorDataCSV() {
  return [
    "sector,region,population,baseline,unit,period,source",
    ...sectorRows.map((r) =>
      [r.sector, r.region, r.population, r.baseline, r.unit, r.period, r.source].join(","),
    ),
  ].join("\n");
}
function renderSectors() {
  const s = sectorDefinitions[activeSector],
    budget = sectorBudgets[activeSector],
    o = sectorOutcome(activeSector, selected, budget, sectorDelivery),
    r = regions[selected];
  $("#content").innerHTML =
    title(
      "CONNECTED NATIONAL PLANNING",
      "A country is more than one sector.",
      "Explore public services, compare investments and preserve the choices you make.",
      `<button class="btn" id="sector-csv">↓ Sector dataset</button>`,
    ) +
    sectorCards() +
    renderSectorHeaderMarkup(s);
  let body = "";
  if (sectorTab === "overview") {
    body = renderSectorOverviewMarkup(o, r, s);
  }
  if (sectorTab === "evidence") {
    body = renderSectorEvidenceMarkup(o, r, s);
  }
  if (sectorTab === "simulator") {
    body = renderSectorSimulatorMarkup(budget, o, r, s);
  }
  if (sectorTab === "people") {
    body = renderSectorHouseholdsMarkup(r, s);
  }
  $("#content").insertAdjacentHTML("beforeend", body);
  bindSectorCards();
  $("#sector-region").onchange = (e) => {
    selected = Number(e.target.value);
    renderSectors();
  };
  $("#sector-csv").onclick = () => download("aderin-sector-baselines.csv", sectorDataCSV());
  document.querySelectorAll("[data-sector-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        sectorTab = b.dataset.sectorTab;
        renderSectors();
      }),
  );
  document.querySelectorAll("[data-sector-region]").forEach(
    (b) =>
      (b.onclick = () => {
        selected = Number(b.dataset.sectorRegion);
        renderSectors();
      }),
  );
  if ($("#sector-start"))
    $("#sector-start").onclick = () => {
      sectorTab = "simulator";
      renderSectors();
    };
  document.querySelectorAll("[data-sector-budget]").forEach(
    (b) =>
      (b.onchange = () => {
        budget[+b.dataset.sectorBudget] = Number(b.value);
        renderSectors();
      }),
  );
  if ($("#sector-delivery"))
    $("#sector-delivery").onchange = (e) => {
      sectorDelivery = Number(e.target.value);
      renderSectors();
    };
  if ($("#sector-save")) $("#sector-save").onclick = () => saveSectorDecision();
}
function saveSectorDecision() {
  const s = sectorDefinitions[activeSector],
    allocation = [...sectorBudgets[activeSector]],
    result = sectorOutcome(activeSector, selected, allocation, sectorDelivery);
  if (!result.cost || result.cost > 200)
    return toast("Allocate between A₦ 1M and 200M before saving.");
  modal(renderSectorDecisionFormMarkup(s));
  $("#sector-decision-form").onsubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    records.unshift({
      sector: activeSector,
      region: regions[selected].name,
      title: form.get("title"),
      reason: form.get("reason"),
      reviewer: form.get("reviewer"),
      date: new Date().toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" }),
      reviewed: false,
      allocation,
      modelSnapshot: result,
      source: s.source,
      gap: s.gap,
      milestones: [...s.milestones],
      values: { roads: 0, storage: 0, support: 0 },
    });
    const saved = persist();
    $("#modal").close();
    navigate("decisions");
    if (saved) toast("Sector decision and roadmap saved in this browser.");
  };
}
const foodDecisionsView = decisions;
decisions = function () {
  const all = records;
  records = all.filter((r) => !r.sector);
  let html;
  try {
    html = foodDecisionsView();
  } finally {
    records = all;
  }
  const sectorRecords = all.filter((r) => r.sector);
  if (!sectorRecords.length) return html;
  if (!all.some((r) => !r.sector))
    html = html.replace(/<section class="panel empty">[\s\S]*?<\/section>/, "");
  html += `<h2 style="margin:25px 0 15px">Public-service decision records</h2>`;
  return (
    html +
    sectorRecords
      .map((r) => {
        const s = sectorDefinitions[r.sector],
          i = all.indexOf(r);
        return renderSectorDecisionCardMarkup(i, r, s);
      })
      .join("")
  );
};
const previousRender = render;
render = function () {
  if (page === "sectors") return renderSectors();
  previousRender();
  if (page === "overview") {
    const strip = document.createElement("section");
    strip.innerHTML = '<p class="eyebrow">EXPLORE CONNECTED SECTORS</p>' + sectorCards();
    $("#content").prepend(strip);
    bindSectorCards();
  }
  if (page === "decisions") {
    // Bind food records back to their original indices in the full record list.
    const foodIndices = records.map((r, i) => (!r.sector ? i : -1)).filter((i) => i >= 0);
    document.querySelectorAll("[data-review]").forEach(
      (b) =>
        (b.onclick = () => {
          const r = records[foodIndices[+b.dataset.review]];
          r.reviewed = !r.reviewed;
          persist();
          render();
        }),
    );
    document
      .querySelectorAll("[data-download]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            download(
              "nationos-food-decision.json",
              JSON.stringify(records[foodIndices[+b.dataset.download]], null, 2),
            )),
      );
    document.querySelectorAll("[data-sector-review]").forEach(
      (b) =>
        (b.onclick = () => {
          const r = records[+b.dataset.sectorReview];
          r.reviewed = !r.reviewed;
          persist();
          render();
        }),
    );
    document
      .querySelectorAll("[data-sector-download]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            download(
              "nationos-sector-decision.json",
              JSON.stringify(records[+b.dataset.sectorDownload], null, 2),
            )),
      );
  }
};
render();
