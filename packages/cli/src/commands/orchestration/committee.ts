import { Command } from "commander";
import chalk from "chalk";
import * as inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createCommitteeCommand(): Command {
  const committee = new Command("committee");

  committee
    .name("committee")
    .description("Run a committee of agents with different perspectives to reach consensus")
    .argument("<task>", "Task description")
    .option("--agents <names>", "Comma-separated list of agent names")
    .option("--perspectives <list>", "Comma-separated list of perspectives (e.g., security,performance,maintainability)")
    .option("--mode <mode>", "Decision mode: unanimous, majority, any", "majority")
    .option("--timeout <seconds>", "Timeout per agent in seconds", "300")
    .option("--verbose", "Show detailed output")
    .action(async (task, options) => {
      try {
        console.log(chalk.blue.bold("\n👥 Agent Committee\n"));

        const client = await getSynapseClient();

        let agentNames: string[] = [];
        if (options.agents) {
          agentNames = options.agents.split(",").map((s: string) => s.trim());
        } else {
          const input = await inquirer.text({
            message: "Enter agent names (comma-separated):",
            placeholder: "claude,codex,gemini",
          });
          if (typeof input === "string") {
            agentNames = input.split(",").map((s: string) => s.trim());
          }
        }

        let perspectives: string[] = [];
        if (options.perspectives) {
          perspectives = options.perspectives.split(",").map((s: string) => s.trim());
        } else {
          const input = await inquirer.text({
            message: "Enter perspectives (comma-separated):",
            placeholder: "security,performance,maintainability",
          });
          if (typeof input === "string") {
            perspectives = input.split(",").map((s: string) => s.trim());
          }
        }

        if (agentNames.length !== perspectives.length) {
          console.log(
            chalk.yellow(
              `\n⚠️  Warning: ${agentNames.length} agents but ${perspectives.length} perspectives`
            )
          );
          console.log(
            chalk.yellow("   Each agent will be assigned a perspective in order\n")
          );
        }

        console.log(chalk.cyan("Task:"), task);
        console.log(chalk.cyan("Mode:"), options.mode);
        console.log(chalk.cyan("Timeout:"), `${options.timeout}s\n`);

        console.log(chalk.bold("Committee Members:\n"));
        agentNames.forEach((name, i) => {
          const perspective = perspectives[i] || perspectives[i % perspectives.length];
          console.log(`  ${chalk.cyan(name)} - ${chalk.yellow(perspective)} perspective`);
        });

        const confirm = await inquirer.confirm({
          message: "Start the committee?",
          initialValue: true,
        });

        if (!confirm) {
          console.log(chalk.yellow("\nCancelled\n"));
          return;
        }

        console.log(chalk.blue("\n🚀 Starting committee deliberation...\n"));

        const agents = agentNames.map((name, i) => ({
          name,
          perspective: perspectives[i] || perspectives[i % perspectives.length],
        }));

        const result = await client.orchestration.committee({
          task,
          agents,
          mode: options.mode as "unanimous" | "majority" | "any",
          timeoutSeconds: parseInt(options.timeout),
          verbose: options.verbose,
        });

        console.log(chalk.bold("\n📊 Committee Results:\n"));

        result.deliberations.forEach((d: any) => {
          const verdict = d.verdict ? chalk.green("AGREE") : chalk.red("DISAGREE");
          console.log(
            `  ${chalk.cyan(d.agent)} (${d.perspective}): ${verdict}`
          );
          if (options.verbose && d.reasoning) {
            console.log(`    Reasoning: ${d.reasoning}`);
          }
        });

        console.log(chalk.bold("\n🎯 Consensus Decision:"));

        if (result.consensus.decision === "approved") {
          console.log(chalk.green.bold("  ✅ APPROVED"));
        } else if (result.consensus.decision === "rejected") {
          console.log(chalk.red.bold("  ❌ REJECTED"));
        } else {
          console.log(chalk.yellow.bold("  ⚠️  NO CONSENSUS"));
        }

        if (result.consensus.summary) {
          console.log(chalk.blue("\nSummary:"), result.consensus.summary);
        }

        if (result.consensus.actionItems && result.consensus.actionItems.length > 0) {
          console.log(chalk.blue("\nAction Items:"));
          result.consensus.actionItems.forEach((item: string, i: number) => {
            console.log(`  ${i + 1}. ${item}`);
          });
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Committee error:"), error);
        process.exit(1);
      }
    });

  committee
    .command("templates")
    .description("List available committee templates")
    .action(async () => {
      try {
        const templates = [
          {
            name: "code-review",
            description: "Review code from security, performance, and maintainability perspectives",
            agents: ["claude", "codex", "gemini"],
            perspectives: ["security", "performance", "maintainability"],
          },
          {
            name: "architecture",
            description: "Evaluate architecture proposals from multiple angles",
            agents: ["claude", "gemini", "pi"],
            perspectives: ["scalability", "cost", "complexity"],
          },
          {
            name: "testing",
            description: "Design test strategies covering different scenarios",
            agents: ["claude", "codex"],
            perspectives: ["coverage", "edge cases", "usability"],
          },
        ];

        console.log(chalk.bold("\n📋 Committee Templates:\n"));
        templates.forEach((t) => {
          console.log(`  ${chalk.cyan(t.name)}`);
          console.log(`    ${t.description}`);
          console.log(
            `    Agents: ${t.agents.join(", ")}`
          );
          console.log(
            `    Perspectives: ${t.perspectives.join(", ")}\n`
          );
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list templates:"), error);
      }
    });

  committee
    .command("history")
    .description("List committee deliberation history")
    .option("--limit <n>", "Number of results to show", "20")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const history = await client.orchestration.listCommitteeHistory({
          limit: parseInt(options.limit),
        });

        if (history.length === 0) {
          console.log(chalk.yellow("\nNo committee history found\n"));
          return;
        }

        console.log(chalk.bold("\n👥 Committee History:\n"));
        history.forEach((h: any) => {
          const verdict = h.decision === "approved" ? chalk.green("✓") : chalk.red("✗");
          console.log(
            `  ${verdict} ${chalk.cyan(h.id)}  ${h.task.substring(0, 50)}...`
          );
          console.log(
            `         ${h.agents.length} agents  ${formatDate(h.createdAt)}`
          );
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list history:"), error);
      }
    });

  return committee;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}
