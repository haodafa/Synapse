import { Command } from "commander";
import chalk from "chalk";
import inquirer from "@clack/prompts";
import { getSynapseClient } from "../../lib/synapse-client.js";

export function createProviderCommand(): Command {
  const provider = new Command("provider");

  provider
    .name("provider")
    .description("Manage agent providers (Claude Code, Codex, OpenCode, etc.)")
    .addCommand(createProviderListCommand())
    .addCommand(createProviderConfigCommand())
    .addCommand(createProviderSetCommand())
    .addCommand(createProviderTestCommand());

  return provider;
}

function createProviderListCommand(): Command {
  return new Command("list")
    .description("List all configured providers")
    .option("--output <format>", "Output format: table, json", "table")
    .action(async (options) => {
      try {
        const providers = [
          {
            id: "claude_code",
            name: "Claude Code",
            description: "Anthropic's official Claude agent",
            status: "available",
            icon: "🤖",
          },
          {
            id: "codex",
            name: "Codex",
            description: "OpenAI's coding agent",
            status: "available",
            icon: "💻",
          },
          {
            id: "opencode",
            name: "OpenCode",
            description: "Open source coding agent",
            status: "available",
            icon: "⚡",
          },
          {
            id: "copilot",
            name: "GitHub Copilot",
            description: "GitHub's AI pair programmer",
            status: "coming_soon",
            icon: "🔮",
          },
          {
            id: "gemini",
            name: "Gemini",
            description: "Google's Gemini AI",
            status: "coming_soon",
            icon: "✨",
          },
          {
            id: "cursor",
            name: "Cursor",
            description: "Cursor AI IDE",
            status: "coming_soon",
            icon: "🎯",
          },
        ];

        if (options.output === "json") {
          console.log(JSON.stringify(providers, null, 2));
          return;
        }

        console.log(chalk.bold("\n🔌 Available Providers:\n"));

        providers.forEach((p) => {
          const statusIcon = p.status === "available" ? chalk.green("✓") : chalk.yellow("⏳");
          const statusText = p.status === "available" ? "Available" : "Coming Soon";
          
          console.log(`  ${statusIcon} ${p.icon} ${chalk.cyan(p.name)}`);
          console.log(`     ${p.description}`);
          console.log(`     Status: ${chalk.gray(statusText)}`);
          console.log(`     ID: ${chalk.gray(p.id)}`);
          console.log();
        });
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to list providers:"), error);
      }
    });
}

function createProviderConfigCommand(): Command {
  return new Command("config")
    .description("Configure a provider")
    .argument("[provider-id]", "Provider ID (e.g., claude_code)")
    .action(async (providerId) => {
      try {
        if (!providerId) {
          console.log(chalk.blue("\n⚙️ Provider Configuration\n"));
          
          const client = await getSynapseClient();
          const config = await client.config.show();
          
          console.log(`  Default Provider: ${chalk.cyan(config.profile)}`);
          console.log(`  Config File: ${chalk.gray(config.configFile)}`);
          
          console.log(chalk.bold("\n📝 Available Settings:\n"));
          console.log("  provider.default - Default provider for new agents");
          console.log("  provider.claude_code.api_key - Anthropic API key");
          console.log("  provider.codex.api_key - OpenAI API key");
          console.log("  provider.opencode.model - Model to use");
          console.log();
          
          return;
        }

        console.log(chalk.blue(`\n⚙️ Configuring ${providerId}\n`));

        const questions = getProviderConfigQuestions(providerId);
        
        for (const q of questions) {
          const answer = await inquirer.text({
            message: q.label,
            placeholder: q.placeholder,
          });

          if (answer) {
            const client = await getSynapseClient();
            await client.config.set(`provider.${providerId}.${q.key}`, answer);
            console.log(chalk.green(`   ✓ Set ${q.key}`));
          }
        }

        console.log(chalk.green("\n✅ Configuration saved\n"));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to configure provider:"), error);
        process.exit(1);
      }
    });
}

function getProviderConfigQuestions(providerId: string) {
  switch (providerId) {
    case "claude_code":
      return [
        {
          key: "api_key",
          label: "Anthropic API Key:",
          placeholder: "sk-ant-...",
        },
        {
          key: "model",
          label: "Model (leave empty for default):",
          placeholder: "claude-sonnet-4-20250514",
        },
      ];
    case "codex":
      return [
        {
          key: "api_key",
          label: "OpenAI API Key:",
          placeholder: "sk-...",
        },
        {
          key: "model",
          label: "Model (leave empty for default):",
          placeholder: "gpt-4o",
        },
      ];
    case "opencode":
      return [
        {
          key: "model",
          label: "Model:",
          placeholder: "deepseek-coder",
        },
        {
          key: "base_url",
          label: "Base URL:",
          placeholder: "https://api.opencode.ai",
        },
      ];
    default:
      return [];
  }
}

function createProviderSetCommand(): Command {
  return new Command("set")
    .description("Set the default provider")
    .argument("<provider-id>", "Provider ID")
    .action(async (providerId) => {
      try {
        const client = await getSynapseClient();
        await client.config.set("provider.default", providerId);
        console.log(chalk.green(`\n✅ Default provider set to ${chalk.cyan(providerId)}\n`));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to set default provider:"), error);
        process.exit(1);
      }
    });
}

function createProviderTestCommand(): Command {
  return new Command("test")
    .description("Test a provider configuration")
    .argument("[provider-id]", "Provider ID (tests default if not specified)")
    .action(async (providerId) => {
      try {
        const client = await getSynapseClient();
        
        console.log(chalk.blue("\n🧪 Testing provider...\n"));

        const testAgent = await client.agent.create({
          name: `test-${Date.now()}`,
          provider: providerId,
          prompt: "Say 'Hello, Synapse!' in exactly those words.",
        });

        console.log(chalk.blue("  Creating test agent..."));
        
        let completed = false;
        let attempts = 0;

        while (!completed && attempts < 60) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const agent = await client.agent.get(testAgent.id);
          
          if (agent.status === "completed") {
            completed = true;
            console.log(chalk.green("  ✅ Provider test passed!\n"));
          } else if (agent.status === "failed") {
            completed = true;
            console.log(chalk.red("  ❌ Provider test failed\n"));
          }
          
          attempts++;
        }

        if (!completed) {
          await client.agent.stop(testAgent.id);
          console.log(chalk.yellow("  ⏱️  Test timed out\n"));
        }

        await client.agent.delete(testAgent.id);
      } catch (error) {
        console.error(chalk.red("\n❌ Provider test failed:"), error);
        process.exit(1);
      }
    });
}

export { createProviderListCommand };
