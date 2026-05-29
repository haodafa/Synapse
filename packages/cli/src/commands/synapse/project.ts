import { Command } from "commander";
import chalk from "chalk";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createProjectCommand(): Command {
  const project = new Command("project");
  
  project.description("Manage projects (group related issues)");

  project
    .command("list")
    .description("List projects in the current workspace")
    .option("--status <status>", "Filter by status: planned, in_progress, paused, completed, cancelled")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const projects = await client.project.list(options);
        
        if (options.output === "json") {
          console.log(JSON.stringify(projects, null, 2));
          return;
        }

        console.log(chalk.bold("\nProjects:\n"));
        projects.forEach((proj: any) => {
          const statusColor = getProjectStatusColor(proj.status);
          console.log(`  ${proj.icon || "📁"} ${chalk.cyan(proj.id.substring(0, 8))}  ${proj.title}`);
          console.log(`         ${statusColor(proj.status)}  Issues: ${proj.issueCount}`);
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list projects:"), error);
      }
    });

  project
    .command("get")
    .description("Get project details")
    .argument("<id>", "Project ID")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (id: string, options) => {
      try {
        const client = await getSynapseClient();
        const proj = await client.project.get(id);
        
        if (options.output === "json") {
          console.log(JSON.stringify(proj, null, 2));
          return;
        }

        const statusColor = getProjectStatusColor(proj.status);
        console.log(chalk.bold(`\n${proj.icon || "📁"} ${proj.title}\n`));
        console.log(`  ID:       ${proj.id}`);
        console.log(`  Status:   ${statusColor(proj.status)}`);
        console.log(`  Lead:     ${proj.lead ? chalk.yellow(proj.lead) : "N/A"}`);
        console.log(`  Issues:   ${proj.issueCount}`);
        console.log(`  Created:  ${proj.createdAt}`);
        console.log(`\n  Description:\n  ${proj.description || "N/A"}\n`);
      } catch (error) {
        console.error(chalk.red("Failed to get project:"), error);
      }
    });

  project
    .command("create")
    .description("Create a new project")
    .requiredOption("--title <title>", "Project title")
    .option("--description <text>", "Project description")
    .option("--icon <emoji>", "Project icon (emoji)")
    .option("--lead <name>", "Project lead (member or agent name)")
    .option("--status <status>", "Initial status", "planned")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const proj = await client.project.create(options);
        console.log(chalk.green(`✓ Created project ${chalk.cyan(proj.title)}`));
      } catch (error) {
        console.error(chalk.red("Failed to create project:"), error);
      }
    });

  project
    .command("update")
    .description("Update a project")
    .argument("<id>", "Project ID")
    .option("--title <title>", "New title")
    .option("--description <text>", "New description")
    .option("--icon <emoji>", "New icon")
    .option("--lead <name>", "New lead")
    .option("--status <status>", "New status")
    .action(async (id: string, options) => {
      try {
        const client = await getSynapseClient();
        await client.project.update(id, options);
        console.log(chalk.green(`✓ Updated project ${chalk.cyan(id)}`));
      } catch (error) {
        console.error(chalk.red("Failed to update project:"), error);
      }
    });

  project
    .command("status")
    .description("Change project status")
    .argument("<id>", "Project ID")
    .argument("<status>", "New status: planned, in_progress, paused, completed, cancelled")
    .action(async (id: string, status: string) => {
      try {
        const client = await getSynapseClient();
        await client.project.setStatus(id, status);
        console.log(chalk.green(`✓ Set project ${chalk.cyan(id)} status to ${status}`));
      } catch (error) {
        console.error(chalk.red("Failed to change status:"), error);
      }
    });

  project
    .command("delete")
    .description("Delete a project")
    .argument("<id>", "Project ID")
    .option("--force", "Skip confirmation")
    .action(async (id: string, options) => {
      try {
        if (!options.force) {
          console.log(chalk.yellow(`Are you sure you want to delete project ${id}?`));
          console.log(chalk.yellow("This action cannot be undone."));
          console.log(chalk.yellow("Use --force to skip this confirmation."));
          return;
        }
        
        const client = await getSynapseClient();
        await client.project.delete(id);
        console.log(chalk.green(`✓ Deleted project ${chalk.cyan(id)}`));
      } catch (error) {
        console.error(chalk.red("Failed to delete project:"), error);
      }
    });

  return project;
}

function getProjectStatusColor(status: string) {
  switch (status) {
    case "completed": return chalk.green;
    case "in_progress": return chalk.blue;
    case "paused": return chalk.yellow;
    case "cancelled": return chalk.red;
    default: return chalk.white;
  }
}
