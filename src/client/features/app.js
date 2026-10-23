/** Shared client state, DOM utilities and the original food workflow. Later features extend render/navigation in feature-order.json. */
let selected = 3,
  page = "overview";
let values = { roads: 40, storage: 30, support: 20 };
let records = [];
try {
  records = JSON.parse(localStorage.getItem("nationos-decisions") || "[]");
  if (!Array.isArray(records)) records = [];
} catch {}
const $ = (s) => document.querySelector(s);
const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").style.display = "block";
  setTimeout(() => ($("#toast").style.display = "none"), 3500);
}
function modal(html) {
  $("#modalContent").innerHTML = html;
  $("#modal").showModal();
}
$("#closeModal").onclick = () => $("#modal").close();
$("#about").onclick = () =>
  modal(
    '<p class="eyebrow">THE DEMONSTRATION</p><h1>Aderin is a fictional country.</h1><p>Its 24.6 million residents, geography, institutions, households and economic indicators are generated for this demonstration. Aderin uses the fictional currency A₦. No figures represent Nigeria or an actual government.</p><p>The policy simulator is a transparent, illustrative rules model, not a calibrated economic forecast. Saved decisions stay in this browser. The people shown are fictional household profiles, not personal records.</p>',
  );
$("#notifications").onclick = () =>
  modal(
    "<h1>Priority signals</h1><p>Central District: staple basket prices rose 26% in the synthetic quarter.</p><p>Kora Highlands: 38% of rural roads are classified as seasonally inaccessible in the demo dataset.</p><p>Eastbank: cold-storage coverage is a modelling evidence gap.</p>",
  );
document
  .querySelectorAll("nav button")
  .forEach((b) => (b.onclick = () => navigate(b.dataset.page)));
function navigate(p) {
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = {
    overview: "National overview",
    evidence: "Evidence explorer",
    scenarios: "Policy simulator",
    people: "People & places",
    decisions: "Decision memory",
  }[p];
  render();
}
function title(eye, name, desc, actions = "") {
  return `<div class="title-row"><div><p class="eyebrow">${eye}</p><h1>${name}</h1><p>${desc}</p></div><div class="actions">${actions}</div></div>`;
}
function panelHead(t, extra = "") {
  return `<div class="panel-head"><h2>${t}</h2>${extra}</div>`;
}
function stat(l, v, s, c = "green") {
  return `<div class="stat"><div class="stat-label">${l}<span>↗</span></div><strong>${v}</strong><small class="${c}">${s}</small></div>`;
}
function map() {
  return renderLegacyMapMarkup();
}
function chart() {
  return renderFoodPriceChartMarkup();
}
function overview() {
  const r = regions[selected];
  return (
    title(
      "NATIONAL SITUATION ROOM",
      "A clearer picture. Better decisions.",
      "Understand today’s pressures. Plan for what comes next.",
      `<select id="period" aria-label="Reporting period"><option>Q3 2026 · Baseline</option><option>Q2 2026 · Prior quarter</option></select><button class="btn" id="export">↓ Export brief</button>`,
    ) + renderLegacyOverviewMarkup(r)
  );
}
function evidence() {
  return (
    title(
      "FOLLOW THE EVIDENCE",
      "What is behind the price change?",
      "Central District · Food affordability investigation",
    ) + renderFoodEvidenceMarkup()
  );
}
function outcome(v = values) {
  const cost = v.roads + v.storage + v.support;
  const relief = Math.min(18, v.roads * 0.07 + v.storage * 0.09 + v.support * 0.045);
  return {
    cost,
    relief,
    people: (v.support * 0.035 + v.roads * 0.009 + v.storage * 0.012).toFixed(2),
    months: v.roads || v.storage ? Math.round(6 + v.storage * 0.08 + v.roads * 0.03) : 1,
  };
}
function scenarios() {
  return (
    title(
      "POLICY LAB",
      "Explore the trade-offs before you decide.",
      "Food affordability · 12-month illustrative planning horizon",
      `<button class="btn" id="reset">↺ Reset assumptions</button>`,
    ) + renderFoodSimulatorMarkup()
  );
}
function updateResults() {
  const o = outcome();
  $("#results").innerHTML = renderFoodResultsMarkup(o);
}
function people() {
  const r = regions[selected];
  return (
    title(
      "PEOPLE & PLACES",
      "National indicators. Human consequences.",
      "Explore the communities behind the numbers.",
      `<select id="region-select" aria-label="Select region">${regions.map((r, i) => `<option value="${i}" ${selected === i ? "selected" : ""}>${r.name}</option>`).join("")}</select>`,
    ) + renderHouseholdProfilesMarkup(r)
  );
}
function decisions() {
  return (
    title(
      "INSTITUTIONAL MEMORY",
      "The reasoning should outlast the administration.",
      "Retrieve decisions, review assumptions and assess the plan you inherit.",
      `<button class="btn" id="handover">↗ Administration handover</button>`,
    ) + renderDecisionArchiveMarkup()
  );
}
function download(name, data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function persist() {
  try {
    localStorage.setItem("nationos-decisions", JSON.stringify(records));
    return true;
  } catch {
    toast("Browser storage is unavailable. Download your record to keep it.");
    return false;
  }
}
function render() {
  $("#content").innerHTML = { overview, evidence, scenarios, people, decisions }[page]();
  document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => navigate(b.dataset.go)));
  document.querySelectorAll("[data-region]").forEach((b) => {
    const pick = () => {
      selected = Number(b.dataset.region);
      render();
    };
    b.onclick = pick;
    b.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    };
  });
  if (page === "overview") {
    $("#period").onchange = (e) => {
      if (e.target.selectedIndex === 1)
        modal(
          "<h1>Q2 baseline snapshot</h1><p>Synthetic national staple basket index: 100. Q3 index: 121. The main overview remains the Q3 planning baseline so scenario inputs stay consistent.</p>",
        );
      e.target.selectedIndex = 0;
    };
    $("#export").onclick = () =>
      download(
        "Aderin-national-brief.txt",
        `NATIONOS — FICTIONAL COUNTRY BRIEF\nRepublic of Aderin · Q3 2026\nPopulation 24.6M. Staple basket increase 21%. Food pressure 10.5M (modelled).\n${regions.map((r) => `${r.name}: ${r.pop}M residents, prices +${r.price}%`).join("\n")}\nAll data is synthetic. No real government statistics.`,
      );
  }
  if (page === "people")
    $("#region-select").onchange = (e) => {
      selected = Number(e.target.value);
      render();
    };
  if (page === "scenarios") {
    updateResults();
    ["roads", "storage", "support"].forEach(
      (k) =>
        ($("#" + k).oninput = (e) => {
          values[k] = Number(e.target.value);
          $("#" + k + "-value").textContent = `A₦ ${values[k]}M`;
          updateResults();
        }),
    );
    $("#reset").onclick = () => {
      values = { roads: 40, storage: 30, support: 20 };
      render();
    };
    document.querySelectorAll("[data-preset]").forEach(
      (b) =>
        (b.onclick = () => {
          const [roads, storage, support] = b.dataset.preset.split(",").map(Number);
          values = { roads, storage, support };
          render();
        }),
    );
    $("#save").onclick = () => {
      if (outcome().cost > 200) {
        toast("Reduce the package to A₦ 200M or less.");
        return;
      }
      if (!outcome().cost) {
        toast("Allocate a budget before saving a decision.");
        return;
      }
      modal(renderDecisionFormMarkup());
      $("#decision-form").onsubmit = (e) => {
        e.preventDefault();
        const f = new FormData(e.target);
        records.unshift({
          title: f.get("title"),
          reason: f.get("reason"),
          reviewer: f.get("reviewer"),
          values: { ...values },
          date: new Date().toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" }),
          reviewed: false,
        });
        const saved = persist();
        $("#modal").close();
        navigate("decisions");
        if (saved) toast("Decision and roadmap saved in this browser.");
      };
    };
  }
  if (page === "decisions") {
    $("#handover").onclick = () =>
      modal(
        `<p class="eyebrow">INCOMING ADMINISTRATION</p><h1>Start with the context.</h1><p>${records.length} decision record(s) inherited. ${records.filter((r) => r.reviewed).length} reviewed for handover.</p><p>Before continuing a plan, review the evidence, delivery status and assumptions. No actual outcomes have been recorded. The incoming administration can continue, revise or discontinue each proposal.</p><p>Records remain drafts or review acknowledgements; neither is proof of policy success.</p>`,
      );
    document.querySelectorAll("[data-review]").forEach(
      (b) =>
        (b.onclick = () => {
          records[+b.dataset.review].reviewed = !records[+b.dataset.review].reviewed;
          persist();
          render();
        }),
    );
    document.querySelectorAll("[data-download]").forEach(
      (b) =>
        (b.onclick = () =>
          download(
            "nationos-decision.json",
            JSON.stringify(
              {
                country: "Aderin (fictional)",
                ...records[+b.dataset.download],
                evidence: [
                  "Synthetic market basket survey",
                  "Synthetic freight inspection",
                  "Synthetic storage audit",
                  "Synthetic expenditure panel",
                ],
                assumptions: ["Normal rainfall", "Stable fuel costs", "Full delivery"],
                outcomes: "Unverified",
                roadmap: [
                  "Month 1: validate baseline and eligibility",
                  "Month 3: review prices and freight times",
                  "Month 6–12: assess delivery and assumptions",
                ],
                model: outcome(records[+b.dataset.download].values),
              },
              null,
              2,
            ),
          )),
    );
  }
}
render();
