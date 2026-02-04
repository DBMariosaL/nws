# Phase 2: Access & Scope - Context

**Gathered:** 2026-02-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure Notion access and confirm the target workspace root. This includes token setup, selecting a parent (page or database), and validating access scope/capabilities before moving on. Ingestion and workspace design are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Token setup flow
- Token provided via CLI prompt.
- Token is persisted locally for reuse.
- Confirmation shows a masked token (last 4 characters).

### Root selection experience
- Parent is selected by pasting a Notion URL/ID.
- Both pages and databases are valid parents.
- Explicit confirmation only when the selection is ambiguous.

### Access verification feedback
- Verification runs immediately after token entry.
- Success feedback includes a capabilities summary.
- Verification failure blocks progress until fixed.

### Scope/capability checks
- Minimum required capabilities: full create/edit/database operations.
- Checks target broader workspace access (not just the selected parent).

### Claude's Discretion
- Whether multiple saved tokens are supported (single vs named profiles).
- How much context to show for the selected parent (title vs breadcrumb path).
- Failure message depth (concise vs actionable steps).
- Capability check result format (checklist vs single verdict).
- Handling partial capability gaps (block vs warn), while honoring the requirement that verification failures block progress.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-access-&-scope*
*Context gathered: 2026-02-04*
