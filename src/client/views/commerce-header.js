/** Render commerce header HTML; the controller supplies transient view state. */
function renderCommerceHeaderMarkup() {
  return /* HTML */ `<div class="notice">
      Fictional records · Q3 2026. Domestic/foreign control describes ownership, not whether a
      business operates in Aderin. The 24,600 firms form an illustrative registered-business
      dataset; informal firms and the complete labour market are not represented.
    </div>
    <div class="sector-toolbar">
      <div class="sector-tabs">
        ${[
          ["businesses", "Businesses"],
          ["banks", "Banks"],
          ["money", "Money in circulation"],
        ]
          .map(
            ([k, l]) =>
              `<button class="btn ${commerceTab === k ? "primary" : ""}" data-commerce-tab="${k}">${l}</button>`,
          )
          .join("")}
      </div>
      ${commerceTab === "businesses" ? `<select id="commerce-state" aria-label="Business operating state"><option value="all">All states & territories</option>${regions.map((s) => `<option value="${s.id}" ${commerceState === s.id ? "selected" : ""}>${s.name}</option>`).join("")}</select>` : ""}
    </div>`;
}
