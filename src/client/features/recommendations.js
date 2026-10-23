/** Coordinate long-term proposal edits, numerical recalculation and browser-local snapshots. Saving is not policy approval. */
const planningStates = regions.map((r, i) => ({
  id: r.id,
  name: r.name,
  population: citizenStates[i].count,
  baselines: {
    food: r.food,
    ...Object.fromEntries(
      Object.keys(sectorDefinitions).map((k) => [k, sectorDefinitions[k].baseline[i]]),
    ),
  },
}));
let planConfig = {
    years: 5,
    scope: "all",
    growth: 2,
    delivery: 80,
    maintenance: 20,
    budgets: { food: 120, education: 160, transport: 180, health: 160, energy: 140, water: 140 },
  },
  planFocus = "education",
  proposalOrigin = "Analyst proposal",
  proposalTitle = "National public-service investment programme",
  proposalReason = "",
  planResult = null,
  savedPlans = [];
try {
  const parsed = JSON.parse(localStorage.getItem("nationos-plans") || "[]");
  if (Array.isArray(parsed)) savedPlans = parsed;
} catch {}
const recommendationsNav = document.createElement("button");
recommendationsNav.dataset.page = "recommendations";
recommendationsNav.innerHTML = "✧ <span>Recommendations & plans</span>";
document.querySelector("nav").append(recommendationsNav);
recommendationsNav.onclick = () => navigate("recommendations");
const navigateBeforePlans = navigate;
navigate = function (p) {
  if (p !== "recommendations") return navigateBeforePlans(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "Recommendations & plans";
  render();
};
function displayPlanValue(v, key) {
  return `${v.toFixed(1)}${PlanningEngine.definitions[key].unit === "%" ? "%" : " min"}`;
}
function planChart(result, key) {
  const vals = result.years.flatMap((y) =>
      ["no", "with", "low", "high"].map((v) => y.national[key][v]),
    ),
    min = Math.min(...vals) - 2,
    max = Math.max(...vals) + 2;
  const point = (v, i) =>
    `${35 + (i * 520) / (result.years.length - 1)},${140 - ((v - min) / (max - min)) * 110}`;
  return renderProjectionChartMarkup(key, max, min, point, result);
}
function renderRecommendations() {
  const defs = PlanningEngine.definitions,
    result = PlanningEngine.project(planningStates, planConfig);
  planResult = result;
  const end = result.years.at(-1),
    first = result.years[0];
  $("#content").innerHTML =
    title(
      "RECOMMENDATIONS & LONG-TERM PLANNING",
      "Turn a proposal into a reviewable national plan.",
      "Compare system suggestions or your own proposal over five or ten years.",
      `<button class="btn" id="plan-new">New proposal</button><button class="btn" id="plan-download">↓ Model report</button><button class="btn primary" id="plan-save">Save proposed decision</button>`,
    ) + renderRecommendationDashboardMarkup(defs, end, first, result);
  function capture() {
    if (!$("#plan-form").reportValidity()) return false;
    const c = {
      years: Number($("#plan-years").value),
      scope: $("#plan-scope").value,
      growth: Number($("#plan-growth").value),
      delivery: Number($("#plan-delivery").value),
      maintenance: Number($("#plan-maintenance").value),
      budgets: Object.fromEntries(
        Object.keys(defs).map((k) => [k, Number($("#budget-" + k).value)]),
      ),
    };
    try {
      PlanningEngine.project(planningStates, c);
    } catch (e) {
      $("#plan-error").textContent = e.message;
      return false;
    }
    proposalTitle = $("#plan-title").value.trim();
    proposalReason = $("#plan-reason").value.trim();
    planConfig = c;
    return true;
  }
  $("#plan-new").onclick = () => {
    if (typeof comparisonProvenance !== "undefined") comparisonProvenance = null;
    if (typeof aiDraftProvenance !== "undefined") aiDraftProvenance = null;
    proposalOrigin = "Analyst proposal";
    proposalTitle = "New public-service proposal";
    proposalReason = "";
    renderRecommendations();
  };
  $("#plan-form").onsubmit = (e) => {
    e.preventDefault();
    if (capture()) renderRecommendations();
  };
  $("#plan-focus").onchange = (e) => {
    planFocus = e.target.value;
    if (capture()) renderRecommendations();
  };
  $("#plan-download").onclick = () => {
    if (capture())
      download(
        "nationos-long-term-plan.json",
        JSON.stringify(
          {
            title: proposalTitle,
            reason: proposalReason,
            result: PlanningEngine.project(planningStates, planConfig),
          },
          null,
          2,
        ),
      );
  };
  $("#plan-save").onclick = () => {
    if (!capture()) return;
    if (!proposalReason) return toast("Record the proposal reasoning before saving.");
    const result = PlanningEngine.project(planningStates, planConfig);
    if (!result.annualCost) return toast("Allocate an annual budget before saving a proposal.");
    savedPlans.unshift({
      title: proposalTitle,
      reason: proposalReason,
      origin: proposalOrigin,
      date: new Date().toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" }),
      reviewed: false,
      result,
      aiProvenance: typeof aiDraftProvenance !== "undefined" ? aiDraftProvenance : null,
      comparisonProvenance:
        typeof comparisonProvenance !== "undefined" ? comparisonProvenance : null,
    });
    try {
      localStorage.setItem("nationos-plans", JSON.stringify(savedPlans));
      renderRecommendations();
      toast("Proposal saved with full annual model snapshot.");
    } catch {
      savedPlans.shift();
      toast("Browser storage is full. Download the model report to preserve it.");
    }
  };
  document.querySelectorAll("[data-use-recommendation]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!capture()) return;
        const rec = PlanningEngine.recommend(planningStates)[+b.dataset.useRecommendation];
        if (typeof comparisonProvenance !== "undefined") comparisonProvenance = null;
        if (typeof aiDraftProvenance !== "undefined") aiDraftProvenance = null;
        proposalOrigin = "System suggestion · gap rule v1";
        proposalTitle = `Improve ${defs[rec.sector].name.toLowerCase()} in ${rec.state}`;
        proposalReason = rec.reason;
        planConfig.scope = rec.stateId;
        planConfig.budgets = Object.fromEntries(
          Object.keys(defs).map((k) => [k, k === rec.sector ? 100 : 0]),
        );
        planFocus = rec.sector;
        renderRecommendations();
      }),
  );
  document
    .querySelectorAll("[data-export-plan]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          download(
            "nationos-saved-plan.json",
            JSON.stringify(savedPlans[+b.dataset.exportPlan], null, 2),
          )),
    );
  document.querySelectorAll("[data-load-plan]").forEach(
    (b) =>
      (b.onclick = () => {
        const p = savedPlans[+b.dataset.loadPlan];
        if (typeof comparisonProvenance !== "undefined")
          comparisonProvenance = p.comparisonProvenance || null;
        if (typeof aiDraftProvenance !== "undefined") aiDraftProvenance = p.aiProvenance || null;
        planConfig = JSON.parse(JSON.stringify(p.result.config));
        proposalTitle = p.title;
        proposalReason = p.reason;
        proposalOrigin = p.origin;
        renderRecommendations();
      }),
  );
  document.querySelectorAll("[data-review-plan]").forEach(
    (b) =>
      (b.onclick = () => {
        const p = savedPlans[+b.dataset.reviewPlan];
        p.reviewed = !p.reviewed;
        try {
          localStorage.setItem("nationos-plans", JSON.stringify(savedPlans));
          renderRecommendations();
        } catch {
          toast("Unable to save review state. Download your plan.");
        }
      }),
  );
}
const renderBeforePlans = render;
render = function () {
  if (page === "recommendations") return renderRecommendations();
  renderBeforePlans();
  if (page === "decisions") {
    const section = document.createElement("section");
    section.className = "panel full";
    section.innerHTML = `<h2>Long-term proposed decisions</h2><p>${savedPlans.length} saved five- or ten-year plan(s). Annual costs, service projections, assumptions and handover reviews are preserved in the recommendation dashboard.</p><button class="btn primary" id="memory-plans">Open recommendations & plans →</button>`;
    $("#content").prepend(section);
    $("#memory-plans").onclick = () => navigate("recommendations");
  }
};
