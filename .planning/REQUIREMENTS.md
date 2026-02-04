# Requirements: gsd-notion-workspace

**Defined:** 2026-02-04
**Core Value:** Enable consultants to reliably transform messy client documentation into a client-ready Notion workspace through a guided, auditable, and safe CLI workflow.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Access

- [x] **ACC-01**: User can configure a Notion integration token and verify access.
- [x] **ACC-02**: User can select a root page or data source as the workspace parent.
- [x] **ACC-03**: User can validate integration capabilities and shared scope before apply.

### Notion Objects

- [ ] **NOTN-01**: User can create and update pages, databases, and blocks via a plan.
- [ ] **NOTN-02**: User can define and validate database properties before apply.

### Safety & Idempotence

- [ ] **SAFE-01**: User can run a dry-run preview that lists planned changes.
- [ ] **SAFE-02**: User can apply changes only after explicit confirmation unless `--yes` is passed.
- [ ] **SAFE-03**: User can rerun without duplication using a stable ID mapping.

### Ingestion & Analysis

- [ ] **ING-01**: User can ingest PDF/DOCX/MD/TXT files from a client folder.
- [ ] **ING-02**: User can extract structured notes (background, pain points, outcomes, processes).
- [ ] **ING-03**: User receives AI critique with citations to source docs.

### Workspace Design & Planning

- [ ] **DES-01**: User receives a workspace architecture proposal (pages, databases, relations, templates, dashboards).
- [ ] **DES-02**: User receives an execution plan of atomic tasks derived from the spec.

### Reporting & Handover

- [ ] **REP-01**: User receives a change report/audit log of created and updated items.
- [ ] **REP-02**: User receives a handover package with links and ID mapping.

### CLI & Installation

- [x] **CLI-01**: User can install command packs for OpenCode and Claude Code (local/global).
- [x] **CLI-02**: User can run the workflow commands (/nws:init → /nws:handover).
- [x] **CLI-03**: User can run a headless CLI for automation outside agentic CLIs.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Safety & Resilience

- **SAFE-04**: CLI retries on 429/5xx with backoff and resume.
- **SAFE-05**: CLI surfaces actionable error recovery guidance.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Bidirectional or real-time sync | High complexity and rate-limit risk; not required for v1 value. |
| Advanced Notion view management | Not fully supported by API; provide manual guidance instead. |
| Safe merge/migration for existing workspaces | Defer until core flow proves reliable. |
| Consultant template library (advanced) | Wait for repeated patterns to stabilize. |
| Multi-client portfolio management | Not required for solo-consultant MVP. |
| What-if simulation for schema changes | High complexity, low early ROI. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACC-01 | Phase 2 | Complete |
| ACC-02 | Phase 2 | Complete |
| ACC-03 | Phase 2 | Complete |
| NOTN-01 | Phase 5 | Pending |
| NOTN-02 | Phase 5 | Pending |
| SAFE-01 | Phase 5 | Pending |
| SAFE-02 | Phase 5 | Pending |
| SAFE-03 | Phase 5 | Pending |
| ING-01 | Phase 3 | Pending |
| ING-02 | Phase 3 | Pending |
| ING-03 | Phase 3 | Pending |
| DES-01 | Phase 4 | Pending |
| DES-02 | Phase 4 | Pending |
| REP-01 | Phase 6 | Pending |
| REP-02 | Phase 6 | Pending |
| CLI-01 | Phase 1 | Complete |
| CLI-02 | Phase 1 | Complete |
| CLI-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-02-04*
*Last updated: 2026-02-04 after Phase 2 completion*
