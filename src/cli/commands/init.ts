import { Command } from "commander";
import { initWorkflow } from "../../workflow/init.js";

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Initialize the workspace flow")
    .action(async (_options, command) => {
      try {
        const result = await initWorkflow(command.optsWithGlobals());
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
