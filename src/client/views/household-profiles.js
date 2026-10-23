/** Render household profiles HTML; the controller supplies transient view state. */
function renderHouseholdProfilesMarkup(r) {
  return /* HTML */ `<div class="grid">
      <section class="panel">
        ${panelHead("Regional geography", "<small>SELECT A REGION</small>")}${map()}
      </section>
      <section class="panel full">
        <p class="eyebrow">REGION PROFILE</p>
        <h1>${r.name}</h1>
        <p>${r.desc}</p>
        <div class="metric"><span>Population</span><b>${r.pop} million</b></div>
        <div class="metric">
          <span>Staple basket price change</span><b class="amber">+${r.price}%</b>
        </div>
        <div class="metric"><span>Households under food pressure</span><b>${r.food}%</b></div>
        <div class="metric"><span>Electricity access</span><b>${r.power}%</b></div>
        <div class="metric"><span>Below demo poverty threshold</span><b>${r.poverty}%</b></div>
      </section>
    </div>
    <div class="title-row" style="margin:28px 0 15px">
      <div>
        <h2>How different households experience the same shock</h2>
        <p>Fictional archetypes · illustrative monthly budgets in ${r.name}</p>
      </div>
    </div>
    <div class="region-details">
      ${[
        [
          "ZI",
          "Zina · Smallholder farmer",
          "5 people · Rural household",
          42000,
          62,
          "Higher retail prices do not guarantee better farm incomes. Transport and storage costs can absorb the gain.",
          "Storage and corridor repairs",
        ],
        [
          "DA",
          "Dami · Market trader",
          "3 people · Peri-urban household",
          68000,
          47,
          "Delivery delays make stock less reliable and reduce the money available for rent and school costs.",
          "More reliable distribution",
        ],
        [
          "ET",
          "Ete · Service worker",
          "4 people · Urban household",
          85000,
          39,
          "A fixed income buys less food. Targeted support may help while infrastructure improvements take effect.",
          "Targeted household support",
        ],
      ]
        .map(([a, n, d, income, share, desc, benefit]) => {
          const food = Math.round((income * share) / 100),
            newFood = Math.round(food * (1 + r.price / 100));
          return `<section class="panel person"><span class="avatar">${a}</span><h3>${n}</h3><small style="color:var(--muted)">${d}</small><p>${desc}</p><div class="metric"><span>Monthly income</span><b>A₦ ${income.toLocaleString()}</b></div><div class="metric"><span>Food budget before shock</span><b>A₦ ${food.toLocaleString()}</b></div><div class="metric"><span>Same basket after shock</span><b class="amber">A₦ ${newFood.toLocaleString()}</b></div><p style="font-size:10px">Relevant response: ${benefit}</p></section>`;
        })
        .join("")}
    </div>`;
}
