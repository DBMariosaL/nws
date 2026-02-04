# Phase 1: CLI & Workflow Shell - Discovery

**Researched:** 2026-02-04
**Focus:** Command pack formats and install locations

## OpenCode Command Packs

### Sources

- https://raw.githubusercontent.com/opencode-ai/opencode/main/README.md

### Pack Format

- **Type:** Markdown file per command (no manifest file mentioned).
- **Entrypoint:** Each `.md` file in a commands directory becomes a command; filename (without extension) becomes the command ID.
- **Namespaces:** Subdirectories are supported; e.g. `~/.config/opencode/commands/git/commit.md` becomes `user:git:commit`.
- **Command syntax:** Example commands are plain markdown with instruction lines like `RUN ...` and `READ ...` (no formal schema or frontmatter keys are documented).
- **Arguments:** Named placeholders use `$NAME` (uppercase letters, numbers, underscores; must start with a letter). Values are prompted at run time.

### Install Locations (Local vs Global)

- **Global (user):**
  - `$XDG_CONFIG_HOME/opencode/commands/` (typically `~/.config/opencode/commands/`)
  - or `$HOME/.opencode/commands/`
- **Local (project):**
  - `<PROJECT DIR>/.opencode/commands/`

### Version / Format Constraints

- No versioned schema or frontmatter requirements are specified in the official README.
