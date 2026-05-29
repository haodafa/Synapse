import { contextBridge, ipcRenderer } from "electron";

export interface SynapseAPI {
  getAppInfo: () => Promise<{
    version: string;
    name: string;
    platform: string;
    arch: string;
  }>;
  getUserDataPath: () => Promise<string>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onNavigate: (callback: (route: string) => void) => () => void;
  onAction: (callback: (action: string) => void) => () => void;
  onWindowStateChanged: (callback: (state: { isMaximized: boolean }) => void) => () => void;
  onShowAbout: (callback: () => void) => () => void;
  platform: string;
}

const synapseAPI: SynapseAPI = {
  getAppInfo: () => ipcRenderer.invoke("get-app-info"),
  getUserDataPath: () => ipcRenderer.invoke("get-user-data-path"),
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),
  isMaximized: () => ipcRenderer.invoke("is-maximized"),

  onNavigate: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, route: string) => callback(route);
    ipcRenderer.on("navigate", handler);
    return () => ipcRenderer.removeListener("navigate", handler);
  },

  onAction: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, action: string) => callback(action);
    ipcRenderer.on("action", handler);
    return () => ipcRenderer.removeListener("action", handler);
  },

  onWindowStateChanged: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, state: { isMaximized: boolean }) =>
      callback(state);
    ipcRenderer.on("window-state-changed", handler);
    return () => ipcRenderer.removeListener("window-state-changed", handler);
  },

  onShowAbout: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("show-about", handler);
    return () => ipcRenderer.removeListener("show-about", handler);
  },

  platform: process.platform,
};

contextBridge.exposeInMainWorld("synapse", synapseAPI);

declare global {
  interface Window {
    synapse: SynapseAPI;
  }
}
