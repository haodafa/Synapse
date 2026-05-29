import { Command } from "commander";
import chalk from "chalk";
import { getMulticaClient } from "../../lib/multica-client.js";

export function createConfigCommand(): Command {
  const config = new Command("config");
  
  config.description("Manage Synapse configuration");

  config
    .command("show")
    .description("Show current configuration")
    .action(async () => {
      try {
        const client = await getMulticaClient();
        const cfg = await client.config.show();
        
        console.log(chalk.bold("\nSynapse Configuration:\n"));
        console.log(`  Config file: ${chalk.cyan(cfg.configFile)}`);
        console.log(`  Server URL:  ${chalk.cyan(cfg.serverUrl)}`);
        console.log(`  App URL:    ${chalk.cyan(cfg.appUrl)}`);
        console.log(`  Workspace:  ${chalk.cyan(cfg.workspace)}`);
        console.log(`  Profile:    ${chalk.cyan(cfg.profile)}`);
      } catch (error) {
        console.error(chalk.red("Failed to show config:"), error);
      }
    });

  config
    .command("set")
    .description("Set a configuration value")
    .argument("<key>", "Configuration key")
    .argument("<value>", "Configuration value")
    .action(async (key: string, value: string) => {
      try {
        const client = await getMulticaClient();
        await client.config.set(key, value);
        console.log(chalk.green(`✓ Set ${key} = ${value}`));
      } catch (error) {
        console.error(chalk.red("Failed to set config:"), error);
      }
    });

  return config;
}
