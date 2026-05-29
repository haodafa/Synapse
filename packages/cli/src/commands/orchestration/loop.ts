import { Command } from "commander";
import chalk from "chalk";
import inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createLoopCommand(): Command {
  const loop = new Command("loop");

  loop
    .name("loop")
    .description("Automatically retry an agent task until acceptance criteria are met")
    .argument("<agent-id>", "Agent ID to loop")
    .option("--max <n>", "Maximum number of iterations", "10")
    .option("--delay <ms>", "Delay between iterations in ms", "1000")
    .option("--criteria <file>", "File containing acceptance criteria")
    .option("--verbose", "Show detailed output")
    .action(async (agentId, options) => {
      try {
        console.log(chalk.blue.bold("\n🔄 Agent Loop\n"));

        const client = await getSynapseClient();

        console.log(chalk.cyan(`Agent: ${agentId}`));
        console.log(chalk.cyan(`Max iterations: ${options.max}`));
        console.log(chalk.cyan(`Delay: ${options.delay}ms`));

        let criteria = "";
        if (options.criteria) {
          const fs = await import("node:fs");
          criteria = fs.readFileSync(options.criteria, "utf-8");
        } else {
          criteria = await loopUntil(
            "Enter acceptance criteria (one per line, empty line to finish):"
          );
        }

        if (!criteria.trim()) {
          console.log(chalk.yellow("\n⚠️  No acceptance criteria provided, loop will run without verification\n"));
        }

        console.log(chalk.blue("\n📋 Acceptance Criteria:"));
        console.log(criteria.split("\n").map((line) => `  • ${line}`).join("\n"));

        const confirm = await inquirer.confirm({
          message: "Start the loop?",
          initialValue: true,
        });

        if (!confirm) {
          console.log(chalk.yellow("\nCancelled\n"));
          return;
        }

        console.log(chalk.blue("\n🚀 Starting loop...\n"));

        const result = await client.orchestration.loop({
          agentId,
          maxIterations: parseInt(options.max),
          delayMs: parseInt(options.delay),
          criteria,
          verbose: options.verbose,
        });

        if (result.success) {
          console.log(chalk.green.bold("\n✅ Loop completed successfully!"));
          console.log(chalk.green(`   Iterations: ${result.iterations}`));
          console.log(chalk.green(`   Duration: ${result.duration}`));
        } else {
          console.log(chalk.red.bold("\n❌ Loop failed"));
          console.log(chalk.red(`   Reason: ${result.reason}`));
          console.log(chalk.red(`   Iterations: ${result.iterations}/${options.max}`));
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Loop error:"), error);
        process.exit(1);
      }
    });

  loop
    .command("status")
    .description("Check loop status")
    .argument("<loop-id>", "Loop ID")
    .action(async (loopId) => {
      try {
        const client = await getSynapseClient();
        const status = await client.orchestration.getLoopStatus(loopId);

        console.log(chalk.bold(`\n🔄 Loop: ${loopId}\n`));
        console.log(`  Status:      ${getStatusColor(status.status)(status.status)}`);
        console.log(`  Iteration:   ${status.currentIteration}/${status.maxIterations}`);
        console.log(`  Agent:       ${chalk.cyan(status.agentId)}`);

        if (status.lastResult) {
          console.log(`\n  Last Result:`);
          console.log(`    Success:   ${status.lastResult.success ? chalk.green("Yes") : chalk.red("No")}`);
          console.log(`    Message:   ${status.lastResult.message}`);
          if (status.lastResult.errors) {
            console.log(`    Errors:`);
            status.lastResult.errors.forEach((err: string) => {
              console.log(`      • ${err}`);
            });
          }
        }

        if (status.criteria) {
          console.log(`\n  Acceptance Criteria:`);
          console.log(`    ${status.criteria.split("\n").join("\n    ")}`);
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get loop status:"), error);
      }
    });

  loop
    .command("stop")
    .description("Stop a running loop")
    .argument("<loop-id>", "Loop ID")
    .action(async (loopId) => {
      try {
        const client = await getSynapseClient();
        await client.orchestration.stopLoop(loopId);
        console.log(chalk.green(`\n✓ Loop ${loopId} stopped\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to stop loop:"), error);
      }
    });

  loop
    .command("list")
    .description("List all loops")
    .option("--status <status>", "Filter by status: running, completed, failed, stopped")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const loops = await client.orchestration.listLoops(options);

        if (loops.length === 0) {
          console.log(chalk.yellow("\nNo loops found\n"));
          return;
        }

        console.log(chalk.bold("\n🔄 Loops:\n"));
        loops.forEach((l: any) => {
          const statusColor = getStatusColor(l.status);
          const progress = `${l.currentIteration}/${l.maxIterations}`;
          console.log(
            `  ${chalk.cyan(l.id)}  ${statusColor(l.status.padEnd(10))}  ` +
              `${progress.padEnd(8)}  ${l.agentId}`
          );
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list loops:"), error);
      }
    });

  return loop;
}

async function loopUntil(message: string): Promise<string> {
  const lines: string[] = [];
  let line = "";

  console.log(chalk.blue(`\n${message}`));
  console.log(chalk.gray("(Press Enter on empty line to finish)\n"));

  while (true) {
    line = await inquirer.text({
      message: "",
      placeholder: "",
    });

    if (line === "") {
      break;
    }

    lines.push(line);
  }

  return lines.join("\n");
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return chalk.green;
    case "failed":
      return chalk.red;
    case "running":
      return chalk.blue;
    case "stopped":
      return chalk.yellow;
    default:
      return chalk.white;
  }
}
