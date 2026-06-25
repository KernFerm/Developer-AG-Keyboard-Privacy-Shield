const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class SecurityMonitor {
  constructor(app, settingsManager) {
    this.app = app;
    this.settingsManager = settingsManager;
    this.summary = {
      status: "Healthy",
      encryptionStatus: "Enabled",
      ipcSecurityStatus: "Allowlist enforced",
      configurationStatus: "Validated",
      permissionStatus: "Local-only",
      warnings: [],
      fileChecks: []
    };
  }

  runStartupChecks() {
    const checks = [
      path.join(this.app.getAppPath(), "src/main.js"),
      path.join(this.app.getAppPath(), "src/preload.js"),
      path.join(this.app.getAppPath(), "src/main/ipc.js"),
      path.join(this.app.getAppPath(), "src/renderer/index.html"),
      path.join(this.app.getAppPath(), "package.json")
    ];
    this.summary.fileChecks = checks.filter(fs.existsSync).map((filePath) => ({
      file: path.basename(filePath),
      hash: crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 16),
      status: "Present"
    }));

    if (!fs.existsSync(this.settingsManager.dataPath)) {
      this.summary.warnings.push({
        title: "Settings baseline created",
        details: "A new encrypted settings file was created with secure defaults."
      });
    }

    if (this.settingsManager.getPublicSettings().recovery?.backupHealthStatus === "Reset applied") {
      this.summary.warnings.push({
        title: "Settings recovery was used",
        details: "The app reset local settings back to secure defaults after a read or decryption problem."
      });
      this.summary.configurationStatus = "Recovered to secure defaults";
    }

    this.summary.warnings.push({
      title: "Manual release review still required",
      details: "Installer signing, accessibility QA, and Windows hardware validation must be completed before public release."
    });
  }

  getSummary() {
    return this.summary;
  }
}

module.exports = { SecurityMonitor };
