const test = require("node:test");
const assert = require("node:assert/strict");

const { registerIpc } = require("../src/main/ipc");

function buildHarness() {
  const handlers = {};
  let quitCalled = false;
  let clearedDeviceHistory = false;
  let updatePatch;
  let openedSupportUrl = "";

  registerIpc({
    app: {
      quit() {
        quitCalled = true;
      }
    },
    shell: {
      async openExternal(url) {
        openedSupportUrl = url;
      }
    },
    supportIssueUrl: "https://github.com/example/repo/issues",
    ipcMain: {
      handle(channel, handler) {
        handlers[channel] = handler;
      }
    },
    settingsManager: {
      update(patch) {
        updatePatch = patch;
      },
      getPublicSettings() {
        return {
          activeProfile: "Developer Profile",
          autoProtection: {},
          accessibility: {},
          organizationPolicy: {},
          windowsIntegration: {},
          wellbeing: {},
          extensionFramework: { approvedExtensions: [] },
          theme: "dark",
          closeBehavior: "exit",
          recovery: {},
          featureFlags: {}
        };
      },
      clearDeviceHistory() {
        clearedDeviceHistory = true;
      },
      exportBackup() {
        return "{}";
      },
      verifyBackup() {
        return { verified: true };
      },
      importBackup() {},
      restoreBackupRecord() {
        return {};
      },
      createSnapshot() {
        return {};
      },
      restoreSnapshot() {
        return {};
      },
      addTrustedDevice() {},
      getTrustedDevices() {
        return [];
      },
      setTrustedDeviceTrustLevel() {},
      removeTrustedDevice() {},
      addGeneratedReport() {},
      applyProfile(profile) {
        return { profile, mode: "Developer Protection Mode" };
      }
    },
    deviceDetector: { refresh: async () => {}, getSnapshot: () => ({}) },
    workspaceMonitor: { refresh: async () => {}, getSnapshot: () => ({}) },
    systemMonitor: { refresh: async () => {}, getSnapshot: () => ({}) },
    protectionService: {
      setProtectionEnabled() {},
      getState() {
        return {};
      },
      enableEmergencyMode() {},
      restoreNormalMode() {},
      toggleQuickHide() {},
      setMode() {}
    },
    reportsManager: {
      generateAndSave() {
        return {};
      },
      preview() {
        return {};
      }
    },
    extensionsManager: {
      getSnapshot() {
        return {};
      }
    },
    wellbeingService: {
      startSession() {},
      stopSession() {},
      getState() {
        return {};
      }
    },
    getSnapshot() {
      return {
        system: {
          windowsThemeStatus: "Dark",
          windowsAccessibilitySyncStatus: "inactive",
          powerMode: "Balanced"
        }
      };
    },
    publishSnapshot() {}
  });

  return {
    handlers,
    get quitCalled() {
      return quitCalled;
    },
    get clearedDeviceHistory() {
      return clearedDeviceHistory;
    },
    get updatePatch() {
      return updatePatch;
    },
    get openedSupportUrl() {
      return openedSupportUrl;
    }
  };
}

test("IPC registers clear device history and app exit handlers", async () => {
  const harness = buildHarness();

  assert.equal(typeof harness.handlers["devices:clearHistory"], "function");
  assert.equal(typeof harness.handlers["app:exit"], "function");
  assert.equal(typeof harness.handlers["support:open"], "function");

  await harness.handlers["devices:clearHistory"]();
  await harness.handlers["support:open"]();
  await harness.handlers["app:exit"]();

  assert.equal(harness.clearedDeviceHistory, true);
  assert.equal(harness.openedSupportUrl, "https://github.com/example/repo/issues");
  assert.equal(harness.quitCalled, true);
});

test("settings:update sanitizes oversized payloads before update", async () => {
  const harness = buildHarness();
  await harness.handlers["settings:update"](null, {
    theme: "dark<script>",
    activeProfile: "A".repeat(100),
    closeBehavior: "tray<script>"
  });

  assert.equal(harness.updatePatch.theme, "darkscript");
  assert.equal(harness.updatePatch.activeProfile.length <= 48, true);
  assert.equal(harness.updatePatch.closeBehavior, undefined);
});
