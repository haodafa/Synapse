import { Command } from "commander";
import chalk from "chalk";
import inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createHandoffCommand(): Command {
  const handoff = new Command("handoff");

  handoff
    .name("handoff")
    .description("Hand off a task from one agent to another with context preservation")
    .argument("<from-agent-id>", "Source agent ID")
    .argument("<to-agent-id>", "Target agent ID")
    .option("--context <file>", "File containing context to preserve")
    .option("--message <text>", "Handoff message")
    .option("--wait", "Wait for handoff completion")
    .action(async (fromAgentId, toAgentId, options) => {
      try {
        console.log(chalk.blue.bold("\n🔀 Agent Handoff\n"));

        const client = await getSynapseClient();

        let context = "";
        if (options.context) {
          const fs = await import("node:fs");
          context = fs.readFileSync(options.context, "utf-8");
        }

        console.log(chalk.cyan(`From: ${fromAgentId}`));
        console.log(chalk.cyan(`To: ${toAgentId}`));

        const handoffMessage =
          options.message ||
          (
            await inquirer.text({
              message: "Enter handoff message:",
              placeholder: "Describe what needs to be done...",
            })
          );

        console.log(chalk.blue("\n📤 Creating handoff..."));

        const result = await client.orchestration.handoff({
          fromAgentId,
          toAgentId,
          context,
          message: handoffMessage,
        });

        console.log(chalk.green(`✓ Handoff created: ${result.id}`));
        console.log(chalk.blue(`  Status: ${result.status}`));

        if (options.wait) {
          console.log(chalk.blue("\n⏳ Waiting for handoff completion..."));
          await client.orchestration.waitForHandoff(result.id);
          console.log(chalk.green("✓ Handoff completed"));
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Handoff failed:"), error);
        process.exit(1);
      }
    });

  handoff
    .command("list")
    .description("List all handoffs")
    .option("--status <status>", "Filter by status: pending, in_progress, completed, failed")
    .option("--from <agent-id>", "Filter by source agent")
    .option("--to <agent-id>", "Filter by target agent")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const handoffs = await client.orchestration.listHandoffs(options);

        if (handoffs.length === 0) {
          console.log(chalk.yellow("\nNo handoffs found\n"));
          return;
        }

        console.log(chalk.bold("\n🔀 Handoffs:\n"));
        handoffs.forEach((h: any) => {
          const statusColor = getStatusColor(h.status);
          console.log(
            `  ${chalk.cyan(h.id)}  ${statusColor(h.status.padEnd(12))}  ` +
              `${h.fromAgent} → ${h.toAgent}`
          );
          if (h.message) {
            console.log(`         ${h.message.substring(0, 60)}...`);
          }
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list handoffs:"), error);
      }
    });

  handoff
    .command("status")
    .description("Get handoff status")
    .argument("<handoff-id>", "Handoff ID")
    .action(async (handoffId) => {
      try {
        const client = await getSynapseClient();
        const handoff = await client.orchestration.getHandoff(handoffId);

        console.log(chalk.bold(`\n🔀 Handoff: ${handoff.id}\n`));
        console.log(`  Status:    ${getStatusColor(handoff.status)(handoff.status)}`);
        console.log(`  From:      ${chalk.cyan(handoff.fromAgent)}`);
        console.log(`  To:        ${chalk.cyan(handoff.toAgent)}`);
        console.log(`  Message:   ${handoff.message}`);
        console.log(`  Created:   ${handoff.createdAt}`);
        if (handoff.completedAt) {
          console.log(`  Completed: ${handoff.completedAt}`);
        }
        if (handoff.context) {
          console.log(`\n  Context:\n${handoff.context}`);
        }
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get handoff:"), error);
      }
    });

  return handoff;
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return chalk.green;
    case "failed":
      return chalk.red;
    case "in_progress":
      return chalk.blue;
    case "pending":
      return chalk.yellow;
    default:
      return chalk.white;
  }
}
