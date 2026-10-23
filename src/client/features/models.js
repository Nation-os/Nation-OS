/** Session-local dataset inspection and OLS/stress model controls. CSV imports do not overwrite canonical country evidence. */
// Local, deterministic models. No external AI service or credentials are used.
const DATA_VERSION = "aderin-state-monthly-v2";
let modelData = regions.flatMap((r, i) =>
  Array.from({ length: 24 }, (_, m) => ({
    region: r.name,
    month: `${2025 + Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}`,
    population: r.pop * 1e6,
    basket: Math.round(
      15000 * (1 + (i % 6) * 0.025) * (1 + m * 0.009) * (1 + (m >= 21 ? r.price / 100 : 0)),
    ),
    rainfall: Math.round(95 + 45 * Math.sin((((m % 12) - 2) * Math.PI) / 6) + (i % 6) * 3),
    freight: Math.round(100 * (1 + m * 0.004 + (m >= 21 && r.parentZone === 3 ? 0.24 : 0))),
    storageLoss: 18 - (i % 6),
    power: r.power,
  })),
);
let datasetName = DATA_VERSION,
  modelRuns = [];
const modelConfig = { horizon: 6, fuel: 10, rainfall: 0, delivery: 80 };
function fitTrend(rows) {
  const n = rows.length,
    xMean = (n - 1) / 2,
    yMean = rows.reduce((a, r) => a + r.basket, 0) / n;
  let numerator = 0,
    denominator = 0;
  rows.forEach((r, i) => {
    numerator += (i - xMean) * (r.basket - yMean);
    denominator += (i - xMean) ** 2;
  });
  const slope = denominator ? numerator / denominator : 0;
  return { slope, intercept: yMean - slope * xMean, n };
}
function runModels() {
  const rows = modelData
    .filter((r) => r.region === regions[selected].name)
    .sort((a, b) => a.month.localeCompare(b.month));
  const train = rows.slice(0, -3),
    holdout = rows.slice(-3),
    fit = fitTrend(train),
    all = fitTrend(rows);
  const errors = holdout.map(
    (r, i) =>
      (Math.abs(r.basket - (fit.intercept + fit.slope * (train.length + i))) / r.basket) * 100,
  );
  const baseline = Math.max(0, all.intercept + all.slope * (rows.length - 1 + modelConfig.horizon));
  const shockFactor = 1 + modelConfig.fuel * 0.002 - modelConfig.rainfall * 0.001;
  const shocked = baseline * shockFactor;
  const policy = outcome(values);
  const relief = (policy.relief * modelConfig.delivery) / 100;
  return {
    region: regions[selected].name,
    last: rows.at(-1).basket,
    lastMonth: rows.at(-1).month,
    baseline,
    shocked,
    policyPrice: shocked * (1 - relief / 100),
    relief,
    mape: errors.reduce((a, b) => a + b, 0) / errors.length,
    trainingRows: train.length,
    testRows: holdout.length,
    slope: all.slope,
    horizon: modelConfig.horizon,
    config: { ...modelConfig },
    allocations: { ...values },
    dataset: datasetName,
    modelVersion: "trend-ols-v1 + stress-v1 + policy-v1",
    created: new Date().toISOString(),
  };
}
const dataNav = document.createElement("button");
dataNav.dataset.page = "data";
dataNav.innerHTML = "▦ <span>Data & models</span>";
document.querySelector("nav").append(dataNav);
dataNav.onclick = () => navigate("data");
const originalNavigate = navigate;
navigate = function (p) {
  if (p !== "data") return originalNavigate(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "Data & models";
  render();
};
const originalRender = render;
render = function () {
  if (page !== "data") {
    originalRender();
    if (page === "scenarios") {
      const note = document.createElement("div");
      note.className = "notice";
      note.innerHTML =
        'MODEL LINK · Policy response v1 powers these allocations. Use Data & models to test a time-series forecast, fuel and rainfall shocks, and delivery sensitivity. <button class="text-btn" id="open-models">Open model workspace →</button>';
      $("#content").prepend(note);
      $("#open-models").onclick = () => navigate("data");
    }
    return;
  }
  renderData();
};
function dataCSV() {
  return [
    "region,month,population,basket,rainfall,freight,storageLoss,power",
    ...modelData.map((r) =>
      [
        r.region,
        r.month,
        r.population,
        r.basket,
        r.rainfall,
        r.freight,
        r.storageLoss,
        r.power,
      ].join(","),
    ),
  ].join("\n");
}
function parseData(csv) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.shift().trim() !== "region,month,population,basket,rainfall,freight,storageLoss,power")
    throw Error(
      "Use the exact column header from the downloadable CSV. Quoted CSV fields are not supported.",
    );
  const seen = new Set();
  const rows = lines.map((line, index) => {
    const cells = line.split(",");
    if (cells.length !== 8) throw Error(`Row ${index + 2}: expected 8 columns.`);
    const [region, month, ...nums] = cells;
    const v = nums.map(Number);
    if (
      !regions.some((r) => r.name === region) ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
      nums.some((s) => !s.trim()) ||
      v.some((n) => !Number.isFinite(n) || n < 0) ||
      v[0] <= 0 ||
      v[1] <= 0 ||
      v[4] > 100 ||
      v[5] > 100
    )
      throw Error(`Row ${index + 2}: invalid region, month or numeric value.`);
    const key = region + month;
    if (seen.has(key)) throw Error(`Duplicate region-month at row ${index + 2}.`);
    seen.add(key);
    return {
      region,
      month,
      population: v[0],
      basket: v[1],
      rainfall: v[2],
      freight: v[3],
      storageLoss: v[4],
      power: v[5],
    };
  });
  for (const r of regions) {
    const months = rows
      .filter((x) => x.region === r.name)
      .map((x) => x.month)
      .sort();
    if (months.length < 12) throw Error(`Provide at least 12 months for ${r.name}.`);
    for (let i = 1; i < months.length; i++) {
      const ordinal = (m) => Number(m.slice(0, 4)) * 12 + Number(m.slice(5));
      if (ordinal(months[i]) - ordinal(months[i - 1]) !== 1)
        throw Error(`Monthly observations must be consecutive for ${r.name}.`);
    }
  }
  return rows;
}
function renderData() {
  const result = runModels(),
    rows = modelData
      .filter((r) => r.region === regions[selected].name)
      .sort((a, b) => a.month.localeCompare(b.month));
  $("#content").innerHTML =
    title(
      "DATA & MODEL WORKSPACE",
      "From source data to a testable decision.",
      "Inspect inputs, run transparent models and preserve the result.",
      `<button class="btn" id="csv-download">↓ Download CSV</button><button class="btn primary" id="import-open">Import demo CSV</button>`,
    ) + renderModelWorkspaceMarkup(result, rows);
  $("#model-region").onchange = (e) => {
    selected = Number(e.target.value);
    renderData();
  };
  document.querySelectorAll("[data-model-input]").forEach(
    (input) =>
      (input.onchange = (e) => {
        modelConfig[input.dataset.modelInput] = Number(e.target.value);
        renderData();
      }),
  );
  $("#csv-download").onclick = () => download("aderin-monthly.csv", dataCSV());
  $("#edit-policy").onclick = () => navigate("scenarios");
  $("#save-run").onclick = () => {
    modelRuns.push(result);
    download("nationos-model-run.json", JSON.stringify(result, null, 2));
    renderData();
    toast("Model run downloaded with inputs, versions and validation.");
  };
  $("#import-open").onclick = () => {
    modal(
      '<h1>Import a monthly dataset</h1><p>Download the sample CSV, edit its numeric values, then select it here. All 37 jurisdictions need at least 12 consecutive months. Maximum file size: 1 MB. Imported data is held in this session; the national overview stays on its original baseline.</p><input type="file" id="csv-file" accept=".csv,text/csv"><p id="import-error" role="alert" class="amber"></p>',
    );
    $("#csv-file").onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1e6) throw Error("File exceeds 1 MB.");
        const rows = parseData(await file.text());
        modelData = rows;
        datasetName = "Imported CSV (session)";
        $("#modal").close();
        renderData();
        toast("Dataset validated. All model outputs recalculated.");
      } catch (err) {
        $("#import-error").textContent = err.message;
      }
    };
  };
}
// Snapshot model provenance once when a new decision is first saved.
const preexistingDecisions = new WeakSet(records);
const originalPersist = persist;
persist = function () {
  records.forEach((r) => {
    if (!preexistingDecisions.has(r) && !r.modelSnapshot) {
      const saved = values;
      values = r.values;
      r.modelSnapshot = runModels();
      values = saved;
      r.modelSnapshot.scope =
        "Data workspace projection; national overview retains its original synthetic baseline";
    }
  });
  return originalPersist();
};
