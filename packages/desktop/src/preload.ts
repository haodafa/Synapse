import { contextBridge, ipcRenderer, webUtils } from "electron";

type EventHandler = (payload: unknown) => void;

contextBridge.exposeInMainWorld("synapseDesktop", {
  platform: process.platform,
  invoke: (command: string, args?: Record<string, unknown>) =>
    ipcRenderer.invoke("synapse:invoke", command, args),
  getPendingOpenProject: () =>
    ipcRenderer.invoke("synapse:get-pending-open-project") as Promise<string | null>,
  events: {
    on: (event: string, handler: EventHandler): Promise<() => void> => {
      const listener = (_ipcEvent: Electron.IpcRendererEvent, payload: unknown) => {
        handler(payload);
      };
      ipcRenderer.on(`synapse:event:${event}`, listener);
      return Promise.resolve(() => {
        ipcRenderer.removeListener(`synapse:event:${event}`, listener);
      });
    },
  },
  window: {
    getCurrentWindow: () => ({
      toggleMaximize: () => ipcRenderer.invoke("synapse:window:toggleMaximize"),
      isFullscreen: () => ipcRenderer.invoke("synapse:window:isFullscreen"),
      updateWindowControls: (update: {
        height?: number;
        backgroundColor?: string;
        foregroundColor?: string;
      }) => ipcRenderer.invoke("synapse:window:updateWindowControls", update),
      onResized: (handler: EventHandler): (() => void) => {
        const listener = (_ipcEvent: Electron.IpcRendererEvent, payload: unknown) => {
          handler(payload);
        };
        ipcRenderer.on("synapse:window:resized", listener);
        return () => {
          ipcRenderer.removeListener("synapse:window:resized", listener);
        };
      },
      setBadgeCount: (count?: number) => ipcRenderer.invoke("synapse:window:setBadgeCount", count),
    }),
  },
  dialog: {
    ask: (message: string, options?: Record<string, unknown>) =>
      ipcRenderer.invoke("synapse:dialog:ask", message, options),
    askWithCheckbox: (message: string, options: Record<string, unknown>) =>
      ipcRenderer.invoke("synapse:dialog:askWithCheckbox", message, options),
    open: (options?: Record<string, unknown>) => ipcRenderer.invoke("synapse:dialog:open", options),
  },
  notification: {
    isSupported: () => ipcRenderer.invoke("synapse:notification:isSupported"),
    sendNotification: (payload: { title: string; body?: string; data?: Record<string, unknown> }) =>
      ipcRenderer.invoke("synapse:notification:send", payload),
  },
  opener: {
    openUrl: (url: string) => ipcRenderer.invoke("synapse:opener:openUrl", url),
  },
  webUtils: {
    getPathForFile: (file: File) => webUtils.getPathForFile(file),
  },
  menu: {
    showContextMenu: (input?: Record<string, unknown>) =>
      ipcRenderer.invoke("synapse:menu:showContextMenu", input),
  },
  browser: {
    setWorkspaceActiveBrowser: (browserId: string | null) =>
      ipcRenderer.invoke("synapse:browser:set-workspace-active-browser", browserId),
    openDevTools: (browserId: string) =>
      ipcRenderer.invoke("synapse:browser:open-devtools", browserId),
    clearPartition: (browserId: string) =>
      ipcRenderer.invoke("synapse:browser:clear-partition", browserId),
  },
});
