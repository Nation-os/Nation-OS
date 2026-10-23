/** Render monetary accounts HTML; the controller supplies transient view state. */
function renderMonetaryAccountsMarkup(f) {
  return /* HTML */ `<div class="stats">
      ${stat("Cash outside banks", moneyM(f.currencyOutsideBanks), "Notes & coins held by the public", "blue")}${stat("Bank deposits", moneyM(f.totalDeposits), "Resident non-bank deposits", "blue")}${stat("Narrow money · demo M1", moneyM(f.narrowMoney), "Public cash + overnight deposits", "blue")}${stat("Extended money · demo M2", moneyM(f.extendedMoney), "M1 + eligible short-term deposits", "blue")}
    </div>
    <section class="panel">
      ${panelHead("Money in circulation", "<small>NATIONAL STOCKS · END Q3 2026</small>")}
      <div class="full">
        ${[
          ["Currency issued", f.currencyIssued],
          ["Cash in bank vaults", f.vaultCash],
          ["Currency outside banks", f.currencyOutsideBanks],
          ["Overnight / immediately withdrawable deposits", f.overnightDeposits],
          ["Eligible short-term savings & time deposits", f.shortTermDeposits],
          ["Total included bank deposits", f.totalDeposits],
          ["Narrow money: public cash + overnight deposits", f.narrowMoney],
          ["Extended money: narrow money + short-term deposits", f.extendedMoney],
          ["Bank reserve balances at the central bank", f.reservesAtCentralBank],
          ["Monetary base: currency issued + bank reserve balances", f.monetaryBase],
        ]
          .map(([k, v]) => `<div class="metric"><span>${k}</span><b>${moneyM(v)}</b></div>`)
          .join("")}
        <p>
          Currency issued = public cash + bank vault cash. Do not add vault cash or central-bank
          reserves to the public money measures above. M2 already contains M1; adding them would
          count the same money twice.
        </p>
        <p>
          These demo aggregates cover resident non-bank deposit holders and exclude
          government/interbank deposits. Short-term deposits here mean maturities up to two years or
          withdrawal notice up to three months. They are a chosen convention for fictional Aderin,
          not Nigeria’s monetary statistics.
        </p>
        <p>
          Money stocks, annual GDP, government budget and business turnover describe different
          things. They cannot be added together as the country’s “total money.” No money-creation,
          exchange-rate or inflation response is modelled.
        </p>
        <p>
          <a
            href="https://data.ecb.europa.eu/methodology/what-are-monetary-aggregates"
            target="_blank"
            rel="noreferrer"
            >Reference: monetary aggregate definitions</a
          >
          · All displayed amounts are synthetic.
        </p>
      </div>
    </section>`;
}
