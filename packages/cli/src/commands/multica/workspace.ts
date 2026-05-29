import { Command } from "commander";
import chalk from "chalk";
import { getMulticaClient } from "../../lib/multica-client.js";

export function createWorkspaceCommand(): Command {
  const workspace = new Command("workspace");
  
  workspace.description("Manage workspaces");

  workspace
    .command("list")
    .description("List all workspaces")
    .option("--full-id", "Show full workspace IDs")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await getMulticaClient();
        const workspaces = await client.workspace.list();
        
        if (options.output === "json") {
          console.log(JSON.stringify(workspaces, null, 2));
          return;
        }

        console.log(chalk.bold("\nWorkspaces:\n"));
        workspaces.forEach((ws: any) => {
          const marker = ws.isDefault ? " *" : "  ";
          const id = options.fullId ? ws.id : ws.id.substring(0, 8);
          console.log(`${chalk.green(marker)} ${chalk.cyan(id)}  ${ws.name}`);
          console.log(`   ${ws.description || ""}`);
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list workspaces:"), error);
      }
    });

  workspace
    .command("switch")
    .description("Switch default workspace")
    .argument("<workspace-id|slug>", "Workspace ID or slug")
    .action(async (workspaceId: string) => {
      try {
        const client = await getMulticaClient();
        await client.workspace.switch(workspaceId);
        console.log(chalk.green(`✓ Switched to workspace: ${workspaceId}`));
      } catch (error) {
        console.error(chalk.red("Failed to switch workspace:"), error);
      }
    });

  workspace
    .command("get")
    .description("Get workspace details")
    .argument("[workspace-id]", "Workspace ID (defaults to current)")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (workspaceId?: string, options?: any) => {
      try {
        const client = await getMulticaClient();
        const ws = await client.workspace.get(workspaceId);
        
        if (options?.output === "json") {
          console.log(JSON.stringify(ws, null, 2));
          return;
        }

        console.log(chalk.bold(`\nWorkspace: ${ws.name}\n`));
        console.log(`  ID:          ${ws.id}`);
        console.log(`  Slug:        ${ws.slug}`);
        console.log(`  Description: ${ws.description || "N/A"}`);
        console.log(`  Created:     ${ws.createdAt}`);
        console.log(`  Members:     ${ws.memberCount}`);
        console.log(`  Agents:      ${ws.agentCount}`);
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to get workspace:"), error);
      }
    });

  workspace
    .command("member")
    .description("Manage workspace members")
    .addCommand(new Command("list")
      .description("List workspace members")
      .argument("[workspace-id]", "Workspace ID (defaults to current)")
      .action(async (workspaceId?: string) => {
        try {
          const client = await getMulticaClient();
          const members = await client.workspace.memberList(workspaceId);
          
          console.log(chalk.bold("\nWorkspace Members:\n"));
          members.forEach((member: any) => {
            const type = member.type === "agent" ? chalk.yellow("[AGENT]") : chalk.blue("[USER]");
            console.log(`  ${type} ${chalk.cyan(member.name)} <${member.email || "N/A"}>`);
            console.log(`          ID: ${member.id}`);
          });
          console.log();
        } catch (error) {
          console.error(chalk.red("Failed to list members:"), error);
        }
      })
    );

  return workspace;
}
