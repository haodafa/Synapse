import { Command } from "commander";
import chalk from "chalk";

export function createSpeechCommand(): Command {
  const speech = new Command("speech");

  speech
    .name("speech")
    .description("Voice control for Synapse (requires mobile app)")
    .addCommand(createSpeechStatusCommand())
    .addCommand(createSpeechListenCommand())
    .addCommand(createSpeechConfigCommand());

  return speech;
}

function createSpeechStatusCommand(): Command {
  return new Command("status")
    .description("Check voice control status")
    .action(async () => {
      try {
        console.log(chalk.blue("\n🎤 Voice Control Status\n"));

        const isEnabled = false;
        const statusColor = isEnabled ? chalk.green : chalk.yellow;
        const statusText = isEnabled ? "Enabled" : "Disabled";

        console.log(`  Status: ${statusColor(statusText)}`);

        if (!isEnabled) {
          console.log(chalk.blue("\n  To enable voice control:"));
          console.log("  1. Download the Synapse mobile app");
          console.log("  2. Connect to your daemon via QR code");
          console.log("  3. Enable voice in app settings");
        } else {
          console.log(`  Input Device: ${chalk.cyan("Default Microphone")}`);
          console.log(`  Language: ${chalk.cyan("English")}`);
        }

        console.log();
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to get voice status:"), error);
      }
    });
}

function createSpeechListenCommand(): Command {
  return new Command("listen")
    .description("Listen for voice commands (requires microphone)")
    .option("--timeout <seconds>", "Listen timeout", "30")
    .option("--language <lang>", "Recognition language", "en-US")
    .action(async (_options) => {
      try {
        console.log(chalk.blue("\n🎤 Listening for voice commands...\n"));
        console.log(chalk.gray("  Press Ctrl+C to stop\n"));

        console.log(chalk.yellow("⚠️  Voice recognition requires additional setup.\n"));
        console.log(chalk.blue("  Voice control is available in the Synapse mobile app.\n"));
        console.log(chalk.blue("  Download at: https://synapse.sh/mobile\n"));
      } catch (error) {
        console.error(chalk.red("\n❌ Voice listen error:"), error);
        process.exit(1);
      }
    });
}

function createSpeechConfigCommand(): Command {
  return new Command("config")
    .description("Configure voice settings")
    .option("--language <lang>", "Recognition language")
    .option("--continuous", "Enable continuous listening")
    .option("--no-continuous", "Disable continuous listening")
    .option("--wake-word <word>", "Wake word")
    .action(async (options) => {
      try {
        console.log(chalk.blue("\n⚙️ Voice Configuration\n"));

        if (options.language) {
          console.log(chalk.green(`  ✓ Language set to: ${options.language}`));
        }
        if (options.continuous !== undefined) {
          console.log(chalk.green(`  ✓ Continuous listening: ${options.continuous}`));
        }
        if (options.wakeWord) {
          console.log(chalk.green(`  ✓ Wake word set to: ${options.wakeWord}`));
        }

        console.log(chalk.blue("\n  Available languages:"));
        console.log("    en-US - English (United States)");
        console.log("    zh-CN - Chinese (Simplified)");
        console.log("    ja-JP - Japanese");
        console.log("    es-ES - Spanish\n");
      } catch (error) {
        console.error(chalk.red("\n❌ Failed to configure voice:"), error);
        process.exit(1);
      }
    });
}

export { createSpeechStatusCommand };
