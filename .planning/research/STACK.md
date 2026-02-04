# Stack Research

**Domain:** Notion workspace automation CLI (Node.js/TypeScript)
**Researched:** 2026-02-04
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js (LTS, Active) | 24.13.0 | Runtime for cross-platform CLI | Current Active LTS with long support window; ensures modern `fetch`, ESM, and performance. Confidence: HIGH. |
| TypeScript | 5.9 | Type-safe CLI implementation | Current TS release; improves reliability for idempotent planning/execution flows. Confidence: HIGH. |
| @notionhq/client | 5.9.0 | Notion API SDK | Official SDK; tracks API surface and handles auth/headers consistently. Confidence: HIGH. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| commander | 14.0.3 | CLI commands/options | Standard, lightweight CLI parsing for multi-command automation. Confidence: HIGH. |
| zod | 4.3.6 | Runtime schema validation | Validate configs, plan payloads, and ID_MAP.json for safe execution. Confidence: HIGH. |
| p-limit | 7.3.0 | Concurrency control | Limit Notion API calls to avoid rate limits; use per operation batch. Confidence: HIGH. |
| p-retry | 7.1.1 | Retry with backoff | Wrap Notion API calls and ingestion reads to handle transient errors. Confidence: HIGH. |
| pino | 10.3.0 | Structured logging | Consistent logs for dry-run, apply, and idempotence reports. Confidence: HIGH. |
| prompts | 2.4.2 | Interactive confirmation | Use for dry-run confirmation unless `--yes` is set. Confidence: HIGH. |
| env-paths | 4.0.0 | Cross-platform config/data dirs | Store cache and ID_MAP.json in OS-appropriate locations. Confidence: HIGH. |
| write-file-atomic | 7.0.0 | Safe state writes | Prevent ID_MAP.json corruption on crash or interruption. Confidence: HIGH. |
| file-type | 21.3.0 | File sniffing | Detect PDF/DOCX/MD/TXT reliably before parsing. Confidence: HIGH. |
| pdf-parse | 2.4.5 | PDF text extraction | Low-dependency PDF text extraction for ingestion. Confidence: MEDIUM (npm registry version; verify if pdfjs-dist is preferred). |
| mammoth | 1.2.5 | DOCX to text/HTML | Extract structured text from DOCX reliably. Confidence: HIGH. |
| remark | 15.0.1 | Markdown parsing | Parse MD and normalize to a consistent AST. Confidence: HIGH. |
| gray-matter | 4.0.3 | Front matter parsing | Handle YAML/TOML front matter in MD docs. Confidence: MEDIUM (npm registry version). |
| yaml | 2.8.2 | YAML parsing | Parse config and front matter when needed. Confidence: MEDIUM (npm registry version). |
| dotenv | 17.2.3 | Local env loading | Only for local dev/testing; not required in production. Confidence: MEDIUM (npm registry version). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| tsx | Fast TS runner | Use for local dev scripts and quick CLI iteration. Version: 4.21.0. |
| tsup | Build bundler | Optional bundling for distribution; keep output ESM. Version: 8.5.1. |
| vitest | Unit/integration tests | Covers parsing, planning, and Notion write idempotence. Version: 4.0.18 (latest stable). |

## Installation

```bash
# Core
npm install @notionhq/client commander zod p-limit p-retry pino prompts env-paths write-file-atomic file-type pdf-parse mammoth remark gray-matter yaml

# Supporting (optional)
npm install dotenv

# Dev dependencies
npm install -D typescript tsx tsup vitest
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| commander | yargs | Choose yargs if you need complex argument coercion and richer help formatting. |
| prompts | inquirer | Use inquirer if you need multi-page TUI flows; heavier dependency. |
| pdf-parse | pdfjs-dist | Prefer pdfjs-dist for more control over layout and glyph extraction. |
| @notionhq/client | Direct fetch | Use direct HTTP for custom endpoints or when SDK lags new API fields. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| node-fetch | Redundant on Node 24+; extra dependency | Built-in `fetch` in Node.js 24 LTS |
| request | Deprecated and unmaintained | Built-in `fetch` or Notion SDK |
| oclif | Heavy scaffolding and slower install time | commander for minimal CLI footprint |
| pkg/nexe for binaries | Adds native build complexity and platform-specific issues | Ship JS with Node LTS requirement |

## Stack Patterns by Variant

**If idempotence must survive concurrent runs:**
- Use a small SQLite file for ID mapping (instead of JSON)
- Because JSON locking is fragile across multiple processes

**If CLI must remain dependency-light:**
- Drop remark/gray-matter and parse Markdown with a minimal lexer
- Because markdown AST tooling increases dependency tree size

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Node.js 24.x | commander@14, p-limit@7, p-retry@7, env-paths@4, file-type@21, write-file-atomic@7 | These packages require Node 20+; Node 24 LTS satisfies all. |
| ESM packages | TypeScript `moduleResolution` set to `NodeNext` | p-limit, env-paths, file-type are ESM-only. |

## Sources

- https://nodejs.org/en/about/releases — Node.js LTS versions and status
- https://www.typescriptlang.org/download — TypeScript current version
- https://github.com/makenotion/notion-sdk-js/releases — @notionhq/client latest
- https://developers.notion.com/reference/intro — Notion API reference
- https://github.com/tj/commander.js/releases — commander latest
- https://github.com/colinhacks/zod/releases — zod latest
- https://github.com/sindresorhus/p-limit/releases — p-limit latest
- https://github.com/sindresorhus/p-retry/releases — p-retry latest
- https://github.com/pinojs/pino/releases — pino latest
- https://github.com/terkelg/prompts/releases — prompts latest
- https://github.com/sindresorhus/env-paths/releases — env-paths latest
- https://github.com/npm/write-file-atomic/releases — write-file-atomic latest
- https://github.com/sindresorhus/file-type/releases — file-type latest
- https://registry.npmjs.org/pdf-parse — pdf-parse dist-tag (latest)
- https://github.com/mwilliamson/mammoth.js/releases — mammoth latest
- https://github.com/remarkjs/remark/releases — remark latest
- https://registry.npmjs.org/gray-matter — gray-matter dist-tag (latest)
- https://registry.npmjs.org/yaml — yaml dist-tag (latest)
- https://registry.npmjs.org/dotenv — dotenv dist-tag (latest)
- https://github.com/privatenumber/tsx/releases — tsx latest
- https://github.com/egoist/tsup/releases — tsup latest
- https://github.com/vitest-dev/vitest/releases — vitest latest stable

---
*Stack research for: Notion workspace automation CLI*
*Researched: 2026-02-04*
