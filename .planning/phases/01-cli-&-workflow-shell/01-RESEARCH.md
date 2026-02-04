# Phase 1: CLI & Workflow Shell - Research

**Researched:** 2026-02-04
**Domain:** Node.js TypeScript CLI distribution and workflow shell
**Confidence:** MEDIUM

## Summary

This phase focuses on establishing a dependable CLI shell that can be installed locally or globally, exposes the workflow commands, and supports a headless mode for automation. The standard approach is a Node.js + TypeScript CLI distributed via npm with a `bin` entry and a proper shebang, using a command parser with subcommands, cross-platform config paths, and a small interactive prompt layer that can be bypassed with `--yes`.

The key recommendations are to standardize on a single headless CLI binary (`nws`) and let OpenCode/Claude command packs invoke that binary, keep configuration in OS-appropriate locations via `env-paths`, and validate user-facing config with schemas. This keeps cross-platform behavior predictable and enables non-interactive automation.

**Primary recommendation:** Implement a single Node.js CLI (`nws`) using commander, env-paths, prompts, and zod, and map all `/nws:*` command-pack entries to that same binary.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js (Active LTS) | 24.13.0 | Cross-platform runtime | Active LTS with long support window and modern runtime features. Source: Node.js releases. |
| TypeScript | 5.9 | Type-safe CLI implementation | Current TS release, standard for Node.js CLIs. Source: TypeScript download page. |
| commander | 14.0.3 | CLI commands, flags, subcommands | Widely used CLI parser with subcommand support. Source: commander releases/README. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| prompts | 2.4.2 | Interactive confirmations | Use for `--yes` bypassable confirmations and guided setup. Source: prompts README. |
| env-paths | 4.0.0 | OS-specific config/data paths | Use for config and state storage across Windows/macOS/Linux. Source: env-paths README. |
| zod | 4.3.6 | Runtime schema validation | Validate config and CLI inputs for safe execution. Source: zod releases/README. |
| pino | 10.3.0 | Structured logging | Emit JSON logs for headless mode and troubleshooting. Source: pino releases/README. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| commander | yargs | Comparable CLI parsing; not verified in this research pass (LOW confidence). |
| prompts | inquirer | Richer TUI, heavier dependency footprint; not verified in this research pass (LOW confidence). |

**Installation:**
```bash
npm install commander prompts env-paths zod pino
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── cli/                 # CLI entrypoint and command wiring
│   ├── commands/        # init, plan, apply, handover
│   └── output/          # console + JSON output helpers
├── config/              # config schema, load/save
├── workflow/            # orchestration for /nws:init -> /nws:handover
└── utils/               # logging, errors
```

### Pattern 1: Single Headless CLI with Command Pack Wrappers
**What:** Implement one headless CLI binary (`nws`) and expose command packs that invoke it with specific subcommands.
**When to use:** Always, to keep OpenCode/Claude commands and automation consistent.
**Example:**
```typescript
// Source: https://github.com/tj/commander.js (README Quick Start)
import { Command } from "commander";

const program = new Command();
program
  .name("nws")
  .command("init")
  .description("initialize workspace flow")
  .action(async () => {
    // call workflow.init()
  });

program.parseAsync(process.argv);
```

### Pattern 2: OS-Specific Config Paths
**What:** Use env-paths for config/cache/log locations instead of hard-coded paths.
**When to use:** Any persisted config or state (tokens, ID maps, logs).
**Example:**
```typescript
// Source: https://github.com/sindresorhus/env-paths (README Usage)
import envPaths from "env-paths";

const paths = envPaths("nws");
// paths.config, paths.data, paths.log
```

### Pattern 3: Explicit Confirmation Gate
**What:** Use an interactive confirm prompt unless `--yes` is provided.
**When to use:** Any operation that applies changes.
**Example:**
```typescript
// Source: https://github.com/terkelg/prompts (README Usage)
import prompts from "prompts";

const { proceed } = await prompts({
  type: "confirm",
  name: "proceed",
  message: "Apply changes?",
  initial: false
});
if (!proceed) process.exit(1);
```

### Anti-Patterns to Avoid
- **Dual CLIs:** Avoid separate logic for command packs vs headless CLI; wrappers should call the same binary.
- **Hard-coded config paths:** Use env-paths to prevent OS-specific breakage.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLI argument parsing | Custom argv parsing | commander | Subcommands, help, errors are handled consistently. |
| Cross-platform config dirs | Manual OS detection | env-paths | Handles Windows/macOS/Linux defaults correctly. |
| Confirmation prompts | Custom stdin reads | prompts | Handles TTY input and cancel flow reliably. |
| CLI distribution | Custom install script | npm `bin` field | Standard global/local install behavior. |

**Key insight:** CLI reliability is mostly about consistent parsing, paths, and distribution; standard libraries remove OS-specific edge cases.

## Common Pitfalls

### Pitfall 1: Missing `bin` + shebang
**What goes wrong:** `nws` is not executable after install or fails on Windows.
**Why it happens:** `package.json` lacks a `bin` entry or the script lacks `#!/usr/bin/env node`.
**How to avoid:** Use npm `bin` mapping and add the shebang to the CLI entry file.
**Warning signs:** `nws` works when run via `node` but not as a command.

### Pitfall 2: Prompting in headless mode
**What goes wrong:** CI or automation hangs waiting for input.
**Why it happens:** Prompts run without a TTY, no `--yes` bypass.
**How to avoid:** Require `--yes` in non-interactive contexts or detect TTY and fail fast.
**Warning signs:** CLI stalls in pipelines.

### Pitfall 3: Commander version/Node mismatch
**What goes wrong:** CLI crashes on older Node versions.
**Why it happens:** commander 14 requires Node 20+.
**How to avoid:** Pin Node to Active LTS and set `engines` in `package.json`.
**Warning signs:** Syntax or runtime errors on Node < 20.

## Code Examples

Verified patterns from official sources:

### Define a CLI with subcommands
```typescript
// Source: https://github.com/tj/commander.js (README Quick Start)
import { Command } from "commander";

const program = new Command();
program
  .name("nws")
  .command("init")
  .description("initialize the workflow")
  .action(() => {
    // run init
  });

program.parse();
```

### Get OS-specific config paths
```typescript
// Source: https://github.com/sindresorhus/env-paths (README Usage)
import envPaths from "env-paths";
const paths = envPaths("nws");
```

### Validate config with zod
```typescript
// Source: https://github.com/colinhacks/zod (README Basic usage)
import { z } from "zod";

const Config = z.object({
  notionToken: z.string().min(1)
});
const parsed = Config.safeParse(input);
```

### Set up npm `bin` mapping
```json
// Source: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin
{
  "bin": {
    "nws": "bin/cli.js"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Ad-hoc install scripts | npm `bin` mapping | npm CLI docs (current) | Standard global/local install behavior across OSes. |
| Fixed config paths | env-paths | env-paths README (current) | Correct OS locations without manual branching. |

**Deprecated/outdated:**
- Custom per-OS install steps: superseded by npm `bin` and Node LTS distribution.

## Open Questions

1. **OpenCode command pack format and install paths**
   - What we know: Packs are Markdown with frontmatter (PROJECT.md).
   - What's unclear: Exact folder layout and required frontmatter keys for install (local/global).
   - Recommendation: Confirm OpenCode pack spec before implementing installer.

2. **Claude Code command pack format and install paths**
   - What we know: Pack installation is required (CLI-01), but spec not in repo.
   - What's unclear: Required file naming, manifest, and install destination.
   - Recommendation: Fetch official docs and codify pack validation rules.

## Sources

### Primary (HIGH confidence)
- https://nodejs.org/en/about/releases - Node.js LTS status and versions
- https://www.typescriptlang.org/download - TypeScript current version and install guidance
- https://github.com/tj/commander.js - CLI parsing patterns and examples
- https://github.com/tj/commander.js/releases - commander latest version and Node requirements
- https://github.com/terkelg/prompts - prompts usage and install
- https://github.com/sindresorhus/env-paths - config/data path conventions and API
- https://github.com/colinhacks/zod - schema validation API and latest release
- https://github.com/pinojs/pino - logging library API and latest release
- https://docs.npmjs.com/cli/v10/configuring-npm/package-json#bin - npm `bin` entry behavior

### Secondary (MEDIUM confidence)
- .planning/research/STACK.md - internal stack recommendations (needs ongoing validation)

### Tertiary (LOW confidence)
- Alternatives table entries (yargs, inquirer) were not verified in this pass

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Versions verified from official sources; command pack specs not verified.
- Architecture: MEDIUM - CLI patterns validated; pack installation rules are unknown.
- Pitfalls: MEDIUM - Based on official docs and common CLI behavior.

**Research date:** 2026-02-04
**Valid until:** 2026-03-06
