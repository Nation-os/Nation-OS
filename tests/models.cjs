const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");
const nodes = new Map();
function element(key) {
  if (!nodes.has(key))
    nodes.set(key, {
      innerHTML: "",
      textContent: "",
      style: {},
      dataset: {},
      classList: { toggle() {} },
      append() {},
      prepend() {},
      insertAdjacentHTML(position, html) {
        this.innerHTML += html;
      },
      showModal() {},
      close() {},
    });
  return nodes.get(key);
}
const context = vm.createContext({
  document: {
    querySelector: element,
    querySelectorAll: () => [],
    createElement: () => element("created"),
  },
  localStorage: { getItem: () => null, setItem() {} },
  setTimeout() {},
  Date,
  Blob,
  URL,
  console,
});
for (const view of fs.readdirSync("src/client/views"))
  vm.runInContext(fs.readFileSync("src/client/views/" + view, "utf8"), context);
vm.runInContext(fs.readFileSync("src/client/features/app-seed.js", "utf8"), context);
for (const file of [
  "src/client/features/app.js",
  "src/client/features/states.js",
  "src/client/features/geography.js",
  "src/client/features/models.js",
])
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
const run = (code) => vm.runInContext(code, context);
assert.equal(run("modelData.length"), 888);
assert.equal(run("parseData(dataCSV()).length"), 888);
assert.throws(
  () => run(String.raw`parseData(dataCSV()+'\n'+dataCSV().split('\n')[1])`),
  /Duplicate/,
);
assert.throws(() => run("parseData(dataCSV().replace('2025-01','2025-13'))"), /invalid/);
assert.throws(
  () => run(String.raw`parseData(dataCSV().split('\n').filter((_,i)=>i!==2).join('\n'))`),
  /consecutive/,
);
assert.equal(run("runModels().trainingRows"), 21);
assert.equal(run("runModels().testRows"), 3);
assert(run("Number.isFinite(runModels().mape)"));
const base = run("runModels().shocked");
run("modelConfig.fuel=50");
assert(run("runModels().shocked") > base);
run("modelConfig.delivery=0");
assert.equal(run("runModels().policyPrice"), run("runModels().shocked"));
run("navigate('data')");
assert(element("#content").innerHTML.includes("Model output & validation"));
run("records.unshift({values:{roads:40,storage:30,support:20}});persist()");
assert.equal(run("records[0].modelSnapshot.modelVersion"), "trend-ols-v1 + stress-v1 + policy-v1");
console.log(
  "Passed: dataset round trip, invalid dates, duplicates, missing months, holdout split, fuel sensitivity, zero delivery, model view and decision provenance.",
);

vm.runInContext(fs.readFileSync("src/client/features/sector-definitions.js", "utf8"), context);
vm.runInContext(fs.readFileSync("src/client/features/sectors.js", "utf8"), context);
assert.equal(run("sectorRows.length"), 185);
for (const key of ["education", "transport", "health", "energy", "water"]) {
  for (let region = 0; region < 37; region++) {
    context.testKey = key;
    context.testRegion = region;
    const result = run("sectorOutcome(testKey,testRegion,[40,30,20],80)");
    assert.equal(result.cost, 90);
    assert(result.result >= 0);
    if (key === "transport") assert(result.result < result.baseline);
    else assert(result.result > result.baseline && result.result <= 100);
    assert.equal(run("sectorOutcome(testKey,testRegion,[40,30,20],0).change"), 0);
  }
  run(`activeSector='${key}';navigate('sectors')`);
  for (const tab of ["overview", "evidence", "simulator", "people"]) {
    run(`sectorTab='${tab}';render()`);
    assert(element("#content").innerHTML.includes("CONNECTED NATIONAL PLANNING"));
  }
}
run(
  "records=[];records.push({title:'Food record',reason:'food',reviewer:'A',date:'today',values:{roads:40,storage:30,support:20},reviewed:false});records.unshift({sector:'education',region:'Central District',title:'School record',reason:'schools',reviewer:'B',date:'today',reviewed:false,allocation:[40,30,20],modelSnapshot:sectorOutcome('education',3,[40,30,20],80),source:'Synthetic census',gap:'Sampling gap',milestones:['Audit','Deliver','Review'],values:{roads:0,storage:0,support:0}});navigate('decisions')",
);
assert(element("#content").innerHTML.includes("School record"));
assert(element("#content").innerHTML.includes("Food record"));
assert.equal(run("records.length"), 2);
assert.equal(run("sectorDataCSV().split(String.fromCharCode(10)).length"), 186);
console.log(
  "Passed: five sectors across 37 jurisdictions, direction and physical bounds, zero delivery, all sector views, mixed food/sector records and CSV export.",
);

vm.runInContext(fs.readFileSync("src/client/features/states-ui.js", "utf8"), context);
assert.equal(run("regions.length"), 37);
assert.equal(run("regions.filter(r=>r.type==='State').length"), 36);
assert(Math.abs(run("regions.reduce((a,r)=>a+r.pop,0)") - 24.6) < 1e-9);
assert.equal(run("new Set(regions.map(r=>r.id)).size"), 37);
for (let z = 0; z < 6; z++) {
  context.zone = z;
  assert(
    Math.abs(
      run(
        "regions.filter(r=>r.parentZone===zone).reduce((a,r)=>a+r.pop,0)-administrativeZones[zone].pop",
      ),
    ) < 1e-9,
  );
}
run("navigate('states')");
assert(element("#content").innerHTML.includes("Ayara Capital Territory"));
run("stateSearch='Ovara';render()");
assert(element("#content").innerHTML.includes("Ovara State"));
assert(!element("#content").innerHTML.includes("Kora State"));
run("stateSearch='';zoneFilter='0';render()");
assert(element("#content").innerHTML.includes("Kora State"));
assert(!element("#content").innerHTML.includes("Ovara State"));
console.log(
  "Passed: complete state register, unique IDs, national and zone population totals, state search and zone filter.",
);

vm.runInContext(fs.readFileSync("src/client/features/country.js", "utf8"), context);
run("navigate('overview')");
assert(element("#content").innerHTML.includes("Republic of Aderin"));
assert(element("#content").innerHTML.includes("Economic structure"));
assert(!element("#content").innerHTML.includes("Priority signal"));
assert(!element("#content").innerHTML.includes("Build an intervention package"));
run("navigate('sectors')");
assert(element("#content").innerHTML.includes("CONNECTED NATIONAL PLANNING"));
console.log("Passed: country landing profile and preserved sector navigation.");
for (const file of ["lib/domain/citizen-engine.cjs", "src/client/features/citizens.js"])
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
run("navigate('citizens')");
assert(element("#content").innerHTML.includes("AD-C-00000001"));
run(
  "citizenState=citizenStates[36].id;citizenPage=Math.ceil(citizenStates[36].count/25)-1;render()",
);
assert(element("#content").innerHTML.includes("AD-C-24600000"));
assert.deepEqual(
  JSON.parse(run("JSON.stringify(citizenStates)")),
  require("../data/citizen-states.cjs"),
);
console.log("Passed: citizen registry first/last page and UI/export register consistency.");
for (const file of ["lib/domain/planning-engine.cjs", "src/client/features/recommendations.js"])
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
run("navigate('recommendations')");
assert(element("#content").innerHTML.includes("System recommendations"));
assert(element("#content").innerHTML.includes("2031"));
run("planConfig.years=10;render()");
assert(element("#content").innerHTML.includes("2036"));
assert(element("#content").innerHTML.includes("Years 6–10"));
run("navigate('overview')");
assert(element("#content").innerHTML.includes("Republic of Aderin"));
run("navigate('decisions')");
console.log(
  "Passed: recommendation dashboard, 5/10-year views, country profile and decision-memory navigation.",
);
for (const file of ["lib/domain/economy-engine.cjs", "src/client/features/economy.js"])
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
run("navigate('overview')");
assert(element("#content").innerHTML.includes("Natural resource register"));
assert(element("#content").innerHTML.includes("Nominal GDP"));
run("navigate('recommendations')");
assert(element("#content").innerHTML.includes("Budget & fiscal outlook"));
run("renderRecommendations()");
assert.equal((element("#content").innerHTML.match(/Budget & fiscal outlook/g) || []).length, 1);
assert(run("planResult.fiscal.annualCost===planResult.annualCost"));
console.log(
  "Passed: economic country profile, fiscal projection integration and recalculation rendering.",
);

assert.equal(run("stateBoundaries.length"), 37);
assert(run("stateBoundaries.every(poly=>poly.length>=3&&poly.every(p=>p.every(Number.isFinite)))"));
assert(
  run(
    "administrativeZones.every((_,z)=>new Set(regions.filter(r=>r.parentZone===z).map(r=>r.citizenCount)).size===regions.filter(r=>r.parentZone===z).length)",
  ),
);
assert.equal(run("regions.reduce((sum,r)=>sum+r.citizenCount,0)"), 24600000);
assert(run("regions.every((r,i)=>citizenStates[i].count===r.citizenCount)"));
run("navigate('overview')");
assert(element("#content").innerHTML.includes("geographic-map"));
assert(element("#content").innerHTML.includes("Ayara Capital Territory"));
console.log(
  "Passed: 37 finite map boundaries, unequal state populations, exact registry counts and homepage geography.",
);

vm.runInContext(fs.readFileSync("src/client/features/economic-scopes.js", "utf8"), context);
run("navigate('overview')");
assert(element("#content").innerHTML.includes("General summary"));
run("selected=0;render()");
assert.equal(run("economicScope"), run("regions[0].id"));
assert(element("#content").innerHTML.includes("Economic baseline"));
run("economicScope='all';render()");
assert(element("#content").innerHTML.includes("National macroeconomic baseline"));
assert(run("stateRegisterData(0).annualSpendingMillions>0"));
console.log(
  "Passed: national general view, map-linked state economic context and state register accounts.",
);
run("globalThis.fetch=async()=>({ok:true,json:async()=>({configured:false,model:null})})");
vm.runInContext(fs.readFileSync("src/client/features/analyst.js", "utf8"), context);
run("navigate('analyst')");
assert(element("#content").innerHTML.includes("Search evidence"));
assert(element("#content").innerHTML.includes("Automated analysis is ready"));
run(
  "analystReport={question:'School plan',mode:'ai',model:'test-model',created:'test-date',summary:'<script>unsafe</script>',findings:[{text:'<b>Test finding</b>',sourceIds:['AD-11-education']}],sources:[{id:'AD-11-education',title:'Attendance',summary:'Synthetic attendance',period:'2026-Q3',values:{baseline:61}}],gaps:['No learning data'],assumptions:['Delivery 80%'],proposal:{title:'School proposal',reason:'Review attendance gaps',scope:'AD-11',years:5,growth:2,delivery:80,maintenance:20,budgets:{food:0,education:100,transport:0,health:0,energy:0,water:0}},modelResult:PlanningEngine.project(planningStates,{years:5,scope:'AD-11',growth:2,delivery:80,maintenance:20,budgets:{food:0,education:100,transport:0,health:0,energy:0,water:0}})};renderAnalyst()",
);
assert(element("#content").innerHTML.includes("&lt;script&gt;"));
assert(element("#content").innerHTML.includes("Review & edit in recommendations"));
const previousSavedPlans = run("savedPlans.length");
element("#analyst-apply").onclick();
assert.equal(run("page"), "recommendations");
assert.equal(run("planConfig.scope"), "AD-11");
assert.equal(run("aiDraftProvenance.model"), "test-model");
assert.equal(run("savedPlans.length"), previousSavedPlans);
element("#plan-new").onclick();
assert.equal(run("aiDraftProvenance"), null);
console.log(
  "Passed: analyst page, escaped AI content, draft-to-planner handoff, no automatic decision save and cleared provenance on new proposals.",
);
for (const file of ["lib/domain/commerce-engine.cjs", "src/client/features/commerce.js"])
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
run("navigate('commerce')");
assert(element("#content").innerHTML.includes("Business register"));
run("commerceOwnership='Foreign-controlled';commerceState='AD-11';renderCommerce()");
assert(
  run(
    "filteredBusinessIndices().every(i=>commerce.business(i).stateId==='AD-11'&&commerce.business(i).ownership==='Foreign-controlled')",
  ),
);
run("commerceTab='banks';renderCommerce()");
assert(element("#content").innerHTML.includes("Aderin Commercial Bank"));
run("commerceTab='money';renderCommerce()");
assert(element("#content").innerHTML.includes("Currency outside banks"));
assert(element("#content").innerHTML.includes("Monetary base"));
run("navigate('overview')");
assert(element("#content").innerHTML.includes("National business & banking register"));
console.log(
  "Passed: business filters, bank and money views, country register summary and preserved navigation.",
);
for (const file of ["lib/domain/comparison-engine.cjs", "src/client/features/comparisons.js"])
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
run("navigate('comparisons')");
assert(element("#content").innerHTML.includes("All-state ranking"));
assert(element("#content").innerHTML.includes("Compare two jurisdictions"));
run("includeCapital=false;renderComparisons()");
assert.equal(
  run(
    "ComparisonEngine.rank(comparisonStates,comparisonWeights,comparisonMetric,includeCapital).length",
  ),
  36,
);
const plansBeforeComparison = run("savedPlans.length");
element("#comparison-horizon").value = "10";
element("#comparison-plan").onclick();
assert.equal(run("page"), "recommendations");
assert.equal(run("planConfig.years"), 10);
assert.equal(run("planConfig.scope"), run("compareLeft"));
assert(Math.abs(run("Object.values(planConfig.budgets).reduce((a,b)=>a+b,0)") - 100) < 1e-9);
assert.equal(run("comparisonProvenance.version"), "aderin-state-comparison-v1");
assert.equal(run("savedPlans.length"), plansBeforeComparison);
element("#plan-new").onclick();
assert.equal(run("comparisonProvenance"), null);
console.log(
  "Passed: comparison page, territory filter, ten-year draft handoff, allocation total and provenance lifecycle.",
);
