# NationOS - developer README

NationOS is a Next.js application for exploring a fictional country, comparing public-service needs and reviewing evidence-backed government proposals. All people, firms, places and economic figures are synthetic.

**Country data -> identify a need -> compare options -> calculate scenarios -> review a proposal -> preserve the decision.**

This README is the entry point. The linked guides explain the whole codebase in smaller documents so every maintained file remains below 300 physical lines.

## Developer guides

| Guide                                              | What it explains                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| [Architecture](docs/architecture.md)               | Frontend/backend boundaries, routing, state, build preparation and request flows |
| [Code map](docs/code-map.md)                       | Responsibilities of controllers, views, engines, scripts and tests               |
| [Backend integration](docs/backend-integration.md) | Existing endpoints, database design, permissions, migration and rollout          |
| [Data and models](docs/data-and-models.md)         | Synthetic datasets, units, formulas, provenance and limitations                  |
| [Contributing](docs/contributing.md)               | Adding features, comments, line limits, formatting and verification              |

## Current stack

- Next.js 16 App Router and React 19.
- JavaScript, JSX and local CSS; no TypeScript, ORM or UI framework.
- Native Next.js route handlers for the analyst API.
- Shared pure JavaScript engines for generation, scoring and numerical scenarios.
- Generated JSON seed shards for server-side data.
- Browser localStorage for decisions and long-term plans.
- Optional OpenAI integration; automated analysis works without a key.

**There is already a backend**, implemented in the Next.js API routes. There is **no database, account system, authorization layer or shared multi-user persistence**. A contributor adding a backend usually needs to extend the existing server layer, not start a second web server.

## Start the application

Use Node.js 24, the verified runtime for this project and its test dependencies.

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:4173. On other shells, use npm instead of npm.cmd.

```powershell
npm.cmd run build
npm.cmd start
```

The second sequence builds and runs production. Both servers bind to loopback; do not run dev and start simultaneously on port 4173.

Use the same browser, hostname and port to retain browser-local records. localhost and 127.0.0.1 have different storage origins.

## Directory layout

```text
app/
  (workspace)/layout.jsx         Persistent workspace layout
  (workspace)/[[...section]]/    URL validation
  api/ai/                       Analyst route handlers
  styles/                       Ordered presentation styles
components/                     React lifecycle boundary and static shell
src/client/features/            Ordered controllers and transient browser state
src/client/views/               Named HTML rendering helpers
lib/domain/                     Shared numerical and generator engines
lib/                            Server analysis, retrieval and API boundary
data/country/                   Canonical zone/state/sector shards
data/citizens/                  Citizen index shards
docs/                           Detailed developer guides
scripts/                        Assembly, exports and repository checks
tests/                          Engine, API, mounted-DOM and HTTP regressions
generated/                      Compiled workspace module; do not edit
```

## How a page loads

1. Next validates the URL using [lib/routes.mjs](lib/routes.mjs).
2. The persistent layout renders [NationWorkspace](components/nation-workspace.jsx).
3. Its effect mounts the generated runtime into a dedicated DOM subtree.
4. Controllers render a view and bind its buttons, forms and sliders.
5. The navigation bridge updates the Next router without rebuilding workspace state.
6. Timers and pending fetches are cancelled on unmount.

The retained controllers are not individually rewritten as React components. React owns their stable container; the controllers own its descendants.

## Page URLs

| URL              | Responsibility                                     |
| ---------------- | -------------------------------------------------- |
| /                | Country profile, map and national/state accounts   |
| /states          | Jurisdiction register and detailed profiles        |
| /citizens        | Paginated synthetic population                     |
| /businesses      | Firms, banks and monetary stocks                   |
| /comparisons     | Rankings, pair comparisons and improvement drafts  |
| /evidence        | Food evidence and evidence gaps                    |
| /data            | Monthly data, imports and model experiments        |
| /households      | Fictional household archetypes                     |
| /sectors         | Education, transport, health, energy and water     |
| /sectors/food    | Food affordability simulator                       |
| /recommendations | Suggestions and five-/ten-year proposals           |
| /decisions       | Decision memory and handover review                |
| /analyst         | Automated analysis, retrieval and optional live AI |

## Data and persistence

Aderin has 36 states and one capital territory, with unequal populations totaling exactly 24.6 million. Citizen profiles are generated on demand, not stored as millions of database rows.

| Item                    | Current location                   | Lifetime                 |
| ----------------------- | ---------------------------------- | ------------------------ |
| Country and sector data | JSON shards under data/            | Build/version controlled |
| Citizen index           | data/citizens/ plus aggregator     | Build/version controlled |
| Decisions               | nationos-decisions in localStorage | This browser/origin      |
| Long-term plans         | nationos-plans in localStorage     | This browser/origin      |
| Imported CSV data       | Client memory                      | Workspace session        |
| Analyst answer          | Client memory or downloaded report | Session unless exported  |
| Provider key            | Server environment or ignored .env | Server configuration     |

Read the backend guide before replacing localStorage. Preserve old snapshots and recompute authoritative results on the server.

## Backend contract for the next developer

The dashboard currently reads generated fixtures; it does **not** fetch state, citizen or business data from REST endpoints. Only the analyst calls the server today. The routes listed as proposed in the backend guide must be implemented and wired into the controllers before they can replace fixtures or localStorage.

| Feature                | Backend must eventually supply                                                          | Current implementation                                              |
| ---------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Country and states     | Stable jurisdiction IDs, names, zones, population, geography and versioned indicators   | Build-time country shards                                           |
| Economic accounts      | GDP, revenue, spending, debt, trade, resources, units and reporting period              | Shared economy engine                                               |
| Citizens               | Paginated records, state filters, ID lookup and streamed exports                        | Deterministic synthetic generator                                   |
| Businesses and banks   | Ownership, operating state, industry, employment, bank accounts and monetary aggregates | Synthetic commerce engine; bank relationships are not real accounts |
| Comparisons            | Same-version service indicators, targets, weights and ranking method                    | Shared comparison engine                                            |
| Plans                  | Validated inputs, immutable model runs and annual state/national results                | Client calculation and localStorage                                 |
| Decisions and handover | Institution-owned records, revisions, reviewers, milestones and measured outcomes       | Browser-local records only                                          |
| Evidence and imports   | Source revisions, units, periods, validation and published dataset versions             | Canonical fixtures; imports stay in memory                          |
| Users and permissions  | Authenticated session, institution membership and authorized workflow operations        | Not implemented                                                     |

### Existing request and response expectations

- `GET /api/ai/status` returns configuration and available analysis capabilities.
- `POST /api/ai/analyze` accepts the JSON below; it returns JSON or `{ "error": "message" }` with a non-success HTTP status.
- `question` is required, non-empty and at most 4,000 characters. `scope` is `all` or a canonical state ID; `mode` is `local`, `evidence` or `ai`. Send explicit scope and mode.
- Successful analysis returns `question`, `scope`, `mode`, `summary`, `findings`, `gaps`, `assumptions`, `sources`, `proposal` and `modelResult`. Findings contain source references. `proposal` and `modelResult` can be null.
- A source carries `id`, `title`, `summary`, `values`, `scope`, `sector`, `period` and `synthetic`. Keep evidence IDs and revisions traceable when replacing the fixtures.

```json
{
  "question": "Draft a 10-year education plan with 120 million per year",
  "scope": "all",
  "mode": "local"
}
```

### Numerical model inputs and saved results

A proposal has `title`, `reason` and the configuration below. Budgets are **millions of real 2026 Aderin naira per year**, not total programme costs or individual currency units.

```json
{
  "years": 10,
  "scope": "all",
  "growth": 2,
  "delivery": 80,
  "maintenance": 20,
  "budgets": {
    "food": 0,
    "education": 120,
    "transport": 0,
    "health": 0,
    "energy": 0,
    "water": 0
  }
}
```

Validate `years` as 5 or 10, `growth` from 0 to 5, `delivery` from 0 to 100, `maintenance` from 0 to 50 and every annual sector budget from 0 to 2,000. Resolve `scope` against canonical IDs. Run `computeProposal` in `lib/knowledge.mjs` on the server rather than accepting client-calculated outcomes.

The model returns `version`, `dataset`, `config`, `annualCost`, `totalCost`, `scopePopulation`, `years`, `limitations` and `assumptions`; `computeProposal` also attaches `fiscal`. Each year contains its year, population, annual/cumulative costs, national indicators and state paths. Indicator paths are `no`, `with`, `low` and `high`. Preserve these snapshots with input, engine and dataset versions.

Saved browser plans also contain `title`, `reason`, `origin`, `date`, `reviewed`, `result` and optional AI/comparison provenance. A server save needs its own stable ID, revision, authenticated actor and authoritative timestamp. A review checkbox is not an approval permission.

See [Backend integration](docs/backend-integration.md) for the proposed routes, tables, save transaction, localStorage migration, authentication, errors and verification. See [Data and models](docs/data-and-models.md) for indicator definitions and accounting identities. Implement durable proposal save/retrieve first, then reviews, observations and data ingestion.

## Analysis modes

**Analyse question** uses supported-intent matching, canonical data and deterministic calculations. It is not an LLM.

**Search evidence** retrieves records without generating an interpretation.

**Ask live AI** optionally sends the question and selected aggregate records to OpenAI. It does not send citizen profiles or saved decisions.

Copy .env.example to .env, set OPENAI_API_KEY locally and restart Next to enable live AI. OPENAI_MODEL defaults to gpt-4.1-mini. Never expose the key through NEXT_PUBLIC variables or Git.

Provider output is validated before numerical evaluation. A citation proves only that the referenced record was supplied, not that the answer is correct.

## Build preparation

```powershell
node scripts/prepare-workspace.cjs
```

This runs automatically before dev, build and check. It joins view helpers and ordered controllers into an isolated module and writes canonical dataset shards.

Edit source definitions, not generated/workspace-runtime.mjs or derived JSON. Initialization order is declared in [feature-order.json](src/client/feature-order.json).

Production API requests read canonical JSON; they do not execute browser scripts or VM code.

## File size and comments

Maintained source, docs and JSON shards must have **fewer than 300 physical lines**: maximum 299, including comments and blank lines.

Dependencies, build output, generated bundles, package-lock.json and NDJSON exports are machine artifacts and excluded. They are not compressed to pretend they are small modules.

Comments explain assumptions, units, boundaries and non-obvious control flow. Update them when those contracts change.

## Verification

```powershell
npm.cmd run check:lines
npm.cmd run format:check
npm.cmd run check
npm.cmd run build
# With production listening:
npm.cmd run check:http
```

Checks cover the line policy, syntax, generators, financial identities, rankings, projections, analyst validation and mounted workflows. HTTP checks exercise all 13 routes and real Next endpoints.

jsdom is not visual browser testing. OpenAI responses are mocked; live provider access requires your own key.

## Population exports

```powershell
npm.cmd run export:citizens -- --count 10000 --output data/new-sample.ndjson
npm.cmd run export:citizens -- --count 24600000 --output data/citizens-all.ndjson
```

Exports stream, refuse to overwrite files and accept --start for a zero-based range. Full population exports take time and many gigabytes; they are not required to use the site.

## Before real-world use

Replace fictional evidence, validate coefficients, add identity/durable storage and measure actual outcomes. Scores describe indicators, not causal governance quality. Proposed decisions remain drafts until reviewed.

Nothing in these commands deploys the application or pushes it to GitHub.
