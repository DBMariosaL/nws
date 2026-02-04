import envPaths from "env-paths";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type ClaudeFrontmatter,
  type PackCommand,
  type PackDefinition,
  type PackTarget,
  PackDefinitionSchema,
} from "./schema.js";

export type PackInstallScope = "local" | "global";

export type PackInstallResult = {
  pack: PackDefinition;
  scope: PackInstallScope;
  installedPaths: string[];
};

export type PackInstallOptions = {
  target: PackTarget;
  scope: PackInstallScope;
  force?: boolean;
};

const packFileUrls: Record<PackTarget, URL> = {
  opencode: new URL("../../../packs/opencode/pack.md", import.meta.url),
  claude: new URL("../../../packs/claude-code/pack.md", import.meta.url),
};

export async function installPack(
  options: PackInstallOptions
): Promise<PackInstallResult> {
  const packPath = fileURLToPath(packFileUrls[options.target]);
  const pack = await loadPackDefinition(packPath);
  const basePath = await resolveInstallBase(options.target, options.scope);
  const installedPaths: string[] = [];

  for (const command of pack.commands) {
    const destination = path.join(basePath, command.destination);
    await ensureWritable(destination, options.force ?? false);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const content = renderCommandContent(pack.target, command);
    await fs.writeFile(destination, content, "utf8");
    installedPaths.push(destination);
  }

  return {
    pack,
    scope: options.scope,
    installedPaths,
  };
}

async function loadPackDefinition(packPath: string): Promise<PackDefinition> {
  const raw = await fs.readFile(packPath, "utf8");
  const parsed = extractFrontmatterJson(raw, packPath);
  return PackDefinitionSchema.parse(parsed);
}

function extractFrontmatterJson(contents: string, packPath: string): unknown {
  const match = contents.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*/);
  if (!match) {
    throw new Error(`Pack definition missing frontmatter in ${packPath}.`);
  }

  const raw = match[1].trim();
  if (!raw) {
    throw new Error(`Pack frontmatter is empty in ${packPath}.`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON frontmatter in ${packPath}: ${message}`);
  }
}

async function resolveInstallBase(
  target: PackTarget,
  scope: PackInstallScope
): Promise<string> {
  if (target === "opencode") {
    if (scope === "local") {
      return path.join(process.cwd(), ".opencode", "commands");
    }

    const xdgBase = envPaths("opencode").config;
    const legacyBase = path.join(os.homedir(), ".opencode");
    const base = (await pathExists(legacyBase)) ? legacyBase : xdgBase;
    return path.join(base, "commands");
  }

  if (scope === "local") {
    return path.join(process.cwd(), ".claude", "skills");
  }

  return path.join(os.homedir(), ".claude", "skills");
}

function renderCommandContent(target: PackTarget, command: PackCommand): string {
  const body = normalizeBody(command.body);
  if (target === "claude") {
    const frontmatter = renderClaudeFrontmatter(command.frontmatter as ClaudeFrontmatter);
    return `${frontmatter}\n\n${body}`;
  }
  return body;
}

function renderClaudeFrontmatter(frontmatter: ClaudeFrontmatter): string {
  const lines: string[] = ["---"];
  const entries: Array<[string, unknown]> = [
    ["name", frontmatter.name],
    ["description", frontmatter.description],
    ["argument-hint", frontmatter["argument-hint"]],
    ["disable-model-invocation", frontmatter["disable-model-invocation"]],
    ["user-invocable", frontmatter["user-invocable"]],
    ["allowed-tools", frontmatter["allowed-tools"]],
    ["model", frontmatter.model],
    ["context", frontmatter.context],
    ["agent", frontmatter.agent],
    ["hooks", frontmatter.hooks],
  ];

  for (const [key, value] of entries) {
    if (value === undefined) {
      continue;
    }
    lines.push(`${key}: ${formatYamlValue(value)}`);
  }

  lines.push("---");
  return lines.join("\n");
}

function formatYamlValue(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (value === null) {
    return "null";
  }
  return JSON.stringify(value);
}

function normalizeBody(body: string): string {
  const trimmed = body.trimEnd();
  return `${trimmed}\n`;
}

async function ensureWritable(
  destination: string,
  force: boolean
): Promise<void> {
  if (await pathExists(destination)) {
    if (!force) {
      throw new Error(
        `Pack file already exists at ${destination}. Re-run with --force to overwrite.`
      );
    }
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}
