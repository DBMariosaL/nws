---
phase: 01-cli-&-workflow-shell
plan: 01
subsystem: cli
tags: [node, typescript, commander, prompts, pino, zod, env-paths]

# Dependency graph
requires: []
provides:
  - ESM Node.js CLI package with npm bin mapping
  - Commander-based subcommands for init/plan/apply/handover
  - Workflow stubs returning structured results
  - Headless-safe apply confirmation and JSON output
affects: [Phase 2: Access & Scope, command packs]

# Tech tracking
tech-stack:
  added: [commander, prompts, env-paths, zod, pino, typescript, tsx, @types/node, @types/prompts]
  patterns: [commander root with subcommands, workflow stubs returning {command,status,message}, headless apply gate with --yes]

key-files:
  created:
    - package.json
    - tsconfig.json
    - src/cli.ts
    - src/cli/index.ts
    - src/cli/commands/apply.ts
    - src/cli/commands/handover.ts
    - src/cli/commands/init.ts
    - src/cli/commands/plan.ts
    - src/workflow/apply.ts
    - src/workflow/handover.ts
    - src/workflow/init.ts
    - src/workflow/plan.ts
    - src/utils/logging.ts
  modified:
    - package-lock.json

key-decisions:
  - "Added src/cli.ts wrapper to emit bin/cli.js while keeping src/cli/index.ts as the command wiring entry."

patterns-established:
  - "Command handlers call workflow stubs and return structured results"
  - "Apply uses explicit confirmation unless --yes is provided"
  - "JSON logging emits a single-line payload when --json is set"

# Metrics
duration: 8min
completed: 2026-02-04
---

# Phase 1 Plan 1: CLI Shell Summary

**Node/TypeScript ESM CLI shell with `nws` subcommands, workflow stubs, and headless-safe apply confirmation with JSON output.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-04T11:36:44Z
- **Completed:** 2026-02-04T11:44:24Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Created an ESM Node.js CLI package with npm `nws` bin mapping and build scripts
- Wired init/plan/apply/handover commands to workflow stubs with consistent error handling
- Added headless-safe apply confirmation and JSON output mode for automation

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold the Node/TypeScript CLI package** - `c98baa5` (chore)
2. **Task 2: Wire CLI commands to workflow stubs (CLI-02)** - `9b3ed41` (feat)
3. **Task 3: Implement headless and confirmation behavior (CLI-03)** - `f9588b9` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified
- `package.json` - npm bin mapping, scripts, and dependencies
- `tsconfig.json` - NodeNext ESM build configuration
- `src/cli.ts` - bin entry wrapper for `bin/cli.js`
- `src/cli/index.ts` - commander root command and subcommand registration
- `src/cli/commands/apply.ts` - apply command with headless confirmation and logging
- `src/cli/commands/handover.ts` - handover command handler
- `src/cli/commands/init.ts` - init command handler
- `src/cli/commands/plan.ts` - plan command handler
- `src/workflow/apply.ts` - apply workflow stub
- `src/workflow/handover.ts` - handover workflow stub
- `src/workflow/init.ts` - init workflow stub
- `src/workflow/plan.ts` - plan workflow stub
- `src/utils/logging.ts` - JSON or human-readable logging helper
- `package-lock.json` - dependency lockfile updates

## Decisions Made
- Added a `src/cli.ts` wrapper to emit `bin/cli.js` while preserving `src/cli/index.ts` as the command wiring entrypoint.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `@types/node` for `process` globals**
- **Found during:** Task 2 (command wiring build)
- **Issue:** TypeScript build failed due to missing Node.js type definitions
- **Fix:** Installed `@types/node` and updated dependencies
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm run build` succeeded
- **Committed in:** `9b3ed41`

**2. [Rule 3 - Blocking] Added `@types/prompts` for prompt typing**
- **Found during:** Task 3 (apply confirmation build)
- **Issue:** TypeScript build failed due to missing prompts type definitions
- **Fix:** Installed `@types/prompts` and updated dependencies
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm run build` and `node "bin/cli.js" apply --yes --json` succeeded
- **Committed in:** `f9588b9`

**3. [Rule 3 - Blocking] Added entry wrapper to emit `bin/cli.js`**
- **Found during:** Task 2 (CLI execution verification)
- **Issue:** `tsc` emitted `bin/cli/index.js`, causing `bin/cli.js` to be missing
- **Fix:** Added `src/cli.ts` wrapper so `tsc` emits `bin/cli.js` while keeping `src/cli/index.ts` as the wiring entry
- **Files modified:** `src/cli.ts`
- **Verification:** `node "bin/cli.js" init --yes` succeeded
- **Committed in:** `9b3ed41`

**4. [Rule 3 - Blocking] Removed unsupported `preserveShebang` compiler option**
- **Found during:** Task 1 (initial build)
- **Issue:** TypeScript 5.9 rejected `preserveShebang` in `tsconfig.json`
- **Fix:** Removed the unsupported option and relied on default shebang preservation
- **Files modified:** `tsconfig.json`
- **Verification:** `npm run build` succeeded and CLI shebang retained in output
- **Committed in:** `c98baa5`

---

**Total deviations:** 4 auto-fixed (4 blocking)
**Impact on plan:** All fixes were required to complete builds and execute the CLI; no scope creep.

## Issues Encountered
- TypeScript build failed on missing globals (`process`) and prompts typings until type packages were added.
- CLI entry output path required a wrapper file to satisfy `bin/cli.js` mapping.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CLI shell and headless behaviors are in place for command pack discovery work.
- No blockers for Phase 1 Plan 02.

---
*Phase: 01-cli-&-workflow-shell*
*Completed: 2026-02-04*
