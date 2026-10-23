/** Render sector households HTML; the controller supplies transient view state. */
function renderSectorHouseholdsMarkup(r, s) {
  return /* HTML */ `<div class="region-details">
      ${[
        [
          "Rural household",
          "Lives outside the main service centre.",
          "Travel distance, maintenance and service reliability can limit access even when infrastructure is built.",
        ],
        [
          "Family with school-age children",
          "Balances care, education and household expenses.",
          "Service improvements may reduce time and financial pressure, but affordability needs its own evidence.",
        ],
        [
          "Resident with limited mobility",
          "Needs accessible facilities and dependable transport.",
          "Regional averages can hide accessibility gaps. Include disability access in the implementation review.",
        ],
      ]
        .map(
          ([n, d, impact]) =>
            `<section class="panel person"><span class="avatar">${s.icon}</span><h3>${n}</h3><p>${d}</p><div class="metric"><span>Location</span><b>${r.name}</b></div><p>${impact}</p><p class="green">${s.name} lens: ${s.impact}</p><small>Fictional household archetype; no individual outcome is estimated.</small></section>`,
        )
        .join("")}
    </div>
    <section class="panel full">
      <h2>Equity questions to retain with the decision</h2>
      <p>
        Who remains underserved? Can low-income residents afford the service? Are rural communities
        and people with disabilities included? Aggregate capacity gains do not answer these
        questions.
      </p>
    </section>`;
}
