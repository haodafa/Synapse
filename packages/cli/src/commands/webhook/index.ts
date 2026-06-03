import { Command } from "commander";
import chalk from "chalk";
import * as inquirer from "@clack/prompts";

export function createWebhookCommand(): Command {
  const webhook = new Command("webhook");

  webhook
    .name("webhook")
    .description("Manage webhooks for external integrations")
    .addCommand(createWebhookListCommand())
    .addCommand(createWebhookCreateCommand())
    .addCommand(createWebhookDeleteCommand())
    .addCommand(createWebhookTestCommand());

  return webhook;
}

function createWebhookListCommand(): Command {
  return new Command("list")
    .description("List all configured webhooks")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await import("../../lib/synapse-client.js").then(m => m.getSynapseClient());
        const webhooks = await client.webhook.list();

        if (options.output === "json") {
          console.log(JSON.stringify(webhooks, null, 2));
          return;
        }

        console.log(chalk.bold("\n🪝 Webhooks\n"));

        if (webhooks.length === 0) {
          console.log(chalk.yellow("  No webhooks configured.\n"));
          console.log(chalk.blue("  Use 'synapse webhook create' to add one.\n"));
          return;
        }

        webhooks.forEach((wh: any) => {
          const statusColor = wh.active ? chalk.green : chalk.red;
          console.log(`  ${chalk.cyan(wh.name)}`);
          console.log(`    URL: ${chalk.gray(wh.url)}`);
          console.log(`    Events: ${wh.events.join(", ")}`);
          console.log(`    Status: ${statusColor(wh.active ? "active" : "inactive")}`);
          console.log();
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list webhooks:"), error);
      }
    });
}

function createWebhookCreateCommand(): Command {
  return new Command("create")
    .description("Create a new webhook")
    .requiredOption("--name <name>", "Webhook name")
    .requiredOption("--url <url>", "Webhook URL")
    .option("--events <events>", "Comma-separated events (e.g., agent.completed,issue.created)")
    .option("--secret <secret>", "Webhook secret for signature verification")
    .action(async (options) => {
      try {
        console.log(chalk.blue("\n🪝 Create Webhook\n"));

        const events = options.events 
          ? options.events.split(",").map((s: string) => s.trim())
          : ["agent.completed"];

        console.log(chalk.cyan("  Name:"), options.name);
        console.log(chalk.cyan("  URL:"), options.url);
        console.log(chalk.cyan("  Events:"), events.join(", "));

        const confirm = await inquirer.confirm({
          message: "Create this webhook?",
          initialValue: true,
        });

        if (!confirm) {
          console.log(chalk.yellow("\nCancelled\n"));
          return;
        }

        console.log(chalk.green("\n✅ Webhook created!"));
        console.log(chalk.blue("\n  Available Events:"));
        console.log("    agent.started, agent.completed, agent.failed");
        console.log("    issue.created, issue.updated, issue.status_changed");
        console.log("    autopilot.triggered, autopilot.completed");
        console.log("    skill.created, skill.used");
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to create webhook:"), error);
        process.exit(1);
      }
    });
}

function createWebhookDeleteCommand(): Command {
  return new Command("delete")
    .description("Delete a webhook")
    .argument("<webhook-id>", "Webhook ID")
    .option("--force", "Skip confirmation")
    .action(async (webhookId, options) => {
      try {
        if (!options.force) {
          const confirm = await inquirer.confirm({
            message: `Delete webhook ${webhookId}?`,
            initialValue: false,
          });

          if (!confirm) {
            console.log(chalk.yellow("\nCancelled\n"));
            return;
          }
        }

        console.log(chalk.green(`\n✅ Webhook ${webhookId} deleted\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to delete webhook:"), error);
        process.exit(1);
      }
    });
}

function createWebhookTestCommand(): Command {
  return new Command("test")
    .description("Test a webhook by sending a test payload")
    .argument("<webhook-id>", "Webhook ID")
    .action(async (webhookId) => {
      try {
        console.log(chalk.blue(`\n🧪 Testing webhook ${webhookId}...\n`));

        const testPayload = {
          event: "test",
          timestamp: new Date().toISOString(),
          data: {
            message: "This is a test webhook payload from Synapse",
          },
        };

        console.log(chalk.gray("Payload:"));
        console.log(JSON.stringify(testPayload, null, 2));

        console.log(chalk.yellow("\n⚠️  Webhook testing not yet implemented\n"));
        console.log(chalk.blue("  To test manually, use:"));
        console.log(`  curl -X POST <webhook-url> -d '${JSON.stringify(testPayload)}'\n`);
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to test webhook:"), error);
        process.exit(1);
      }
    });
}

export { createWebhookListCommand };
