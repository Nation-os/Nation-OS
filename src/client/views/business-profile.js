/** Render business profile HTML; the controller supplies transient view state. */
function renderBusinessProfileMarkup(b) {
  return /* HTML */ `<p class="eyebrow">SYNTHETIC BUSINESS · ${b.id}</p>
    <h1>${b.name}</h1>
    ${[
      ["Operating state", b.state],
      ["Industry", b.industry],
      ["Control classification", b.ownership],
      ["Domestic ownership", b.domesticOwnershipPercent + "%"],
      ["Ultimate owner location", b.ultimateOwnerCountry],
      ["Incorporation country", b.incorporationCountry],
      ["Market reach", b.marketScope],
      ["Legal form", b.legalForm],
      ["Employees", b.employees],
      ["Annual turnover", moneyM(b.annualTurnoverMillions)],
      ["Banking relationship", b.bank],
    ]
      .map(([k, v]) => `<div class="metric"><span>${k}</span><b>${escapeHtml(v)}</b></div>`)
      .join("")}
    <p>
      “Domestic-controlled” means more than 50% Aderin ownership; “foreign-controlled” means less
      than 50%; 50% is joint control. Operating location and market reach are separate attributes.
      The banking relationship is illustrative and does not represent an actual account or deposit
      balance.
    </p>`;
}
