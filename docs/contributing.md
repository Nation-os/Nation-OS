# Contributing and verification

## Maintained-file rules

- Maximum 299 physical lines, including comments and blank lines.
- Use readable formatting, not minification to bypass the limit.
- Split by responsibility before a file becomes too large.
- Comment units, assumptions, lifecycle behavior and trust boundaries.
- Preserve the distinction between synthetic, projected and measured values.
- Never import secrets or database clients into browser code.

Dependency/build output, generated bundles, lockfiles and NDJSON exports are machine artifacts, not maintained modules.

## Commands

```powershell
npm.cmd run format
npm.cmd run format:check
npm.cmd run check:lines
npm.cmd run check
npm.cmd run build
npm.cmd start
npm.cmd run check:http
```

Run check:http with production listening on port 4173. NATIONOS_TEST_URL can specify a different test URL.

Prettier ignores generated seed shards because their writer controls formatting. The line checker still checks their size.

The normal check command includes the line policy. Oversized new modules should fail before regression tests continue.

## Add a client page

1. Add a page key/path in lib/routes.mjs.
2. Put transient state and event binding in src/client/features/.
3. Put larger HTML rendering helpers in src/client/views/.
4. Add the controller once to feature-order.json after dependencies.
5. Bind controls after rendering.
6. Preserve unrelated navigation handlers.
7. Add focused mounted and HTTP coverage.

View files must declare functions without initialization side effects.

Retained classic feature files are assembled into one closure. Do not add module imports directly to them. Reusable calculations belong in lib/domain and are imported by the wrapper.

A future React conversion must first remove imperative ownership of that page's descendants.

## Change a model

Update the pure engine, document units/assumptions and version meaningful behavior changes.

Test physical limits, zero-budget/delivery cases, scope and reconciliation as appropriate. Test invariants, not a second copy of the formula.

Do not overwrite historical snapshots. A new model run should have a new version.

Update the data/model guide when interpretation changes.

## Change seed data

Edit app-seed, states or sector-definitions, not derived JSON.

```powershell
node scripts/prepare-workspace.cjs
npm.cmd run check
```

Preparation rewrites small shards. Tests check order, totals and browser/server consistency.

Population changes may move generated IDs between state ranges; retain old export metadata.

## Add a server endpoint

Use app/api/.../route.js and delegate application logic outside the route.

Follow [backend integration](backend-integration.md) for sessions, permissions, repositories, idempotency, dataset versions and recomputation.

The prototype origin check and limiter are not production user authorization.

## Add or update comments

Explain why a boundary exists or what assumption changes behavior. Examples:

- A budget is annual and in millions.
- A score is descriptive, not causal.
- A browser snapshot is untrusted when imported.
- The persistent layout must not remount drafts on navigation.

Avoid comments that just restate the next assignment. Keep comments synchronized with code changes.

## Update documentation

Keep README as the entry point and place deeper explanations in linked guides.

Future tables/routes must stay labelled as not implemented. Describe the actual code path, not an aspirational architecture.

Persistence/schema changes should update both backend integration and data/model documentation.

## Test map

| Suite           | Protects                                                        |
| --------------- | --------------------------------------------------------------- |
| models.cjs      | Retained controllers, imports and provenance lifecycle          |
| citizens.cjs    | Determinism, ranges, households and attributes                  |
| planning.cjs    | Horizons, zero paths, directions and scope                      |
| economy.cjs     | Accounts, deficits, debt and reconciliation                     |
| ai.mjs          | Retrieval, local responses, mocked provider and HTTP validation |
| commerce.cjs    | Ownership, branches, balance sheets and money                   |
| comparisons.mjs | Scores, ties, weights and peers                                 |
| workspace.mjs   | Mounted handoffs, persistence and remount                       |
| next-http.mjs   | Real production URLs/assets/API                                 |

jsdom is not visual browser testing. Provider tests use mocks; a live key is needed to verify actual provider access.

## Handoff checklist

- Run relevant checks and the production build.
- Explain what changed and what remains illustrative.
- State whether a browser/provider was actually tested.
- Preserve the user's local-only/GitHub preference.
