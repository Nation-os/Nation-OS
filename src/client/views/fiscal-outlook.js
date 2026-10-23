/** Render fiscal outlook HTML; the controller supplies transient view state. */
function renderFiscalOutlookMarkup(f, last) {
  return /* HTML */ `<section class="panel" style="margin-top:24px">
    ${panelHead("Budget & fiscal outlook", "<small>ILLUSTRATIVE TREASURY MODEL</small>")}
    <div class="full">
      <div class="stats">
        ${stat("Annual proposal cost", moneyM(f.annualCost), "Recurring each plan year")}${stat("Available planning envelope", moneyM(f.available), `${f.utilization.toFixed(1)}% used by this proposal`)}${stat("Extra annual funding", moneyM(f.supplemental), f.supplemental ? "Assumed financed through debt" : "Fits within the existing envelope", f.supplemental ? "amber" : "green")}${stat("End-of-plan debt / GDP", `${last.debtToGDP.toFixed(1)}%`, "GDP path assumes 3% real annual growth", "blue")}
      </div>
      <p>
        ${f.supplemental ? `The proposal exceeds the current envelope by ${moneyM(f.supplemental)} per year. The fiscal scenario borrows this shortfall; saving a proposal does not authorize that borrowing.` : `The proposal leaves ${moneyM(f.remaining)} of the annual planning envelope unallocated. The baseline budget already includes the full envelope, so unused funds are not treated as a saving.`}
        This check assesses one proposal at a time. Saved proposals are not combined into a funded
        portfolio.
      </p>
    </div>
    <div style="overflow:auto">
      <table class="compare">
        <thead>
          <tr>
            <th>Year</th>
            <th>Real GDP</th>
            <th>Revenue</th>
            <th>Spending</th>
            <th>Deficit</th>
            <th>Debt / GDP</th>
            <th>Additional debt vs. baseline</th>
          </tr>
        </thead>
        <tbody>
          ${f.rows.map((r) => `<tr><td>${r.year}</td><td>${moneyM(r.gdp)}</td><td>${moneyM(r.revenue)}</td><td>${moneyM(r.spending)}</td><td>${moneyM(r.deficit)}</td><td>${r.debtToGDP.toFixed(1)}%</td><td>${moneyM(r.extraDebt)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="full">
      <details>
        <summary class="text-btn">Fiscal assumptions</summary>
        <p>
          All future amounts are in real 2026 A₦. GDP and revenues grow ${f.assumptions.gdpGrowth}%
          annually; committed non-interest spending grows
          ${f.assumptions.nonInterestSpendingGrowth}%. Financing charges equal
          ${f.assumptions.financingRate.toFixed(2)}% of opening debt. Deficits increase debt. No
          inflation, refinancing, exchange-rate or policy-to-GDP effects are estimated.
        </p>
        <p>${f.assumptions.financing} ${f.assumptions.scope}</p>
      </details>
    </div>
  </section>`;
}
