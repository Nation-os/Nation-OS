/** Retain existing button handlers while grouping navigation and simplifying presentation. Route events are bridged by Next. */
// Reorganise the existing controls without replacing their event handlers.
const navigationGroups = [
  ["COUNTRY", ["overview", "states", "citizens"]],
  ["ANALYSIS", ["evidence", "data", "people"]],
  ["PLANNING", ["sectors", "recommendations", "decisions"]],
];
const navigationLabels = {
  overview: "Country profile",
  states: "States & territories",
  citizens: "Population register",
  evidence: "Evidence library",
  data: "Data & models",
  people: "Household profiles",
  sectors: "Sector plans",
  scenarios: "Food policy scenarios",
  recommendations: "Recommendations",
  decisions: "Decision archive",
};
const navElement = document.querySelector("nav");
const navigationButtons = new Map(
  [...navElement.querySelectorAll("button")].map((b) => [b.dataset.page, b]),
);
navElement.replaceChildren();
let navigationNumber = 0;
for (const [label, pages] of navigationGroups) {
  const heading = document.createElement("p");
  heading.className = "nav-section";
  heading.textContent = label;
  navElement.append(heading);
  for (const key of pages) {
    const button = navigationButtons.get(key);
    if (!button) continue;
    navigationNumber++;
    button.replaceChildren();
    const number = document.createElement("span");
    number.className = "nav-number";
    number.textContent = String(navigationNumber).padStart(2, "0");
    const text = document.createElement("span");
    text.textContent = navigationLabels[key];
    button.append(number, text);
    navElement.append(button);
  }
}
document.querySelector(".side-note").innerHTML =
  '<p>Aderin demonstration<br>Reference period: Q3 2026</p><button id="about-design">About the data</button>';
document.querySelector("#about-design").onclick = () =>
  modal(
    "<h1>About the data</h1><p>Aderin is a fictional country. State indicators and citizen profiles are synthetic. Models use illustrative assumptions and have not been calibrated against real national outcomes.</p><p>Proposals and review records are saved in this browser. Export a record or model report to keep a copy.</p>",
  );
document.querySelector(".brand").href = "#";
document.querySelector(".brand").onclick = (e) => {
  e.preventDefault();
  navigate("overview");
};
document.querySelector(".demo").textContent = "DEMONSTRATION DATA";
document.querySelector("footer").innerHTML =
  "<span>NationOS · Aderin Planning Office</span><span>Synthetic country dataset · Q3 2026</span>";
const reportTitle = title;
title = function (eye, name, description, actions = "") {
  const replacements = {
    "A country is more than one sector.": "Sector planning",
    "Turn a proposal into a reviewable national plan.": "Recommendations & investment plans",
    "Meet the people behind the indicators.": "Population register",
    "Every state in the planning picture.": "States & territories",
    "From source data to a testable decision.": "Data & models",
    "Explore the trade-offs before you decide.": "Food policy scenarios",
    "The reasoning should outlast the administration.": "Decision archive",
    "National indicators. Human consequences.": "Household profiles",
  };
  return reportTitle(eye, replacements[name] || name, description, actions);
};
const renderBeforeFoodSection = render;
render = function () {
  renderBeforeFoodSection();
  if (page === "scenarios") {
    document
      .querySelectorAll("nav button")
      .forEach((b) => b.classList.toggle("active", b.dataset.page === "sectors"));
    $("#crumb").textContent = "Sector planning / Food affordability";
    const switcher = document.createElement("section");
    switcher.innerHTML = sectorCards();
    $("#content").prepend(switcher);
    bindSectorCards();
  }
};
render();
