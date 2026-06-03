import { Command } from "commander";
import chalk from "chalk";
import * as inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createAdvisorCommand(): Command {
  const advisor = new Command("advisor");

  advisor
    .name("advisor")
    .description("Consult an advisor agent for guidance on a specific problem")
    .argument("<question>", "Question or problem to咨询")
    .option("--agent <name>", "Advisor agent name", "claude")
    .option("--context <file>", "File containing context")
    .option("--format <format>", "Response format: text, structured, json", "text")
    .action(async (question, options) => {
      try {
        console.log(chalk.blue.bold("\n🤖 Advisor Consultation\n"));

        const client = await getSynapseClient();

        console.log(chalk.cyan(`Question:`), question);
        console.log(chalk.cyan(`Advisor:`), options.agent);
        console.log(chalk.cyan(`Format:`), options.format);

        let context = "";
        if (options.context) {
          const fs = await import("node:fs");
          context = fs.readFileSync(options.context, "utf-8");
        } else {
          const addContext = await inquirer.confirm({
            message: "Add additional context?",
            initialValue: false,
          });

          if (addContext) {
            const ctxInput = await inquirer.text({
              message: "Enter context:",
              placeholder: "Paste relevant code, error messages, etc.",
            });
            if (typeof ctxInput === "string") {
              context = ctxInput;
            }
          }
        }

        console.log(chalk.blue("\n⏳ Consulting advisor...\n"));

        const result = await client.orchestration.advisor({
          question,
          agentName: options.agent,
          context,
          format: options.format as "text" | "structured" | "json",
        });

        if (options.format === "json") {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(chalk.bold("💡 Advisor Response:\n"));
          console.log(result.response);
        }

        if (result.suggestions && result.suggestions.length > 0) {
          console.log(chalk.bold("\n📋 Suggestions:\n"));
          result.suggestions.forEach((s: string, i: number) => {
            console.log(`  ${i + 1}. ${s}`);
          });
        }

        if (result.resources) {
          console.log(chalk.bold("\n📚 Resources:\n"));
          result.resources.forEach((r: any) => {
            console.log(`  • ${r.title}`);
            if (r.url) {
              console.log(`    ${r.url}`);
            }
          });
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Advisor error:"), error);
        process.exit(1);
      }
    });

  advisor
    .command("list")
    .description("List available advisor agents")
    .action(async () => {
      try {
        const client = await getSynapseClient();
        const advisors = await client.orchestration.listAdvisors();

        console.log(chalk.bold("\n🤖 Available Advisors:\n"));
        advisors.forEach((a: any) => {
          console.log(`  ${chalk.cyan(a.name)}`);
          console.log(`    ${a.description}`);
          console.log(`    Expertise: ${a.expertise.join(", ")}`);
          console.log();
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list advisors:"), error);
      }
    });

  advisor
    .command("register")
    .description("Register a new advisor agent")
    .option("--name <name>", "Advisor name")
    .option("--description <text>", "Advisor description")
    .option("--expertise <list>", "Comma-separated expertise areas")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();

        const nameInput =
          options.name ||
          (await inquirer.text({
            message: "Enter advisor name:",
            placeholder: "security-expert",
          }));
        const name = typeof nameInput === "string" ? nameInput : "";

        const descInput =
          options.description ||
          (await inquirer.text({
            message: "Enter description:",
            placeholder: "Expert in security best practices",
          }));
        const description = typeof descInput === "string" ? descInput : "";

        const expertiseInput =
          options.expertise ||
          (await inquirer.text({
            message: "Enter expertise areas (comma-separated):",
            placeholder: "security, cryptography, authentication",
          }));

        const expertise = typeof expertiseInput === "string"
          ? expertiseInput
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];

        const advisor = await client.orchestration.registerAdvisor({
          name,
          description,
          expertise,
        });

        console.log(chalk.green(`\n✓ Advisor registered: ${advisor.name}\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to register advisor:"), error);
      }
    });

  advisor
    .command("history")
    .description("View advisor consultation history")
    .option("--agent <name>", "Filter by advisor")
    .option("--limit <n>", "Number of results", "20")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const history = await client.orchestration.listAdvisorHistory({
          agentName: options.agent,
          limit: parseInt(options.limit),
        });

        if (history.length === 0) {
          console.log(chalk.yellow("\nNo advisor history found\n"));
          return;
        }

        console.log(chalk.bold("\n🤖 Advisor History:\n"));
        history.forEach((h: any) => {
          console.log(`  ${chalk.cyan(h.advisor)}`);
          console.log(`    Q: ${h.question.substring(0, 60)}...`);
          console.log(`    ${formatDate(h.timestamp)}`);
          console.log();
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list history:"), error);
      }
    });

  return advisor;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}
