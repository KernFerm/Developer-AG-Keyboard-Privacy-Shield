const EventEmitter = require("events");

const MODES = [
  "Developer Protection Mode",
  "Presentation Mode",
  "Live Stream Mode",
  "Public Workspace Mode",
  "Focus Mode",
  "Coding Session Mode",
  "Pair Programming Mode",
  "Classroom Teaching Mode",
  "Conference Presentation Mode",
  "Interview Mode",
  "Open Source Contributor Mode",
  "Public Demo Mode",
  "Coffee Shop Mode",
  "Library Mode",
  "Conference Mode",
  "Meeting Room Mode",
  "Open Office Mode",
  "Creator Mode",
  "Recording Session Mode"
];

class ProtectionService extends EventEmitter {
  constructor(settingsManager) {
    super();
    this.settingsManager = settingsManager;
    this.state = {
      protectionEnabled: true,
      emergencyMode: false,
      quickHideActive: false,
      activeMode: "Developer Protection Mode",
      overlayEnabled: true,
      privacyReadinessScore: 100,
      workspaceExposureScore: 26,
      protectionCoverageScore: 91,
      recentEvents: []
    };
  }

  initialize() {
    this.addEvent("Application started with secure local-only protections enabled.");
    this.addDecision("privacy", {
      title: "Privacy protections initialized",
      trigger: "Application startup completed with local-only secure defaults.",
      impact: "Privacy-ready state is active without collecting keystrokes or typed content."
    });
  }

  addEvent(message) {
    const entry = {
      timestamp: new Date().toISOString(),
      message
    };
    this.state.recentEvents = [entry, ...this.state.recentEvents].slice(0, 25);
    this.settingsManager.addProtectionHistory({
      timestamp: entry.timestamp,
      message,
      protectionEnabled: this.state.protectionEnabled,
      emergencyMode: this.state.emergencyMode
    });
  }

  setProtectionEnabled(enabled, source) {
    this.state.protectionEnabled = enabled;
    this.state.emergencyMode = enabled ? this.state.emergencyMode : false;
    this.state.quickHideActive = enabled ? this.state.quickHideActive : false;
    this.addEvent(`Protection ${enabled ? "enabled" : "disabled"} from ${source}.`);
    this.addDecision("protection", {
      title: `Protection ${enabled ? "enabled" : "disabled"}`,
      trigger: `Protection state changed from ${source}.`,
      impact: enabled
        ? "Visible privacy protections are active."
        : "Visible privacy protections are reduced until re-enabled."
    });
    this.emit("updated", this.state);
  }

  enableEmergencyMode() {
    this.state.protectionEnabled = true;
    this.state.emergencyMode = true;
    this.state.quickHideActive = true;
    this.state.activeMode = "Emergency Privacy Mode";
    this.state.privacyReadinessScore = 100;
    this.state.workspaceExposureScore = 12;
    this.state.protectionCoverageScore = 99;
    this.addEvent("Emergency Privacy Mode activated.");
    this.addDecision("protection", {
      title: "Emergency Privacy Mode activated",
      trigger: "User requested the highest privacy profile immediately.",
      impact: "Non-essential interface detail is reduced and critical privacy indicators stay visible."
    });
    this.emit("updated", this.state);
  }

  restoreNormalMode() {
    this.state.protectionEnabled = true;
    this.state.emergencyMode = false;
    this.state.quickHideActive = false;
    this.state.activeMode = "Developer Protection Mode";
    this.addEvent("Emergency Privacy Mode cleared and normal protection restored.");
    this.addDecision("protection", {
      title: "Normal protection restored",
      trigger: "User explicitly exited Emergency Privacy Mode.",
      impact: "The standard privacy dashboard and workflow protections are visible again."
    });
    this.emit("updated", this.state);
  }

  toggleQuickHide(enabled) {
    this.state.quickHideActive = Boolean(enabled);
    this.addEvent(`Quick Hide Dashboard ${this.state.quickHideActive ? "enabled" : "disabled"}.`);
    this.addDecision("protection", {
      title: this.state.quickHideActive ? "Quick Hide Dashboard enabled" : "Quick Hide Dashboard disabled",
      trigger: "User changed emergency safe-view visibility.",
      impact: this.state.quickHideActive
        ? "Non-essential dashboard detail is hidden for a faster safe view."
        : "Standard dashboard detail is visible again."
    });
    this.emit("updated", this.state);
  }

  setMode(mode) {
    if (!MODES.includes(mode)) {
      return;
    }
    this.state.activeMode = mode;
    this.state.emergencyMode = false;
    this.addEvent(`${mode} activated.`);
    this.addDecision("protection", {
      title: `${mode} activated`,
      trigger: "A protection workflow mode was selected by the user.",
      impact: "Protection behavior and dashboard emphasis are aligned to the selected workflow."
    });
    this.emit("updated", this.state);
  }

  applyAutomaticRules({ workspace, system }) {
    const auto = this.settingsManager.getPublicSettings().autoProtection;
    const shouldEnable =
      (auto.onScreenSharing && workspace.screenSharingDetected) ||
      (auto.onScreenCapture && workspace.screenCaptureDetected) ||
      (auto.onPresentation && workspace.presentationDisplayDetected) ||
      (auto.onLiveStream && workspace.streamingEnvironmentDetected) ||
      (auto.onPublicWorkspace && workspace.publicWorkspaceRisk) ||
      (auto.onTrustedWorkflow && workspace.activeEnvironments.length > 0 && workspace.monitorCount > 1);

    if (shouldEnable && !this.state.protectionEnabled) {
      this.setProtectionEnabled(true, "automatic rule");
      this.addDecision("protection", {
        title: "Protection auto-enabled",
        trigger: describeAutomaticTrigger(workspace),
        impact: "Protection was activated automatically to reduce visible privacy exposure."
      });
    }

    this.state.privacyReadinessScore = calculatePrivacyReadiness({
      protectionEnabled: this.state.protectionEnabled,
      overlayEnabled: this.state.overlayEnabled,
      emergencyMode: this.state.emergencyMode,
      workspace
    });
    this.state.workspaceExposureScore = workspace.workspaceRiskScore;
    this.state.protectionCoverageScore = system.securityScore;

    const privacySummary = describePrivacyReadiness(this.state.privacyReadinessScore, workspace, this.state.protectionEnabled);
    if (privacySummary) {
      this.addDecision("privacy", privacySummary);
    }
  }

  getState() {
    return {
      ...this.state,
      availableModes: MODES,
      emergencyChecklist: buildEmergencyChecklist(this.state, this.settingsManager.getPublicSettings()),
      overlaySummary: this.state.emergencyMode
        ? "Critical-only safe view is active."
        : "Anti Ghosting Privacy Overlay is ready for screen sharing, streaming, and public workspace use."
    };
  }

  addDecision(category, entry) {
    this.settingsManager.addDecisionHistory(category, {
      timestamp: new Date().toISOString(),
      ...entry
    });
  }
}

function calculatePrivacyReadiness({ protectionEnabled, overlayEnabled, emergencyMode, workspace }) {
  if (emergencyMode) {
    return 100;
  }

  let score = 100;

  if (!protectionEnabled) {
    score -= 35;
  }

  if (!overlayEnabled) {
    score -= 15;
  }

  if (workspace.screenSharingDetected && !protectionEnabled) {
    score -= 20;
  }

  if (workspace.screenCaptureDetected && !protectionEnabled) {
    score -= 15;
  }

  if (workspace.streamingEnvironmentDetected && !protectionEnabled) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

function describeAutomaticTrigger(workspace) {
  if (workspace.screenSharingDetected) {
    return "A local screen-sharing environment was detected.";
  }
  if (workspace.screenCaptureDetected) {
    return "A local screen-capture or recording environment was detected.";
  }
  if (workspace.streamingEnvironmentDetected) {
    return "A local streaming environment was detected.";
  }
  if (workspace.publicWorkspaceRisk) {
    return "Public workspace risk indicators were detected locally.";
  }
  return "An automatic privacy rule matched the current workspace conditions.";
}

function describePrivacyReadiness(score, workspace, protectionEnabled) {
  if (score === 100 && protectionEnabled) {
    return {
      title: "Privacy readiness remains at 100%",
      trigger: "Protection is active and no local privacy failure condition is reducing readiness.",
      impact: "The application is currently in its strongest privacy-ready state."
    };
  }

  if (!protectionEnabled) {
    return {
      title: "Privacy readiness reduced",
      trigger: "Protection is currently disabled.",
      impact: "Visible privacy protections are reduced until protection is re-enabled."
    };
  }

  if (workspace.screenSharingDetected || workspace.screenCaptureDetected || workspace.streamingEnvironmentDetected) {
    return {
      title: "Privacy-sensitive workspace detected",
      trigger: "Sharing, capture, or streaming conditions were detected locally.",
      impact: "Readiness remains high, but the workspace requires stronger visible privacy awareness."
    };
  }

  return null;
}

function buildEmergencyChecklist(state, settings) {
  const items = [
    {
      label: "Emergency mode",
      status: state.emergencyMode ? "Active" : "Standby",
      ready: state.emergencyMode
    },
    {
      label: "Quick hide dashboard",
      status: state.quickHideActive ? "Enabled" : "Available",
      ready: state.quickHideActive
    },
    {
      label: "Protection enabled",
      status: state.protectionEnabled ? "Active" : "Inactive",
      ready: state.protectionEnabled
    },
    {
      label: "Simplified accessibility support",
      status: settings.accessibility.simplifiedMode ? "Enabled" : "Recommended",
      ready: settings.accessibility.simplifiedMode
    }
  ];

  const readyCount = items.filter((item) => item.ready).length;
  return {
    readinessScore: Math.round((readyCount / items.length) * 100),
    items
  };
}

module.exports = { ProtectionService };
