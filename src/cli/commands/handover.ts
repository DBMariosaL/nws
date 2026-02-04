import { Command } from "commander";
import { handoverWorkflow } from "../../workflow/handover.js";

export function registerHandoverCommand(program: Command): void {
  program
    .command("handover")
    .description("Package results for handover")
    .action(async (_options, command) => {
      try {
        const result = await handoverWorkflow(command.optsWithGlobals());
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
