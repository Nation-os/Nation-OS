/** Generate only the requested citizen page. Filters change the indexed range; exports do not imply a stored population database. */
const citizenStates = CitizenData.prepare(
  regions.map((r, i) => {
    return {
      ...r,
      citizenCount: r.citizenCount,
      education: sectorDefinitions.education.baseline[i] / 100,
      energy: r.power / 100,
      water: sectorDefinitions.water.baseline[i] / 100,
      health: sectorDefinitions.health.baseline[i] / 100,
      transport: sectorDefinitions.transport.baseline[i],
    };
  }),
);
let citizenPage = 0,
  citizenState = "all";
const citizenPageSize = 25;
const citizensNav = document.createElement("button");
citizensNav.dataset.page = "citizens";
citizensNav.innerHTML = "♙ <span>Citizen registry</span>";
document.querySelector("nav").append(citizensNav);
citizensNav.onclick = () => navigate("citizens");
const navigateBeforeCitizens = navigate;
navigate = function (p) {
  if (p !== "citizens") return navigateBeforeCitizens(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "Citizen registry";
  render();
};
function citizenScope() {
  return citizenState === "all"
    ? { offset: 0, count: 24600000 }
    : citizenStates.find((s) => s.id === citizenState);
}
function showCitizen(index) {
  const c = CitizenData.citizen(index, citizenStates);
  modal(
    `<p class="eyebrow">SYNTHETIC CITIZEN · ${c.id}</p><h1>${c.name}</h1><p>This fictional record is generated from a fixed seed, not collected from a person.</p>${Object.entries(
      c,
    )
      .filter(([k]) => !["name", "synthetic", "id"].includes(k))
      .map(
        ([k, v]) =>
          `<div class="metric"><span>${k}</span><b>${v === null ? "Not applicable" : escapeHtml(v)}</b></div>`,
      )
      .join("")}`,
  );
}
function renderCitizens() {
  const scope = citizenScope(),
    start = scope.offset + citizenPage * citizenPageSize,
    count = Math.min(citizenPageSize, scope.count - citizenPage * citizenPageSize),
    rows = Array.from({ length: count }, (_, i) => CitizenData.citizen(start + i, citizenStates));
  $("#content").innerHTML =
    title(
      "SYNTHETIC POPULATION REGISTER",
      "Meet the people behind the indicators.",
      "Browse a reproducible fictional record for every resident of Aderin.",
      `<button class="btn" id="citizen-export">↓ Export 1,000 records</button>`,
    ) + renderCitizenRegisterMarkup(rows, scope, start);
  $("#citizen-state").onchange = (e) => {
    citizenState = e.target.value;
    citizenPage = 0;
    renderCitizens();
  };
  $("#citizen-prev").onclick = () => {
    if (citizenPage > 0) {
      citizenPage--;
      renderCitizens();
    }
  };
  $("#citizen-next").onclick = () => {
    if ((citizenPage + 1) * citizenPageSize < scope.count) {
      citizenPage++;
      renderCitizens();
    }
  };
  $("#citizen-jump").onsubmit = (e) => {
    e.preventDefault();
    const n = Number($("#citizen-page").value);
    if (Number.isInteger(n) && n >= 1 && n <= Math.ceil(scope.count / citizenPageSize)) {
      citizenPage = n - 1;
      renderCitizens();
    }
  };
  $("#citizen-lookup").onsubmit = (e) => {
    e.preventDefault();
    const id = $("#citizen-id").value.trim();
    if (!/^AD-C-\d{8}$/.test(id)) return toast("Use an ID such as AD-C-00000001.");
    const index = Number(id.slice(5)) - 1;
    if (index < 0 || index >= 24600000) return toast("Citizen ID is outside this population.");
    showCitizen(index);
  };
  document
    .querySelectorAll("[data-citizen]")
    .forEach((b) => (b.onclick = () => showCitizen(Number(b.dataset.citizen))));
  $("#citizen-export").onclick = () => {
    const n = Math.min(1000, scope.offset + scope.count - start);
    download(
      "aderin-citizens.ndjson",
      Array.from({ length: n }, (_, i) =>
        JSON.stringify(CitizenData.citizen(start + i, citizenStates)),
      ).join("\n"),
    );
  };
}
const renderBeforeCitizens = render;
render = function () {
  if (page === "citizens") return renderCitizens();
  return renderBeforeCitizens();
};
