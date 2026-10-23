# Architecture and execution flow

Read [the README](../README.md) for commands and URLs.

## Execution layers

| Layer                 | Runs where                     | Owns                                              |
| --------------------- | ------------------------------ | ------------------------------------------------- |
| App Router            | Next server and browser router | URLs, layouts, metadata, 404s and API dispatch    |
| Controllers and views | Browser                        | Transient edits, DOM, filters and interactions    |
| Shared engines        | Browser or Node                | Deterministic generation, scoring and scenarios   |
| Server analysis       | Node route handlers            | Canonical evidence, validation and provider calls |

Do not import server analysis or environment configuration into the client workspace.

## Routing and the persistent workspace

[lib/routes.mjs](../lib/routes.mjs) maps page keys to public URLs.

The catch-all page awaits route parameters and rejects unknown paths. The workspace layout sits above that dynamic page. This matters: navigating must not remount the workspace and discard an unsaved proposal.

[NationWorkspace](../components/nation-workspace.jsx) holds its controller in a ref. A pathname change asks that controller to show a page. A controller navigation updates the Next router.

The bridge distinguishes UI-originated navigation from a pathname received from Next. Otherwise it could push the same route repeatedly.

## React and DOM ownership

[workspace-shell.mjs](../components/workspace-shell.mjs) defines the sidebar, main region, modal and toast.

React installs the shell in one dedicated subtree. Retained view code changes only that subtree; React does not manage its individual table rows or inputs.

A document facade scopes selectors to the mounted root. The runtime also tracks timers and fetch controllers.

On unmount, destroy marks the runtime disposed, clears timers and aborts fetches. This makes development remounts safe and prevents old callbacks from changing a new workspace.

A future JSX conversion should remove the old imperative ownership before React renders those descendants. Do not have both systems mutate the same elements.

## Feature initialization

[feature-order.json](../src/client/feature-order.json) is an initialization manifest, not a navigation list.

1. app-seed defines six original zones.
2. app defines shared state, utilities and the food workflow.
3. states expands the seed into 37 jurisdictions.
4. geography replaces the old schematic.
5. models initializes dataset experiments.
6. sector-definitions expands per-state sector baselines.
7. sectors and subsequent controllers extend the workspace.
8. commerce and comparisons add their data/navigation.

View files contain function declarations only. They load before controllers because they do not access live state until called.

Several controllers capture the previous render/navigate function and extend it. That preserves the existing prototype but makes ordering important. Add a controller once, after its dependencies.

## Controllers and markup helpers

Controllers calculate transient view state, pass it to named helpers and bind events after inserting their HTML.

For example, comparisons computes scores, chooses two states and prepares priorities. Its markup helper displays the result; the controller wires dropdowns and the draft-plan action.

Helpers can also read shared workspace state because assembly puts them inside one closure. Arguments identify values local to the calling controller.

Database strings will be untrusted. Escape them before HTML interpolation, or replace that view with React rendering. Fictional hardcoded labels are not a guarantee that arbitrary database content is safe.

## Shared engines

The five files under lib/domain expose pure functions through CommonJS exports. The same files support the isolated VM regression harness.

Client assembly and server analysis import the same implementations. Formulas are not duplicated in a language-model prompt.

The client economy controller decorates planning results with fiscal output; server computeProposal explicitly attaches the same independent fiscal result.

See [data and models](data-and-models.md) for units and equations.

## Build-time preparation

[prepare-workspace.cjs](../scripts/prepare-workspace.cjs) produces:

- An ESM client module containing the lifecycle wrapper, view functions and ordered controllers.
- Canonical country and citizen-index JSON shards.

[workspace-files.cjs](../scripts/workspace-files.cjs) resolves source order and paths.

[write-datasets.cjs](../scripts/write-datasets.cjs) splits records at zone/sector boundaries, preserving readable JSON.

The VM runs only during preparation to derive fixtures from the same definitions used by the browser. It never evaluates user input.

Production requests read the JSON through lib/country-data.mjs. They do not execute browser scripts or VM code.

## Data ordering

The country aggregator imports zone shards and sorts by stable jurisdiction ID, with the capital last.

The citizen aggregator sorts by original offsets. Offsets define citizen ID ranges; display names do not.

Sector arrays are positional. Changing order inconsistently could associate an indicator with the wrong state. Tests verify counts, order and browser/server agreement.

## Analyst request flow

```text
Browser form
 -> POST /api/ai/analyze
 -> input, origin and rate checks
 -> local analysis, retrieval or optional provider
 -> source/proposal validation
 -> shared service and fiscal engines
 -> JSON response
 -> review/edit in recommendations
```

A provider may suggest parameters. It never supplies the authoritative numerical projection.

## Persistence and provenance

Decisions and long-term plans use different localStorage keys. Records are shared only within one browser origin.

Imported CSV data, model-run history, filters and the current analyst answer are session-only unless exported.

A saved proposal contains inputs and calculated outputs. Analysis or comparison provenance is attached when available. Starting an unrelated proposal clears old provenance.

Use the [backend guide](backend-integration.md) to replace this with durable storage.

## API lifecycle

Next route handlers use the Node runtime. A process-local singleton holds the analyst service, active-request gate and rolling timestamps.

Separate Node instances have separate limits. This singleton is not a database, distributed lock, user account or durable queue.

The npm servers bind to loopback. Public/multi-instance deployment requires explicit identity, authorization, persistence and operational work.

## Styles

The root layout imports base, sector, planning, editorial and analyst styles in order.

The two largest stylesheets import numbered sections. Later editorial rules intentionally override the original prototype styles.

Preserve the cascade order. After changes, check tables, narrow layouts, map selection, dialogs and source buttons.
