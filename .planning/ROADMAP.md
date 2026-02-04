# Roadmap: gsd-notion-workspace

## Overview

This roadmap delivers a safe, repeatable CLI workflow that turns client documents into a client-ready Notion workspace. Phases move from runnable CLI entrypoints to access setup, document ingestion, workspace design, safe apply with idempotence, and finally reporting and handover outputs.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: CLI & Workflow Shell** - Users can install and run the workflow commands.
- [ ] **Phase 2: Access & Scope** - Users can configure Notion access and select the workspace parent.
- [ ] **Phase 3: Ingestion & Analysis** - Users can ingest documents and get structured analysis.
- [ ] **Phase 4: Workspace Design & Planning** - Users can review a proposed architecture and atomic execution plan.
- [ ] **Phase 5: Safe Apply & Idempotence** - Users can preview, apply, and rerun safely without duplication.
- [ ] **Phase 6: Reporting & Handover** - Users receive audit and handover artifacts.

## Phase Details

### Phase 1: CLI & Workflow Shell
**Goal**: Users can install and run the workspace workflow from their preferred CLI environment.
**Depends on**: Nothing (first phase)
**Requirements**: CLI-01, CLI-02, CLI-03
**Success Criteria** (what must be TRUE):
  1. User can install OpenCode and Claude Code command packs locally or globally.
  2. User can run the workflow commands (/nws:init → /nws:handover).
  3. User can run a headless CLI for automation outside agentic CLIs.
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold CLI shell and workflow command stubs
- [ ] 01-02-PLAN.md — Discover OpenCode and Claude Code pack specs
- [ ] 01-03-PLAN.md — Implement pack assets and installer command

### Phase 2: Access & Scope
**Goal**: Users can configure Notion access and confirm the target workspace root.
**Depends on**: Phase 1
**Requirements**: ACC-01, ACC-02, ACC-03
**Success Criteria** (what must be TRUE):
  1. User can configure a Notion integration token and verify access.
  2. User can select a root page or data source as the workspace parent.
  3. User can validate integration capabilities and shared scope before apply.
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Ingestion & Analysis
**Goal**: Users can turn client files into structured, critique-ready context.
**Depends on**: Phase 1
**Requirements**: ING-01, ING-02, ING-03
**Success Criteria** (what must be TRUE):
  1. User can ingest PDF/DOCX/MD/TXT files from a client folder.
  2. User can review extracted structured notes (background, pain points, outcomes, processes).
  3. User receives AI critique with citations to source docs.
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Workspace Design & Planning
**Goal**: Users can review a coherent workspace proposal and its atomic execution plan.
**Depends on**: Phase 2, Phase 3
**Requirements**: DES-01, DES-02
**Success Criteria** (what must be TRUE):
  1. User receives a workspace architecture proposal (pages, databases, relations, templates, dashboards).
  2. User receives an execution plan of atomic tasks derived from the spec.
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Safe Apply & Idempotence
**Goal**: Users can safely preview and apply the plan, with repeatable results.
**Depends on**: Phase 4
**Requirements**: NOTN-01, NOTN-02, SAFE-01, SAFE-02, SAFE-03
**Success Criteria** (what must be TRUE):
  1. User can run a dry-run preview that lists planned changes.
  2. User can apply changes only after explicit confirmation unless `--yes` is passed.
  3. User can create and update pages, databases, and blocks via a plan.
  4. User can define and validate database properties before apply.
  5. User can rerun without duplication using a stable ID mapping.
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Reporting & Handover
**Goal**: Users receive delivery artifacts to review and reuse the workspace.
**Depends on**: Phase 5
**Requirements**: REP-01, REP-02
**Success Criteria** (what must be TRUE):
  1. User receives a change report/audit log of created and updated items.
  2. User receives a handover package with links and ID mapping.
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CLI & Workflow Shell | 0/3 | Not started | - |
| 2. Access & Scope | 0/TBD | Not started | - |
| 3. Ingestion & Analysis | 0/TBD | Not started | - |
| 4. Workspace Design & Planning | 0/TBD | Not started | - |
| 5. Safe Apply & Idempotence | 0/TBD | Not started | - |
| 6. Reporting & Handover | 0/TBD | Not started | - |
