import { Command } from "commander";
import { applyWorkflow } from "../../workflow/apply.js";

export function registerApplyCommand(program: Command): void {
  program
    .command("apply")
    .description("Apply the planned workspace changes")
    .action(async (_options, command) => {
      try {
        const result = await applyWorkflow(command.optsWithGlobals());
        if (result.status !== "ok") {
          console.error(result.message);
          process.exitCode = 1;
          return;
        }
        console.log(result.message);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
        process.exitCode = 1;
      }
    });
}
