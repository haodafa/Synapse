import { Command } from "commander";
import chalk from "chalk";
import { getMulticaClient } from "../../lib/multica-client.js";

export function createIssueCommand(): Command {
  const issue = new Command("issue");
  
  issue.description("Manage issues (kanban-style task board)");

  // List issues
  issue
    .command("list")
    .description("List issues in the current workspace")
    .option("--status <status>", "Filter by status: backlog, todo, in_progress, in_review, done, blocked, cancelled")
    .option("--priority <priority>", "Filter by priority: low, medium, high, urgent")
    .option("--assignee <name>", "Filter by assignee name")
    .option("--assignee-id <id>", "Filter by assignee ID")
    .option("--project <id>", "Filter by project ID")
    .option("--limit <n>", "Limit number of results", "50")
    .option("--full-id", "Show full issue IDs")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const client = await getMulticaClient();
        const issues = await client.issue.list(options);
        
        if (options.output === "json") {
          console.log(JSON.stringify(issues, null, 2));
          return;
        }

        console.log(chalk.bold("\nIssues:\n"));
        issues.forEach((iss: any) => {
          const key = options.fullId ? iss.id : iss.key;
          const statusColor = getStatusColor(iss.status);
          console.log(`  ${chalk.cyan(key)}  ${statusColor(iss.status.padEnd(12))}  ${iss.title}`);
          if (iss.assignee) {
            console.log(`         Assignee: ${chalk.yellow(iss.assignee)}`);
          }
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list issues:"), error);
      }
    });

  // Get issue
  issue
    .command("get")
    .description("Get issue details")
    .argument("<id>", "Issue ID (e.g., MUL-123)")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (id: string, options) => {
      try {
        const client = await getMulticaClient();
        const iss = await client.issue.get(id);
        
        if (options.output === "json") {
          console.log(JSON.stringify(iss, null, 2));
          return;
        }

        const statusColor = getStatusColor(iss.status);
        console.log(chalk.bold(`\n${iss.key}: ${iss.title}\n`));
        console.log(`  Status:    ${statusColor(iss.status)}`);
        console.log(`  Priority:  ${chalk.red(iss.priority)}`);
        console.log(`  Assignee: ${iss.assignee ? chalk.yellow(iss.assignee) : "Unassigned"}`);
        console.log(`  Created:   ${iss.createdAt}`);
        console.log(`\n  Description:\n  ${iss.description || "N/A"}\n`);
      } catch (error) {
        console.error(chalk.red("Failed to get issue:"), error);
      }
    });

  // Create issue
  issue
    .command("create")
    .description("Create a new issue")
    .requiredOption("--title <title>", "Issue title")
    .option("--description <text>", "Issue description")
    .option("--priority <priority>", "Priority: low, medium, high, urgent", "medium")
    .option("--assignee <name>", "Assign to agent or member by name")
    .option("--assignee-id <id>", "Assign by member/agent ID")
    .option("--project <id>", "Project ID")
    .option("--parent <id>", "Parent issue ID")
    .action(async (options) => {
      try {
        const client = await getMulticaClient();
        const iss = await client.issue.create(options);
        console.log(chalk.green(`✓ Created issue ${chalk.cyan(iss.key)}`));
      } catch (error) {
        console.error(chalk.red("Failed to create issue:"), error);
      }
    });

  // Update issue
  issue
    .command("update")
    .description("Update an issue")
    .argument("<id>", "Issue ID")
    .option("--title <title>", "New title")
    .option("--description <text>", "New description")
    .option("--priority <priority>", "New priority")
    .action(async (id: string, options) => {
      try {
        const client = await getMulticaClient();
        await client.issue.update(id, options);
        console.log(chalk.green(`✓ Updated issue ${chalk.cyan(id)}`));
      } catch (error) {
        console.error(chalk.red("Failed to update issue:"), error);
      }
    });

  // Assign issue
  issue
    .command("assign")
    .description("Assign an issue")
    .argument("<id>", "Issue ID")
    .option("--to <name>", "Assign to member/agent by name")
    .option("--to-id <id>", "Assign by ID")
    .option("--unassign", "Unassign the issue")
    .action(async (id: string, options) => {
      try {
        const client = await getMulticaClient();
        
        if (options.unassign) {
          await client.issue.unassign(id);
          console.log(chalk.green(`✓ Unassigned issue ${chalk.cyan(id)}`));
        } else {
          await client.issue.assign(id, options.to || options.toId);
          console.log(chalk.green(`✓ Assigned issue ${chalk.cyan(id)} to ${options.to || options.toId}`));
        }
      } catch (error) {
        console.error(chalk.red("Failed to assign issue:"), error);
      }
    });

  // Change status
  issue
    .command("status")
    .description("Change issue status")
    .argument("<id>", "Issue ID")
    .argument("<status>", "New status: backlog, todo, in_progress, in_review, done, blocked, cancelled")
    .action(async (id: string, status: string) => {
      try {
        const client = await getMulticaClient();
        await client.issue.setStatus(id, status);
        console.log(chalk.green(`✓ Set issue ${chalk.cyan(id)} status to ${status}`));
      } catch (error) {
        console.error(chalk.red("Failed to change status:"), error);
      }
    });

  // Comments
  const comment = issue.command("comment");
  comment.description("Manage issue comments");
  
  comment
    .command("list")
    .description("List comments on an issue")
    .argument("<issue-id>", "Issue ID")
    .option("--thread <id>", "Filter to specific thread")
    .option("--recent <n>", "Show N recent threads")
    .action(async (issueId: string, options) => {
      try {
        const client = await getMulticaClient();
        const comments = await client.issue.commentList(issueId, options);
        
        console.log(chalk.bold(`\nComments on ${issueId}:\n`));
        comments.forEach((c: any) => {
          const actor = c.actorType === "agent" ? chalk.yellow(c.actor) : chalk.blue(c.actor);
          console.log(`  ${chalk.cyan(c.id.substring(0, 8))}  ${actor}  ${c.createdAt}`);
          console.log(`  ${c.content}\n`);
        });
      } catch (error) {
        console.error(chalk.red("Failed to list comments:"), error);
      }
    });

  comment
    .command("add")
    .description("Add a comment to an issue")
    .argument("<issue-id>", "Issue ID")
    .requiredOption("--content <text>", "Comment content")
    .option("--parent <id>", "Reply to a specific comment")
    .action(async (issueId: string, options) => {
      try {
        const client = await getMulticaClient();
        await client.issue.commentAdd(issueId, options.content, options.parent);
        console.log(chalk.green("✓ Comment added"));
      } catch (error) {
        console.error(chalk.red("Failed to add comment:"), error);
      }
    });

  // Metadata
  const metadata = issue.command("metadata");
  metadata.description("Manage issue metadata");
  
  metadata
    .command("list")
    .description("List all metadata on an issue")
    .argument("<issue-id>", "Issue ID")
    .action(async (issueId: string) => {
      try {
        const client = await getMulticaClient();
        const meta = await client.issue.metadataList(issueId);
        
        console.log(chalk.bold(`\nMetadata for ${issueId}:\n`));
        Object.entries(meta).forEach(([key, value]) => {
          console.log(`  ${chalk.cyan(key)}: ${value}`);
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list metadata:"), error);
      }
    });

  metadata
    .command("set")
    .description("Set a metadata value")
    .argument("<issue-id>", "Issue ID")
    .requiredOption("--key <key>", "Metadata key")
    .requiredOption("--value <value>", "Metadata value")
    .option("--type <type>", "Value type: string, number, boolean", "string")
    .action(async (issueId: string, options) => {
      try {
        const client = await getMulticaClient();
        await client.issue.metadataSet(issueId, options.key, options.value, options.type);
        console.log(chalk.green(`✓ Set ${chalk.cyan(options.key)} = ${options.value}`));
      } catch (error) {
        console.error(chalk.red("Failed to set metadata:"), error);
      }
    });

  // Subscribers
  const subscriber = issue.command("subscriber");
  subscriber.description("Manage issue subscribers");
  
  subscriber
    .command("list")
    .description("List issue subscribers")
    .argument("<issue-id>", "Issue ID")
    .action(async (issueId: string) => {
      try {
        const client = await getMulticaClient();
        const subs = await client.issue.subscriberList(issueId);
        
        console.log(chalk.bold(`\nSubscribers for ${issueId}:\n`));
        subs.forEach((s: any) => {
          console.log(`  ${chalk.cyan(s.id)}  ${s.name} <${s.email || "N/A"}>`);
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list subscribers:"), error);
      }
    });

  subscriber
    .command("add")
    .description("Subscribe to an issue")
    .argument("<issue-id>", "Issue ID")
    .option("--user <name>", "Subscribe a specific user")
    .action(async (issueId: string, options) => {
      try {
        const client = await getMulticaClient();
        await client.issue.subscriberAdd(issueId, options.user);
        console.log(chalk.green("✓ Subscribed to issue"));
      } catch (error) {
        console.error(chalk.red("Failed to subscribe:"), error);
      }
    });

  // Execution history
  issue
    .command("runs")
    .description("List execution runs for an issue")
    .argument("<issue-id>", "Issue ID")
    .option("--full-id", "Show full run IDs")
    .action(async (issueId: string, options) => {
      try {
        const client = await getMulticaClient();
        const runs = await client.issue.runs(issueId);
        
        console.log(chalk.bold(`\nExecution runs for ${issueId}:\n`));
        runs.forEach((run: any) => {
          const id = options.fullId ? run.id : run.id.substring(0, 8);
          const statusColor = run.status === "completed" ? chalk.green : run.status === "failed" ? chalk.red : chalk.yellow;
          console.log(`  ${chalk.cyan(id)}  ${statusColor(run.status.padEnd(12))}  ${run.startedAt}`);
        });
        console.log();
      } catch (error) {
        console.error(chalk.red("Failed to list runs:"), error);
      }
    });

  return issue;
}

function getStatusColor(status: string) {
  switch (status) {
    case "done": return chalk.green;
    case "in_progress": return chalk.blue;
    case "blocked": return chalk.red;
    case "in_review": return chalk.cyan;
    case "todo": return chalk.yellow;
    default: return chalk.white;
  }
}
