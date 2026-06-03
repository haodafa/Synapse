import { Command } from "commander";
import chalk from "chalk";
import * as inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createSquadsCommand(): Command {
  const squads = new Command("squads");

  squads
    .name("squads")
    .description("Manage squads - teams of agents that collaborate on tasks")
    .addCommand(createSquadsListCommand())
    .addCommand(createSquadsCreateCommand())
    .addCommand(createSquadsGetCommand())
    .addCommand(createSquadsAssignCommand())
    .addCommand(createSquadsAddMemberCommand())
    .addCommand(createSquadsRemoveMemberCommand())
    .addCommand(createSquadsDeleteCommand());

  return squads;
}

function createSquadsListCommand(): Command {
  return new Command("list")
    .description("List all squads in the workspace")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        const squads = await client.squad.list();

        if (options.output === "json") {
          console.log(JSON.stringify(squads, null, 2));
          return;
        }

        console.log(chalk.bold(`\n🤖 Squads (${squads.length})\n`));

        if (squads.length === 0) {
          console.log(chalk.yellow("  No squads found. Create one with 'synapse squads create'\n"));
          return;
        }

        squads.forEach((squad: any) => {
          console.log(`  ${chalk.cyan(squad.name)}`);
          if (squad.description) {
            console.log(`    ${squad.description}`);
          }
          console.log(`    Members: ${squad.members.map((m: any) => 
            m.role === "lead" ? chalk.yellow(`★ ${m.name}`) : m.name
          ).join(", ")}`);
          console.log(`    Issues: ${chalk.blue(squad.issueCount || 0)}`);
          console.log();
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list squads:"), error);
      }
    });
}

function createSquadsCreateCommand(): Command {
  return new Command("create")
    .description("Create a new squad")
    .requiredOption("--name <name>", "Squad name")
    .option("--description <text>", "Squad description")
    .option("--lead <name>", "Lead agent/member name")
    .option("--members <names>", "Comma-separated member names")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();

        const members = [];

        if (options.lead) {
          members.push({
            name: options.lead,
            role: "lead",
            type: "agent",
          });
        }

        if (options.members) {
          const names = options.members.split(",").map((s: string) => s.trim());
          for (const name of names) {
            if (members.some((m: any) => m.name === name)) continue;
            members.push({
              name,
              role: "member",
              type: "agent",
            });
          }
        }

        if (members.length === 0) {
          const addMembers = await inquirer.confirm({
            message: "Add initial members to the squad?",
            initialValue: true,
          });

          if (addMembers) {
            const memberNames = await inquirer.text({
              message: "Enter member names (comma-separated):",
              placeholder: "claude, codex, gemini",
            });

            if (typeof memberNames === "string") {
              const names = memberNames.split(",").map((s: string) => s.trim());
              for (const name of names) {
                const role = await inquirer.select({
                  message: `Role for ${name}:`,
                  options: [
                    { value: "member", label: "Member" },
                    { value: "advisor", label: "Advisor" },
                  ],
                });

                members.push({
                  name,
                  role: typeof role === "string" ? role : "member",
                  type: "agent",
                });
              }
            }
          }
        }

        const squad = await client.squad.create({
          name: options.name,
          description: options.description,
          members,
          leadId: options.lead,
        });

        console.log(chalk.green(`\n✅ Squad created successfully!`));
        console.log(chalk.blue(`   ID: ${squad.id}`));
        console.log(chalk.blue(`   Name: ${squad.name}`));
        if (squad.description) {
          console.log(chalk.blue(`   Description: ${squad.description}`));
        }
        console.log(chalk.blue(`   Members: ${squad.members.length}`));
        console.log();

        const assignNow = await inquirer.confirm({
          message: "Would you like to assign an issue to this squad now?",
          initialValue: false,
        });

        if (assignNow) {
          const issueId = await inquirer.text({
            message: "Enter issue ID:",
            placeholder: "ISS-123",
          });

          if (typeof issueId === "string") {
            try {
              await client.squad.assign(squad.id, issueId);
              console.log(chalk.green(`   ✅ Assigned issue ${issueId} to squad ${squad.name}`));
            } catch (error) {
              console.log(chalk.yellow(`   ⚠️  Could not assign issue: ${error}`));
            }
          }
        }
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to create squad:"), error);
        process.exit(1);
      }
    });
}

function createSquadsGetCommand(): Command {
  return new Command("get")
    .description("Get squad details")
    .argument("<squad-id>", "Squad ID")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (squadId, options) => {
      try {
        const client = await getSynapseClient();
        const squad = await client.squad.get(squadId);

        if (options.output === "json") {
          console.log(JSON.stringify(squad, null, 2));
          return;
        }

        console.log(chalk.bold(`\n🤖 Squad: ${squad.name}\n`));
        console.log(`  ID:           ${chalk.cyan(squad.id)}`);
        if (squad.description) {
          console.log(`  Description:   ${squad.description}`);
        }
        console.log(`  Created At:   ${new Date(squad.createdAt).toLocaleString()}`);

        console.log(chalk.bold("\n  Members:"));
        squad.members.forEach((member: any) => {
          const roleIcon = member.role === "lead" ? "👑" : member.role === "advisor" ? "🧙" : "🤖";
          const roleColor = member.role === "lead" ? chalk.yellow : chalk.cyan;
          console.log(`    ${roleIcon} ${chalk.cyan(member.name)} - ${roleColor(member.role)}`);
        });

        if (squad.issues && squad.issues.length > 0) {
          console.log(chalk.bold("\n  Assigned Issues:"));
          squad.issues.forEach((issue: any) => {
            console.log(`    ${chalk.blue(issue.key)}: ${issue.title}`);
            console.log(`      Status: ${issue.status}`);
          });
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get squad:"), error);
      }
    });
}

function createSquadsAssignCommand(): Command {
  return new Command("assign")
    .description("Assign an issue to a squad")
    .argument("<squad-id>", "Squad ID")
    .argument("<issue-id>", "Issue ID")
    .action(async (squadId, issueId) => {
      try {
        const client = await getSynapseClient();
        await client.squad.assign(squadId, issueId);
        console.log(chalk.green(`\n✅ Assigned issue ${issueId} to squad ${squadId}\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to assign issue:"), error);
        process.exit(1);
      }
    });
}

function createSquadsAddMemberCommand(): Command {
  return new Command("add-member")
    .description("Add a member to a squad")
    .argument("<squad-id>", "Squad ID")
    .argument("<member-name>", "Member name")
    .option("--role <role>", "Member role: member, advisor", "member")
    .option("--type <type>", "Member type: agent, user", "agent")
    .action(async (squadId, memberName, options) => {
      try {
        const client = await getSynapseClient();
        
        const squad = await client.squad.get(squadId);
        
        const newMember = {
          name: memberName,
          role: options.role,
          type: options.type,
        };

        squad.members.push(newMember);

        await client.squad.update(squadId, { members: squad.members });

        console.log(chalk.green(`\n✅ Added ${memberName} to squad ${squad.name}`));
        console.log(chalk.blue(`   Role: ${options.role}`));
        console.log(chalk.blue(`   Type: ${options.type}`));
        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to add member:"), error);
        process.exit(1);
      }
    });
}

function createSquadsRemoveMemberCommand(): Command {
  return new Command("remove-member")
    .description("Remove a member from a squad")
    .argument("<squad-id>", "Squad ID")
    .argument("<member-name>", "Member name")
    .action(async (squadId, memberName) => {
      try {
        const client = await getSynapseClient();
        
        const squad = await client.squad.get(squadId);
        
        const initialLength = squad.members.length;
        squad.members = squad.members.filter((m: any) => m.name !== memberName);

        if (squad.members.length === initialLength) {
          console.log(chalk.yellow(`\n⚠️  Member ${memberName} not found in squad ${squad.name}\n`));
          return;
        }

        await client.squad.update(squadId, { members: squad.members });

        console.log(chalk.green(`\n✅ Removed ${memberName} from squad ${squad.name}\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to remove member:"), error);
        process.exit(1);
      }
    });
}

function createSquadsDeleteCommand(): Command {
  return new Command("delete")
    .description("Delete a squad")
    .argument("<squad-id>", "Squad ID")
    .option("--force", "Skip confirmation")
    .action(async (squadId, options) => {
      try {
        if (!options.force) {
          const confirm = await inquirer.confirm({
            message: `Are you sure you want to delete squad ${squadId}?`,
            initialValue: false,
          });

          if (!confirm) {
            console.log(chalk.yellow("\nCancelled\n"));
            return;
          }
        }

        const client = await getSynapseClient();
        await client.squad.delete(squadId);

        console.log(chalk.green(`\n✅ Squad ${squadId} deleted successfully!\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to delete squad:"), error);
        process.exit(1);
      }
    });
}

export { createSquadsListCommand };
