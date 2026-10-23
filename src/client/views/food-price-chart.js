/** Render food price chart HTML; the controller supplies transient view state. */
function renderFoodPriceChartMarkup() {
  return /* HTML */ `<div class="chart">
    <svg
      viewBox="0 0 560 140"
      role="img"
      aria-label="Synthetic food basket index rises from 100 in April to 121 in September"
    >
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#6ae1b2" stop-opacity=".22" />
          <stop offset="1" stop-color="#6ae1b2" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${[25, 65, 105].map((y, i) => `<line x1="35" x2="550" y1="${y}" y2="${y}" stroke="#293541"/><text x="0" y="${y + 4}" fill="#7c8b9e" font-size="9">${130 - i * 15}</text>`).join("")}
      <path
        d="M38 109 C90 110 100 85 145 90 S225 72 250 77 S320 57 355 60 S420 32 450 36 S515 10 549 17 L549 135 L38 135Z"
        fill="url(#area)"
      />
      <path
        d="M38 109 C90 110 100 85 145 90 S225 72 250 77 S320 57 355 60 S420 32 450 36 S515 10 549 17"
        fill="none"
        stroke="#6ae1b2"
        stroke-width="2.5"
      />
      <path
        d="M38 110 L145 105 L250 99 L355 91 L450 85 L549 79"
        fill="none"
        stroke="#7188a3"
        stroke-dasharray="4 5"
      />
      <circle cx="549" cy="17" r="4" fill="#6ae1b2" />
    </svg>
    <div class="chart-labels">
      <span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span
      ><span>SEP</span>
    </div>
  </div>`;
}
