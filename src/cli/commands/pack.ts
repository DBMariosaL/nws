import { Command } from "commander";
import { logResult } from "../../utils/logging.js";
import { installPack } from "../packs/install.js";

type PackInstallOptions = {
  target?: string;
  scope?: string;
  force?: boolean;
  json?: boolean;
};

export function registerPackCommand(program: Command): void {
  const pack = program.command("pack").description("Manage command packs");

  pack
    .command("install")
    .description("Install a command pack")
    .requiredOption("--target <target>", "Pack to install (opencode|claude)")
    .requiredOption("--scope <scope>", "Install scope (local|global)")
    .option("--force", "Overwrite existing pack files")
    .option("--json", "Output result as JSON")
    .action(async (_options, command) => {
      const options = command.optsWithGlobals() as PackInstallOptions;
      try {
        const target = normalizeTarget(options.target);
        const scope = normalizeScope(options.scope);
        const result = await installPack({
          target,
          scope,
          force: options.force ?? false,
        });

        logResult(
          {
            command: "pack install",
            status: "ok",
            message: `Installed ${result.pack.name} (${result.pack.target}) to ${result.scope}.`,
            installedPaths: result.installedPaths,
          },
          options
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logResult(
          {
            command: "pack install",
            status: "error",
            message,
          },
          options
        );
        process.exitCode = 1;
      }
    });
}

function normalizeTarget(value?: string): "opencode" | "claude" {
  if (value === "opencode" || value === "claude") {
    return value;
  }
  throw new Error("Invalid --target. Use opencode or claude.");
}

function normalizeScope(value?: string): "local" | "global" {
  if (value === "local" || value === "global") {
    return value;
  }
  throw new Error("Invalid --scope. Use local or global.");
}
