# Code map

This guide explains the responsibilities of the maintained code. Generated bundles are assembled from these files and are not separate implementations.

## Next and React entry points

| File                                    | Responsibility                                      |
| --------------------------------------- | --------------------------------------------------- |
| app/layout.jsx                          | Language, metadata and ordered CSS imports          |
| app/(workspace)/layout.jsx              | Persistent container above changing page segments   |
| app/(workspace)/[[...section]]/page.jsx | Await params, validate URL, return 404 when unknown |
| app/not-found.jsx                       | Missing-page presentation                           |
| app/api/ai/status/route.js              | Delegate configuration-status requests              |
| app/api/ai/analyze/route.js             | Delegate analysis requests in Node                  |
| components/nation-workspace.jsx         | Mount, route synchronization and cleanup            |
| components/workspace-shell.mjs          | Trusted initial HTML structure                      |
| next.config.mjs                         | Local build behavior, tracing root and worker count |
| lib/routes.mjs                          | Shared internal-page/public-path mapping            |

## Shared engine modules

All paths below are under lib/domain/.

| Module                | Main interfaces                                             |
| --------------------- | ----------------------------------------------------------- |
| citizen-engine.cjs    | prepare state ranges; generate a citizen by index           |
| planning-engine.cjs   | definitions, recommend and project                          |
| economy-engine.cjs    | baseline, resources, fiscalPlan and stateAccounts           |
| commerce-engine.cjs   | Build business generator, bank data and monetary identities |
| comparison-engine.cjs | Normalize scores, rank with ties and identify peer gaps     |

These modules should remain independent of DOM, sessions, network providers and database clients.

## Server modules

| Module               | Responsibility                                                   |
| -------------------- | ---------------------------------------------------------------- |
| country-data.mjs     | Assemble small JSON seed files in stable state order             |
| knowledge.mjs        | Build stable-ID evidence records and combine proposal models     |
| retrieval.mjs        | Bounded keyword matching with synonyms and jurisdiction scope    |
| analysis-intents.mjs | Sector vocabulary and state-name/scope interpretation            |
| local-analyst.mjs    | Explain supported data questions and draft rule-based plans      |
| ai-service.mjs       | Optional provider, structured output and source/input validation |
| http-api.mjs         | Request/body checks, process-local throttling and safe errors    |

No module currently implements user identity or a database repository.

## Client feature controllers

Paths below are relative to src/client/features/. Their order is in feature-order.json.

| File                  | State or workflow                                                           |
| --------------------- | --------------------------------------------------------------------------- |
| app-seed.js           | Original six-zone records                                                   |
| app.js                | Selected jurisdiction, food budgets, records, helpers and original workflow |
| states.js             | State expansion, unequal populations, register data and profile dialogs     |
| geography.js          | Outline, sites and clipped state-cell geometry                              |
| models.js             | Monthly CSV, OLS/stress controls, import/export and model snapshots         |
| sector-definitions.js | Sector metrics, seed arrays, coefficients and milestones                    |
| sectors.js            | Sector selection, investment controls and decision records                  |
| states-ui.js          | Register filters, profile events and CSV download                           |
| country.js            | Informational first page and state-map interactions                         |
| citizens.js           | Index ranges, page navigation, ID lookup and limited exports                |
| recommendations.js    | Draft inputs, projections, saved plans and review actions                   |
| editorial.js          | Navigation grouping, simpler titles and presentation behavior               |
| economy.js            | Fiscal attachment, economic overview and model reports                      |
| economic-scopes.js    | National/state account switching and state profile enrichment               |
| analyst.js            | Mode buttons, server requests, sources and review handoff                   |
| commerce.js           | Firm/bank/money tabs, filters, profiles and exports                         |
| comparisons.js        | Weights, pair selection, rankings and improvement-plan handoff              |

The original food render/navigation functions are extended by later controllers. The food simulator remains under /sectors/food, not a separate sidebar item.

## HTML view helpers

All files in src/client/views/ are rendering helpers with no initialization side effects.

| Group                       | Files and purpose                                                                |
| --------------------------- | -------------------------------------------------------------------------------- |
| Country                     | country-profile, state-register, state-map                                       |
| Population                  | citizen-register, household-profiles                                             |
| Original food flow          | food-price-chart, food-evidence, food-simulator, food-results                    |
| Decision memory             | decision-archive, decision-form                                                  |
| Sector workspace            | sector-header, sector-overview, sector-evidence, sector-simulator                |
| Sector detail               | sector-households, sector-decision-form, sector-decision-card                    |
| Long-term planning          | projection-chart, recommendation-dashboard, fiscal-outlook                       |
| Economic accounts           | economic-accounts; legacy-economic-summary is retained by the original extension |
| Analyst                     | analyst-workspace and analyst-report                                             |
| Business                    | commerce-header, business-register, business-profile                             |
| Financial system            | bank-register and monetary-accounts                                              |
| Comparisons                 | state-comparisons                                                                |
| Initial compatibility views | legacy-map and legacy-overview                                                   |

Each filename ends in .js. Function names use render...Markup. Arguments carry controller-local state; shared workspace values remain visible in the assembled closure.

When adding database/user-provided content, review every interpolated value for HTML safety.

## Styles

| Entry file    | Responsibility                                                |
| ------------- | ------------------------------------------------------------- |
| style.css     | Base prototype rules, divided into ordered sections           |
| sectors.css   | Sector controls and responsive tiles                          |
| planning.css  | Recommendation cards and numeric fields                       |
| editorial.css | Current report-style overrides, divided into ordered sections |
| analyst.css   | Findings, citations and source inspection                     |

Numbered files under style/ and editorial/ preserve cascade order. Do not reorder them alphabetically.

## Scripts and data adapters

| Script                     | Responsibility                                                |
| -------------------------- | ------------------------------------------------------------- |
| prepare-workspace.cjs      | Assemble runtime and derive canonical snapshots               |
| runtime-wrapper.cjs        | Emit isolated DOM, navigation, timer and fetch lifecycle code |
| workspace-files.cjs        | Read manifest and pure view helpers                           |
| write-datasets.cjs         | Write small per-zone and per-sector shards                    |
| build-citizen-register.cjs | Compatibility entry that delegates to preparation             |
| export-citizens.cjs        | Backpressure-aware NDJSON exporter                            |
| check-lines.mjs            | Maximum 299 physical lines for maintained files               |
| check.mjs                  | Syntax and regression runner                                  |

data/citizen-states.cjs joins citizen shards for Node tools/tests. lib/country-data.mjs joins country shards for the server.

## Regression suites

| File            | Boundary tested                                                            |
| --------------- | -------------------------------------------------------------------------- |
| models.cjs      | Retained views, data validation and provenance lifecycle                   |
| citizens.cjs    | ID ranges, determinism, households and attributes                          |
| planning.cjs    | Yearly paths, limits, scope and sensitivity                                |
| economy.cjs     | Accounts, deficits, debt and reconciliation                                |
| ai.mjs          | Retrieval, local analysis, mocked provider behavior and request validation |
| commerce.cjs    | Firm ownership, branches, bank balance sheets and money                    |
| comparisons.mjs | Weights, ranks, ties and peers                                             |
| workspace.mjs   | Mounted interactions, persistence and remount cleanup                      |
| next-http.mjs   | Production URLs, assets and analyst endpoints                              |

See [contributing](contributing.md) for the normal verification sequence.
