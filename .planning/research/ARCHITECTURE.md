# Architecture Research

**Domain:** Notion workspace automation CLI
**Researched:** 2026-02-04
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                               CLI Layer                              │
├──────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐ │
│  │  Command  │  │  Config/    │  │   Planner   │  │  Reporter/     │ │
│  │  Parser   │  │  Secrets    │  │  Orchestr.  │  │  Output        │ │
│  └─────┬─────┘  └─────┬───────┘  └─────┬───────┘  └──────┬─────────┘ │
│        │              │                │                 │           │
├────────┴──────────────┴────────────────┴─────────────────┴───────────┤
│                           Domain Layer                               │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌────────────┐  ┌─────────────┐  ┌───────────────┐ │
│  │ Ingestion   │  │ Analysis/  │  │ Workspace   │  │ Execution      │ │
│  │ Pipeline    │  │ Critique   │  │ Model       │  │ Planner        │ │
│  └─────┬───────┘  └─────┬──────┘  └─────┬───────┘  └──────┬────────┘ │
│        │                │               │                 │           │
├────────┴────────────────┴───────────────┴─────────────────┴──────────┤
│                         Integration Layer                            │
├──────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │ Notion API    │  │ File System │  │ LLM/Reasoning Adapter        │ │
│  │ Client        │  │ I/O         │  │ (OpenCode/Claude)            │ │
│  └───────────────┘  └─────────────┘  └─────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────┤
│                             Data Stores                              │
├──────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │ ID_MAP.json   │  │ Plan Cache  │  │ Logs/Artifacts              │ │
│  └───────────────┘  └─────────────┘  └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Command Parser | Parse CLI args, subcommands, and flags; handle --yes and dry-run | Commander/Clipanion-style parser with schema validation |
| Config/Secrets | Load config, env vars, tokens; validate Notion-Version header required | Env + config loader with precedence rules |
| Ingestion Pipeline | Read files (PDF/DOCX/MD/TXT), extract text, normalize | Streaming readers + converters |
| Analysis/Critique | Summarize, critique, and translate docs to workspace needs | LLM adapter + prompt/guardrails |
| Workspace Model | In-memory representation of pages, databases, relations, templates | Domain entities with IDs and references |
| Execution Planner | Diff desired vs existing, produce ordered operations | Planner with dependency graph |
| Notion API Client | CRUD pages/databases/blocks, pagination, rate-limit handling | REST client or Notion SDK |
| State Store | Persist ID mapping for idempotency and reruns | JSON file store with atomic writes |
| Reporter/Output | Human-readable plan, JSON output, error summaries | Console renderer + log sink |

## Recommended Project Structure

```
src/
├── cli/                    # Command definitions, flags, help
│   ├── commands/           # init, plan, apply, inspect
│   └── output/             # console formatting, JSON output
├── config/                 # config schema, env loading, secrets
├── ingest/                 # file readers, parsers, normalization
├── analysis/               # critique, synthesis, prompt templates
├── model/                  # workspace entities, relations, templates
├── plan/                   # diffing, dependency ordering, validation
├── notion/                 # Notion API client, pagination, rate limits
├── state/                  # id_map store, plan cache
├── apply/                  # execution engine, retries, rollback rules
└── utils/                  # logging, errors, telemetry
```

### Structure Rationale

- **cli/:** isolates UX and CLI concerns from domain logic to keep automation testable.
- **model/ + plan/:** separates desired workspace model from execution details.
- **notion/:** centralizes API concerns (pagination, rate limits, versioning).

## Architectural Patterns

### Pattern 1: Plan-Apply Split (Dry-Run First)

**What:** Generate a deterministic execution plan, show diff, then apply on explicit confirmation.
**When to use:** Any destructive or schema-changing operation (databases, relations, templates).
**Trade-offs:** Extra planning step; simplifies idempotency and rollback decisions.

**Example:**
```typescript
const plan = await planner.build(desired, current)
reporter.print(plan)
if (!flags.yes) await confirmer.requireExplicitOk()
await executor.apply(plan)
```

### Pattern 2: Idempotent ID Mapping

**What:** Persist Notion IDs for created artifacts to avoid duplicates on reruns.
**When to use:** Re-runnable CLIs and incremental updates.
**Trade-offs:** Requires migration handling when schema changes.

**Example:**
```typescript
const id = idMap.get("db:Projects") ?? await notion.createDatabase(...)
idMap.set("db:Projects", id)
```

### Pattern 3: Rate-Limited Request Queue

**What:** Central queue that retries on 429 using Retry-After.
**When to use:** Bulk creation/update and pagination-heavy operations.
**Trade-offs:** Adds latency but avoids hard failures.

**Example:**
```typescript
await requestQueue.enqueue(() => notion.pages.create(payload))
```

## Data Flow

### Request Flow

```
User CLI
  ↓
Command Parser → Config/Secrets → Planner
  ↓                               ↓
Ingestion → Analysis/Critique → Workspace Model
  ↓                               ↓
Notion API Read (search/query) → Diff/Plan
  ↓                               ↓
Dry-Run Output → Confirmation → Apply via Notion API
  ↓                               ↓
ID_MAP.json update            Logs/Artifacts
```

### Key Data Flows

1. **Workspace discovery:** Notion API query/search (paginated) → current state snapshot → planner diff.
2. **Apply phase:** plan operations → rate-limited Notion API calls → update ID_MAP.json.
3. **Rerun path:** ID_MAP.json → resolve existing objects → skip create → update where needed.

## Build Order Implications

1. **Notion client + config** (auth, version header, rate limit, pagination) before planner.
2. **Workspace model + planner** before analysis to ensure outputs target concrete schema.
3. **Apply engine + id map** after plan output is stable and dry-run UX exists.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k items | Single process, local ID_MAP.json is enough |
| 1k-100k items | Add batching, pagination helpers, queue with backoff |
| 100k+ items | Consider resumable checkpoints and parallel read with rate limit gate |

### Scaling Priorities

1. **First bottleneck:** Notion API rate limits and pagination overhead.
2. **Second bottleneck:** Large payload limits on blocks and properties.

## Anti-Patterns

### Anti-Pattern 1: Apply-Only CLI

**What people do:** Create/update in a single pass with no plan preview.
**Why it's wrong:** Hard to audit; increases risk of destructive changes.
**Do this instead:** Always produce a dry-run plan and require explicit confirmation.

### Anti-Pattern 2: Stateless Creation

**What people do:** Recreate pages/databases on every run.
**Why it's wrong:** Duplicates and broken relations; no rerun safety.
**Do this instead:** Persist ID mapping and reconcile by IDs.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Notion API | REST/SDK with auth + version header | Rate-limited; pagination and size limits apply |
| Notion Webhooks | Optional event-driven sync | Requires public endpoint and verification |
| LLM Provider | Prompted analysis and critique | Keep deterministic outputs for planning |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| cli ↔ plan | API calls | CLI should never call Notion directly |
| plan ↔ notion | API calls | Centralized rate-limit queue |
| analysis ↔ model | API calls | Analysis outputs map to schema entities |

## Sources

- https://developers.notion.com/reference/intro
- https://developers.notion.com/reference/request-limits
- https://developers.notion.com/reference/authentication
- https://developers.notion.com/reference/versioning
- https://developers.notion.com/reference/webhooks

---
*Architecture research for: Notion workspace automation CLI*
*Researched: 2026-02-04*
