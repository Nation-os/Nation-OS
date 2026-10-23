/** Render model workspace HTML; the controller supplies transient view state. */
function renderModelWorkspaceMarkup(result, rows) {
  return /* HTML */ `<div class="notice">
      LOCAL COMPUTATION · These statistical and rules models run in your browser. All starting data
      is synthetic. No LLM or external AI provider is connected. Imported data changes this
      workspace only; the national overview retains its fictional baseline.
    </div>
    <div class="stats">
      ${stat("Dataset observations", modelData.length, "37 state monthly series")}${stat("Data validation", "Passed", "Required fields · unique dates · ranges")}${stat("Model versions", "3", "Trend · stress · policy response")}${stat("Saved model runs", modelRuns.length, "Session only · download to preserve")}
    </div>
    <div class="grid">
      <section class="panel">
        ${panelHead("Model registry", "<small>EXECUTABLE IN BROWSER</small>")}
        <div class="full">
          <h3>01 · Staple basket trend / OLS v1</h3>
          <p>
            Fits a straight line to monthly basket prices. Trains on all but the final three
            observations to report holdout error; refits on all observations for projection. Month
            is the only predictor.
          </p>
          <h3>02 · Supply stress / Rules v1</h3>
          <p>
            Applies fuel and rainfall assumptions to the trend. Each 1% fuel increase adds 0.2% to
            basket cost; each 1% rainfall increase reduces it by 0.1%. Coefficients are
            illustrative.
          </p>
          <h3>03 · Policy response / Rules v1</h3>
          <p>
            Uses the current simulator allocations, then scales its relief by delivery
            effectiveness. These coefficients are not learned from data.
          </p>
          <div class="metric"><span>Data lineage</span><b>${escapeHtml(datasetName)}</b></div>
          <p style="font-size:11px">
            Rainfall, freight, storage and power columns are available for inspection. They are not
            predictors in the trend model. Shock controls are explicit user assumptions.
          </p>
        </div>
      </section>
      <section class="panel">
        ${panelHead("Run conditions", "<small>ADJUST & RECALCULATE</small>")}
        <div class="full">
          <select id="model-region" aria-label="Model region">
            ${regions.map((r, i) => `<option value="${i}" ${selected === i ? "selected" : ""}>${r.name}</option>`).join("")}</select
          >${[
            ["horizon", "Forecast horizon", 1, 12, "months"],
            ["fuel", "Fuel price change", -30, 80, "%"],
            ["rainfall", "Rainfall change", -50, 50, "%"],
            ["delivery", "Delivery effectiveness", 0, 100, "%"],
          ]
            .map(
              ([k, l, min, max, u]) =>
                `<div class="slider-row"><label for="model-${k}">${l}<b>${modelConfig[k]} ${u}</b></label><input id="model-${k}" data-model-input="${k}" type="range" min="${min}" max="${max}" value="${modelConfig[k]}"></div>`,
            )
            .join("")}
          <p style="font-size:11px">
            Allocation: roads ${values.roads}M · storage ${values.storage}M · support
            ${values.support}M A₦. <button class="text-btn" id="edit-policy">Edit policy →</button>
          </p>
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:20px">
      ${panelHead("Model output & validation", `<button class="text-btn" id="save-run">Save & download run ↓</button>`)}
      <div class="full">
        <div class="stats">
          ${stat("Latest input basket", `A₦ ${result.last.toLocaleString()}`, result.lastMonth, "blue")}${stat(`${result.horizon}-month trend projection`, `A₦ ${Math.round(result.baseline).toLocaleString()}`, "Before scenario shocks", "blue")}${stat("After fuel & rainfall shock", `A₦ ${Math.round(result.shocked).toLocaleString()}`, "Conditional estimate", "amber")}${stat("After policy response", `A₦ ${Math.round(result.policyPrice).toLocaleString()}`, `${result.relief.toFixed(1)}% relief vs. shocked projection`)}
        </div>
        <div class="metric">
          <span>Three-month holdout mean absolute percentage error</span
          ><b>${result.mape.toFixed(2)}%</b>
        </div>
        <div class="metric">
          <span>Training / test observations</span
          ><b>${result.trainingRows} / ${result.testRows}</b>
        </div>
        <p>
          Holdout accuracy on synthetic data is not evidence of real-world validity. The trend can
          miss shocks, seasonality and structural change. These models do not estimate causal
          effects or calibrated uncertainty.
        </p>
      </div>
    </section>
    <section class="panel" style="margin-top:20px">
      ${panelHead("Dataset preview · latest six months", `<small>${escapeHtml(regions[selected].name)}</small>`)}
      <div style="overflow:auto">
        <table class="compare">
          <thead>
            <tr>
              <th>Month</th>
              <th>Basket (A₦)</th>
              <th>Rain (mm)</th>
              <th>Freight index</th>
              <th>Storage loss (%)</th>
              <th>Power access (%)</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .slice(-6)
              .map(
                (r) =>
                  `<tr><td>${r.month}</td><td>${r.basket.toLocaleString()}</td><td>${r.rainfall}</td><td>${r.freight}</td><td>${r.storageLoss}</td><td>${r.power}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="map-caption" style="margin-top:15px">
        Schema: region, month, population (persons), basket (A₦), rainfall (mm), freight (index),
        storageLoss (%), power (%). Generated deterministically; 2025–2026 baseline.
      </p>
    </section>`;
}
