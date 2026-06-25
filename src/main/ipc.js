const {
  sanitizeString,
  sanitizeSettingsPatch,
  sanitizeTrustPayload,
  sanitizeReportRequest,
  sanitizeBackupPayload,
  sanitizeRecordId,
  sanitizeSnapshotRequest,
  sanitizeNotePayload
} = require("../modules/sanitizer");

function registerIpc(dependencies) {
  const {
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
  } = dependencies;

  const handlers = {
    "state:get": async () => getSnapshot(),
    "settings:update": async (_event, payload) => {
      settingsManager.update(sanitizeSettingsPatch(payload));
      publishSnapshot();
      return settingsManager.getPublicSettings();
    },
    "settings:backup": async () => settingsManager.exportBackup(),
    "settings:backup:verify": async (_event, payload) => settingsManager.verifyBackup(sanitizeBackupPayload(payload)),
    "settings:restore": async (_event, payload) => {
      settingsManager.importBackup(sanitizeBackupPayload(payload));
      publishSnapshot();
      return settingsManager.getPublicSettings();
    },
    "settings:backup:restoreSaved": async (_event, payload) => {
      const record = settingsManager.restoreBackupRecord(sanitizeRecordId(payload?.id));
      publishSnapshot();
      return record;
    },
    "settings:snapshot:create": async (_event, payload) => {
      const snapshot = settingsManager.createSnapshot(sanitizeSnapshotRequest(payload).label);
      publishSnapshot();
      return snapshot;
    },
    "settings:snapshot:restore": async (_event, payload) => {
      const snapshot = settingsManager.restoreSnapshot(sanitizeRecordId(payload?.id));
      publishSnapshot();
      return snapshot;
    },
    "protection:set": async (_event, payload) => {
      protectionService.setProtectionEnabled(Boolean(payload?.enabled), "ui");
      publishSnapshot();
      return protectionService.getState();
    },
    "protection:emergency": async () => {
      protectionService.enableEmergencyMode();
      publishSnapshot();
      return protectionService.getState();
    },
    "protection:emergencyPrepare": async () => {
      settingsManager.createSnapshot("Emergency restore point");
      protectionService.enableEmergencyMode();
      publishSnapshot();
      return {
        protection: protectionService.getState(),
        recovery: settingsManager.getPublicSettings().recovery
      };
    },
    "protection:restoreNormal": async () => {
      protectionService.restoreNormalMode();
      publishSnapshot();
      return protectionService.getState();
    },
    "protection:quickHide": async (_event, payload) => {
      protectionService.toggleQuickHide(Boolean(payload?.enabled));
      publishSnapshot();
      return protectionService.getState();
    },
    "protection:mode": async (_event, payload) => {
      protectionService.setMode(sanitizeString(payload?.mode, 48));
      publishSnapshot();
      return protectionService.getState();
    },
    "profiles:apply": async (_event, payload) => {
      const profileName = sanitizeString(payload?.profile, 48) || settingsManager.getPublicSettings().activeProfile;
      const result = settingsManager.applyProfile(profileName);
      protectionService.setMode(result.mode);
      publishSnapshot();
      return result;
    },
    "windows:syncApp": async () => {
      const current = settingsManager.getPublicSettings();
      const snapshot = getSnapshot();
      const patch = {
        theme: snapshot.system.windowsThemeStatus === "Light" ? "light" : "dark",
        accessibility: {
          ...current.accessibility,
          highContrast: snapshot.system.windowsAccessibilitySyncStatus.includes("active")
        },
        minimalResourceMode: snapshot.system.powerMode === "Power Saver",
        startupOptimizationMode: snapshot.system.powerMode === "Power Saver" ? true : current.startupOptimizationMode
      };
      settingsManager.update(patch);
      publishSnapshot();
      return {
        theme: patch.theme,
        highContrast: patch.accessibility.highContrast,
        minimalResourceMode: patch.minimalResourceMode,
        powerMode: snapshot.system.powerMode
      };
    },
    "wellbeing:startSession": async () => {
      wellbeingService.startSession();
      publishSnapshot();
      return wellbeingService.getState();
    },
    "wellbeing:stopSession": async () => {
      wellbeingService.stopSession();
      publishSnapshot();
      return wellbeingService.getState();
    },
    "devices:trust": async (_event, payload) => {
      const trusted = sanitizeTrustPayload(payload);
      settingsManager.addTrustedDevice(trusted);
      publishSnapshot();
      return settingsManager.getTrustedDevices();
    },
    "devices:setTrustLevel": async (_event, payload) => {
      settingsManager.setTrustedDeviceTrustLevel(
        sanitizeString(payload?.fingerprint, 200),
        sanitizeString(payload?.trustLevel, 24) || "Known"
      );
      publishSnapshot();
      return settingsManager.getTrustedDevices();
    },
    "devices:removeTrusted": async (_event, payload) => {
      settingsManager.removeTrustedDevice(sanitizeString(payload?.fingerprint, 200));
      publishSnapshot();
      return settingsManager.getTrustedDevices();
    },
    "devices:clearHistory": async () => {
      settingsManager.clearDeviceHistory();
      publishSnapshot();
      return true;
    },
    "reports:generate": async (_event, payload) => {
      const report = reportsManager.generateAndSave(getSnapshot(), sanitizeReportRequest(payload));
      settingsManager.addGeneratedReport(report);
      publishSnapshot();
      return report;
    },
    "reports:preview": async (_event, payload) => reportsManager.preview(getSnapshot(), sanitizeReportRequest(payload)),
    "diagnostics:createSupportBundle": async () => {
      const bundle = diagnosticsManager.createSupportBundle(getSnapshot());
      if (typeof notify === "function") {
        notify(
          "Local report ZIP saved",
          "Saved to Documents. Open the GitHub issue page, sign in or create an account, and attach the ZIP."
        );
      }
      publishSnapshot();
      return bundle;
    },
    "notes:add": async (_event, payload) => {
      settingsManager.addSessionNote(sanitizeNotePayload(payload));
      publishSnapshot();
      return settingsManager.getPublicSettings().sessionNotes;
    },
    "notes:remove": async (_event, payload) => {
      settingsManager.removeSessionNote(sanitizeRecordId(payload?.id));
      publishSnapshot();
      return settingsManager.getPublicSettings().sessionNotes;
    },
    "presets:apply": async (_event, payload) => {
      const presetName = sanitizeString(payload?.preset, 48);
      const presets = {
        "Start Coding Stream": {
          profile: "Streamer Profile",
          mode: "Live Stream Mode",
          settings: { compactMode: true, minimalResourceMode: true, overlay: { panelVisible: true } }
        },
        "Start Presentation": {
          profile: "Teacher Profile",
          mode: "Presentation Mode",
          settings: { compactMode: true, minimalResourceMode: false, accessibility: { largeText: true } }
        },
        "Start Public Workspace Mode": {
          profile: "Guest Profile",
          mode: "Public Workspace Mode",
          settings: { compactMode: true, minimalResourceMode: true, overlay: { panelVisible: true } }
        }
      };
      const preset = presets[presetName];
      if (!preset) {
        return null;
      }
      settingsManager.applyProfile(preset.profile);
      settingsManager.update(preset.settings);
      protectionService.setMode(preset.mode);
      publishSnapshot();
      return { preset: presetName, mode: preset.mode };
    },
    "overlay:setVisible": async (_event, payload) => {
      const visible = Boolean(payload?.visible);
      settingsManager.update({
        overlay: {
          ...settingsManager.getPublicSettings().overlay,
          panelVisible: visible
        }
      });
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        if (visible) {
          overlayWindow.showInactive();
        } else {
          overlayWindow.hide();
        }
      }
      publishSnapshot();
      return visible;
    },
    "extensions:approve": async (_event, payload) => {
      const approvedExtensions = new Set(settingsManager.getPublicSettings().extensionFramework.approvedExtensions);
      const name = sanitizeString(payload?.name, 80);
      if (name) {
        approvedExtensions.add(name);
      }
      settingsManager.update({
        extensionFramework: {
          ...settingsManager.getPublicSettings().extensionFramework,
          approvedExtensions: [...approvedExtensions],
          enabled: true
        }
      });
      publishSnapshot();
      return extensionsManager.getSnapshot(settingsManager.getPublicSettings().extensionFramework.approvedExtensions);
    },
    "extensions:revoke": async (_event, payload) => {
      const name = sanitizeString(payload?.name, 80);
      settingsManager.update({
        extensionFramework: {
          ...settingsManager.getPublicSettings().extensionFramework,
          approvedExtensions: settingsManager
            .getPublicSettings()
            .extensionFramework.approvedExtensions.filter((item) => item !== name)
        }
      });
      publishSnapshot();
      return extensionsManager.getSnapshot(settingsManager.getPublicSettings().extensionFramework.approvedExtensions);
    },
    "extensions:refresh": async () => {
      publishSnapshot();
      return extensionsManager.getSnapshot(settingsManager.getPublicSettings().extensionFramework.approvedExtensions);
    },
    "refresh:all": async () => {
      await Promise.all([deviceDetector.refresh(), workspaceMonitor.refresh(), systemMonitor.refresh()]);
      publishSnapshot();
      return true;
    },
    "support:open": async () => {
      if (supportIssueUrl) {
        await shell.openExternal(supportIssueUrl);
        return true;
      }
      return false;
    },
    "app:exit": async () => {
      app.quit();
      return true;
    }
  };

  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcMain.handle(channel, handler);
  });
}

module.exports = { registerIpc };
