import { planWorkflow } from "../../workflow/plan.js";
export function registerPlanCommand(program) {
    program
        .command("plan")
        .description("Plan the workspace build")
        .action(async (_options, command) => {
        try {
            const result = await planWorkflow(command.optsWithGlobals());
            if (result.status !== "ok") {
                console.error(result.message);
                process.exitCode = 1;
                return;
            }
            console.log(result.message);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(message);
            process.exitCode = 1;
        }
    });
}
