---
phase: 02-access-&-scope
verified: 2026-02-04T14:27:26Z
status: human_needed
score: 9/9 must-haves verified
human_verification:
  - test: "Run `nws init` interactively with a valid Notion token and a shared root"
    expected: "Prompts for token/root, verifies access, prints masked token, and saves auth/root JSON under the OS config directory"
    why_human: "Requires live Notion API access and local filesystem writes"
  - test: "Run `nws init` with an invalid token or an unshared root"
    expected: "Command fails with guidance and does not persist auth/root state"
    why_human: "Needs real Notion error responses to confirm failure gating"
  - test: "Use a database root with multiple data sources"
    expected: "Prompts to select a data source (or `--yes` selects the first) and persists the selected data_source_id"
    why_human: "Requires live database with multiple data sources"
---

# Phase 2: Access & Scope Verification Report

**Phase Goal:** Users can configure Notion access and confirm the target workspace root.
**Verified:** 2026-02-04T14:27:26Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Token config can be saved and loaded from an OS-specific config path. | ✓ VERIFIED | `src/config/paths.ts` uses `env-paths` and `ensureConfigDir`; `src/config/notion-auth.ts` reads/writes via `getAuthConfigPath()`. |
| 2 | Workspace root selection persists locally with schema validation. | ✓ VERIFIED | `src/state/workspace-root.ts` defines zod schema + `loadWorkspaceRoot`/`saveWorkspaceRoot`. |
| 3 | Malformed config data is rejected before use. | ✓ VERIFIED | `src/config/notion-auth.ts` and `src/state/workspace-root.ts` use `safeParse` and return `null` on invalid JSON. |
| 4 | A Notion URL or ID resolves to a page or database with title metadata. | ✓ VERIFIED | `src/notion/root.ts` resolves page/database and derives title with fallback to `Untitled`. |
| 5 | Capability checks validate token, read access, and write/archiving permissions. | ✓ VERIFIED | `src/notion/verify.ts` uses `users.me`, retrieve, `pages.create`, and `pages.update(archived)`; `src/workflow/init.ts` gates on these checks. |
| 6 | Database roots expose data source IDs needed for later page creation. | ✓ VERIFIED | `src/notion/root.ts` returns `data_source_ids` and errors if none. |
| 7 | User can enter a token and see a masked confirmation. | ✓ VERIFIED | `src/cli/prompts/access.ts` masks saved token confirmation; `src/workflow/init.ts` success message uses `maskToken()`. |
| 8 | Init blocks progress when access verification fails. | ✓ VERIFIED | `src/workflow/init.ts` returns error before saving when token/root verification fails. |
| 9 | Selected root is persisted and summarized after success. | ✓ VERIFIED | `src/workflow/init.ts` calls `saveWorkspaceRoot` and includes root label in success message. |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `src/config/paths.ts` | Resolved config directory and file paths | ✓ VERIFIED | Uses `env-paths`, ensures config dir, exports path helpers. |
| `src/config/notion-auth.ts` | Notion token schema and load/save helpers | ✓ VERIFIED | Zod schema + load/save with `write-file-atomic`. |
| `src/state/workspace-root.ts` | Workspace root schema and load/save helpers | ✓ VERIFIED | Discriminated union schema + load/save with atomic writes. |
| `package.json` | Notion SDK and atomic write dependencies | ✓ VERIFIED | Lists `@notionhq/client` and `write-file-atomic`. |
| `src/notion/client.ts` | Notion SDK client factory | ✓ VERIFIED | Exports `createNotionClient` using `new Client({ auth })`. |
| `src/notion/ids.ts` | Notion ID parsing and normalization | ✓ VERIFIED | Parses raw/dashed IDs and normalizes to dashed. |
| `src/notion/root.ts` | Root resolver for page or database | ✓ VERIFIED | Retrieves page/db and returns `ResolvedRoot` union. |
| `src/notion/verify.ts` | Token and capability probe helpers | ✓ VERIFIED | Implements token/workspace/root probes with structured results. |
| `src/cli/prompts/access.ts` | Interactive token + root prompts | ✓ VERIFIED | Prompts token/root and data source selection. |
| `src/workflow/init.ts` | Access and scope init workflow | ✓ VERIFIED | Orchestrates prompt, verification, persistence, and summary. |
| `src/utils/mask.ts` | Token masking helper | ✓ VERIFIED | Masks to last 4 characters. |
| `src/cli/commands/init.ts` | CLI init command wired to workflow | ✓ VERIFIED | Calls `initWorkflow` and logs via `logResult`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `src/config/notion-auth.ts` | `env-paths` | config path resolver | ✓ WIRED | Uses `getAuthConfigPath()` from `src/config/paths.ts` which uses `envPaths`. |
| `src/config/notion-auth.ts` | `write-file-atomic` | atomic write | ✓ WIRED | `saveNotionAuth` calls `writeFileAtomic`. |
| `src/notion/client.ts` | `@notionhq/client` | `new Client` | ✓ WIRED | Client factory returns `new Client({ auth: token })`. |
| `src/notion/verify.ts` | `pages.create` | access probe | ✓ WIRED | `verifyRootCapabilities` calls `client.pages.create`. |
| `src/workflow/init.ts` | `src/config/notion-auth.ts` | load/save config | ✓ WIRED | `loadNotionAuth` and `saveNotionAuth` used in init flow. |
| `src/workflow/init.ts` | `src/notion/verify.ts` | capability checks | ✓ WIRED | Uses `verifyToken` and `verifyRootCapabilities`. |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
| --- | --- | --- |
| ACC-01 | ? NEEDS HUMAN | Requires live Notion token verification. |
| ACC-02 | ? NEEDS HUMAN | Requires real root selection against Notion data. |
| ACC-03 | ? NEEDS HUMAN | Requires live capability checks and shared scope confirmation. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| None | - | - | - | - |

### Human Verification Required

### 1. Interactive init success

**Test:** Run `nws init` with a valid token and a shared root.
**Expected:** Prompts for token/root, verifies access, prints masked token, and persists config/state.
**Why human:** Requires live Notion API access and local filesystem changes.

### 2. Verification failure gates progress

**Test:** Run `nws init` with an invalid token or unshared root.
**Expected:** Init fails with actionable guidance and does not save config/state.
**Why human:** Depends on real Notion error responses.

### 3. Database data source selection

**Test:** Run `nws init` with a database root that has multiple data sources.
**Expected:** Prompts for data source (or `--yes` selects the first) and persists selected `data_source_id`.
**Why human:** Requires a live database with multiple data sources.

### Gaps Summary

No code gaps found. Automated checks confirm structural readiness; live Notion verification required.

---

_Verified: 2026-02-04T14:27:26Z_
_Verifier: Claude (gsd-verifier)_
