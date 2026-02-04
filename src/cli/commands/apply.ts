import { Command } from "commander";
import prompts from "prompts";
import { logResult } from "../../utils/logging.js";
import { applyWorkflow } from "../../workflow/apply.js";

export function registerApplyCommand(program: Command): void {
  program
    .command("apply")
    .description("Apply the planned workspace changes")
    .action(async (_options, command) => {
      try {
        const options = command.optsWithGlobals() as {
          yes?: boolean;
          json?: boolean;
        };

        if (!options.yes) {
          if (!process.stdout.isTTY) {
            logResult(
              {
                command: "apply",
                status: "error",
                message: "Non-interactive mode detected. Re-run with --yes to apply.",
              },
              options
            );
            process.exitCode = 1;
            return;
          }

          const response = await prompts({
            type: "confirm",
            name: "proceed",
            message: "Apply changes?",
            initial: false,
          });

          if (!response.proceed) {
            logResult(
              {
                command: "apply",
                status: "error",
                message: "Apply cancelled.",
              },
              options
            );
            process.exitCode = 1;
            return;
          }
        }

        const result = await applyWorkflow(options);
        if (result.status !== "ok") {
          logResult(result, options);
          process.exitCode = 1;
          return;
        }
        logResult(result, options);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logResult(
          {
            command: "apply",
            status: "error",
            message,
          },
          command.optsWithGlobals() as { json?: boolean }
        );
        process.exitCode = 1;
      }
    });
}
