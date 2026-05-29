import { Command } from "commander";
import { createHandoffCommand } from "./handoff.js";
import { createLoopCommand } from "./loop.js";
import { createCommitteeCommand } from "./committee.js";
import { createAdvisorCommand } from "./advisor.js";

export function createOrchestrationCommand(): Command {
  const orchestration = new Command("orchestration");

  orchestration
    .name("orchestration")
    .description("Advanced multi-agent orchestration commands")
    .addCommand(createHandoffCommand())
    .addCommand(createLoopCommand())
    .addCommand(createCommitteeCommand())
    .addCommand(createAdvisorCommand());

  return orchestration;
}

export { createHandoffCommand, createLoopCommand, createCommitteeCommand, createAdvisorCommand };
