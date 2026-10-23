/** Compare normalized service scores and inspect peer gaps before drafting improvements. Preserve the score basis in saved plans. */
const comparisonStates = planningStates.map((s, i) => ({
  ...s,
  type: regions[i].type,
  zone: regions[i].zone,
}));
let comparisonWeights = { ...ComparisonEngine.defaults },
  comparisonMetric = "overall",
  includeCapital = true,
  compareLeft = regions[0].id,
  compareRight = ComparisonEngine.rank(comparisonStates)[0].id,
  comparisonProvenance = null;
const comparisonNav = document.createElement("button");
comparisonNav.dataset.page = "comparisons";
comparisonNav.innerHTML = '<span class="nav-number">↔</span><span>State comparisons</span>';
const comparisonHeading = [...document.querySelectorAll(".nav-section")].find(
  (n) => n.textContent === "PLANNING",
);
if (comparisonHeading) document.querySelector("nav").insertBefore(comparisonNav, comparisonHeading);
else document.querySelector("nav").append(comparisonNav);
comparisonNav.onclick = () => navigate("comparisons");
const navigateBeforeComparison = navigate;
navigate = function (p) {
  if (p !== "comparisons") return navigateBeforeComparison(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "State comparisons";
  render();
};
const comparisonFormat = (key, value) =>
  `${value.toFixed(1)}${ComparisonEngine.metrics[key].unit === "%" ? "%" : " min"}`;
const improvementOptions = {
  food: [
    "Investigate price, freight and storage constraints before choosing support.",
    "Compare distribution repairs, storage and targeted support using local cost evidence.",
  ],
  education: [
    "Audit teacher vacancies, classroom crowding, travel time and meal coverage.",
    "Compare teacher support, classroom rehabilitation and meal provision.",
  ],
  transport: [
    "Inspect high-delay routes, bridge condition, fares and accessible transport.",
    "Compare priority repairs, bus services and rural feeder connections.",
  ],
  health: [
    "Check staffing, medicine stockouts and facility readiness.",
    "Compare clinic upgrades, community workers and medicine supply reliability.",
  ],
  energy: [
    "Measure outages, unserved settlements and connection affordability.",
    "Compare grid repairs, community solar and last-mile connections.",
  ],
  water: [
    "Test water quality and inspect broken facilities and collection times.",
    "Compare rehabilitation, network expansion and sanitation monitoring.",
  ],
};
function renderComparisons() {
  const rows = ComparisonEngine.rank(
    comparisonStates,
    comparisonWeights,
    comparisonMetric,
    includeCapital,
  );
  if (!rows.some((r) => r.id === compareLeft)) compareLeft = rows[0].id;
  if (!rows.some((r) => r.id === compareRight))
    compareRight = rows.find((r) => r.id !== compareLeft)?.id || compareLeft;
  const a = rows.find((r) => r.id === compareLeft),
    b = rows.find((r) => r.id === compareRight),
    leaders = rows.filter((r) => r.rank === 1),
    leader = rows[0],
    population = rows.reduce((n, r) => n + r.population, 0),
    national = rows.reduce((n, r) => n + r.score * r.population, 0) / population,
    priorities = ComparisonEngine.improvements(
      comparisonStates.filter((s) => includeCapital || s.type !== "Capital territory"),
      compareLeft,
      comparisonWeights,
    ).slice(0, 3),
    weightSum = Object.values(comparisonWeights).reduce((n, v) => n + v, 0);
  const options = (selected) =>
    rows
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (s) => `<option value="${s.id}" ${selected === s.id ? "selected" : ""}>${s.name}</option>`,
      )
      .join("");
  $("#content").innerHTML =
    title(
      "COMPARATIVE STATE DATA",
      "State comparisons",
      "Compare performance, inspect the score and turn service gaps into reviewable proposals.",
      `<button class="btn" id="compare-export">Download comparison ↓</button>`,
    ) +
    renderStateComparisonsMarkup(
      a,
      b,
      leader,
      leaders,
      national,
      options,
      priorities,
      rows,
      weightSum,
    );
  $("#comparison-metric").onchange = (e) => {
    comparisonMetric = e.target.value;
    renderComparisons();
  };
  $("#comparison-territory").onchange = (e) => {
    includeCapital = e.target.checked;
    renderComparisons();
  };
  $("#compare-left").onchange = (e) => {
    compareLeft = e.target.value;
    renderComparisons();
  };
  $("#compare-right").onchange = (e) => {
    compareRight = e.target.value;
    renderComparisons();
  };
  $("#comparison-reset").onclick = () => {
    comparisonWeights = { ...ComparisonEngine.defaults };
    renderComparisons();
  };
  $("#comparison-weights").onsubmit = (e) => {
    e.preventDefault();
    const weights = Object.fromEntries(
      Object.keys(ComparisonEngine.metrics).map((k) => [k, Number($("#weight-" + k).value)]),
    );
    try {
      ComparisonEngine.rank(comparisonStates, weights);
      comparisonWeights = weights;
      renderComparisons();
    } catch (err) {
      $("#comparison-error").textContent = err.message;
    }
  };
  document.querySelectorAll("[data-compare-state]").forEach(
    (b) =>
      (b.onclick = () => {
        compareLeft = b.dataset.compareState;
        renderComparisons();
      }),
  );
  $("#compare-export").onclick = () =>
    download(
      "aderin-state-comparison.json",
      JSON.stringify(
        {
          version: ComparisonEngine.version,
          period: "2026-Q3",
          metric: comparisonMetric,
          weights: comparisonWeights,
          includeCapital,
          ranking: rows,
          selected: [compareLeft, compareRight],
          improvements: priorities,
          causality: "Score explanations are descriptive, not causal.",
        },
        null,
        2,
      ),
    );
  $("#comparison-plan").onclick = () => {
    if (!priorities.length) return;
    const sum = priorities.reduce((n, p) => n + p.priority, 0),
      budgets = Object.fromEntries(Object.keys(ComparisonEngine.metrics).map((k) => [k, 0]));
    let used = 0;
    priorities.forEach((p, i) => {
      const amount =
        i === priorities.length - 1
          ? Math.round((100 - used) * 100) / 100
          : Math.round((p.priority / sum) * 10000) / 100;
      budgets[p.sector] = amount;
      used += amount;
    });
    planConfig = {
      years: Number($("#comparison-horizon").value),
      scope: compareLeft,
      growth: 2,
      delivery: 80,
      maintenance: 20,
      budgets,
    };
    proposalTitle = `Service improvement plan for ${a.name}`;
    proposalReason = `Comparison of synthetic state target gaps: ${priorities.map((p) => `${ComparisonEngine.metrics[p.sector].name}: ${p.baseline}${ComparisonEngine.metrics[p.sector].unit}, target ${p.target}`).join("; ")}. Investigate local causes and verify peer comparability before investment.`;
    proposalOrigin = "State comparison · target-gap review";
    aiDraftProvenance = null;
    comparisonProvenance = {
      version: ComparisonEngine.version,
      weights: { ...comparisonWeights },
      state: a.id,
      referenceState: b.id,
      priorities,
      baseline: a.baselines,
      period: "2026-Q3",
      causalEvidence: "Not established",
    };
    navigate("recommendations");
    toast("Comparison-based draft loaded. Review assumptions before saving.");
  };
}
const renderBeforeComparison = render;
render = function () {
  if (page === "comparisons") return renderComparisons();
  renderBeforeComparison();
};
