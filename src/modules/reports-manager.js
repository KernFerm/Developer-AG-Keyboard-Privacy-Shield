const fs = require("fs");
const path = require("path");

class ReportsManager {
  constructor(app) {
    this.reportsDir = path.join(app.getPath("userData"), "reports");
    fs.mkdirSync(this.reportsDir, { recursive: true });
  }

  generateAndSave(snapshot, request) {
    const fileName = `${slug(request.type)}-${Date.now()}.txt`;
    const filePath = path.join(this.reportsDir, fileName);
    const content = buildReport(snapshot, request);
    fs.writeFileSync(filePath, content, "utf8");
    return {
      fileName,
      filePath,
      createdAt: new Date().toISOString(),
      type: request.type
    };
  }

  preview(snapshot, request) {
    const content = buildReport(snapshot, request);
    return {
      type: request.type,
      createdAt: new Date().toISOString(),
      summary: buildPreviewSummary(snapshot, request),
      content
    };
  }

  getReportsSummary() {
    const files = fs
      .readdirSync(this.reportsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".txt"))
      .map((entry) => {
        const filePath = path.join(this.reportsDir, entry.name);
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
      files: files.slice(0, 15)
    };
  }
}

function buildReport(snapshot, request) {
  const sections = [
    header(request.type),
    section("Privacy Protection Status", [
      `Protection Enabled: ${snapshot.protection.protectionEnabled}`,
      `Emergency Privacy Mode: ${snapshot.protection.emergencyMode}`,
      `Active Mode: ${snapshot.protection.activeMode}`,
      `Privacy Readiness Score: ${snapshot.protection.privacyReadinessScore}%`,
      `Protection Coverage Score: ${snapshot.protection.protectionCoverageScore}%`
    ]),
    section("Trusted Device Status", [
      `Connected Keyboards: ${snapshot.devices.total}`,
      `Trusted Devices Connected: ${snapshot.devices.trustedCount}`,
      ...snapshot.devices.devices.map(
        (device) =>
          `${device.name} | ${device.connectionType} | ${device.status} | Trust: ${device.trustLevel}`
      )
    ]),
    section("Workspace Protection Status", [
      `Monitor Count: ${snapshot.workspace.monitorCount}`,
      `Screen Sharing Detected: ${snapshot.workspace.screenSharingDetected}`,
      `Screen Capture Detected: ${snapshot.workspace.screenCaptureDetected}`,
      `Streaming Environment Detected: ${snapshot.workspace.streamingEnvironmentDetected}`,
      `Workspace Risk Score: ${snapshot.workspace.workspaceRiskScore}%`,
      `Workspace Classification: ${snapshot.workspace.workspaceClassification}`,
      `Remote Desktop Detected: ${snapshot.workspace.remoteDesktopDetected}`
    ]),
    section("Accessibility Status", [
      `High Contrast: ${snapshot.settings.accessibility.highContrast}`,
      `Large Text: ${snapshot.settings.accessibility.largeText}`,
      `Reduced Motion: ${snapshot.settings.accessibility.reducedMotion}`,
      `Simplified Mode: ${snapshot.settings.accessibility.simplifiedMode}`
    ]),
    section("Security Health Status", [
      `Security Status: ${snapshot.security.status}`,
      `Encryption Status: ${snapshot.security.encryptionStatus}`,
      `IPC Security Status: ${snapshot.security.ipcSecurityStatus}`,
      `Configuration Status: ${snapshot.security.configurationStatus}`,
      `Firewall Status: ${snapshot.system.firewallStatus}`
    ]),
    section("Release Health Status", [
      `Release Version: ${snapshot.releaseHealth.version}`,
      `Version Aligned: ${snapshot.releaseHealth.versionAligned}`,
      `QA Passed: ${snapshot.releaseHealth.qaPassed}`,
      `Signed Build: ${snapshot.releaseHealth.signedBuild}`,
      `Hardware QA Complete: ${snapshot.releaseHealth.hardwareQaComplete}`,
      `Accessibility QA Complete: ${snapshot.releaseHealth.accessibilityQaComplete}`,
      `Installer QA Complete: ${snapshot.releaseHealth.installerQaComplete}`,
      `Release Ready: ${snapshot.releaseHealth.releaseReady}`
    ]),
    section("Windows and Hardware Awareness", [
      `Windows Version: ${snapshot.system.windowsVersion}`,
      `Windows Build: ${snapshot.system.windowsBuild}`,
      `Theme Status: ${snapshot.system.windowsThemeStatus}`,
      `Power Mode: ${snapshot.system.powerMode}`,
      `Bluetooth Status: ${snapshot.system.bluetoothStatus}`,
      `USB Status: ${snapshot.system.usbStatus}`,
      `Battery Status: ${snapshot.system.batteryStatus}`,
      `Public Network Warning: ${snapshot.system.publicWifiWarning}`
    ]),
    section("Enterprise and Policy Modes", [
      `Offline Deployment Mode: ${snapshot.settings.organizationPolicy.offlineDeploymentMode}`,
      `Portable USB Mode: ${snapshot.settings.organizationPolicy.portableUsbMode}`,
      `Kiosk Mode: ${snapshot.settings.organizationPolicy.kioskMode}`,
      `Read-Only Profile Mode: ${snapshot.settings.organizationPolicy.readOnlyProfileMode}`,
      `Shared Workstation Mode: ${snapshot.settings.organizationPolicy.sharedWorkstationMode}`,
      `Managed Policy Support: ${snapshot.settings.organizationPolicy.managedPolicySupport}`
    ]),
    section("Performance Intelligence", [
      `Application Performance Score: ${snapshot.system.appPerformanceScore}%`,
      `Resource Efficiency Score: ${snapshot.system.resourceEfficiencyScore}%`,
      `Startup Performance Score: ${snapshot.system.startupPerformanceScore}%`,
      `Battery Efficiency Score: ${snapshot.system.batteryEfficiencyScore}%`,
      `System Load Awareness: ${snapshot.system.systemLoadAwareness}`
    ]),
    section("Diagnostics Summary", [
      `Detection Source: ${snapshot.devices.health?.source || "Windows inventory"}`,
      `Detection Status: ${snapshot.devices.health?.status || "Unknown"}`,
      `Last Device Refresh: ${snapshot.devices.lastRefreshAt || "Not refreshed yet"}`,
      `Support Bundles Saved: ${snapshot.diagnostics.total}`,
      `Device Comparison Added: ${(snapshot.devices.comparison?.added || []).join(", ") || "None"}`,
      `Device Comparison Removed: ${(snapshot.devices.comparison?.removed || []).join(", ") || "None"}`
    ])
  ];

  if (request.includeRecommendations) {
    sections.push(
      section(
        "Recommendations",
        snapshot.insights.recommendations.map((item) => `${item.title}: ${item.reason}`)
      )
    );
  }

  if (request.includeHistory) {
    sections.push(
      section(
        "Recent Protection Events",
        snapshot.protection.recentEvents.map((item) => `${item.timestamp} - ${item.message}`)
      ),
      section(
        "Protection Decision History",
        snapshot.settings.decisionHistory.protection.map(
          (item) => `${item.timestamp} - ${item.title} - ${item.trigger} - ${item.impact}`
        )
      ),
      section(
        "Privacy Decision History",
        snapshot.settings.decisionHistory.privacy.map(
          (item) => `${item.timestamp} - ${item.title} - ${item.trigger} - ${item.impact}`
        )
      ),
      section(
        "Connected Device Timeline",
        snapshot.settings.deviceHistory.map(
          (item) => `${item.timestamp} - ${item.type} - ${item.name} - ${item.details}`
        )
      )
    );
  }

  sections.push(
    section("What We Do Not Collect", [
      "Keystrokes",
      "Typed content",
      "Passwords",
      "Clipboard contents",
      "Source code",
      "Screen contents",
      "Webcam footage",
      "Microphone recordings",
      "Analytics",
      "Telemetry"
    ])
  );

  return sections.join("\n\n");
}

function buildPreviewSummary(snapshot, request) {
  return {
    includeHistory: request.includeHistory,
    includeRecommendations: request.includeRecommendations,
    sections: [
      "Privacy Protection Status",
      "Trusted Device Status",
      "Workspace Protection Status",
      "Accessibility Status",
      "Security Health Status",
      "Windows and Hardware Awareness",
      "Enterprise and Policy Modes",
      "Performance Intelligence",
      "Diagnostics Summary",
      "Release Health Status",
      request.includeRecommendations ? "Recommendations" : null,
      request.includeHistory ? "Recent Protection Events" : null,
      request.includeHistory ? "Protection Decision History" : null,
      request.includeHistory ? "Privacy Decision History" : null,
      request.includeHistory ? "Connected Device Timeline" : null,
      "What We Do Not Collect"
    ].filter(Boolean),
    privacyReadiness: snapshot.protection.privacyReadinessScore,
    trustedDevices: snapshot.devices.trustedCount,
    connectedKeyboards: snapshot.devices.total,
    workspaceRisk: snapshot.workspace.workspaceRiskScore,
    securityScore: snapshot.system.securityScore
  };
}

function header(title) {
  return `${title}\nGenerated locally: ${new Date().toLocaleString()}\nApplication: Developer Anti Ghosting Keyboard Privacy Shield`;
}

function section(title, lines) {
  return `${title}\n${"-".repeat(title.length)}\n${lines.length ? lines.join("\n") : "No data available."}`;
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = { ReportsManager };
