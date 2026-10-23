/** Render projection chart HTML; the controller supplies transient view state. */
function renderProjectionChartMarkup(key, max, min, point, result) {
  return /* HTML */ `<svg
    viewBox="0 0 580 180"
    style="width:100%;height:210px"
    role="img"
    aria-label="National ${PlanningEngine.definitions[key].metric}: no additional investment versus the proposed plan"
  >
    ${[0, 1, 2].map((i) => `<line x1="35" x2="555" y1="${30 + i * 55}" y2="${30 + i * 55}" stroke="#2b3946"/><text x="0" y="${34 + i * 55}" font-size="9" fill="#8491a3">${(max - ((max - min) * i) / 2).toFixed(1)}</text>`).join("")}${[
      ["low", "#618b83", "3 4"],
      ["high", "#618b83", "3 4"],
      ["no", "#e9b56e", "5 5"],
      ["with", "#6ae1b2", ""],
    ]
      .map(
        ([variant, color, dash]) =>
          `<polyline points="${result.years.map((y, i) => point(y.national[key][variant], i)).join(" ")}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="${dash}"/>`,
      )
      .join(
        "",
      )}${result.years.map((y, i) => `<text x="${35 + (i * 520) / (result.years.length - 1)}" y="169" text-anchor="middle" font-size="9" fill="#8491a3">${y.year}</text>`).join("")}
  </svg>`;
}
