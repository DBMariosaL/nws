import { initWorkflow } from "../../workflow/init.js";
import { logResult } from "../../utils/logging.js";
export function registerInitCommand(program) {
    program
        .command("init")
        .description("Initialize the workspace flow")
        .action(async (_options, command) => {
        try {
            const options = command.optsWithGlobals();
            const result = await initWorkflow(options);
            if (result.status !== "ok") {
                logResult(result, options);
                process.exitCode = 1;
                return;
            }
            logResult(result, options);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logResult({
                command: "init",
                status: "error",
                message,
            }, command.optsWithGlobals());
            process.exitCode = 1;
        }
    });
}
