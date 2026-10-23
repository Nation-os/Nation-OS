/** The browser sends questions, never provider keys. Keep local/evidence/LLM modes explicit and require review before saving drafts. */
let analystStatus = { configured: false, model: null },
  analystQuestion = "",
  analystScope = "all",
  analystReport = null,
  analystBusy = false,
  analystError = "",
  aiDraftProvenance = null;
const analystNav = document.createElement("button");
analystNav.dataset.page = "analyst";
analystNav.innerHTML = '<span class="nav-number">AI</span><span>Data analyst</span>';
const analysisHeading = [...document.querySelectorAll(".nav-section")].find(
  (e) => e.textContent === "PLANNING",
);
if (analysisHeading) document.querySelector("nav").insertBefore(analystNav, analysisHeading);
else document.querySelector("nav").append(analystNav);
analystNav.onclick = () => navigate("analyst");
const navigateBeforeAnalyst = navigate;
navigate = function (p) {
  if (p !== "analyst") return navigateBeforeAnalyst(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "Data analyst";
  render();
  refreshAnalystStatus();
};
async function refreshAnalystStatus() {
  try {
    const response = await fetch("/api/ai/status");
    if (!response.ok) throw Error();
    analystStatus = await response.json();
    if (page === "analyst") renderAnalyst();
  } catch {
    analystError =
      "The AI endpoint is unavailable. Restart the local server with npm.cmd start to load the new API routes.";
    if (page === "analyst") renderAnalyst();
  }
}
function sourceButtons(ids) {
  return ids
    .map(
      (id) =>
        `<button class="source-reference" data-analyst-source="${escapeHtml(id)}">${escapeHtml(id)}</button>`,
    )
    .join(" ");
}
function analystResults() {
  const r = analystReport;
  if (!r)
    return `<section class="panel full"><h2>Start with a question about the evidence</h2><p>Choose a state or ask a country-wide question. Automated analysis explains indicators, compares service gaps and drafts five- or ten-year plans. It uses local rules and calculations, not a language model. Live AI is optional.</p><p>Example: “Draft a five-year plan to improve school attendance in Kora State, and explain what evidence is missing.”</p></section>`;
  return renderAnalystReportMarkup(r);
}
function renderAnalyst() {
  $("#content").innerHTML =
    title(
      "EVIDENCE ANALYSIS",
      "Data & AI analyst",
      "Ask questions, inspect sources and draft proposals for review.",
    ) + renderAnalystWorkspaceMarkup();
  async function submit(mode) {
    if (analystBusy || !$("#analyst-form").reportValidity()) return;
    analystQuestion = $("#analyst-question").value.trim();
    analystScope = $("#analyst-scope").value;
    if (!analystQuestion) return;
    analystBusy = true;
    analystError = "";
    renderAnalyst();
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: analystQuestion, scope: analystScope, mode }),
        signal: AbortSignal.timeout(70000),
      });
      const body = await response.json();
      if (!response.ok) throw Error(body.error || "Analysis failed.");
      analystReport = body;
    } catch (e) {
      analystError =
        e.name === "TimeoutError"
          ? "Analysis timed out. Try a narrower question or search evidence."
          : e.message;
    } finally {
      analystBusy = false;
      if (page === "analyst") renderAnalyst();
    }
  }
  $("#analyst-question").oninput = (e) => {
    analystQuestion = e.target.value;
  };
  $("#analyst-scope").onchange = (e) => {
    analystScope = e.target.value;
  };
  $("#analyst-form").onsubmit = (e) => {
    e.preventDefault();
    submit("local");
  };
  $("#analyst-live").onclick = () => submit("ai");
  $("#analyst-search").onclick = () => submit("evidence");
  $("#analyst-setup").onclick = () =>
    modal(
      "<h1>Connect the AI analyst</h1><p>Copy .env.example to .env in the project folder. Set OPENAI_API_KEY locally, optionally change OPENAI_MODEL, then restart the server with npm.cmd start.</p><p>Keys stay on the server. Do not paste them into the chat, browser or source files. The .env file is excluded from Git. Without a key, use Analyse question or Search evidence.</p>",
    );
  document.querySelectorAll("[data-analyst-source]").forEach(
    (b) =>
      (b.onclick = () => {
        const s = analystReport.sources.find((s) => s.id === b.dataset.analystSource);
        if (s)
          modal(
            `<p class="eyebrow">${escapeHtml(s.id)} · ${s.period}</p><h1>${escapeHtml(s.title)}</h1><p>${escapeHtml(s.summary)}</p><pre class="source-json">${escapeHtml(JSON.stringify(s.values, null, 2))}</pre><p>Synthetic local record. No real-world effectiveness is established.</p>`,
          );
      }),
  );
  if ($("#analyst-export"))
    $("#analyst-export").onclick = () =>
      download("nationos-analyst-report.json", JSON.stringify(analystReport, null, 2));
  if ($("#analyst-apply"))
    $("#analyst-apply").onclick = () => {
      const r = analystReport,
        p = r.proposal;
      if (typeof comparisonProvenance !== "undefined") comparisonProvenance = null;
      planConfig = {
        years: p.years,
        scope: p.scope,
        growth: p.growth,
        delivery: p.delivery,
        maintenance: p.maintenance,
        budgets: { ...p.budgets },
      };
      proposalTitle = p.title;
      proposalReason = p.reason;
      proposalOrigin =
        r.mode === "ai" ? `AI draft · ${r.model}` : "Automated data analysis · local rules";
      aiDraftProvenance = {
        mode: r.mode,
        engine: r.engine || null,
        question: r.question,
        model: r.model,
        created: r.created,
        sources: r.sources,
        findings: r.findings,
        gaps: r.gaps,
        assumptions: r.assumptions,
      };
      navigate("recommendations");
      toast("Draft loaded for review. No decision has been saved.");
    };
}
const renderBeforeAnalyst = render;
render = function () {
  if (page === "analyst") return renderAnalyst();
  renderBeforeAnalyst();
};
