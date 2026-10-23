/** Render legacy map HTML; the controller supplies transient view state. */
function renderLegacyMapMarkup() {
  return /* HTML */ `<svg
    class="map"
    viewBox="0 0 590 355"
    role="img"
    aria-label="Interactive map of the six fictional Aderin regions"
  >
    <defs>
      <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r=".7" fill="#314049" />
      </pattern>
    </defs>
    <rect width="590" height="355" fill="url(#dots)" />
    <text x="44" y="40" style="font-size:9px;fill:#627a8b">REPUBLIC OF ADERIN</text>
    <text x="508" y="45" style="font-size:12px">N ↑</text>
    ${regions.map((r, i) => `<polygon tabindex="0" role="button" aria-label="Inspect ${r.name}" class="region ${selected === i ? "selected" : ""}" data-region="${i}" fill="${["#344d42", "#3f6350", "#29443e", "#557f66", "#35594d", "#426b57"][i]}" points="${r.points}"/>`).join("")}
    <path
      d="M335 55 Q290 115 327 170 T338 252 Q314 287 325 322"
      fill="none"
      stroke="#6aacc2"
      stroke-width="5"
      opacity=".7"
    />
    <path
      d="M205 102 L293 210 L273 283 M293 210 L395 237 M293 210 L183 194"
      fill="none"
      stroke="#c4ae75"
      stroke-dasharray="4 5"
      opacity=".7"
    />
    ${regions.map((r) => `<text x="${r.x}" y="${r.y}" text-anchor="middle">${r.name}</text>`).join("")}
    <circle class="city" cx="293" cy="218" r="6" />
    <text x="303" y="232" style="font-size:9px">Ayara · Capital</text>
    <circle class="city" cx="273" cy="298" r="4" />
    <text x="405" y="325" style="font-size:10px;fill:#5d879a;letter-spacing:2px">
      SOUTHERN OCEAN
    </text>
    <text x="35" y="320" style="font-size:9px;fill:#7b8b9a">0 ━━━━━ 100 km</text>
  </svg>`;
}
