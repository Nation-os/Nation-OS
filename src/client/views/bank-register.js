/** Render bank register HTML; the controller supplies transient view state. */
function renderBankRegisterMarkup() {
  return /* HTML */ `<div class="stats">
      ${stat("Depository banks", "8", "Five domestic · two foreign · one joint")}${stat(
        "Branches",
        commerce.banks.reduce((a, b) => a + b.branches, 0),
        "Distributed across states",
      )}${stat("Included deposits", moneyM(commerce.financial.totalDeposits), "Resident non-bank deposit stock")}${stat("Loans outstanding", moneyM(commerce.banks.reduce((a, b) => a + b.loans, 0)), "Credit stock; not extra money supply")}
    </div>
    <section class="panel full" style="margin-bottom:22px">
      <h2>Reserve Authority of Aderin</h2>
      <p>
        The fictional monetary authority issues currency and holds commercial-bank reserve accounts.
        It is listed separately from the eight depository banks; its own full balance sheet is not
        modelled.
      </p>
    </section>
    <section class="panel">
      ${panelHead("Bank register", "<small>SYNTHETIC BALANCE SHEETS</small>")}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Bank</th>
              <th>Control / owner</th>
              <th>Head office</th>
              <th>Branches</th>
              <th>Deposits</th>
              <th>Loans</th>
              <th>Total assets</th>
              <th>NPL rate</th>
            </tr>
          </thead>
          <tbody>
            ${commerce.banks.map((b, i) => `<tr><td><button class="text-btn" data-bank="${i}">${b.name}</button></td><td>${b.ownership}<br>${b.ownerCountry}</td><td>${regions.find((s) => s.id === b.headquartersStateId).name}</td><td>${b.branches}</td><td>${moneyM(b.deposits)}</td><td>${moneyM(b.loans)}</td><td>${moneyM(b.totalAssets)}</td><td>${b.nonPerformingLoanPercent.toFixed(2)}%</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
    <p>
      Each balance sheet reconciles assets with deposits, wholesale funding and equity. Reserves and
      vault cash are bank assets, not additional household deposits. Ownership does not change the
      residency definition used in the monetary totals.
    </p>`;
}
