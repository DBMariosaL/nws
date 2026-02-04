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

## Claude Code Command Packs

### Sources

- https://code.claude.com/docs/en/skills.md
- https://code.claude.com/docs/en/plugins-reference.md

### Pack Format

- **Preferred type (skills):** A directory per skill with a required `SKILL.md` file.
- **Legacy type (commands):** `.claude/commands/<name>.md` still works and supports the same frontmatter as skills.
- **Entrypoint:** `SKILL.md` contains YAML frontmatter between `---` markers plus markdown instructions.
- **Frontmatter keys (documented):** `name`, `description`, `argument-hint`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `model`, `context`, `agent`, `hooks`.
- **Command syntax:** Skills are invoked as `/skill-name`. Arguments are passed via `$ARGUMENTS`, `$ARGUMENTS[N]`, or `$N` substitutions.

### Install Locations (Local vs Global)

- **Global (personal):** `~/.claude/skills/<skill-name>/SKILL.md`
- **Local (project):** `.claude/skills/<skill-name>/SKILL.md`
- **Plugin scope (optional):** `<plugin>/skills/<skill-name>/SKILL.md` with manifest at `.claude-plugin/plugin.json` (namespaced as `/plugin-name:skill-name`).

### Version / Format Constraints

- Skills follow the Agent Skills standard and Claude Code adds extra frontmatter fields; no explicit version pin is required for plain `.claude/skills` usage.

## OpenCode vs Claude Code (Key Differences)

- **Structure:** OpenCode uses single markdown files in a `commands/` folder; Claude Code uses skill directories with `SKILL.md` and optional supporting files.
- **Metadata:** OpenCode does not document required frontmatter; Claude Code documents YAML frontmatter fields for skill behavior.
- **Invocation:** OpenCode commands are referenced by `user:`/`project:` IDs; Claude Code uses `/slash` commands (optionally namespaced for plugins).
- **Scopes:** OpenCode distinguishes user vs project commands by install path; Claude Code distinguishes personal vs project skills and adds plugin/enterprise scopes.
