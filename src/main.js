const { app, BrowserWindow, ipcMain, Menu, Notification, dialog, powerMonitor, screen, nativeTheme, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { createMainWindow, createOverlayWindow } = require("./main/window");
const { registerTray } = require("./main/tray");
const { registerIpc } = require("./main/ipc");
const { SettingsManager } = require("./modules/settings-manager");
const { SecurityMonitor } = require("./modules/security");
const { DeviceDetector } = require("./modules/device-detector");
const { WorkspaceMonitor } = require("./modules/workspace-monitor");
const { SystemMonitor } = require("./modules/system-monitor");
const { ProtectionService } = require("./modules/protection-service");
const { ReportsManager } = require("./modules/reports-manager");
const { DiagnosticsManager } = require("./modules/diagnostics-manager");
const { buildInsights } = require("./modules/insights-engine");
const { configureStoragePaths } = require("./modules/storage-paths");
const { ExtensionsManager } = require("./modules/extensions-manager");
const { WellbeingService } = require("./modules/wellbeing-service");

let mainWindow;
let trayController;
let overlayWindow;
let isQuitting = false;
const supportIssueUrl = "https://github.com/KernFerm/DAGKPS/issues";

const storageContext = configureStoragePaths(app);
const settingsManager = new SettingsManager(app);
const securityMonitor = new SecurityMonitor(app, settingsManager);
const deviceDetector = new DeviceDetector();
const workspaceMonitor = new WorkspaceMonitor();
const systemMonitor = new SystemMonitor();
const protectionService = new ProtectionService(settingsManager);
const reportsManager = new ReportsManager(app);
const diagnosticsManager = new DiagnosticsManager(app);
const extensionsManager = new ExtensionsManager(app, storageContext);
const wellbeingService = new WellbeingService(settingsManager);

function broadcast(channel, payload) {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (!window.isDestroyed()) {
      window.webContents.send(channel, payload);
    }
  });
}

function notify(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

function createAppMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: "Application",
      submenu: [
        {
          label: "Open Main Window",
          click: () => showMainWindow()
        },
        {
          label: "Open Privacy Information",
          click: () => {
            showMainWindow();
            mainWindow?.webContents.send("app:navigate", "privacy");
          }
        },
        {
          label: "Exit",
          click: () => app.quit()
        }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "How To Use",
          click: () => {
            showMainWindow();
            mainWindow?.webContents.send("app:navigate", "how-to-use");
          }
        },
        {
          label: "About",
          click: () => {
            showMainWindow();
            mainWindow?.webContents.send("app:navigate", "about");
          }
        },
        {
          label: "Project Homepage",
          click: () => {
            showMainWindow();
            mainWindow?.webContents.send("app:navigate", "knowledge-base");
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

function getSnapshot() {
  const snapshot = {
    settings: settingsManager.getPublicSettings(),
    security: securityMonitor.getSummary(),
    protection: protectionService.getState(),
    devices: deviceDetector.getSnapshot(settingsManager.getTrustedDevices()),
    workspace: workspaceMonitor.getSnapshot(),
    system: systemMonitor.getSnapshot(),
    storage: storageContext,
    extensions: extensionsManager.getSnapshot(settingsManager.getPublicSettings().extensionFramework.approvedExtensions),
    wellbeing: wellbeingService.getState()
  };
  return {
    ...snapshot,
    reports: reportsManager.getReportsSummary(),
    diagnostics: diagnosticsManager.getSummary(),
    releaseHealth: buildReleaseHealth(snapshot),
    insights: buildInsights(snapshot)
  };
}

function publishSnapshot() {
  const snapshot = getSnapshot();
  broadcast("state:update", snapshot);
  trayController?.update(protectionService.getState());
  syncOverlayVisibility(snapshot);
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.setSkipTaskbar(false);
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
  syncOverlayVisibility();
}

function hideMainWindowToTray() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.hide();
  mainWindow.setSkipTaskbar(true);
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
  }
}

async function refreshProtectionContext() {
  protectionService.applyAutomaticRules({
    workspace: workspaceMonitor.getSnapshot(),
    system: systemMonitor.getSnapshot()
  });
  publishSnapshot();
}

function registerRealtimeHooks() {
  deviceDetector.startMonitoring(2000);
  workspaceMonitor.startMonitoring(2000);
  systemMonitor.startMonitoring(3000);

  deviceDetector.on("updated", publishSnapshot);
  workspaceMonitor.on("updated", refreshProtectionContext);
  systemMonitor.on("updated", refreshProtectionContext);

  screen.on("display-added", () => workspaceMonitor.refresh().catch(() => {}));
  screen.on("display-removed", () => workspaceMonitor.refresh().catch(() => {}));
  screen.on("display-metrics-changed", () => workspaceMonitor.refresh().catch(() => {}));

  powerMonitor.on("resume", () => {
    workspaceMonitor.refresh().catch(() => {});
    systemMonitor.refresh().catch(() => {});
    deviceDetector.refresh().catch(() => {});
  });
  powerMonitor.on("unlock-screen", () => {
    workspaceMonitor.refresh().catch(() => {});
    systemMonitor.refresh().catch(() => {});
  });
  powerMonitor.on("on-ac", () => systemMonitor.refresh().catch(() => {}));
  powerMonitor.on("on-battery", () => systemMonitor.refresh().catch(() => {}));

  nativeTheme.on("updated", () => systemMonitor.refresh().catch(() => {}));
}

function syncOverlayVisibility(snapshot = getSnapshot()) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    return;
  }
  if (snapshot.settings.overlay?.panelVisible) {
    if (!overlayWindow.isVisible()) {
      overlayWindow.showInactive();
    }
  } else if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  }
}

function buildReleaseHealth(snapshot) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(app.getAppPath(), "package.json"), "utf8"));
  const changelogPath = path.join(app.getAppPath(), "CHANGE-LOG.md");
  const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, "utf8") : "";
  const changelogMatch = changelog.match(/^##\s+v([0-9]+\.[0-9]+\.[0-9]+)/m);
  const versionAligned = Boolean(changelogMatch && changelogMatch[1] === packageJson.version);
  const checks = snapshot.settings.releaseChecks || {};

  return {
    version: packageJson.version,
    versionAligned,
    qaPassed: checks.qaPassed,
    signedBuild: checks.signedBuild,
    hardwareQaComplete: checks.hardwareQaComplete,
    accessibilityQaComplete: checks.accessibilityQaComplete,
    installerQaComplete: checks.installerQaComplete,
    releaseReady: versionAligned && checks.qaPassed && checks.signedBuild && checks.hardwareQaComplete && checks.accessibilityQaComplete && checks.installerQaComplete
  };
}

async function boot() {
  if (!storageContext.allowed) {
    dialog.showErrorBox(
      "External Drive Required",
      [
        "This packaged build is restricted to portable external storage.",
        "",
        "Run it from a flash drive, external HDD, or external SSD and then reopen the app.",
        storageContext.driveDetails ? `Detected location: ${storageContext.driveDetails}` : ""
      ].filter(Boolean).join("\n")
    );
    app.quit();
    return;
  }

  settingsManager.load();
  securityMonitor.runStartupChecks();
  protectionService.initialize();
  wellbeingService.initialize();

  mainWindow = createMainWindow(path.join(__dirname, "renderer/index.html"));
  overlayWindow = createOverlayWindow(path.join(__dirname, "renderer/overlay.html"));
  registerIpc({
    app,
    shell,
    supportIssueUrl,
    ipcMain,
    settingsManager,
    deviceDetector,
    workspaceMonitor,
    systemMonitor,
    protectionService,
    reportsManager,
    diagnosticsManager,
    overlayWindow,
    extensionsManager,
    wellbeingService,
    getSnapshot,
    publishSnapshot,
    notify
  });

  trayController = registerTray({
    app,
    iconPath: path.join(__dirname, "../build/icon.png"),
    onOpen: () => showMainWindow(),
    onNavigate: (target) => {
      showMainWindow();
      mainWindow?.webContents.send("app:navigate", target);
    },
    onToggleProtection: (enabled) => {
      protectionService.setProtectionEnabled(enabled, "tray");
      publishSnapshot();
    },
    onEmergency: () => {
      protectionService.enableEmergencyMode();
      publishSnapshot();
    },
    getState: () => protectionService.getState()
  });

  createAppMenu();
  registerRealtimeHooks();
  mainWindow.on("close", (event) => {
    if (isQuitting) {
      return;
    }

    const settings = settingsManager.getPublicSettings();
    const shouldMinimizeToTray = settings.closeBehavior === "tray" && settings.trayEnabled;

    if (shouldMinimizeToTray) {
      event.preventDefault();
      hideMainWindowToTray();
      return;
    }

    event.preventDefault();
    isQuitting = true;
    app.quit();
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    publishSnapshot();
  });

  deviceDetector.on("events", (events) => {
    const trustedLookup = new Set(settingsManager.getTrustedDevices().map((item) => item.fingerprint));
    events.forEach((event) => {
      notify(event.title, event.body);
      settingsManager.addDeviceHistory({
        timestamp: new Date().toISOString(),
        type: event.type,
        name: event.device?.name || "Keyboard",
        details: trustedLookup.has(event.device?.fingerprint)
          ? "Trusted device event"
          : "Untrusted or unknown device event"
      });
    });
    publishSnapshot();
  });
  protectionService.on("updated", publishSnapshot);
  settingsManager.on("updated", publishSnapshot);
  wellbeingService.on("updated", publishSnapshot);
  wellbeingService.on("break-reminder", ({ title, body }) => notify(title, body));
  wellbeingService.on("session-started", () => notify("Focus session started", "Local-only focus session timer is now active."));
  wellbeingService.on("session-stopped", () => notify("Focus session stopped", "Local-only focus session timer has stopped."));
}

app.whenReady().then(boot);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
  }
  wellbeingService.dispose();
  systemMonitor.dispose();
  workspaceMonitor.dispose();
  deviceDetector.dispose();
  settingsManager.flush();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    boot();
  } else {
    showMainWindow();
  }
});
