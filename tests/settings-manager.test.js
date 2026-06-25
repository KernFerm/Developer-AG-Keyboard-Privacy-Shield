const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { SettingsManager } = require("../src/modules/settings-manager");

function createTempApp() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "shield-settings-"));
  return {
    root: tempRoot,
    app: {
      getPath(name) {
        if (name !== "userData") {
          throw new Error(`Unexpected path request: ${name}`);
        }
        return tempRoot;
      }
    }
  };
}

test("SettingsManager creates defaults, applies profiles, and restores backups", () => {
  const { app, root } = createTempApp();
  const manager = new SettingsManager(app);

  manager.load();
  const settingsPath = path.join(root, "shield-settings.json");
  assert.equal(fs.existsSync(settingsPath), true);
  assert.equal(manager.getPublicSettings().activeProfile, "Developer Profile");
  assert.equal(manager.getPublicSettings().closeBehavior, "exit");

  const applied = manager.applyProfile("Accessibility Profile");
  assert.equal(applied.profile, "Accessibility Profile");
  assert.equal(applied.mode, "Focus Mode");
  assert.equal(manager.getPublicSettings().accessibility.highContrast, true);

  manager.addDeviceHistory({
    timestamp: new Date().toISOString(),
    type: "connected",
    name: "HP USB Multimedia Keyboard",
    details: "Trusted device event"
  });
  assert.equal(manager.getPublicSettings().deviceHistory.length, 1);

  const themeBeforeBackup = manager.getPublicSettings().theme;
  const backup = manager.exportBackup();
  manager.update({ theme: "dark" });
  assert.equal(manager.getPublicSettings().theme, "dark");

  manager.importBackup(backup);
  assert.equal(manager.getPublicSettings().theme, themeBeforeBackup);
  assert.equal(manager.getPublicSettings().activeProfile, "Accessibility Profile");
  assert.equal(manager.getPublicSettings().closeBehavior, "exit");

  manager.clearDeviceHistory();
  assert.equal(manager.getPublicSettings().deviceHistory.length, 0);

  manager.addSessionNote({ text: "Use this profile for Zoom teaching." });
  assert.equal(manager.getPublicSettings().sessionNotes.length, 1);
});

test("SettingsManager resets to secure defaults after corrupted settings", () => {
  const { app, root } = createTempApp();
  const settingsPath = path.join(root, "shield-settings.json");
  fs.writeFileSync(settingsPath, "{ not-valid-json", "utf8");

  const manager = new SettingsManager(app);
  manager.load();

  const current = manager.getPublicSettings();
  assert.equal(current.activeProfile, "Developer Profile");
  assert.match(current.recovery.lastRecoveryAction, /reset to secure defaults/i);
  assert.equal(current.recovery.backupHealthStatus, "Reset applied");
});

test("SettingsManager records a recovery warning when backup verification fails", () => {
  const { app } = createTempApp();
  const manager = new SettingsManager(app);
  manager.load();

  assert.throws(() => manager.verifyBackup("{bad-json"), /could not be verified locally/i);

  const current = manager.getPublicSettings();
  assert.equal(current.recovery.backupHealthStatus, "Verification failed");
  assert.match(current.recovery.lastRecoveryAction, /verification failed/i);
});
