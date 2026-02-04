# Pitfalls Research

**Domain:** Notion workspace automation add-on (API-driven architecture + execution)
**Researched:** 2026-02-04
**Confidence:** MEDIUM

## Critical Pitfalls

### Pitfall 1: Treating Search as a Complete Inventory

**What goes wrong:**
Automation misses pages/databases because the search endpoint is not exhaustive and indexing is not immediate.

**Why it happens:**
Teams use search to enumerate all accessible content, assuming it is complete and fresh.

**How to avoid:**
Use search only for name discovery; for exhaustive access, require explicit sharing of root pages/databases and traverse known structures. Add a manual refresh option in any UI that depends on search results.

**Warning signs:**
Search results differ between runs; newly shared pages do not appear immediately; missing items despite confirmed access.

**Phase to address:**
Phase 1 - Discovery and Access Model

---

### Pitfall 2: Missing or Mismatched Notion-Version Header

**What goes wrong:**
Requests fail with `missing_version`, or property schemas behave differently than expected after version changes.

**Why it happens:**
Teams omit the required `Notion-Version` header or assume the SDK defaults remain stable across releases.

**How to avoid:**
Pin a specific `Notion-Version` in all requests, document it in config, and test upgrades against Notion's upgrade guide before bumping.

**Warning signs:**
Sudden schema mismatches, `missing_version` errors, or API responses changing shape without code changes.

**Phase to address:**
Phase 2 - Core API Client Setup

---

### Pitfall 3: Under-Scoped Integration Capabilities / Missing Page Sharing

**What goes wrong:**
Automation cannot read or update pages, returning `restricted_resource` or `object_not_found` even though the page exists.

**Why it happens:**
Integrations are not granted the right capabilities, or pages/databases are not explicitly shared with the integration.

**How to avoid:**
Define minimum required capabilities early and validate in a setup checklist. Require users to share the root workspace page/database and verify access during onboarding.

**Warning signs:**
403/404 errors for known objects; webhooks not firing for expected entities; incomplete search results.

**Phase to address:**
Phase 1 - Discovery and Access Model

---

### Pitfall 4: Ignoring Rate and Size Limits

**What goes wrong:**
Bulk operations fail with 429s, or large payloads are rejected with `validation_error` due to size limits.

**Why it happens:**
Teams batch too aggressively, ignore Retry-After, or exceed property/payload limits (e.g., 1000 blocks / 500KB payload).

**How to avoid:**
Implement request queues with backoff and Retry-After handling, enforce payload sizing, and split large operations into smaller chunks.

**Warning signs:**
Frequent 429 responses, partial writes, or `validation_error` with size-related messages.

**Phase to address:**
Phase 3 - Execution Engine and Idempotency

---

### Pitfall 5: Webhook Semantics Misunderstood

**What goes wrong:**
Automation assumes webhooks are ordered or complete and misses changes when events are aggregated or delivered out of order.

**Why it happens:**
Teams treat webhooks as a full change payload rather than a signal; they do not fetch fresh state after receiving events.

**How to avoid:**
Treat webhooks as hints only; always re-fetch the latest state, reorder by timestamp, and handle at-most-once delivery with idempotent processing.

**Warning signs:**
Stale state after rapid edits, double-processing of updates, or missing content changes that occurred between aggregated events.

**Phase to address:**
Phase 4 - Change Detection and Sync

---

### Pitfall 6: Conflict Errors and Silent Overwrites

**What goes wrong:**
Updates fail with `conflict_error` or overwrite user edits due to stale data assumptions.

**Why it happens:**
Automation updates pages without re-reading, or does not reconcile when schema/content has changed since last sync.

**How to avoid:**
Use read-then-write patterns for critical updates, detect schema/content drift, and re-apply changes only after confirming the current state.

**Warning signs:**
409 errors, mismatched property types after schema edits, or user complaints about overwritten content.

**Phase to address:**
Phase 3 - Execution Engine and Idempotency

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip idempotency mapping (no ID_MAP.json) | Faster prototype | Duplicate pages/databases on re-run | Never for production |
| Hard-code property names without schema sync | Less upfront work | Breaks when users rename properties | Only for throwaway demos |
| Use search for all discovery | Simple and quick | Missing content, inconsistent runs | Never for exhaustive sync |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Notion API auth | Missing `Notion-Version` header | Always send `Notion-Version` and pin it in config |
| Notion API access | Assuming integration sees all workspace content | Require explicit sharing and capability checks |
| Notion Search | Using search to list everything | Use search only for discovery and query data sources directly |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unthrottled write bursts | 429 rate limits, long retries | Queue requests and respect Retry-After | When bulk runs exceed ~3 rps average |
| Oversized payloads | 400 validation errors | Chunk writes; keep within 1000 blocks / 500KB | Large document imports |
| Polling instead of webhooks | Excess API usage, stale state | Use webhooks and fetch on event | Any active workspace |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Skipping webhook signature validation | Accepting spoofed events | Validate `X-Notion-Signature` using verification token |
| Over-scoping capabilities | Excess data exposure | Request minimum capabilities needed |
| Logging tokens or page content | Data leakage in logs | Redact secrets and sensitive fields |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No dry-run preview | Users fear data damage | Always show plan diff before apply |
| No explicit re-share guidance | Confusing permission errors | Provide clear “share this page with the integration” steps |
| Silent search delays | Users think content is missing | Add refresh/retry guidance for search results |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **API client:** `Notion-Version` header pinned and configured
- [ ] **Access model:** Integration shared on the correct root page/database
- [ ] **Sync engine:** Pagination, rate limits, and size limits handled
- [ ] **Webhooks:** Subscription verified and signature validation enabled
- [ ] **Idempotency:** ID mapping persisted and re-run safe

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Search missing content | LOW | Re-share root pages and re-run discovery; add manual refresh |
| Rate limited writes | MEDIUM | Back off, queue retries, and resume from last cursor |
| Version mismatch | MEDIUM | Pin version, update mappings, re-run validation tests |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Search not exhaustive | Phase 1 - Discovery and Access Model | Test discovery against a known complete set |
| Missing Notion-Version | Phase 2 - Core API Client Setup | Integration smoke test includes `missing_version` guard |
| Under-scoped capabilities | Phase 1 - Discovery and Access Model | Access check on shared root pages/databases |
| Rate/size limits | Phase 3 - Execution Engine and Idempotency | Load test with large docs; no 429/400 failures |
| Webhook semantics | Phase 4 - Change Detection and Sync | Event ordering and re-fetch tests pass |
| Conflict errors | Phase 3 - Execution Engine and Idempotency | Update re-reads and conflict handling verified |

## Sources

- https://developers.notion.com/reference/request-limits
- https://developers.notion.com/reference/errors
- https://developers.notion.com/reference/versioning
- https://developers.notion.com/reference/search-optimizations-and-limitations
- https://developers.notion.com/reference/capabilities
- https://developers.notion.com/reference/webhooks
- https://developers.notion.com/reference/webhooks-events-delivery

---
*Pitfalls research for: Notion workspace automation add-on*
*Researched: 2026-02-04*
