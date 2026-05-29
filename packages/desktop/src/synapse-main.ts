import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, shell } from "electron";
import * as path from "path";
import log from "electron-log";

log.initialize();
log.transports.file.level = "info";
log.transports.console.level = "debug";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  log.info("Creating main window");

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: "#111827",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    log.info("Main window shown");
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../web/.next/server/app.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.on("minimize", () => {
    log.info("Window minimized");
  });

  mainWindow.on("maximize", () => {
    log.info("Window maximized");
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  createMenu();
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Synapse",
      submenu: [
        { label: "About Synapse", role: "about" },
        { type: "separator" },
        { label: "Settings...", accelerator: "CmdOrCtrl+,", click: () => mainWindow?.webContents.send("navigate", "/settings") },
        { type: "separator" },
        { label: "Hide Synapse", accelerator: "CmdOrCtrl+H", role: "hide" },
        { label: "Hide Others", accelerator: "CmdOrCtrl+Shift+H", role: "hideOthers" },
        { label: "Show All", role: "unhide" },
        { type: "separator" },
        { label: "Quit Synapse", accelerator: "CmdOrCtrl+Q", role: "quit" },
      ],
    },
    {
      label: "File",
      submenu: [
        { label: "New Agent", accelerator: "CmdOrCtrl+N", click: () => mainWindow?.webContents.send("action", "new-agent") },
        { label: "New Issue", accelerator: "CmdOrCtrl+Shift+N", click: () => mainWindow?.webContents.send("action", "new-issue") },
        { type: "separator" },
        { label: "New Project", click: () => mainWindow?.webContents.send("action", "new-project") },
        { type: "separator" },
        { label: "Import Skills...", click: () => mainWindow?.webContents.send("action", "import-skills") },
        { label: "Export Skills...", click: () => mainWindow?.webContents.send("action", "export-skills") },
        { type: "separator" },
        { label: "Close Window", accelerator: "CmdOrCtrl+W", role: "close" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Agents", accelerator: "CmdOrCtrl+1", click: () => mainWindow?.webContents.send("navigate", "/agents") },
        { label: "Kanban Board", accelerator: "CmdOrCtrl+2", click: () => mainWindow?.webContents.send("navigate", "/kanban") },
        { label: "Skills Marketplace", accelerator: "CmdOrCtrl+3", click: () => mainWindow?.webContents.send("navigate", "/skills") },
        { label: "Squads", accelerator: "CmdOrCtrl+4", click: () => mainWindow?.webContents.send("navigate", "/squads") },
        { type: "separator" },
        { label: "Toggle Sidebar", accelerator: "CmdOrCtrl+B", click: () => mainWindow?.webContents.send("action", "toggle-sidebar") },
        { type: "separator" },
        { label: "Reload", accelerator: "CmdOrCtrl+R", role: "reload" },
        { label: "Force Reload", accelerator: "CmdOrCtrl+Shift+R", role: "forceReload" },
        { type: "separator" },
        { label: "Actual Size", accelerator: "CmdOrCtrl+0", role: "resetZoom" },
        { label: "Zoom In", accelerator: "CmdOrCtrl+Plus", role: "zoomIn" },
        { label: "Zoom Out", accelerator: "CmdOrCtrl+-", role: "zoomOut" },
        { type: "separator" },
        { label: "Toggle Full Screen", accelerator: "F11", role: "togglefullscreen" },
        ...(isDev ? [{ label: "Toggle DevTools", accelerator: "Alt+CmdOrCtrl+I", role: "toggleDevTools" as const }] : []),
      ],
    },
    {
      label: "Window",
      submenu: [
        { label: "Minimize", accelerator: "CmdOrCtrl+M", role: "minimize" },
        { label: "Maximize", click: () => mainWindow?.setMaximized(!mainWindow?.isMaximized()) },
        { type: "separator" },
        { label: "Bring All to Front", role: "front" },
      ],
    },
    {
      label: "Help",
      submenu: [
        { label: "Documentation", click: () => shell.openExternal("https://synapse.ai/docs") },
        { label: "Keyboard Shortcuts", click: () => mainWindow?.webContents.send("navigate", "/shortcuts") },
        { type: "separator" },
        { label: "Report Issue", click: () => shell.openExternal("https://github.com/synapse-ai/synapse/issues") },
        { type: "separator" },
        { label: "About", click: () => mainWindow?.webContents.send("action", "show-about") },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  const iconPath = isDev
    ? path.join(__dirname, "../../assets/icon.png")
    : path.join(process.resourcesPath, "assets/icon.png");

  try {
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
      { label: "Show Synapse", click: () => mainWindow?.show() },
      { label: "New Agent", click: () => mainWindow?.webContents.send("action", "new-agent") },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]);

    tray.setToolTip("Synapse");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow?.show();
      }
    });
  } catch (error) {
    log.warn("Failed to create tray icon:", error);
  }
}

ipcMain.handle("get-app-info", () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    arch: process.arch,
  };
});

ipcMain.handle("get-user-data-path", () => {
  return app.getPath("userData");
});

ipcMain.handle("minimize-window", () => {
  mainWindow?.minimize();
});

ipcMain.handle("maximize-window", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle("close-window", () => {
  mainWindow?.close();
});

ipcMain.handle("is-maximized", () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.on("window-state-change", () => {
  mainWindow?.webContents.send("window-state-changed", {
    isMaximized: mainWindow?.isMaximized() ?? false,
  });
});

app.whenReady().then(() => {
  log.info("App ready, creating window");
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  log.info("App quitting");
});

process.on("uncaughtException", (error) => {
  log.error("Uncaught exception:", error);
});

process.on("unhandledRejection", (reason) => {
  log.error("Unhandled rejection:", reason);
});
