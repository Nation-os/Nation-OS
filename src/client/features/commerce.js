/** Browse firm ownership, bank balance sheets and national money stocks. A local operating address does not imply domestic control. */
const commerce = CommerceEngine.build(regions);
let commerceTab = "businesses",
  commerceState = "all",
  commerceOwnership = "all",
  commercePage = 0;
const commerceSize = 30;
const commerceNav = document.createElement("button");
commerceNav.dataset.page = "commerce";
commerceNav.innerHTML = '<span class="nav-number">EC</span><span>Business & banking</span>';
const countryGroup = [...document.querySelectorAll(".nav-section")].find(
  (n) => n.textContent === "ANALYSIS",
);
if (countryGroup) document.querySelector("nav").insertBefore(commerceNav, countryGroup);
else document.querySelector("nav").append(commerceNav);
commerceNav.onclick = () => navigate("commerce");
const navigateBeforeCommerce = navigate;
navigate = function (p) {
  if (p !== "commerce") return navigateBeforeCommerce(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "Business & banking";
  render();
};
function filteredBusinessIndices() {
  const scope =
      commerceState === "all"
        ? { businessOffset: 0, businessCount: commerce.totalBusinesses }
        : commerce.states.find((s) => s.id === commerceState),
    indices = [];
  for (let i = scope.businessOffset; i < scope.businessOffset + scope.businessCount; i++)
    if (commerceOwnership === "all" || commerce.business(i).ownership === commerceOwnership)
      indices.push(i);
  return indices;
}
function businessProfile(index) {
  const b = commerce.business(index);
  modal(renderBusinessProfileMarkup(b));
}
function moneyOverview() {
  const f = commerce.financial;
  return renderMonetaryAccountsMarkup(f);
}
function renderCommerce() {
  const totals = commerce.summary
    .filter((s) => commerceState === "all" || s.stateId === commerceState)
    .reduce(
      (a, s) => ({
        businesses: a.businesses + s.businesses,
        domestic: a.domestic + s.domestic,
        foreign: a.foreign + s.foreign,
        joint: a.joint + s.joint,
        employees: a.employees + s.employees,
      }),
      { businesses: 0, domestic: 0, foreign: 0, joint: 0, employees: 0 },
    );
  $("#content").innerHTML =
    title(
      "ECONOMIC REGISTERS",
      "Business & banking",
      "Registered firms, ownership, financial institutions and national monetary stocks.",
      `<button class="btn" id="commerce-export">Download ${commerceTab === "money" ? "monetary data" : commerceTab === "banks" ? "bank register" : "business register"} ↓</button>`,
    ) + renderCommerceHeaderMarkup();
  let content = "";
  if (commerceTab === "businesses") {
    const indices = filteredBusinessIndices(),
      pageCount = Math.max(1, Math.ceil(indices.length / commerceSize));
    commercePage = Math.min(commercePage, pageCount - 1);
    const shown = indices.slice(commercePage * commerceSize, (commercePage + 1) * commerceSize);
    content = renderBusinessRegisterMarkup(indices, pageCount, shown, totals);
  }
  if (commerceTab === "banks") content = renderBankRegisterMarkup();
  if (commerceTab === "money") content = moneyOverview();
  $("#content").insertAdjacentHTML("beforeend", content);
  document.querySelectorAll("[data-commerce-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        commerceTab = b.dataset.commerceTab;
        renderCommerce();
      }),
  );
  if ($("#commerce-state") && commerceTab === "businesses")
    $("#commerce-state").onchange = (e) => {
      commerceState = e.target.value;
      commercePage = 0;
      renderCommerce();
    };
  if (commerceTab === "businesses") {
    $("#commerce-ownership").onchange = (e) => {
      commerceOwnership = e.target.value;
      commercePage = 0;
      renderCommerce();
    };
    $("#commerce-prev").onclick = () => {
      if (commercePage > 0) {
        commercePage--;
        renderCommerce();
      }
    };
    $("#commerce-next").onclick = () => {
      if ((commercePage + 1) * commerceSize < filteredBusinessIndices().length) {
        commercePage++;
        renderCommerce();
      }
    };
  }
  document
    .querySelectorAll("[data-business]")
    .forEach((b) => (b.onclick = () => businessProfile(Number(b.dataset.business))));
  document.querySelectorAll("[data-bank]").forEach(
    (b) =>
      (b.onclick = () => {
        const bank = commerce.banks[Number(b.dataset.bank)];
        modal(
          `<h1>${bank.name}</h1><p>${bank.ownership} · ${bank.domesticOwnershipPercent}% domestic ownership</p><pre class="source-json">${escapeHtml(JSON.stringify(bank, null, 2))}</pre><p>branchesByState follows the state register order. This is a fictional institution and balance sheet.</p>`,
        );
      }),
  );
  $("#commerce-export").onclick = () => {
    if (commerceTab !== "businesses")
      return download(
        "aderin-" + commerceTab + ".json",
        JSON.stringify(commerceTab === "money" ? commerce.financial : commerce.banks, null, 2),
      );
    const records = filteredBusinessIndices().map((i) => commerce.business(i)),
      fields = Object.keys(records[0] || commerce.business(0)),
      cell = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    download(
      "aderin-businesses.csv",
      [fields.join(","), ...records.map((r) => fields.map((k) => cell(r[k])).join(","))].join("\n"),
    );
  };
}
const profileBeforeCommerce = stateProfile;
stateProfile = function (index) {
  profileBeforeCommerce(index);
  const row = commerce.summary[index],
    branches = commerce.banks.reduce((sum, b) => sum + b.branchesByState[index], 0);
  $("#modalContent").insertAdjacentHTML(
    "beforeend",
    `<h3 style="margin-top:24px">Business & banking register</h3>${[
      ["Registered businesses", row.businesses],
      ["Domestic-controlled", row.domestic],
      ["Foreign-controlled", row.foreign],
      ["Joint-control", row.joint],
      ["Bank branches", branches],
    ]
      .map(([k, v]) => `<div class="metric"><span>${k}</span><b>${v.toLocaleString()}</b></div>`)
      .join(
        "",
      )}<p>Currency circulation is reported nationally; no state cash estimate is imputed.</p>`,
  );
};
const renderBeforeCommerce = render;
render = function () {
  if (page === "commerce") return renderCommerce();
  renderBeforeCommerce();
  if (page === "overview") {
    $("#content").insertAdjacentHTML(
      "beforeend",
      `<section class="panel full" style="margin-top:24px"><h2>National business & banking register</h2><p>24,600 fictional firms · 8 banks · Public cash outside banks: ${moneyM(commerce.financial.currencyOutsideBanks)}. These national monetary stocks remain separate from state GDP and government budgets.</p><button class="btn" id="open-commerce">View businesses, banks & money →</button></section>`,
    );
    $("#open-commerce").onclick = () => navigate("commerce");
  }
};
