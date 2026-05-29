import { Command } from "commander";
import chalk from "chalk";
import { getMulticaClient } from "../../lib/multica-client.js";

export function createSetupCommand(): Command {
  const setup = new Command("setup");
  
  setup
    .description("One-command setup for Synapse")
    .option("--cloud", "Connect to Synapse Cloud (default)", false)
    .option("--self-host", "Connect to self-hosted server")
    .option("--server-url <url>", "Self-hosted server URL")
    .option("--app-url <url>", "Self-hosted app URL")
    .option("--profile <name>", "Profile name", "default")
    .option("--port <port>", "Server port for self-hosted", "8080")
    .option("--frontend-port <port>", "Frontend port for self-hosted", "3000")
    .action(async (options) => {
      console.log(chalk.blue.bold("\n🔷 Synapse Setup\n"));
      
      try {
        const client = await getMulticaClient();
        
        if (options.selfHost) {
          console.log(chalk.cyan("Setting up self-hosted configuration..."));
          
          const serverUrl = options.serverUrl || `http://localhost:${options.port}`;
          const appUrl = options.appUrl || `http://localhost:${options.frontendPort}`;
          
          await client.config.set("server_url", serverUrl);
          await client.config.set("app_url", appUrl);
          await client.config.set("profile", options.profile);
          
          console.log(chalk.green(`✓ Server URL: ${serverUrl}`));
          console.log(chalk.green(`✓ App URL: ${appUrl}`));
          console.log(chalk.green(`✓ Profile: ${options.profile}`));
        } else {
          console.log(chalk.cyan("Connecting to Synapse Cloud..."));
        }
        
        console.log(chalk.blue("\nOpening browser for authentication..."));
        await client.auth.login();
        
        console.log(chalk.blue("\nStarting daemon..."));
        await client.daemon.start();
        
        console.log(chalk.green.bold("\n✅ Setup complete! Synapse is ready to use.\n"));
        console.log(chalk.blue("Next steps:"));
        console.log("  synapse agent list        - List available agents");
        console.log("  synapse issue create      - Create an issue");
        console.log("  synapse daemon status     - Check daemon status\n");
      } catch (error) {
        console.error(chalk.red("\n❌ Setup failed:"), error);
        process.exit(1);
      }
    });

  return setup;
}
