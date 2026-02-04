# Phase 2: Access & Scope - Research

**Researched:** 2026-02-04
**Domain:** Notion API access setup, capability verification, workspace root selection
**Confidence:** MEDIUM

## Summary

This research covers the Notion API mechanics needed to implement token setup, access verification, and root selection for Phase 2. The Notion API requires a bearer token and a `Notion-Version` header for all REST requests, and integrations must be explicitly shared on pages/databases to access them. Capabilities are configured in Notion and are enforced by the API; lack of capabilities or sharing manifests as `restricted_resource` or `object_not_found` errors. The official JS SDK (`@notionhq/client`) handles versioning headers and is the standard way to make requests.

For root selection, Notion URLs contain a 32-character ID; the API accepts IDs with or without dashes. A database URL corresponds to a database container that contains one or more data sources; later operations that create pages under a database should use the data source ID. Root verification should therefore retrieve the page or database by ID, then when a database is selected, record the database and its data source IDs for later phases.

Capabilities verification has no dedicated API endpoint, so the most reliable approach is to run a sequence of capability probes immediately after token entry and block progress on failure. Use `users.me` to validate the token, then test content capabilities via read (retrieve page/database), insert (create a page in the selected root), and update (archive the created test page). Keep the test page clearly labeled and auto-archived to avoid user confusion. For OAuth flows, token introspection exists but requires client credentials and is not suitable for internal integrations.

**Primary recommendation:** Use the Notion SDK for auth + versioning, validate token with `users.me`, resolve root by trying page/database retrieval, and verify insert/update capabilities by creating and immediately archiving a test page under the selected root.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @notionhq/client | 5.9.0 | Notion API SDK | Official SDK; handles auth + Notion-Version header and keeps API usage consistent. |
| Node.js (LTS, Active) | 24.13.0 | Runtime | Provides built-in `fetch` and stable CLI runtime. |
| TypeScript | 5.9 | Safety | Enforces typing for config and Notion API responses. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| commander | 14.0.3 | CLI parsing | Define commands/flags for access setup flows. |
| prompts | 2.4.2 | Interactive input | Capture token, root URL/ID, confirmation prompts. |
| env-paths | 4.0.0 | Config/data paths | Store token config in OS-appropriate directory. |
| write-file-atomic | 7.0.0 | Safe writes | Persist tokens/config without corruption. |
| zod | 4.3.6 | Schema validation | Validate token config and root selection payloads. |
| pino | 10.3.0 | Logging | Consistent redaction and debug output for access checks. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @notionhq/client | Direct HTTP fetch | Only needed for unsupported endpoints; you must manage `Notion-Version` header yourself. |
| prompts | inquirer | Heavier dependency, richer TUI at the cost of footprint. |

**Installation:**
```bash
npm install @notionhq/client commander prompts env-paths write-file-atomic zod pino
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── cli/                 # Access setup commands + prompts
├── config/              # Token storage + schema validation
├── notion/              # Notion client + capability probes
├── state/               # Persisted workspace root selection
└── utils/               # Redaction, logging, URL parsing
```

### Pattern 1: Token Setup + Immediate Verification
**What:** Prompt for token, persist it locally, then verify by calling `users.me` and capability probes.
**When to use:** First-time setup or token refresh.
**Example:**
```typescript
// Source: https://developers.notion.com/reference/authentication
// Source: https://developers.notion.com/reference/get-self
const client = new Client({ auth: token });
await client.users.me();
```

### Pattern 2: Root Resolution by ID + Type Probe
**What:** Parse the ID from a Notion URL, try `retrieve page`, then `retrieve database` to detect type.
**When to use:** User provides a URL/ID and both pages and databases are valid.
**Example:**
```typescript
// Source: https://developers.notion.com/reference/retrieve-a-page
// Source: https://developers.notion.com/reference/database-retrieve
async function resolveRoot(id: string) {
  try {
    return { type: "page", page: await client.pages.retrieve({ page_id: id }) };
  } catch (error) {
    return { type: "database", database: await client.databases.retrieve({ database_id: id }) };
  }
}
```

### Pattern 3: Capability Probes with Safe Write Test
**What:** Validate read/insert/update by creating a labeled test page under the root and immediately archiving it.
**When to use:** Token verification where write capabilities are required.
**Example:**
```typescript
// Source: https://developers.notion.com/reference/post-page
const testPage = await client.pages.create({
  parent: { page_id: rootPageId },
  properties: { Title: { title: [{ text: { content: "Access Check" } }] } },
});
await client.pages.update({ page_id: testPage.id, archived: true });
```

### Anti-Patterns to Avoid
- **Assuming workspace-wide access:** Integrations only see shared pages/databases; expect 404/403 if not shared.
- **Skipping Notion-Version:** Requests fail with `missing_version` unless the SDK sets it.
- **Relying on search for access:** Search is not exhaustive for access verification.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Notion API client | Custom HTTP wrapper | `@notionhq/client` | Handles auth + `Notion-Version` header and updates with API changes. |
| Token persistence | Ad-hoc file paths | `env-paths` + `write-file-atomic` | OS-correct storage + safe writes. |
| Prompt handling | Custom readline flow | `prompts` | Reliable masking and confirmations. |

**Key insight:** Access setup is error-prone; leveraging Notion SDK and safe config storage reduces subtle auth bugs.

## Common Pitfalls

### Pitfall 1: Token Valid but No Access
**What goes wrong:** `object_not_found` or `restricted_resource` when retrieving a known page/database.
**Why it happens:** The root page/database was not shared with the integration.
**How to avoid:** Require explicit sharing of the chosen root, and surface the Notion UI steps to add the integration connection.
**Warning signs:** 404 with `object_not_found` for a valid ID.

### Pitfall 2: Missing Notion-Version Header
**What goes wrong:** Requests fail with `missing_version`.
**Why it happens:** Direct HTTP usage without header, or SDK overridden incorrectly.
**How to avoid:** Use the JS SDK or always set `Notion-Version: 2025-09-03`.
**Warning signs:** 400 `missing_version` errors.

### Pitfall 3: Capability Mismatch
**What goes wrong:** Create/update requests fail with `restricted_resource`.
**Why it happens:** Integration lacks insert/update capabilities.
**How to avoid:** Explicitly validate insert/update with a test page and provide capability remediation steps.
**Warning signs:** 403 `restricted_resource` on create/update.

## Code Examples

Verified patterns from official sources:

### Initialize Notion Client + Verify Token
```typescript
// Source: https://developers.notion.com/reference/authentication
// Source: https://developers.notion.com/reference/get-self
import { Client } from "@notionhq/client";

const client = new Client({ auth: token });
const me = await client.users.me();
```

### Retrieve Database and Data Sources
```typescript
// Source: https://developers.notion.com/reference/database-retrieve
const database = await client.databases.retrieve({ database_id });
const dataSourceIds = database.data_sources.map((ds) => ds.id);
```

### Create Page Under a Data Source
```typescript
// Source: https://developers.notion.com/reference/post-page
await client.pages.create({
  parent: { data_source_id },
  properties: { Title: { title: [{ text: { content: "Access Check" } }] } },
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Database parent for pages | Data source parent for pages | API 2025-09-03 | Root selection must capture data_source_id for database parents. |

**Deprecated/outdated:**
- **Database-only parents in create page:** Updated to data source parents in the 2025-09-03 API version.

## Open Questions

1. **How to verify capabilities without creating content?**
   - What we know: No dedicated capabilities API; `users.me` only validates token.
   - What's unclear: Whether a safe, non-mutating insert/update probe is possible.
   - Recommendation: Create + immediately archive a labeled test page, and document this behavior in UX.

## Sources

### Primary (HIGH confidence)
- https://developers.notion.com/reference/authentication
- https://developers.notion.com/reference/get-self
- https://developers.notion.com/reference/capabilities
- https://developers.notion.com/reference/versioning
- https://developers.notion.com/reference/status-codes
- https://developers.notion.com/reference/database-retrieve
- https://developers.notion.com/reference/retrieve-a-data-source
- https://developers.notion.com/reference/retrieve-a-page
- https://developers.notion.com/reference/post-page
- https://developers.notion.com/reference/parent-object

### Secondary (MEDIUM confidence)
- https://developers.notion.com/guides/get-started/authorization
- https://developers.notion.com/guides/resources/best-practices-for-handling-api-keys

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - matches repository stack research and official SDK.
- Architecture: MEDIUM - based on API behavior and common CLI patterns.
- Pitfalls: MEDIUM - derived from official error docs and known access constraints.

**Research date:** 2026-02-04
**Valid until:** 2026-03-06
