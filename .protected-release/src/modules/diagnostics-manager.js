const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const REPORT_FILE_PREFIX = "local-report-";

class DiagnosticsManager {
  constructor(app) {
    this.app = app;
    this.diagnosticsDir = app.getPath("documents");
    fs.mkdirSync(this.diagnosticsDir, { recursive: true });
  }

  createSupportBundle(snapshot) {
    const createdAt = new Date().toISOString();
    const safeTimestamp = createdAt.replace(/[:.]/g, "-");
    const baseName = `${REPORT_FILE_PREFIX}${safeTimestamp}`;
    const fileName = `${baseName}.zip`;
    const filePath = path.join(this.diagnosticsDir, fileName);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "shield-support-"));
    const jsonPath = path.join(tempDir, `${baseName}.json`);
    const payload = buildSupportBundle(this.app, snapshot, createdAt);

    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");
    createZipArchive(jsonPath, filePath);
    fs.rmSync(tempDir, { recursive: true, force: true });

    return {
      fileName,
      filePath,
      createdAt,
      keyboardCount: snapshot.devices.total
    };
  }

  getSummary() {
    const files = fs
      .readdirSync(this.diagnosticsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.startsWith(REPORT_FILE_PREFIX) && entry.name.endsWith(".zip"))
      .map((entry) => {
        const filePath = path.join(this.diagnosticsDir, entry.name);
        const stats = fs.statSync(filePath);
        return {
          fileName: entry.name,
          filePath,
          createdAt: stats.mtime.toISOString(),
          sizeKb: Math.max(1, Math.round(stats.size / 1024))
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      total: files.length,
      files: files.slice(0, 12)
    };
  }
}

function buildSupportBundle(app, snapshot, createdAt) {
  return {
    generatedAt: createdAt,
    purpose: "Local-only support diagnostics for GitHub issue reporting. No keystrokes, typed content, passwords, clipboard data, screenshots, screen contents, personal documents, or user file paths are included.",
    application: {
      productName: app.getName(),
      version: app.getVersion(),
      platform: snapshot.system.platform,
      platformName: snapshot.system.platformName,
      protectionMode: snapshot.protection.activeMode,
      privacyReadinessScore: snapshot.protection.privacyReadinessScore,
      protectionEnabled: snapshot.protection.protectionEnabled,
      emergencyMode: snapshot.protection.emergencyMode
    },
    devices: {
      total: snapshot.devices.total,
      trustedCount: snapshot.devices.trustedCount,
      health: snapshot.devices.health,
      lastRefreshAt: snapshot.devices.lastRefreshAt,
      comparison: snapshot.devices.comparison,
      devices: snapshot.devices.devices.map((device) => ({
        name: device.name,
        connectionType: device.connectionType,
        vendorId: device.vendorId,
        productId: device.productId,
        status: device.status,
        trustLevel: device.trustLevel,
        confidence: device.confidence,
        confidenceReason: device.confidenceReason
        }))
    },
    workspace: {
      classification: snapshot.workspace.workspaceClassification,
      riskScore: snapshot.workspace.workspaceRiskScore,
      screenSharingDetected: snapshot.workspace.screenSharingDetected,
      screenCaptureDetected: snapshot.workspace.screenCaptureDetected,
      streamingEnvironmentDetected: snapshot.workspace.streamingEnvironmentDetected,
      monitorCount: snapshot.workspace.monitorCount
    },
    system: {
      operatingSystemVersion: snapshot.system.windowsVersion,
      operatingSystemBuild: snapshot.system.windowsBuild,
      themeStatus: snapshot.system.windowsThemeStatus,
      powerMode: snapshot.system.powerMode,
      firewallStatus: snapshot.system.firewallStatus,
      bluetoothStatus: snapshot.system.bluetoothStatus,
      usbStatus: snapshot.system.usbStatus,
      batteryStatus: snapshot.system.batteryStatus
    },
    storage: {
      portableMode: Boolean(snapshot.storage?.portableMode),
      externalDriveRequired: Boolean(snapshot.storage?.externalDriveRequired),
      externalDriveDetected: Boolean(snapshot.storage?.externalDriveDetected),
      allowed: Boolean(snapshot.storage?.allowed)
    },
    releaseHealth: snapshot.releaseHealth
  };
}

function createZipArchive(sourcePath, zipPath) {
  if (process.platform === "win32") {
    const command = [
      "Compress-Archive",
      "-LiteralPath",
      `'${escapePowerShell(sourcePath)}'`,
      "-DestinationPath",
      `'${escapePowerShell(zipPath)}'`,
      "-Force"
    ].join(" ");
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        command
      ],
      { windowsHide: true }
    );
    return;
  }

  if (process.platform === "darwin") {
    execFileSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", sourcePath, zipPath]);
    return;
  }

  execFileSync("zip", ["-j", zipPath, sourcePath]);
}

function escapePowerShell(value) {
  return String(value).replace(/'/g, "''");
}

module.exports = { DiagnosticsManager };
