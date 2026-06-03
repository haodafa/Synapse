import { homedir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

export interface SynapseConfig {
  configPath: string;
  serverUrl: string;
  appUrl: string;
  workspaceId?: string;
  profile: string;
  token?: string;
}

export async function loadConfig(): Promise<SynapseConfig> {
  const configPath = getConfigPath();
  const defaultConfig: SynapseConfig = {
    configPath,
    serverUrl: process.env.SYNAPSE_SERVER_URL || "http://localhost:8080",
    appUrl: process.env.SYNAPSE_APP_URL || "http://localhost:3000",
    profile: "default",
  };

  if (!existsSync(configPath)) {
    return defaultConfig;
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    const saved = JSON.parse(content);
    
    return {
      ...defaultConfig,
      ...saved,
      configPath,
    };
  } catch (error) {
    console.error("Failed to load config:", error);
    return defaultConfig;
  }
}

export async function saveConfig(config: Partial<SynapseConfig>): Promise<void> {
  const current = await loadConfig();
  const updated = { ...current, ...config };
  
  try {
    const fs = await import("node:fs");
    fs.writeFileSync(updated.configPath, JSON.stringify({
      serverUrl: updated.serverUrl,
      appUrl: updated.appUrl,
      workspaceId: updated.workspaceId,
      profile: updated.profile,
      token: updated.token,
    }, null, 2));
  } catch (error) {
    console.error("Failed to save config:", error);
    throw error;
  }
}

function getConfigPath(): string {
  const envPath = process.env.SYNAPSE_CONFIG_PATH;
  if (envPath) {
    return envPath;
  }
  
  const homeDir = homedir();
  
  if (process.platform === "win32") {
    return join(homeDir, "AppData", "Local", "Synapse", "config.json");
  }
  
  if (process.platform === "darwin") {
    return join(homeDir, "Library", "Application Support", "Synapse", "config.json");
  }
  
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return join(xdgConfigHome, "synapse", "config.json");
  }
  
  return join(homeDir, ".config", "synapse", "config.json");
}

export function getDataPath(): string {
  const homeDir = homedir();
  
  if (process.platform === "win32") {
    return join(homeDir, "AppData", "Local", "Synapse", "data");
  }
  
  if (process.platform === "darwin") {
    return join(homeDir, "Library", "Application Support", "Synapse", "data");
  }
  
  return join(homeDir, ".local", "share", "synapse");
}
