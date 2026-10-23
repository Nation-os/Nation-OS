/** Render business register HTML; the controller supplies transient view state. */
function renderBusinessRegisterMarkup(indices, pageCount, shown, totals) {
  return /* HTML */ `<div class="stats">
      ${stat("Registered firms", totals.businesses.toLocaleString(), "In selected operating geography")}${stat("Domestic-controlled", totals.domestic.toLocaleString(), "More than 50% domestic ownership")}${stat("Foreign-controlled", totals.foreign.toLocaleString(), "Less than 50% domestic ownership")}${stat("Joint control", totals.joint.toLocaleString(), "Exactly 50% domestic ownership")}
    </div>
    <section class="panel">
      ${panelHead("Business register", `<select id="commerce-ownership" aria-label="Business ownership">${["all", "Domestic-controlled", "Foreign-controlled", "Joint control"].map((v) => `<option value="${v}" ${commerceOwnership === v ? "selected" : ""}>${v === "all" ? "All ownership types" : v}</option>`).join("")}</select>`)}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Business</th>
              <th>Operating state</th>
              <th>Industry</th>
              <th>Ownership</th>
              <th>Market reach</th>
              <th>Employees</th>
              <th>Turnover / year</th>
            </tr>
          </thead>
          <tbody>
            ${shown
              .map((i) => {
                const b = commerce.business(i);
                return `<tr><td><button class="text-btn" data-business="${i}">${b.name}</button><br><small>${b.id}</small></td><td>${b.state}</td><td>${b.industry}</td><td>${b.ownership}<br>${b.domesticOwnershipPercent}% domestic</td><td>${b.marketScope}</td><td>${b.employees}</td><td>${moneyM(b.annualTurnoverMillions)}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="full" style="display:flex;justify-content:space-between">
        <button class="btn" id="commerce-prev" ${commercePage === 0 ? "disabled" : ""}>
          Previous</button
        ><span
          >${indices.length.toLocaleString()} matches · Page ${commercePage + 1} of
          ${pageCount}</span
        ><button class="btn" id="commerce-next" ${commercePage + 1 >= pageCount ? "disabled" : ""}>
          Next
        </button>
      </div>
    </section>
    <p>
      Headline counts reflect the selected state scope; the ownership filter applies to table rows.
      Turnover is revenue before costs, not GDP or profit. Registered employment totals are not
      national employment statistics.
    </p>`;
}
