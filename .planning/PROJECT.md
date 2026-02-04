# gsd-notion-workspace

## What This Is

An add-on for OpenCode and Claude Code that turns a client folder of documents into a safe, repeatable Notion workspace build. It ingests files, analyzes and critiques the content, proposes a coherent Notion architecture, plans execution, and applies it via the Notion API with strong safety and idempotence guarantees.

## Core Value

Enable consultants to reliably transform messy client documentation into a client-ready Notion workspace through a guided, auditable, and safe CLI workflow.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Provide a GSD-style workflow (questioning → research → requirements → roadmap) specialized for Notion workspace creation.
- [ ] Ingest a client folder (PDF/DOCX/MD/TXT, notes, diagrams) and produce structured context, critique, and requirements inputs.
- [ ] Generate a coherent Notion workspace spec (pages, databases, relations, templates, dashboards) adapted to the client domain.
- [ ] Produce and execute an atomic, auditable execution plan with dry-run previews and explicit apply confirmation.
- [ ] Ensure idempotent re-runs via stable logical-to-Notion ID mapping.
- [ ] Provide OpenCode and Claude Code command packs plus a cross-platform installer.

### Out of Scope

- Bidirectional sync with external systems — too complex for v1 and not required for the MVP flow.

## Context

- Target user is a solo Notion consultant delivering client workspaces from heterogeneous document sets.
- The add-on must work as a command pack (Markdown with frontmatter) installable locally and globally.
- The Notion API uses data sources (2025-09-03); pages (rows) live under data sources and queries are via data sources.
- Notion API limitations around advanced views require fallbacks and manual instructions.

## Constraints

- **Tech Stack**: Node.js + TypeScript — aligns with CLI and Notion API tooling.
- **Safety**: No writes without dry-run + explicit confirmation unless `--yes` is passed.
- **Idempotence**: Strict reuse of existing logical names in local ID mapping.
- **Compatibility**: Cross-platform (Mac/Linux/Windows; WSL OK), no exotic dependencies.
- **Inputs**: Must handle PDF/DOCX/MD/TXT plus notes and diagrams.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build with Node.js + TypeScript | Strong typing for planner/executor and broad CLI compatibility | — Pending |
| Default to dry-run only | Safety-first workflow for Notion writes | — Pending |
| Use Notion API direct by default | Official integration path, stable capabilities | — Pending |
| Provide OpenCode + Claude Code command packs in v1 | Must work in both agentic CLIs | — Pending |
| Strict idempotence via ID_MAP.json | Prevent duplicate workspace creation on re-runs | — Pending |
| Default base preset: standard client set | Aligns with typical consulting deliverables | — Pending |
| Repo name: gsd-notion-workspace | Consistent with GSD ecosystem | — Pending |

---
*Last updated: 2026-02-04 after initialization*
