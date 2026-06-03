import { Command } from "commander";
import chalk from "chalk";
import * as inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createScheduleCommand(): Command {
  const schedule = new Command("schedule");

  schedule
    .name("schedule")
    .description("Schedule agents to run at specific times or intervals")
    .addCommand(createScheduleCreateCommand())
    .addCommand(createScheduleListCommand())
    .addCommand(createScheduleDeleteCommand())
    .addCommand(createSchedulePauseCommand())
    .addCommand(createScheduleResumeCommand());

  return schedule;
}

function createScheduleCreateCommand(): Command {
  return new Command("create")
    .description("Create a new scheduled task")
    .requiredOption("--name <name>", "Schedule name")
    .requiredOption("--agent <agent-name>", "Agent name to run")
    .requiredOption("--prompt <prompt>", "Task prompt")
    .requiredOption("--cron <expression>", "Cron expression (e.g., '0 9 * * 1-5')")
    .option("--timezone <tz>", "Timezone (e.g., America/New_York)", "UTC")
    .option("--enabled", "Enable immediately", true)
    .option("--description <text>", "Schedule description")
    .action(async (options) => {
      try {
        console.log(chalk.blue("\n📅 Create Scheduled Task\n"));

        console.log(chalk.cyan("  Name:"), options.name);
        console.log(chalk.cyan("  Agent:"), options.agent);
        console.log(chalk.cyan("  Prompt:"), options.prompt);
        console.log(chalk.cyan("  Cron:"), options.cron);
        console.log(chalk.cyan("  Timezone:"), options.timezone);

        if (!isValidCron(options.cron)) {
          console.log(chalk.yellow("\n⚠️  Warning: The cron expression might not be valid"));
        }

        const confirm = await inquirer.confirm({
          message: "Create this schedule?",
          initialValue: true,
        });

        if (!confirm) {
          console.log(chalk.yellow("\nCancelled\n"));
          return;
        }

        const client = await getSynapseClient();

        const autopilot = await client.autopilot.create({
          title: options.name,
          description: options.description || options.name,
          agent: options.agent,
          mode: "scheduled_task",
          triggers: [
            {
              type: "schedule",
              cron: options.cron,
              timezone: options.timezone,
              enabled: options.enabled,
            },
          ],
        });

        console.log(chalk.green("\n✅ Schedule created successfully!"));
        console.log(chalk.blue("   ID:"), autopilot.id);
        console.log(chalk.blue("   Next run:"), formatNextRun(options.cron, options.timezone));
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to create schedule:"), error);
        process.exit(1);
      }
    });
}

function createScheduleListCommand(): Command {
  return new Command("list")
    .description("List all scheduled tasks")
    .option("--status <status>", "Filter by status: active, paused")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const autopilots = await client.autopilot.list({
          status: options.status,
        });

        const scheduledTasks = autopilots.filter(
          (a: any) => a.mode === "scheduled_task"
        );

        if (options.output === "json") {
          console.log(JSON.stringify(scheduledTasks, null, 2));
          return;
        }

        console.log(chalk.bold(`\n📅 Scheduled Tasks (${scheduledTasks.length})\n`));

        if (scheduledTasks.length === 0) {
          console.log(chalk.yellow("  No scheduled tasks found.\n"));
          return;
        }

        scheduledTasks.forEach((task: any) => {
          const trigger = task.triggers?.[0];
          const statusColor = task.status === "active" ? chalk.green : chalk.yellow;
          
          console.log(`  ${chalk.cyan(task.title)}`);
          console.log(`    ID: ${chalk.gray(task.id)}`);
          console.log(`    Agent: ${chalk.blue(task.agent)}`);
          if (trigger?.cron) {
            console.log(`    Schedule: ${chalk.yellow(trigger.cron)} (${trigger.timezone})`);
            console.log(`    Next: ${chalk.green(formatNextRun(trigger.cron, trigger.timezone))}`);
          }
          console.log(`    Status: ${statusColor(task.status)}`);
          console.log(`    Runs: ${chalk.blue(task.runCount || 0)}`);
          console.log();
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list schedules:"), error);
      }
    });
}

function createScheduleDeleteCommand(): Command {
  return new Command("delete")
    .description("Delete a scheduled task")
    .argument("<schedule-id>", "Schedule ID")
    .option("--force", "Skip confirmation")
    .action(async (scheduleId, options) => {
      try {
        if (!options.force) {
          const confirm = await inquirer.confirm({
            message: `Delete schedule ${scheduleId}?`,
            initialValue: false,
          });

          if (!confirm) {
            console.log(chalk.yellow("\nCancelled\n"));
            return;
          }
        }

        const client = await getSynapseClient();
        await client.autopilot.delete(scheduleId);

        console.log(chalk.green(`\n✅ Schedule ${scheduleId} deleted\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to delete schedule:"), error);
        process.exit(1);
      }
    });
}

function createSchedulePauseCommand(): Command {
  return new Command("pause")
    .description("Pause a scheduled task")
    .argument("<schedule-id>", "Schedule ID")
    .action(async (scheduleId) => {
      try {
        const client = await getSynapseClient();
        
        const autopilot = await client.autopilot.get(scheduleId);
        
        await client.autopilot.update(scheduleId, {
          status: "paused",
        });

        console.log(chalk.green(`\n✅ Schedule ${autopilot.title} paused\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to pause schedule:"), error);
        process.exit(1);
      }
    });
}

function createScheduleResumeCommand(): Command {
  return new Command("resume")
    .description("Resume a paused scheduled task")
    .argument("<schedule-id>", "Schedule ID")
    .action(async (scheduleId) => {
      try {
        const client = await getSynapseClient();
        
        const autopilot = await client.autopilot.get(scheduleId);
        
        await client.autopilot.update(scheduleId, {
          status: "active",
        });

        console.log(chalk.green(`\n✅ Schedule ${autopilot.title} resumed\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to resume schedule:"), error);
        process.exit(1);
      }
    });
}

function isValidCron(cron: string): boolean {
  const parts = cron.trim().split(/\s+/);
  return parts.length === 5;
}

function formatNextRun(_cron: string, _timezone: string): string {
  try {
    return `in approximately ${chalk.yellow("1h")} (cron parsing not implemented)`;
  } catch {
    return "Unknown";
  }
}

export { createScheduleCreateCommand };
