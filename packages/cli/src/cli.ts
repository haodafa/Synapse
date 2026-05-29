import { Command } from "commander";
import { createAgentCommand } from "./commands/agent/index.js";
import { createDaemonCommand } from "./commands/daemon/index.js";
import { createChatCommand } from "./commands/chat/index.js";
import { createLoopCommand } from "./commands/loop/index.js";
import { createPermitCommand } from "./commands/permit/index.js";
import { createProviderCommand } from "./commands/provider/index.js";
import { createScheduleCommand } from "./commands/schedule/index.js";
import { createSpeechCommand } from "./commands/speech/index.js";
import { createTerminalCommand } from "./commands/terminal/index.js";
import { createWorktreeCommand } from "./commands/worktree/index.js";
import { startCommand as daemonStartCommand } from "./commands/daemon/start.js";
import { runStatusCommand as runDaemonStatusCommand } from "./commands/daemon/status.js";
import { runRestartCommand as runDaemonRestartCommand } from "./commands/daemon/restart.js";
import { addLsOptions, runLsCommand } from "./commands/agent/ls.js";
import { addRunOptions, runRunCommand } from "./commands/agent/run.js";
import { addLogsOptions, runLogsCommand } from "./commands/agent/logs.js";
import { addDeleteOptions, runDeleteCommand } from "./commands/agent/delete.js";
import { addStopOptions, runStopCommand } from "./commands/agent/stop.js";
import { addSendOptions, runSendCommand } from "./commands/agent/send.js";
import { addInspectOptions, runInspectCommand } from "./commands/agent/inspect.js";
import { addWaitOptions, runWaitCommand } from "./commands/agent/wait.js";
import { addArchiveOptions, runArchiveCommand } from "./commands/agent/archive.js";
import { addAttachOptions, runAttachCommand } from "./commands/agent/attach.js";
import { addImportOptions, runImportCommand } from "./commands/agent/import.js";
import { withOutput } from "./output/index.js";
import { onboardCommand } from "./commands/onboard.js";
import {
  addDaemonHostOption,
  addJsonAndDaemonHostOptions,
  addJsonOption,
} from "./utils/command-options.js";
import { resolveCliVersion } from "./version.js";

import { createAuthCommand } from "./commands/synapse/auth.js";
import { createWorkspaceCommand } from "./commands/synapse/workspace.js";
import { createIssueCommand } from "./commands/synapse/issue.js";
import { createProjectCommand } from "./commands/synapse/project.js";
import { createAutopilotCommand } from "./commands/synapse/autopilot.js";
import { createConfigCommand } from "./commands/synapse/config.js";
import { createSetupCommand } from "./commands/synapse/setup.js";

import { createOrchestrationCommand } from "./commands/orchestration/index.js";

const VERSION = resolveCliVersion();

function resolveHostnamesOption(hostnames: unknown, allowedHosts: unknown): string | undefined {
  if (typeof hostnames === "string") return hostnames;
  if (typeof allowedHosts === "string") return allowedHosts;
  return undefined;
}

export function createCli(): Command {
  const program = new Command();

  program
    .name("synapse")
    .description("Synapse CLI - Unified AI Agent Orchestration Platform\n\nCombining the best of Paseo (cross-device control, multi-agent orchestration) and Synapse (team collaboration, skill compounding)")
    .version(VERSION, "-v, --version", "output the version number")
    .option("-o, --format <format>", "output format: table, json, yaml", "table")
    .option("--json", "output in JSON format (alias for --format json)")
    .option("-q, --quiet", "minimal output (IDs only)")
    .option("--no-headers", "omit table headers")
    .option("--no-color", "disable colored output");

  // ============ PASEO-STYLE AGENT COMMANDS ============
  
  program.command("ls", { isDefault: true })
    .description("List running agents")
    .action(withOutput(runLsCommand));

  program
    .command("run")
    .description("Start a new agent task")
    .argument("<prompt>", "Task description")
    .action(
      withOutput(runRunCommand),
    );

  program
    .command("import")
    .description("Import existing agent sessions")
    .action(
      withOutput(runImportCommand),
    );

  program
    .command("attach")
    .description("Attach to a running agent's output")
    .argument("<agent-id>", "Agent ID to attach to")
    .action(runAttachCommand);

  program
    .command("logs")
    .description("View agent logs")
    .argument("<agent-id>", "Agent ID")
    .action(runLogsCommand);

  program
    .command("stop")
    .description("Stop a running agent")
    .argument("<agent-id>", "Agent ID to stop")
    .action(
      withOutput(runStopCommand),
    );

  program
    .command("delete")
    .description("Delete an agent session")
    .argument("<agent-id>", "Agent ID to delete")
    .action(
      withOutput(runDeleteCommand),
    );

  program
    .command("send")
    .description("Send a follow-up message to a running agent")
    .argument("<agent-id>", "Agent ID")
    .argument("<message>", "Message to send")
    .action(
      withOutput(runSendCommand),
    );

  program
    .command("inspect")
    .description("Inspect agent state and configuration")
    .argument("<agent-id>", "Agent ID")
    .action(
      withOutput(runInspectCommand),
    );

  program
    .command("wait")
    .description("Wait for an agent to complete")
    .argument("<agent-id>", "Agent ID")
    .action(
      withOutput(runWaitCommand),
    );

  program
    .command("archive")
    .description("Archive completed agents")
    .argument("[agents...]", "Agent IDs to archive (default: all completed)")
    .action(
      withOutput(runArchiveCommand),
    );

  // ============ LOCAL DAEMON SHORTCUTS ============
  
  program.addCommand(onboardCommand());
  program.addCommand(daemonStartCommand());

  program
    .command("status")
    .description('Show local daemon status (alias for "synapse daemon status")')
    .action(withOutput(runDaemonStatusCommand));

  program
    .command("restart")
    .description('Restart local daemon (alias for "synapse daemon restart")')
    .option("--timeout <seconds>", "Wait timeout before force stop (default: 15)")
    .option("--force", "Send SIGKILL if graceful stop times out")
    .option("--listen <listen>", "Listen target for restarted daemon (host:port, port, or unix socket)")
    .option("--port <port>", "Port for restarted daemon listen target")
    .option("--no-relay", "Disable relay on restarted daemon")
    .option("--no-mcp", "Disable Agent MCP on restarted daemon")
    .action(
      withOutput((...args) => {
        const [options, command] = args.slice(-2) as [typeof args[number], Command];
        return runDaemonRestartCommand(
          {
            ...options,
            hostnames: resolveHostnamesOption(options.hostnames, (options as any).allowedHosts),
          },
          command,
        );
      }),
    );

  // ============ ADVANCED AGENT COMMANDS ============
  
  program.addCommand(createAgentCommand());
  program.addCommand(createDaemonCommand());
  program.addCommand(createChatCommand());
  program.addCommand(createTerminalCommand());
  program.addCommand(createLoopCommand());
  program.addCommand(createScheduleCommand());
  program.addCommand(createPermitCommand());
  program.addCommand(createProviderCommand());
  program.addCommand(createSpeechCommand());
  program.addCommand(createWorktreeCommand());

  // ============ SYNAPSE-STYLE COMMANDS ============
  
  // Setup & Auth
  program.addCommand(createSetupCommand());
  program.addCommand(createAuthCommand());
  program.addCommand(createConfigCommand());

  // Workspace management
  program.addCommand(createWorkspaceCommand());

  // Issue management (kanban-style)
  program.addCommand(createIssueCommand());

  // Project management
  program.addCommand(createProjectCommand());

  // Autopilot (scheduled tasks)
  program.addCommand(createAutopilotCommand());

  // ============ ADVANCED ORCHESTRATION COMMANDS ============
  
  program.addCommand(createOrchestrationCommand());

  return program;
}
