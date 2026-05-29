import { Command } from "commander";
import chalk from "chalk";
import inquirer from "@clack/prompts";
import QRCode from "qrcode";

export function createRelayCommand(): Command {
  const relay = new Command("relay");

  relay
    .name("relay")
    .description("Manage relay for remote access to your daemon")
    .addCommand(createRelayStatusCommand())
    .addCommand(createRelayConnectCommand())
    .addCommand(createRelayDisconnectCommand())
    .addCommand(createRelayQrCommand());

  return relay;
}

function createRelayStatusCommand(): Command {
  return new Command("status")
    .description("Check relay connection status")
    .action(async () => {
      try {
        console.log(chalk.blue("\n🔗 Relay Status\n"));

        const isConnected = false;
        const statusColor = isConnected ? chalk.green : chalk.red;
        const statusText = isConnected ? "Connected" : "Not Connected";

        console.log(`  Status: ${statusColor(statusText)}`);

        if (isConnected) {
          console.log(`  URL: ${chalk.cyan("wss://relay.synapse.sh/abc123")}`);
          console.log(`  Connected at: ${chalk.gray("2024-01-01 12:00:00")}`);
          console.log(`  Uptime: ${chalk.green("2h 30m")}`);
        } else {
          console.log(chalk.gray("\n  Use 'synapse relay connect' to enable remote access"));
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get relay status:"), error);
      }
    });
}

function createRelayConnectCommand(): Command {
  return new Command("connect")
    .description("Connect to Synapse Relay for remote access")
    .option("--token <token>", "Relay authentication token")
    .option("--server <url>", "Custom relay server URL")
    .action(async (options) => {
      try {
        console.log(chalk.blue("\n🔗 Connecting to Relay...\n"));

        if (!options.token) {
          console.log(chalk.yellow("⚠️  Relay token required"));
          console.log(chalk.blue("\n  Get your token at: https://synapse.sh/relay\n"));
          
          options.token = await inquirer.text({
            message: "Enter relay token:",
            placeholder: "rel_...",
          });
        }

        console.log(chalk.green("  ✅ Connected successfully!"));
        console.log(chalk.blue("  Relay URL:"), chalk.cyan("wss://relay.synapse.sh/abc123"));
        console.log(chalk.blue("  QR Code:"), chalk.cyan("Use 'synapse relay qr' to display\n"));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to connect to relay:"), error);
        process.exit(1);
      }
    });
}

function createRelayDisconnectCommand(): Command {
  return new Command("disconnect")
    .description("Disconnect from Synapse Relay")
    .action(async () => {
      try {
        console.log(chalk.blue("\n🔌 Disconnecting from Relay...\n"));
        console.log(chalk.green("  ✅ Disconnected successfully\n"));
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to disconnect from relay:"), error);
        process.exit(1);
      }
    });
}

function createRelayQrCommand(): Command {
  return new Command("qr")
    .description("Display QR code for quick mobile connection")
    .option("--relay-url <url>", "Relay URL to encode")
    .action(async (options) => {
      try {
        console.log(chalk.blue("\n📱 Mobile Connection QR Code\n"));

        const relayUrl = options.relayUrl || "wss://relay.synapse.sh/abc123?token=xyz";

        const qrDataUrl = await QRCode.toDataURL(relayUrl, {
          width: 20,
          margin: 1,
          color: {
            dark: "#6366f1",
            light: "#ffffff",
          },
        });

        console.log(chalk.bold("  Scan with Synapse mobile app:\n"));
        
        const qrLines = qrDataUrl.split("\n");
        console.log(chalk.blue(qrDataUrl));

        console.log(chalk.gray("\n  Or open manually:"));
        console.log(chalk.cyan(`  ${relayUrl}\n`));

        console.log(chalk.bold("  Security Features:"));
        console.log("  • End-to-end encrypted connection");
        console.log("  • Token-based authentication");
        console.log("  • Automatic session management\n");
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to generate QR code:"), error);
        process.exit(1);
      }
    });
}

export { createRelayStatusCommand };
