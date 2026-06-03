import { Command } from "commander";
import chalk from "chalk";
import * as inquirer from "@clack/prompts";
import { getSynapseClient, SynapseClient } from "../../lib/synapse-client.js";

export function createChatCommand(): Command {
  const chat = new Command("chat");

  chat
    .name("chat")
    .description("Interactive chat with agents")
    .addCommand(createChatSendCommand())
    .addCommand(createChatHistoryCommand())
    .addCommand(createChatSessionCommand())
    .addCommand(createChatContextCommand());

  return chat;
}

function createChatSendCommand(): Command {
  return new Command("send")
    .description("Send a message to an agent and get a response")
    .argument("<message>", "Message to send")
    .option("--agent <id>", "Agent ID (creates new agent if not specified)")
    .option("--agent-name <name>", "New agent name if creating")
    .option("--provider <provider>", "Provider: claude_code, codex, opencode", "claude_code")
    .option("--stream", "Stream the response")
    .option("--no-stream", "Don't stream the response")
    .action(async (message, options) => {
      try {
        const client = await getSynapseClient();

        let agentId = options.agent;

        if (!agentId) {
          console.log(chalk.blue("\n🚀 Creating new agent..."));
          const agent = await client.agent.create({
            name: options.agentName || `chat-${Date.now()}`,
            provider: options.provider,
            prompt: message,
          });
          agentId = agent.id;
          console.log(chalk.green(`   Agent created: ${chalk.cyan(agentId)}`));
        } else {
          console.log(chalk.blue(`\n📤 Sending message to ${agentId}...`));
          await client.agent.send(agentId, message);
        }

        console.log(chalk.blue("\n⏳ Waiting for response...\n"));

        const shouldStream = options.stream !== false;

        if (shouldStream) {
          process.stdout.write(chalk.cyan("🤖 "));
          
          await streamAgentResponse(client, agentId);
          
          console.log(chalk.reset("\n"));
          console.log(chalk.green("✅ Response complete\n"));
        } else {
          await client.agent.wait(agentId);
          const logs = await client.agent.logs(agentId);
          
          console.log(chalk.bold("\n📋 Full Conversation:\n"));
          logs.forEach((log: any) => {
            const prefix = log.type === "input" ? chalk.blue("👤") : chalk.cyan("🤖");
            console.log(`${prefix} ${log.content}`);
          });
          console.log();
        }
      } catch (error) {
        console.error(chalk.red("\n❌ Chat error:"), error);
        process.exit(1);
      }
    });
}

async function streamAgentResponse(client: SynapseClient, agentId: string): Promise<string> {
  return new Promise((resolve) => {
    let fullResponse = "";

    const logHandler = (data: any) => {
      if (data.payload?.agentId === agentId && data.payload?.level === "info") {
        const content = data.payload.message;
        fullResponse += content;
        process.stdout.write(content);
      }
    };

    const statusHandler = (data: any) => {
      if (data.payload?.agentId === agentId && data.payload?.status === "completed") {
        client.ws.off("log", logHandler);
        client.ws.off("agent:status", statusHandler);
        resolve(fullResponse);
      }
    };

    client.ws.on("log", logHandler);
    client.ws.on("agent:status", statusHandler);

    setTimeout(() => {
      client.ws.off("log", logHandler);
      client.ws.off("agent:status", statusHandler);
      resolve(fullResponse);
    }, 30000);
  });
}

function createChatHistoryCommand(): Command {
  return new Command("history")
    .description("View chat history with an agent")
    .argument("[agent-id]", "Agent ID (shows all if not specified)")
    .option("--limit <n>", "Maximum number of messages to show", "50")
    .option("--format <format>", "Format: pretty, json", "pretty")
    .action(async (agentId, options) => {
      try {
        const client = await getSynapseClient();

        if (agentId) {
          const logs = await client.agent.logs(agentId);
          displayLogs(logs, options.format as "pretty" | "json", parseInt(options.limit));
        } else {
          const agents = await client.agent.list();
          
          console.log(chalk.bold("\n💬 Recent Chats:\n"));
          
          const recentAgents = agents
            .filter((a: any) => a.status === "completed" || a.status === "failed")
            .slice(0, parseInt(options.limit));

          if (recentAgents.length === 0) {
            console.log(chalk.yellow("  No chat history found\n"));
            return;
          }

          recentAgents.forEach((agent: any) => {
            console.log(`  ${chalk.cyan(agent.id)}`);
            console.log(`    ${chalk.gray(agent.provider)} - ${agent.status}`);
            console.log(`    Created: ${new Date(agent.createdAt).toLocaleString()}`);
            console.log();
          });
        }
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get chat history:"), error);
      }
    });
}

function displayLogs(logs: any[], format: string, limit: number) {
  const limited = logs.slice(0, limit);

  if (format === "json") {
    console.log(JSON.stringify(limited, null, 2));
    return;
  }

  console.log(chalk.bold("\n💬 Chat History\n"));

  limited.forEach((log: any) => {
    const prefix = log.level === "info" && log.message.startsWith("User:")
      ? chalk.blue("👤")
      : chalk.cyan("🤖");
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    
    console.log(`${chalk.gray(`[${timestamp}]`)} ${prefix} ${log.message}`);
  });

  if (logs.length > limit) {
    console.log(chalk.gray(`\n  ... and ${logs.length - limit} more messages`));
  }

  console.log();
}

function createChatSessionCommand(): Command {
  return new Command("session")
    .description("Start an interactive chat session")
    .option("--agent <id>", "Existing agent ID to continue")
    .option("--provider <provider>", "Provider for new agent", "claude_code")
    .option("--system <prompt>", "System prompt for the agent")
    .action(async (options) => {
      try {
        const client = await getSynapseClient();
        let agentId = options.agent;
        let agentName = `session-${Date.now()}`;

        if (!agentId) {
          console.log(chalk.blue("\n🚀 Starting new chat session..."));
          const agent = await client.agent.create({
            name: agentName,
            provider: options.provider,
            systemPrompt: options.system,
          });
          agentId = agent.id;
          console.log(chalk.green(`   Session started: ${chalk.cyan(agentId)}\n`));
        } else {
          console.log(chalk.blue(`\n🔄 Resuming session: ${agentId}\n`));
        }

        console.log(chalk.gray("  Type 'exit' to end the session, 'clear' to clear the screen\n"));

        while (true) {
          const rawMessage = await inquirer.text({
            message: chalk.blue("👤"),
            placeholder: "Type your message...",
          });

          if (typeof rawMessage !== "string" || !rawMessage.trim()) continue;

          const message = rawMessage;

          if (message.toLowerCase() === "exit") {
            console.log(chalk.blue("\n👋 Ending session...\n"));
            break;
          }

          if (message.toLowerCase() === "clear") {
            console.clear();
            continue;
          }

          if (message.startsWith("/")) {
            await handleSlashCommand(message, client, agentId);
            continue;
          }

          console.log(chalk.blue("\n⏳ Sending...\n"));

          try {
            await client.agent.send(agentId, message);

            process.stdout.write(chalk.cyan("🤖 "));

            let response = "";
            const logHandler = (data: any) => {
              if (data.payload?.agentId === agentId) {
                response += data.payload.message;
                process.stdout.write(data.payload.message);
              }
            };

            client.ws.on("log", logHandler);

            const responsePromise = new Promise<string>((resolve) => {
              setTimeout(() => {
                client.ws.off("log", logHandler);
                resolve(response);
              }, 10000);
            });

            await responsePromise;
            console.log(chalk.reset("\n"));
          } catch (error) {
            console.error(chalk.red("\n❌ Error:"), error);
          }
        }
      } catch (error) {
        console.error(chalk.red("\n❌ Session error:"), error);
        process.exit(1);
      }
    });
}

async function handleSlashCommand(message: string, client: SynapseClient, agentId: string) {
  const [command] = message.slice(1).split(" ");

  switch (command) {
    case "agent":
      console.log(chalk.blue(`\nCurrent agent: ${agentId}`));
      break;

    case "status":
      try {
        const agent = await client.agent.get(agentId);
        console.log(chalk.blue("\n📊 Agent Status:"));
        console.log(`  ID: ${agent.id}`);
        console.log(`  Provider: ${agent.provider}`);
        console.log(`  Status: ${agent.status}`);
      } catch (error) {
        console.error(chalk.red("Failed to get status"));
      }
      break;

    case "attach":
      console.log(chalk.blue("\n🔗 Attaching to agent output..."));
      await client.agent.attach(agentId);
      break;

    case "stop":
      console.log(chalk.blue("\n🛑 Stopping agent..."));
      await client.agent.stop(agentId);
      break;

    case "help":
      console.log(chalk.blue("\n📖 Available Commands:"));
      console.log("  /agent - Show current agent ID");
      console.log("  /status - Show agent status");
      console.log("  /attach - Attach to agent output");
      console.log("  /stop - Stop the agent");
      console.log("  /help - Show this help");
      console.log("  /exit - End the session");
      break;

    default:
      console.log(chalk.yellow(`\nUnknown command: ${command}`));
      console.log(chalk.gray("Type /help for available commands"));
  }
}

function createChatContextCommand(): Command {
  return new Command("context")
    .description("Manage chat context and attachments")
    .argument("<action>", "Action: add, remove, list, clear")
    .argument("[value]", "File path or value")
    .option("--agent <id>", "Agent ID")
    .action(async (action, value, options) => {
      try {
        const client = await getSynapseClient();

        if (!options.agent) {
          console.error(chalk.red("\n❌ Agent ID required"));
          console.log(chalk.blue("Use --agent <id> to specify an agent"));
          return;
        }

        switch (action) {
          case "add":
            if (!value) {
              console.error(chalk.red("\n❌ File path required for add action"));
              return;
            }

            const fs = await import("node:fs");
            const content = fs.readFileSync(value, "utf-8");
            const message = `Context from ${value}:\n\`\`\`\n${content}\n\`\`\``;
            
            await client.agent.send(options.agent, message);
            console.log(chalk.green(`\n✅ Added ${value} to context\n`));
            break;

          case "remove":
            console.log(chalk.blue("\n🗑️ Context removal not yet implemented\n"));
            break;

          case "list":
            const agent = await client.agent.get(options.agent);
            console.log(chalk.bold(`\n📋 Context for ${agent.name}\n`));
            console.log(chalk.yellow("  Context management coming soon\n"));
            break;

          case "clear":
            console.log(chalk.blue("\n🧹 Clearing context...\n"));
            break;

          default:
            console.error(chalk.red(`\n❌ Unknown action: ${action}`));
            console.log(chalk.blue("Available actions: add, remove, list, clear"));
        }
      } catch (error) {
        console.error(chalk.red("\n❌ Context error:"), error);
        process.exit(1);
      }
    });
}

export { createChatSendCommand };
