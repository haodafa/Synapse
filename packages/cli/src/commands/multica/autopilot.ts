import { Command } from "commander";
import chalk from "chalk";
import { getMulticaClient } from "../../lib/multica-client.js";

export function createAutopilotCommand(): Command {
  const autopilot = new Command("autopilot");
  
  autopilot.description("Manage scheduled automations (Autopilots)");

  autopilot
    .command("list")
    .description("List all autopilots")
    .option("--status <status>", "Filter by status: active, paused")
    .option("--full-id", "Show full autopilot IDs")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await getMulticaClient();
        const autopilots = await client.autopilot.list(options);
        
        if (options.output === "json") {
          console.log(JSON.stringify(autopilots, null, 2));
          return;
        }

        console.log(chalk.bold("\nAutopilots:\n"));
        autopilots.forEach((ap: any) => {
          const id = options.fullId ? ap.id : ap.id.substring(0, 8);
          const statusColor = ap.status === "active" ? chalk.green : chalk.yellow;
          console.log(`  ${chalk.cyan(id)}  ${statusColor(ap.status.padEnd(8))}  ${ap.title}`);
          console.log(`         Agent: ${chalk.yellow(ap.agent)}`);
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list autopilots:"), error);
      }
    });

  autopilot
    .command("get")
    .description("Get autopilot details")
    .argument("<id>", "Autopilot ID")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (id: string, options) => {
      try {
        const client = await getMulticaClient();
        const ap = await client.autopilot.get(id);
        
        if (options.output === "json") {
          console.log(JSON.stringify(ap, null, 2));
          return;
        }

        console.log(chalk.bold(`\nAutopilot: ${ap.title}\n`));
        console.log(`  ID:          ${ap.id}`);
        console.log(`  Status:      ${ap.status === "active" ? chalk.green(ap.status) : chalk.yellow(ap.status)}`);
        console.log(`  Agent:       ${chalk.yellow(ap.agent)}`);
        console.log(`  Mode:        ${ap.mode}`);
        console.log(`  Created:     ${ap.createdAt}`);
        
        if (ap.triggers && ap.triggers.length > 0) {
          console.log(`\n  Triggers:`);
          ap.triggers.forEach((t: any) => {
            if (t.type === "schedule") {
              console.log(`    - ${chalk.cyan("cron")}: ${t.cron} (${t.timezone})`);
            }
          });
        }
        
        console.log(`\n  Description:\n  ${ap.description || "N/A"}\n`);
      } catch (error) {
        console.error(chalk.red("Failed to get autopilot:"), error);
      }
    });

  autopilot
    .command("create")
    .description("Create a new autopilot")
    .requiredOption("--title <title>", "Autopilot title")
    .option("--description <text>", "Autopilot description")
    .requiredOption("--agent <name>", "Agent name to run the autopilot")
    .option("--mode <mode>", "Execution mode: create_issue (default)", "create_issue")
    .action(async (options) => {
      try {
        const client = await getMulticaClient();
        const ap = await client.autopilot.create(options);
        console.log(chalk.green(`✓ Created autopilot ${chalk.cyan(ap.title)}`));
        console.log(chalk.blue(`  ID: ${ap.id}`));
      } catch (error) {
        console.error(chalk.red("Failed to create autopilot:"), error);
      }
    });

  autopilot
    .command("update")
    .description("Update an autopilot")
    .argument("<id>", "Autopilot ID")
    .option("--title <title>", "New title")
    .option("--description <text>", "New description")
    .option("--agent <name>", "New agent")
    .option("--status <status>", "New status: active, paused")
    .action(async (id: string, options) => {
      try {
        const client = await getMulticaClient();
        await client.autopilot.update(id, options);
        console.log(chalk.green(`✓ Updated autopilot ${chalk.cyan(id)}`));
      } catch (error) {
        console.error(chalk.red("Failed to update autopilot:"), error);
      }
    });

  autopilot
    .command("delete")
    .description("Delete an autopilot")
    .argument("<id>", "Autopilot ID")
    .option("--force", "Skip confirmation")
    .action(async (id: string, options) => {
      try {
        if (!options.force) {
          console.log(chalk.yellow(`Are you sure you want to delete autopilot ${id}?`));
          console.log(chalk.yellow("This action cannot be undone."));
          console.log(chalk.yellow("Use --force to skip this confirmation."));
          return;
        }
        
        const client = await getMulticaClient();
        await client.autopilot.delete(id);
        console.log(chalk.green(`✓ Deleted autopilot ${chalk.cyan(id)}`));
      } catch (error) {
        console.error(chalk.red("Failed to delete autopilot:"), error);
      }
    });

  autopilot
    .command("trigger")
    .description("Manually trigger an autopilot")
    .argument("<id>", "Autopilot ID")
    .action(async (id: string) => {
      try {
        const client = await getMulticaClient();
        const run = await client.autopilot.trigger(id);
        console.log(chalk.green(`✓ Triggered autopilot ${chalk.cyan(id)}`));
        console.log(chalk.blue(`  Run ID: ${run.id}`));
      } catch (error) {
        console.error(chalk.red("Failed to trigger autopilot:"), error);
      }
    });

  autopilot
    .command("runs")
    .description("List execution runs for an autopilot")
    .argument("<id>", "Autopilot ID")
    .option("--limit <n>", "Limit number of results", "50")
    .action(async (id: string, options) => {
      try {
        const client = await getMulticaClient();
        const runs = await client.autopilot.runs(id, options.limit);
        
        console.log(chalk.bold(`\nAutopilot runs for ${id}:\n`));
        runs.forEach((run: any) => {
          const statusColor = run.status === "completed" ? chalk.green : 
                            run.status === "failed" ? chalk.red : chalk.yellow;
          console.log(`  ${chalk.cyan(run.id.substring(0, 8))}  ${statusColor(run.status.padEnd(12))}  ${run.triggeredAt}`);
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list runs:"), error);
      }
    });

  // Trigger management
  const trigger = autopilot.command("trigger-add")
    .description("Add a schedule trigger to an autopilot")
    .argument("<autopilot-id>", "Autopilot ID")
    .requiredOption("--cron <expression>", "Cron expression (e.g., '0 9 * * 1-5')")
    .requiredOption("--timezone <tz>", "Timezone (e.g., America/New_York)");

  trigger.action(async (autopilotId: string, options) => {
    try {
      const client = await getMulticaClient();
      const trigger = await client.autopilot.addTrigger(autopilotId, {
        type: "schedule",
        cron: options.cron,
        timezone: options.timezone,
      });
      console.log(chalk.green(`✓ Added trigger to autopilot ${chalk.cyan(autopilotId)}`));
      console.log(chalk.blue(`  Trigger ID: ${trigger.id}`));
    } catch (error) {
      console.error(chalk.red("Failed to add trigger:"), error);
    }
  });

  autopilot
    .command("trigger-update")
    .description("Update a schedule trigger")
    .argument("<autopilot-id>", "Autopilot ID")
    .argument("<trigger-id>", "Trigger ID")
    .option("--cron <expression>", "New cron expression")
    .option("--timezone <tz>", "New timezone")
    .option("--enabled <bool>", "Enable/disable: true, false")
    .action(async (autopilotId: string, triggerId: string, options) => {
      try {
        const client = await getMulticaClient();
        await client.autopilot.updateTrigger(autopilotId, triggerId, options);
        console.log(chalk.green(`✓ Updated trigger ${chalk.cyan(triggerId)}`));
      } catch (error) {
        console.error(chalk.red("Failed to update trigger:"), error);
      }
    });

  autopilot
    .command("trigger-delete")
    .description("Delete a schedule trigger")
    .argument("<autopilot-id>", "Autopilot ID")
    .argument("<trigger-id>", "Trigger ID")
    .action(async (autopilotId: string, triggerId: string) => {
      try {
        const client = await getMulticaClient();
        await client.autopilot.deleteTrigger(autopilotId, triggerId);
        console.log(chalk.green(`✓ Deleted trigger ${chalk.cyan(triggerId)}`));
      } catch (error) {
        console.error(chalk.red("Failed to delete trigger:"), error);
      }
    });

  return autopilot;
}
