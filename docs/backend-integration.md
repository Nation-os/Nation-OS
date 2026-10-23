# Adding database-backed backend services

The app already has a Next.js backend. Extend it with durable data and identity rather than adding another web server by default.

## Existing endpoints

The route files delegate to lib/http-api.mjs and run in Node.

### GET /api/ai/status

```json
{
  "configured": false,
  "model": null,
  "evidenceSearch": true,
  "automatedAnalysis": true,
  "provider": "OpenAI",
  "liveVerified": false
}
```

Configured means a key exists, not that provider access or billing has been verified.

### POST /api/ai/analyze

```json
{
  "question": "Draft a 10-year education plan for Kora State with 120 million",
  "scope": "all",
  "mode": "local"
}
```

- question: non-empty string, at most 4,000 characters.
- scope: all or a known jurisdiction ID, such as AD-11.
- mode: local, evidence or ai.
- Body limit: 12,000 bytes.
- Origin: same-origin when an Origin header is present.
- Prototype throttle: one active analysis and 20 accepted attempts per rolling minute per process.

Responses include question, scope, mode, summary, findings, gaps, assumptions, sources, proposal and modelResult. Local responses identify the rule engine. Evidence responses have no proposal; live AI requires a server key.

Findings reference source IDs. A proposal contains title, reason, scope, years, growth, delivery, maintenance and six annual budget amounts.

Errors have a JSON error field. Statuses include 400 for input, 403 for origin, 413 for size, 415 for media type, 422 for a provider refusal, 429 for throttling, 503 for missing AI configuration and 502 for provider/output failures.

## What does not exist

There are no database repositories, durable save routes, account sessions, approval roles, migrations or server-backed decision history.

Saved records are browser-local. Do not describe them as shared institutional storage.

## Integration boundary

```text
Next route
 -> authenticated actor and permissions
 -> request schema validation
 -> application service
 -> repository / database transaction
 -> versioned model run and audit event
```

Keep database calls out of JSX, HTML helpers and numerical engines. A server-only lib/repositories/ layer would provide a clear boundary.

The relationships below suit a relational design; no database vendor or ORM is currently required.

## Example tables - not implemented

| Table               | Responsibility                                         |
| ------------------- | ------------------------------------------------------ |
| organizations       | Institution, jurisdiction and ownership                |
| users / memberships | External identity, institution and role                |
| jurisdictions       | Stable state ID, type and parent zone                  |
| dataset_versions    | Source, period, checksum and publication state         |
| indicators          | Dataset version, jurisdiction, metric, value and unit  |
| source_records      | Stable evidence ID and immutable content revision      |
| proposals           | Owner, scope, title, reasoning and workflow state      |
| proposal_versions   | Immutable input config and revision                    |
| model_runs          | Proposal revision, engine/dataset versions and outputs |
| decisions           | Chosen revision, reviewer, reasoning and status        |
| milestones          | Responsible owner, due date and intended measure       |
| observations        | Actual measured outcome, source and period             |
| audit_events        | Actor, operation, entity revision and server timestamp |

Define money units explicitly and use an appropriate decimal representation. Current API budgets are in millions, not individual naira.

Projections and measured observations belong in different records. A forecast does not become an observation when its date passes.

## Example routes - not implemented

| Route                                 | Purpose                              |
| ------------------------------------- | ------------------------------------ |
| GET /api/jurisdictions                | Read authorized jurisdictions        |
| GET /api/indicators                   | Read versioned indicator ranges      |
| POST /api/proposals                   | Create an institution-owned draft    |
| PATCH /api/proposals/:id              | Edit with an expected revision       |
| POST /api/proposals/:id/model-runs    | Calculate an immutable run           |
| POST /api/decisions                   | Save a reviewed proposal revision    |
| GET /api/decisions                    | Read permitted institutional records |
| POST /api/decisions/:id/reviews       | Append a review event                |
| POST /api/milestones/:id/observations | Record actual delivery evidence      |

These names are design examples, not currently callable endpoints.

## Safe proposal-save sequence

1. Resolve the actor from the server session.
2. Check institution, jurisdiction and operation permissions.
3. Validate IDs, horizon, units and budget ranges.
4. Resolve an authorized published dataset version.
5. Recompute service and fiscal results on the server.
6. Persist the proposal revision, model run and evidence context transactionally.
7. Append an audit event with a server timestamp.
8. Return the ID and revision.

Do not trust a body-supplied organization ID, projected outcome, score or approval flag.

The numerical entry points are PlanningEngine.project and EconomyEngine.fiscalPlan. computeProposal in lib/knowledge.mjs already combines them.

## Replace browser persistence

Current save points:

- persist in src/client/features/app.js.
- The plan-save handler in recommendations.js.
- The sector decision handler in sectors.js.

These synchronous paths must become asynchronous for database writes. Add saving/error states, await confirmation, and show success only after the server has committed.

Long-term snapshots contain more than a title: preserve input config, versions, source context, annual paths and review state.

Keep export/download available during the migration.

## Import old localStorage records

- Offer an explicit import of nationos-decisions and nationos-plans.
- Validate records; browser storage is untrusted.
- Preserve original model snapshots as historical evidence.
- Calculate new runs separately instead of overwriting old projections.
- Use a batch ID or idempotency key to avoid duplicate imports.
- Return per-record errors when possible.
- Do not clear browser copies before a confirmed server copy exists.

Existing dates are display strings. Add authoritative server timestamps and retain the original display date as legacy metadata when useful.

## Dataset ingestion

Validate units, state IDs, periods, uniqueness and provenance before publishing a dataset version.

Current JSON shards are build-time fixtures. Operational requests should use a repository, not rewrite build output.

Keep one canonical indicator provider for browser, comparisons and analyst retrieval. Otherwise they could calculate and cite different versions.

Data & models CSV imports are session-only experiments. They are not published evidence and should not silently replace canonical records.

## Identity and workflow

Define analyst, reviewer and administrator permissions explicitly. Scope reads and writes to institutions and permitted jurisdictions.

Approval should be a distinct authorized operation, not a client-editable boolean. Preserve append-only review events and distinguish draft, reviewed and approved.

An administration handover needs institution-level access rules. Changing a browser profile is not a transfer-of-office mechanism.

## Security and operations

Origin checks do not authenticate users. Public/multi-instance deployment needs sessions, resource permissions, protected writes and a distributed limiter.

Keep database/provider credentials server-only. Do not use NEXT_PUBLIC for secrets.

Escape database strings before passing them to the retained HTML views, or migrate those views to React. Current fictional labels conceal this future trust boundary.

Add migrations, backups, transactions and request tracing. Use a recoverable queue for longer model jobs, and do not hold a database transaction open during a provider call.

Real citizen data would require a separate privacy/access-control design. The synthetic generator is not a ready-made real-person registry.

## Model and evidence integrity

Store input config, dataset version, engine version and source revisions with each run. Source IDs alone may point to different content after future updates.

Keep immutable source snapshots or source-version references. Separate provider text, deterministic projections, human decisions and measured outcomes.

A smaller service gap is not proof that a particular policy caused the result.

## Verification and staged rollout

- Repository tests: transactions, optimistic revisions and duplicate imports.
- Permission tests: forbidden institutions, jurisdictions and workflow actions.
- API tests: schemas, missing resources, pagination and error behavior.
- Model tests: the same validated inputs reproduce the expected run.
- UI tests: loading, retry, save failure and restored drafts.
- Migration tests: old browser records remain recoverable.

Start with durable save/retrieve of one long-term proposal. Then migrate reviews, milestones and ingestion. Retain the working local workflow until its replacement is verified.
