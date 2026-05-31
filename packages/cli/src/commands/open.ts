import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnProcess } from "@synapse/unified-daemon/server";

function findDesktopApp(): string | null {
  if (process.platform === "darwin") {
    const candidates = [
      "/Applications/Synapse.app",
      path.join(homedir(), "Applications", "Synapse.app"),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  if (process.platform === "linux") {
    const candidates = [
      "/usr/bin/Synapse",
      "/opt/Synapse/Synapse",
      path.join(homedir(), "Applications", "Synapse.AppImage"),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) {
      return null;
    }

    const candidate = path.join(localAppData, "Programs", "Synapse", "Synapse.exe");
    return existsSync(candidate) ? candidate : null;
  }

  return null;
}

function cleanEnvForDesktopLaunch(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  // The CLI runs via ELECTRON_RUN_AS_NODE=1. On Linux/Windows the spawned
  // desktop process inherits the env directly, so we must strip it or the
  // desktop app would start as a bare Node process instead of Electron.
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.ELECTRON_NO_ATTACH_CONSOLE;
  delete env.SYNAPSE_NODE_ENV;
  return env;
}

function spawnDetached(command: string, args: string[]): void {
  spawnProcess(command, args, {
    detached: true,
    stdio: "ignore",
    env: cleanEnvForDesktopLaunch(),
  }).unref();
}

export async function openDesktopWithProject(projectPath: string): Promise<void> {
  try {
    if (process.env.SYNAPSE_DESKTOP_CLI === "1") {
      throw new Error(
        "Cannot open a desktop project while running in desktop CLI passthrough mode.",
      );
    }

    const desktopApp = findDesktopApp();
    if (!desktopApp) {
      throw new Error(
        "Synapse desktop app not found. Install it from https://github.com/haodafa/Synapse/releases",
      );
    }

    if (process.platform === "darwin") {
      // -n forces a new instance even if the app is already running.
      // The new instance hits requestSingleInstanceLock(), fails, and relays
      // the argv to the first instance via the second-instance event.
      // -g keeps the terminal in the foreground (better CLI UX).
      // Without -n, macOS just activates the existing window and drops --args.
      spawnDetached("open", ["-n", "-g", "-a", desktopApp, "--args", projectPath]);
      return;
    }

    spawnDetached(desktopApp, [projectPath]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}
