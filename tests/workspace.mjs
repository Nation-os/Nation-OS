import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { mountWorkspace } from "../generated/workspace-runtime.mjs";
import { createAIService } from "../lib/ai-service.mjs";
import { workspaceRoutes, pageForPath } from "../lib/routes.mjs";

const dom = new JSDOM('<!doctype html><html><body><div id="workspace"></div></body></html>', {
  url: "http://localhost:4173",
});
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage"),
  originalFetch = globalThis.fetch;
Object.defineProperty(globalThis, "localStorage", {
  value: dom.window.localStorage,
  configurable: true,
});
const service = createAIService({ apiKey: "" });
globalThis.fetch = async (url, options) =>
  new Response(
    JSON.stringify(
      url === "/api/ai/status" ? service.status() : await service.analyze(JSON.parse(options.body)),
    ),
    { headers: { "Content-Type": "application/json" } },
  );
const root = dom.window.document.querySelector("#workspace"),
  visited = [];
let controller;
try {
  controller = mountWorkspace(root, { onNavigate: (page) => visited.push(workspaceRoutes[page]) });
  assert(root.textContent.includes("Republic of Aderin"));
  assert.equal(root.querySelectorAll(".geographic-map [data-region]").length, 37);
  for (const [page, path] of Object.entries(workspaceRoutes)) {
    assert.equal(pageForPath(path), page);
    controller.show(page);
    assert.equal(controller.currentPage, page);
    assert(root.querySelector("#content").textContent.length > 100);
  }
  controller.show("states");
  root.querySelector("[data-open-state]").click();
  assert(root.querySelector("dialog").open);
  assert(root.querySelector("#modalContent").textContent.includes("State economic accounts"));
  root.querySelector("#closeModal").click();
  controller.show("sectors");
  root.querySelector('[data-sector="food"]').click();
  assert.equal(controller.currentPage, "scenarios");
  assert.equal(visited.at(-1), "/sectors/food");
  controller.show("comparisons");
  root.querySelector("#comparison-horizon").value = "10";
  root.querySelector("#comparison-plan").click();
  assert.equal(controller.currentPage, "recommendations");
  assert.equal(root.querySelector("#plan-years").value, "10");
  assert.equal(visited.at(-1), "/recommendations");
  root.querySelector("#plan-title").value = "Next.js migration verification";
  root.querySelector("#plan-reason").value =
    "Review a comparison-based draft using the preserved model.";
  root.querySelector("#plan-save").click();
  assert(
    JSON.parse(dom.window.localStorage.getItem("nationos-plans")).some(
      (p) => p.title === "Next.js migration verification",
    ),
  );
  controller.show("analyst");
  await new Promise((resolve) => setTimeout(resolve, 20));
  root.querySelector("#analyst-question").value =
    "Draft a 5-year education plan for Kora State with 120 million";
  root
    .querySelector("#analyst-form")
    .dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert(root.querySelector("#content").textContent.includes("AUTOMATED PROPOSAL"));
  root.querySelector("#analyst-apply").click();
  assert.equal(controller.currentPage, "recommendations");
  controller.destroy();
  controller = mountWorkspace(root);
  controller.show("recommendations");
  assert(root.textContent.includes("Next.js migration verification"));
  assert.equal(root.querySelectorAll('nav [data-page="overview"]').length, 1);
  assert.equal(root.querySelectorAll('nav [data-page="scenarios"]').length, 0);
  assert.equal(pageForPath("/missing"), null);
  console.log(
    "Passed: mounted client runtime, all Next.js page mappings, SVG selection, dialogs, food nesting, comparison/analyst plan handoffs, persistence and clean remount.",
  );
} finally {
  controller?.destroy();
  dom.window.close();
  globalThis.fetch = originalFetch;
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else delete globalThis.localStorage;
}
