# Project Research Summary

**Project:** gsd-notion-workspace
**Domain:** Notion workspace automation CLI for consultants
**Researched:** 2026-02-04
**Confidence:** MEDIUM

## Executive Summary

This project is a safety-first CLI that turns client documents into a structured Notion workspace for consultants. Experts build this with a plan-then-apply workflow: ingest documents, derive a workspace model, produce a deterministic execution plan, then apply via the Notion API with explicit confirmation and idempotent re-runs.

The recommended approach uses Node.js 24 LTS + TypeScript, the official Notion SDK, and a layered architecture that separates CLI UX, ingestion/analysis, planning, and execution. The MVP should focus on authorization, document ingestion, workspace proposal, dry-run + apply, and stable ID mapping with audit output; advanced features like migration, execution plans, and multi-client management can follow once the core flow is reliable.

Key risks center on Notion API behavior and safety: search is not exhaustive, missing Notion-Version headers cause subtle breakage, integrations are often under-scoped, and rate/size limits can derail bulk operations. Mitigation requires explicit access modeling, pinned API versions, robust rate-limit queues, payload chunking, and read-then-write semantics to prevent conflicts.

## Key Findings

### Recommended Stack

The stack emphasizes a stable, modern Node LTS runtime with strong TypeScript typing and predictable API behavior. Official Notion SDK usage reduces API drift, and runtime schema validation plus safe state persistence enable reliable dry-run and idempotent apply behavior. ESM-only dependencies imply `moduleResolution: NodeNext` and a Node 20+ baseline.

**Core technologies:**
- Node.js 24.13.0: CLI runtime — active LTS, built-in `fetch`, long support window
- TypeScript 5.9: Type-safe planner/executor — reduces idempotence and schema errors
- @notionhq/client 5.9.0: Notion API SDK — official, stable header handling

### Expected Features

Launch expectations center on safe, repeatable workspace creation from documents, with a reliable audit trail. Differentiators are more advanced planning and migration capabilities that can be phased in after validation.

**Must have (table stakes):**
- Notion authorization + workspace/page selection — required access scope
- Read/write Notion objects + schema mapping — core workspace scaffolding
- Doc ingestion (PDF/DOCX/MD/TXT) — source input normalization
- Dry-run preview + explicit apply — safety for client data
- Idempotent re-runs (ID mapping) — iterative consulting workflow
- Change report output — stakeholder review and traceability

**Should have (competitive):**
- Architecture proposal generator — speeds discovery and alignment
- Execution plan generation — turns analysis into delivery steps
- Safe merge/migration for existing workspaces — brownfield adoption
- Consultant template library — reusable starting points
- Multi-client portfolio support — aligns with consultant workflows

**Defer (v2+):**
- What-if simulation for schema changes — high complexity, niche early
- Continuous or scheduled sync — heavy rate-limit and drift risk
- Advanced compliance features — enterprise-only needs

### Architecture Approach

Use a layered CLI architecture with a plan-apply split, a workspace model, and an execution planner that diffs desired vs current state. Centralize Notion API access with rate-limit queues and persist ID mappings in a local state store for idempotency.

**Major components:**
1. Command parser + config/secrets — CLI UX, validation, and auth setup
2. Ingestion + analysis — parse docs and derive workspace intent
3. Workspace model + planner — deterministic plan generation
4. Notion API client + executor — rate-limited apply with retries
5. State store + reporter — ID mapping, logs, audit output

### Critical Pitfalls

1. **Search treated as exhaustive** — require explicit shared roots and traverse known structures; use search only for discovery.
2. **Missing or mismatched Notion-Version** — pin header in config and test upgrades before bumping.
3. **Under-scoped integration access** — validate capabilities and require explicit page/database sharing.
4. **Ignoring rate/size limits** — queue requests with Retry-After, chunk payloads to avoid 429/400s.
5. **Conflict errors from stale state** — read-then-write and reconcile schema drift before updates.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Discovery + Access Model
**Rationale:** Authorization and access scoping are prerequisite for any Notion operations and are a common failure point.
**Delivers:** Auth flow, workspace/page selection, config validation, pinned Notion-Version, access checks.
**Addresses:** Notion authorization + selection, read access prerequisites.
**Avoids:** Search-as-inventory, under-scoped capabilities, missing Notion-Version.

### Phase 2: Core Planning + Ingestion
**Rationale:** A deterministic plan requires normalized inputs and a stable workspace model before apply is safe.
**Delivers:** Doc ingestion (PDF/DOCX/MD/TXT), workspace model, schema mapping + validation, dry-run preview.
**Uses:** TypeScript + zod validation, file-type + parsers, plan-apply split.
**Implements:** Ingestion pipeline, planner, reporter.

### Phase 3: Execution Engine + Idempotency
**Rationale:** Apply should only follow a stable plan and must be safe to re-run.
**Delivers:** Apply engine, ID_MAP.json persistence, retries/backoff, change report output.
**Addresses:** Idempotent re-runs, audit logging, rate-limit and size handling.
**Avoids:** Unthrottled bursts, duplicate creations, conflict errors.

### Phase 4: Differentiators + Scale Extensions
**Rationale:** Advanced features depend on a reliable core workflow and stable plan/apply semantics.
**Delivers:** Architecture proposal improvements, execution plan generation, safe merge/migration, template library, multi-client management.
**Avoids:** Unsafe overwrites and migration drift; requires stronger diff/merge semantics.

### Phase Ordering Rationale

- Access and version pinning are foundational for every API call.
- Planning needs a stable workspace model and doc ingestion before apply is safe.
- Idempotency and rate-limit handling must be in place before scaling writes.
- Differentiators are higher leverage after the core workflow proves reliable.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Doc ingestion quality (PDF/DOCX parsing), LLM critique with citations, and local-first processing details.
- **Phase 4:** Safe merge/migration semantics and diffing strategy for existing workspaces.

Phases with standard patterns (skip research-phase):
- **Phase 1:** CLI auth/config patterns and Notion API version pinning.
- **Phase 3:** Rate-limit queues, retry/backoff, and idempotent apply patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official release sources and stable Node/TS/SDK choices. |
| Features | MEDIUM | Based on domain expectations and competitive analysis, needs validation. |
| Architecture | MEDIUM | Established plan/apply patterns, but LLM analysis details remain open. |
| Pitfalls | HIGH | Derived from official Notion API docs and known integration gotchas. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Notion data sources changes (2025-09-03):** Validate API behavior for databases/data sources and ensure planner models align with current schema rules.
- **Doc parsing fidelity:** Validate pdf-parse vs pdfjs-dist and ensure structured extraction meets consultant needs.
- **LLM integration:** Define provider, prompt strategy, and deterministic outputs for planning reliability.

## Sources

### Primary (HIGH confidence)
- https://developers.notion.com/reference/intro — API capabilities
- https://developers.notion.com/reference/request-limits — rate/size limits
- https://developers.notion.com/reference/versioning — Notion-Version header requirements
- https://developers.notion.com/reference/authentication — auth and access model
- https://developers.notion.com/reference/search-optimizations-and-limitations — search limitations

### Secondary (MEDIUM confidence)
- https://github.com/makenotion/notion-sdk-js/releases — SDK versions
- https://nodejs.org/en/about/releases — Node LTS versions
- https://www.typescriptlang.org/download — TypeScript version
- https://github.com/tj/commander.js/releases — CLI parser
- https://github.com/colinhacks/zod/releases — schema validation

### Tertiary (LOW confidence)
- https://registry.npmjs.org/pdf-parse — parser version; verify quality
- https://registry.npmjs.org/gray-matter — front matter parsing
- https://registry.npmjs.org/yaml — YAML parsing

---
*Research completed: 2026-02-04*
*Ready for roadmap: yes*
