import { Command } from "commander";
import chalk from "chalk";
import { getMulticaClient } from "../../lib/multica-client.js";

export function createAuthCommand(): Command {
  const auth = new Command("auth");
  
  auth
    .description("Manage authentication")
    .action(() => {
      console.log(chalk.blue("Use 'synapse login' or 'synapse setup' to authenticate"));
    });

  auth
    .command("status")
    .description("Show current authentication status")
    .action(async () => {
      try {
        const client = await getMulticaClient();
        const status = await client.auth.status();
        
        if (status.authenticated) {
          console.log(chalk.green("✓ Authenticated"));
          console.log(`  Server: ${status.server}`);
          console.log(`  User: ${status.user}`);
          console.log(`  Token expires: ${status.expiresAt}`);
        } else {
          console.log(chalk.yellow("✗ Not authenticated"));
          console.log(chalk.blue("  Run 'synapse login' or 'synapse setup' to authenticate"));
        }
      } catch (error) {
        console.error(chalk.red("Failed to check auth status:"), error);
      }
    });

  auth
    .command("logout")
    .description("Remove stored authentication token")
    .action(async () => {
      try {
        const client = await getMulticaClient();
        await client.auth.logout();
        console.log(chalk.green("✓ Logged out successfully"));
      } catch (error) {
        console.error(chalk.red("Failed to logout:"), error);
      }
    });

  return auth;
}
