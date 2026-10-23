/** Render food evidence HTML; the controller supplies transient view state. */
function renderFoodEvidenceMarkup() {
  return /* HTML */ `<div class="notice">
      All records below are synthetic observations in the fictional baseline. Associations suggest
      questions to investigate; they do not establish causation.
    </div>
    <div class="grid">
      <div>
        ${[
          [
            "Market basket survey",
            "OBSERVED IN DEMO",
            "The median staple basket increased from A₦ 18,000 to A₦ 22,680 in Central District.",
            "Synthetic Statistics Office · 120 market stalls · Q3 2026",
          ],
          [
            "Freight corridor inspection",
            "OBSERVED IN DEMO",
            "The Ayara bridge restriction adds an average 2.4 days to the Kora–Ayara freight route.",
            "Synthetic Transport Authority · 40 sampled journeys",
          ],
          [
            "Post-harvest storage audit",
            "ESTIMATE",
            "An estimated 18% of staple volume is lost before retail. The sample excludes small informal stores.",
            "Synthetic Agriculture Bureau · 32 storage facilities",
          ],
          [
            "Household expenditure panel",
            "ESTIMATE",
            "Lower-income Central District households spend approximately 58% of their income on food.",
            "Synthetic Household Survey · 600 fictional households",
          ],
          [
            "International approach library",
            "ILLUSTRATIVE OPTION",
            "Compare freight repairs, improved storage and targeted cash support. Implementation conditions differ by location.",
            "Demo policy library · no claimed real-world effectiveness",
          ],
        ]
          .map(
            ([t, b, d, s]) =>
              `<section class="panel evidence"><span class="badge">${b}</span><h3 style="margin-top:12px">${t}</h3><p>${d}</p><small style="color:var(--muted)">${s}</small></section>`,
          )
          .join("")}
      </div>
      <div>
        <section class="panel full">
          <h2>What we still need to know</h2>
          <p>① How much of the retail price rise comes from freight costs?</p>
          <p>② How do storage losses differ by crop and region?</p>
          <p class="amber">
            Confidence: limited by synthetic sampling and untested causal assumptions.
          </p>
          <button class="btn primary" data-go="scenarios">Compare policy scenarios →</button>
        </section>
        <section class="panel full" style="margin-top:20px">
          <h2>Connected systems</h2>
          <div class="timeline">
            <h3>Bridge disruption</h3>
            <p>Longer routes and higher freight costs</p>
            <h3>Slower market supply</h3>
            <p>More spoilage and less reliable stock</p>
            <h3>Household pressure</h3>
            <p>Potential effects on nutrition and disposable income</p>
          </div>
        </section>
      </div>
    </div>`;
}
