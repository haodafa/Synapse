import { ipcMain, BrowserWindow } from "electron";
import log from "electron-log";

interface SynapseState {
  isConnected: boolean;
  activeProject: string | null;
  activeAgent: string | null;
  sidebarVisible: boolean;
  theme: "dark" | "light" | "system";
}

let state: SynapseState = {
  isConnected: false,
  activeProject: null,
  activeAgent: null,
  sidebarVisible: true,
  theme: "dark",
};

const listeners: Set<(state: SynapseState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(state));
}

export function getSynapseState() {
  return { ...state };
}

export function subscribeToState(callback: (state: SynapseState) => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function setConnectionStatus(isConnected: boolean) {
  state.isConnected = isConnected;
  notifyListeners();
  log.info(`Connection status changed: ${isConnected}`);
}

export function setActiveProject(projectId: string | null) {
  state.activeProject = projectId;
  notifyListeners();
}

export function setActiveAgent(agentId: string | null) {
  state.activeAgent = agentId;
  notifyListeners();
}

export function toggleSidebar() {
  state.sidebarVisible = !state.sidebarVisible;
  notifyListeners();
}

export function setTheme(theme: "dark" | "light" | "system") {
  state.theme = theme;
  notifyListeners();
}

export function setupDesktopIPC() {
  ipcMain.handle("synapse:get-state", () => getSynapseState());

  ipcMain.handle("synapse:set-connection", (_event, isConnected: boolean) => {
    setConnectionStatus(isConnected);
  });

  ipcMain.handle("synapse:set-active-project", (_event, projectId: string | null) => {
    setActiveProject(projectId);
  });

  ipcMain.handle("synapse:set-active-agent", (_event, agentId: string | null) => {
    setActiveAgent(agentId);
  });

  ipcMain.handle("synapse:toggle-sidebar", () => {
    toggleSidebar();
  });

  ipcMain.handle("synapse:set-theme", (_event, theme: "dark" | "light" | "system") => {
    setTheme(theme);
  });

  ipcMain.handle("synapse:get-projects", async () => {
    return [];
  });

  ipcMain.handle("synapse:get-agents", async () => {
    return [];
  });

  ipcMain.handle("synapse:get-skills", async () => {
    return [];
  });

  ipcMain.handle("synapse:get-squads", async () => {
    return [];
  });

  ipcMain.handle("synapse:create-issue", async (_event, issue) => {
    log.info("Creating issue:", issue);
    return { id: Date.now().toString(), ...issue };
  });

  ipcMain.handle("synapse:update-issue", async (_event, issueId: string, updates) => {
    log.info("Updating issue:", issueId, updates);
    return { id: issueId, ...updates };
  });

  ipcMain.handle("synapse:delete-issue", async (_event, issueId: string) => {
    log.info("Deleting issue:", issueId);
    return { success: true };
  });

  ipcMain.handle("synapse:create-agent", async (_event, agent) => {
    log.info("Creating agent:", agent);
    return { id: Date.now().toString(), ...agent };
  });

  ipcMain.handle("synapse:update-agent", async (_event, agentId: string, updates) => {
    log.info("Updating agent:", agentId, updates);
    return { id: agentId, ...updates };
  });

  ipcMain.handle("synapse:delete-agent", async (_event, agentId: string) => {
    log.info("Deleting agent:", agentId);
    return { success: true };
  });

  ipcMain.handle("synapse:create-squad", async (_event, squad) => {
    log.info("Creating squad:", squad);
    return { id: Date.now().toString(), members: [], ...squad };
  });

  ipcMain.handle("synapse:update-squad", async (_event, squadId: string, updates) => {
    log.info("Updating squad:", squadId, updates);
    return { id: squadId, ...updates };
  });

  ipcMain.handle("synapse:delete-squad", async (_event, squadId: string) => {
    log.info("Deleting squad:", squadId);
    return { success: true };
  });

  ipcMain.handle("synapse:add-squad-member", async (_event, squadId: string, member) => {
    log.info("Adding squad member:", squadId, member);
    return { id: Date.now().toString(), ...member };
  });

  ipcMain.handle("synapse:remove-squad-member", async (_event, squadId: string, memberId: string) => {
    log.info("Removing squad member:", squadId, memberId);
    return { success: true };
  });

  ipcMain.handle("synapse:install-skill", async (_event, skillId: string) => {
    log.info("Installing skill:", skillId);
    return { success: true };
  });

  ipcMain.handle("synapse:uninstall-skill", async (_event, skillId: string) => {
    log.info("Uninstalling skill:", skillId);
    return { success: true };
  });

  log.info("Desktop IPC handlers registered");
}
