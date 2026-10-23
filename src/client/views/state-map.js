/** Render state map HTML; the controller supplies transient view state. */
function renderStateMapMarkup() {
  return /* HTML */ `<svg
      class="map state-map geographic-map"
      viewBox="0 0 650 470"
      role="img"
      aria-label="Map of fictional Aderin divided into 36 selectable states and Ayara Capital Territory"
    >
      <defs>
        <clipPath id="aderin-outline">
          <polygon points="${countryOutline.map((p) => p.join(",")).join(" ")}" />
        </clipPath>
      </defs>
      <rect width="650" height="470" fill="#e5edf0" />
      <text x="24" y="29" style="font-size:9px;letter-spacing:1.5px">REPUBLIC OF ADERIN</text>
      <text x="600" y="44" style="font-size:11px">N ↑</text>
      <polygon
        points="${countryOutline.map((p) => p.join(",")).join(" ")}"
        fill="#dae0cc"
        stroke="#6e806a"
        stroke-width="2"
      />
      ${regions.map((r, i) => `<polygon class="region ${i === selected ? "selected" : ""}" style="--state-fill:${zoneMapColors[r.parentZone]}" data-region="${i}" tabindex="0" role="button" aria-label="${r.name}, population ${r.citizenCount.toLocaleString()}" points="${stateBoundaries[i].map((p) => p.map((n) => n.toFixed(2)).join(",")).join(" ")}"><title>${r.name} · ${r.citizenCount.toLocaleString()} residents</title></polygon>`).join("")}
      <path
        d="M338 45 Q312 100 341 156 Q359 193 339 247 Q326 280 350 321 Q365 359 343 423"
        clip-path="url(#aderin-outline)"
        fill="none"
        stroke="#83aebc"
        stroke-width="3"
        opacity=".8"
        pointer-events="none"
      />
      ${regions.map((r, i) => `<text x="${stateSites[i][0]}" y="${stateSites[i][1] + 3}" text-anchor="middle" style="font-size:${i === 36 ? "7" : "9"}px">${i === 36 ? "ACT" : r.name.replace(" State", "")}</text>`).join("")}
      <circle cx="309" cy="216" r="3" fill="#38523c" pointer-events="none" />
      <text x="444" y="444" style="font-size:9px;letter-spacing:2px">SOUTHERN OCEAN</text>
      <text x="22" y="455" style="font-size:9px">
        Fictional boundaries · Select a state · ACT = capital territory
      </text>
    </svg>
    <div class="geography-key">
      ${administrativeZones.map((z, i) => `<span><b style="background:${zoneMapColors[i]}"></b>${z.name}</span>`).join("")}
    </div>`;
}
