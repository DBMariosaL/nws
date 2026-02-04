#!/usr/bin/env node
import { Command } from "commander";
import { registerApplyCommand } from "./commands/apply.js";
import { registerHandoverCommand } from "./commands/handover.js";
import { registerInitCommand } from "./commands/init.js";
import { registerPackCommand } from "./commands/pack.js";
import { registerPlanCommand } from "./commands/plan.js";

const program = new Command();

program
  .name("nws")
  .description("Notion workspace shell CLI")
  .option("-y, --yes", "Assume yes for all prompts")
  .option("--json", "Output result as JSON");

registerInitCommand(program);
registerPlanCommand(program);
registerApplyCommand(program);
registerHandoverCommand(program);
registerPackCommand(program);

program.parseAsync(process.argv);
