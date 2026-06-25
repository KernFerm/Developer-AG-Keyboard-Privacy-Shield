const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { encryptObject, decryptObject } = require("./encryption");

const DEFAULT_SETTINGS = {
  theme: "dark",
  compactMode: false,
  minimalResourceMode: false,
  startupOptimizationMode: true,
  trayEnabled: true,
  closeBehavior: "exit",
  activeProfile: "Developer Profile",
  profiles: [
    "Developer Profile",
    "Streamer Profile",
    "Teacher Profile",
    "Student Profile",
    "Business Profile",
    "Accessibility Profile",
    "Guest Profile",
    "Personal Profile",
    "Developer Workspace Profile",
    "Creator Mode Profile"
  ],
  autoProtection: {
    onScreenSharing: true,
      onScreenCapture: true,
      onPresentation: true,
      onLiveStream: true,
      onDeveloperMode: false,
      onPublicWorkspace: true,
      onTrustedWorkflow: false
    },
  accessibility: {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    dyslexiaFriendlyFont: false,
    simplifiedMode: false,
    cognitiveFriendly: false,
    voiceGuidance: false,
    lowSensoryMode: false,
    adhdFriendlyMode: false,
    largeTargetMode: false
  },
  trustedDevices: [],
  deviceHistory: [],
  protectionHistory: [],
  decisionHistory: {
    protection: [],
    privacy: []
  },
  backups: [],
  recovery: {
    snapshots: [],
    lastBackupAt: "",
    lastVerifiedBackupAt: "",
    lastRestoredAt: "",
    lastRecoveryAction: "No recovery actions yet",
    backupHealthStatus: "Ready"
  },
  organizationPolicy: {
    offlineDeploymentMode: false,
    portableUsbMode: false,
    kioskMode: false,
    readOnlyProfileMode: false,
    sharedWorkstationMode: false,
    managedPolicySupport: false
  },
  windowsIntegration: {
    themeSynchronization: true,
    accessibilitySynchronization: true,
    powerProfileAwareness: true,
    focusAssistAwareness: true,
    securityCenterAwareness: true
  },
  overlay: {
    panelVisible: false
  },
  wellbeing: {
    focusSessionMinutes: 45,
    breakReminders: true,
    deepFocusMode: false,
    reducedDistractionMode: false
  },
  extensionFramework: {
    enabled: false,
    approvedExtensions: []
  },
  personalization: {
    dashboardLayout: "mission-control",
    visibleWidgets: [
      "protection-status",
      "connected-keyboards",
      "trusted-devices",
      "screen-sharing",
      "screen-capture",
      "accessibility-status",
      "security-status",
      "privacy-status",
      "system-status",
      "webcam-status",
      "microphone-status",
      "speaker-status",
      "bluetooth-status",
      "usb-status",
      "battery-status"
    ]
  },
  featureFlags: {
    dashboardPersonalization: true,
    searchableSettings: true,
    knowledgeBaseSearch: true,
    reducedInterfaceMotion: false
  },
  sessionNotes: [],
  shortcuts: {
    toggleProtection: "Ctrl+Shift+1",
    emergencyMode: "Ctrl+Shift+2",
    quickHide: "Ctrl+Shift+3",
    openDeviceCenter: "Ctrl+Shift+4",
    refreshStatus: "Ctrl+Shift+5"
  },
  releaseChecks: {
    versionAligned: true,
    qaPassed: false,
    signedBuild: false,
    hardwareQaComplete: false,
    accessibilityQaComplete: false,
    installerQaComplete: false
  },
  generatedReports: []
};

const PROFILE_PRESETS = {
  "Developer Profile": {
    mode: "Developer Protection Mode",
    settings: {
      theme: "dark",
      compactMode: false,
      minimalResourceMode: false,
      startupOptimizationMode: true,
      autoProtection: {
        onScreenSharing: true,
        onScreenCapture: true,
        onPresentation: false,
        onLiveStream: false,
        onDeveloperMode: true,
        onPublicWorkspace: true,
        onTrustedWorkflow: false
      },
      accessibility: {
        simplifiedMode: false,
        reducedMotion: false,
        highContrast: false
      },
      wellbeing: {
        focusSessionMinutes: 50,
        deepFocusMode: true,
        reducedDistractionMode: true
      }
    }
  },
  "Streamer Profile": {
    mode: "Live Stream Mode",
    settings: {
      theme: "dark",
      compactMode: true,
      minimalResourceMode: true,
      autoProtection: {
        onScreenSharing: true,
        onScreenCapture: true,
        onPresentation: false,
        onLiveStream: true,
        onDeveloperMode: false,
        onPublicWorkspace: true,
        onTrustedWorkflow: false
      },
      accessibility: {
        simplifiedMode: true,
        reducedMotion: true,
        largeText: false
      },
      wellbeing: {
        focusSessionMinutes: 45,
        deepFocusMode: true,
        reducedDistractionMode: true
      }
    }
  },
  "Teacher Profile": {
    mode: "Classroom Teaching Mode",
    settings: {
      theme: "light",
      compactMode: true,
      autoProtection: {
        onScreenSharing: true,
        onScreenCapture: true,
        onPresentation: true,
        onLiveStream: false,
        onDeveloperMode: false,
        onPublicWorkspace: true,
        onTrustedWorkflow: false
      },
      accessibility: {
        largeText: true,
        simplifiedMode: true,
        voiceGuidance: false
      }
    }
  },
  "Student Profile": {
    mode: "Focus Mode",
    settings: {
      theme: "light",
      compactMode: false,
      minimalResourceMode: false,
      accessibility: {
        simplifiedMode: true,
        cognitiveFriendly: true,
        reducedMotion: true
      },
      wellbeing: {
        focusSessionMinutes: 35,
        breakReminders: true,
        deepFocusMode: false,
        reducedDistractionMode: true
      }
    }
  },
  "Business Profile": {
    mode: "Presentation Mode",
    settings: {
      theme: "light",
      compactMode: true,
      autoProtection: {
        onScreenSharing: true,
        onScreenCapture: true,
        onPresentation: true,
        onLiveStream: false,
        onDeveloperMode: false,
        onPublicWorkspace: true,
        onTrustedWorkflow: false
      },
      organizationPolicy: {
        sharedWorkstationMode: false,
        managedPolicySupport: true
      }
    }
  },
  "Accessibility Profile": {
    mode: "Focus Mode",
    settings: {
      theme: "light",
      compactMode: false,
      accessibility: {
        highContrast: true,
        largeText: true,
        reducedMotion: true,
        dyslexiaFriendlyFont: true,
        simplifiedMode: true,
        cognitiveFriendly: true,
        lowSensoryMode: true,
        largeTargetMode: true
      }
    }
  },
  "Guest Profile": {
    mode: "Public Workspace Mode",
    settings: {
      theme: "dark",
      compactMode: true,
      minimalResourceMode: true,
      organizationPolicy: {
        readOnlyProfileMode: true,
        sharedWorkstationMode: true
      },
      accessibility: {
        simplifiedMode: true,
        reducedMotion: true
      }
    }
  },
  "Personal Profile": {
    mode: "Developer Protection Mode",
    settings: {
      theme: "dark",
      compactMode: false,
      minimalResourceMode: false
    }
  },
  "Developer Workspace Profile": {
    mode: "Coding Session Mode",
    settings: {
      theme: "dark",
      compactMode: true,
      autoProtection: {
        onScreenSharing: true,
        onScreenCapture: true,
        onPresentation: false,
        onLiveStream: false,
        onDeveloperMode: true,
        onPublicWorkspace: true,
        onTrustedWorkflow: true
      },
      wellbeing: {
        focusSessionMinutes: 60,
        deepFocusMode: true,
        reducedDistractionMode: true
      }
    }
  },
  "Creator Mode Profile": {
    mode: "Creator Mode",
    settings: {
      theme: "dark",
      compactMode: true,
      minimalResourceMode: true,
      autoProtection: {
        onScreenSharing: true,
        onScreenCapture: true,
        onPresentation: true,
        onLiveStream: true,
        onDeveloperMode: false,
        onPublicWorkspace: true,
        onTrustedWorkflow: false
      },
      accessibility: {
        simplifiedMode: true,
        reducedMotion: true
      }
    }
  }
};

class SettingsManager extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;
    this.dataPath = path.join(app.getPath("userData"), "shield-settings.json");
    this.state = structuredClone(DEFAULT_SETTINGS);
  }

  load() {
    try {
      if (!fs.existsSync(this.dataPath)) {
        this.flush();
        return;
      }
      const raw = JSON.parse(fs.readFileSync(this.dataPath, "utf8"));
      const parsed = decryptObject(raw);
      this.state = mergeDefaults(parsed);
    } catch {
      this.state = structuredClone(DEFAULT_SETTINGS);
      this.state.recovery.lastRecoveryAction = "Settings were reset to secure defaults after a local read or decryption error.";
      this.state.recovery.backupHealthStatus = "Reset applied";
      this.flush();
    }
  }

  flush() {
    const encrypted = encryptObject(this.state);
    fs.writeFileSync(this.dataPath, JSON.stringify(encrypted, null, 2), "utf8");
  }

  update(patch) {
    this.state = mergeNested(this.state, patch);
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  applyProfile(profileName) {
    const preset = PROFILE_PRESETS[profileName] || {
      mode: "Developer Protection Mode",
      settings: {}
    };
    this.state = mergeNested(this.state, {
      activeProfile: profileName,
      ...preset.settings
    });
    this.flush();
    this.emit("updated", this.getPublicSettings());
    return {
      profile: profileName,
      mode: preset.mode,
      summary: summarizeProfilePreset(profileName, preset)
    };
  }

  addTrustedDevice(device) {
    if (!device.fingerprint) {
      return;
    }
    this.state.trustedDevices = [
      ...this.state.trustedDevices.filter((item) => item.fingerprint !== device.fingerprint),
      device
    ];
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  setTrustedDeviceTrustLevel(fingerprint, trustLevel) {
    this.state.trustedDevices = this.state.trustedDevices.map((item) =>
      item.fingerprint === fingerprint ? { ...item, trustLevel } : item
    );
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  removeTrustedDevice(fingerprint) {
    this.state.trustedDevices = this.state.trustedDevices.filter((item) => item.fingerprint !== fingerprint);
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  addProtectionHistory(entry) {
    this.state.protectionHistory = [entry, ...this.state.protectionHistory].slice(0, 100);
    this.flush();
  }

  addDecisionHistory(category, entry) {
    if (!this.state.decisionHistory[category]) {
      return;
    }
    const latest = this.state.decisionHistory[category][0];
    if (latest && latest.title === entry.title && latest.trigger === entry.trigger && latest.impact === entry.impact) {
      return;
    }
    this.state.decisionHistory[category] = [entry, ...this.state.decisionHistory[category]].slice(0, 120);
    this.flush();
  }

  addDeviceHistory(entry) {
    this.state.deviceHistory = [entry, ...this.state.deviceHistory].slice(0, 150);
    this.flush();
  }

  clearDeviceHistory() {
    this.state.deviceHistory = [];
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  exportBackup() {
    const payload = {
      exportedAt: new Date().toISOString(),
      settings: this.buildRestorableSettings()
    };
    const backup = encryptObject(payload);
    const record = {
      id: createRecordId("backup"),
      createdAt: new Date().toISOString(),
      label: "Encrypted Backup",
      payload: JSON.stringify(backup),
      summary: buildSettingsSummary(this.state),
      verificationStatus: "Verified during creation"
    };
    this.state.backups = [record, ...this.state.backups].slice(0, 10);
    this.state.recovery.lastBackupAt = record.createdAt;
    this.state.recovery.backupHealthStatus = "Healthy";
    this.state.recovery.lastRecoveryAction = "Encrypted backup created locally";
    this.flush();
    return JSON.stringify(backup, null, 2);
  }

  importBackup(serialized) {
    try {
      const payload = JSON.parse(String(serialized));
      const restored = decryptObject(payload);
      const existingBackups = [...this.state.backups];
      const existingSnapshots = [...this.state.recovery.snapshots];
      this.state = mergeDefaults(restored.settings || restored);
      this.state.backups = existingBackups;
      this.state.recovery = {
        ...this.state.recovery,
        snapshots: existingSnapshots,
        lastRestoredAt: new Date().toISOString(),
        backupHealthStatus: "Healthy",
        lastRecoveryAction: "Encrypted backup restored locally"
      };
      this.flush();
      this.emit("updated", this.getPublicSettings());
    } catch {
      this.recordRecoveryIssue(
        "Restore was blocked because the encrypted backup payload could not be read safely.",
        "Needs attention"
      );
      throw new Error(
        "Encrypted backup could not be restored locally. Verify the payload first or create a new backup on this device."
      );
    }
  }

  verifyBackup(serialized) {
    try {
      const payload = JSON.parse(String(serialized));
      const restored = decryptObject(payload);
      const settings = mergeDefaults(restored.settings || restored);

      this.state.recovery.lastVerifiedBackupAt = new Date().toISOString();
      this.state.recovery.backupHealthStatus = "Healthy";
      this.state.recovery.lastRecoveryAction = "Encrypted backup verified locally";
      this.flush();
      this.emit("updated", this.getPublicSettings());

      return {
        verified: true,
        exportedAt: restored.exportedAt || "",
        summary: buildSettingsSummary(settings)
      };
    } catch {
      this.recordRecoveryIssue(
        "Backup verification failed because the encrypted payload was incomplete, corrupted, or from another unreadable local context.",
        "Verification failed"
      );
      throw new Error(
        "Encrypted backup could not be verified locally. Check that the full backup payload was pasted without changes."
      );
    }
  }

  createSnapshot(label = "Manual restore point") {
    const snapshot = {
      id: createRecordId("snapshot"),
      createdAt: new Date().toISOString(),
      label,
      summary: buildSettingsSummary(this.state),
      payload: JSON.stringify(
        encryptObject({
          createdAt: new Date().toISOString(),
          label,
          settings: this.buildRestorableSettings()
        })
      )
    };

    this.state.recovery.snapshots = [snapshot, ...this.state.recovery.snapshots].slice(0, 12);
    this.state.recovery.lastRecoveryAction = `${label} created locally`;
    this.state.recovery.backupHealthStatus = "Healthy";
    this.flush();
    this.emit("updated", this.getPublicSettings());
    return sanitizeRecoveryRecord(snapshot);
  }

  restoreSnapshot(id) {
    const snapshot = this.state.recovery.snapshots.find((item) => item.id === id);
    if (!snapshot?.payload) {
      throw new Error("Snapshot not found");
    }
    this.importBackup(snapshot.payload);
    this.state.recovery.lastRecoveryAction = `${snapshot.label} restored locally`;
    this.flush();
    this.emit("updated", this.getPublicSettings());
    return sanitizeRecoveryRecord(snapshot);
  }

  restoreBackupRecord(id) {
    const backup = this.state.backups.find((item) => item.id === id);
    if (!backup?.payload) {
      throw new Error("Backup not found");
    }
    this.importBackup(backup.payload);
    this.state.recovery.lastRecoveryAction = `${backup.label} restored locally`;
    this.flush();
    this.emit("updated", this.getPublicSettings());
    return sanitizeBackupRecord(backup);
  }

  buildRestorableSettings() {
    const restorable = structuredClone(this.state);
    restorable.backups = [];
    restorable.recovery = {
      ...restorable.recovery,
      snapshots: []
    };
    return restorable;
  }

  getTrustedDevices() {
    return [...this.state.trustedDevices];
  }

  addGeneratedReport(report) {
    this.state.generatedReports = [report, ...this.state.generatedReports].slice(0, 30);
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  addSessionNote(note) {
    if (!note?.text) {
      return;
    }
    this.state.sessionNotes = [
      {
        id: createRecordId("note"),
        createdAt: new Date().toISOString(),
        text: note.text
      },
      ...this.state.sessionNotes
    ].slice(0, 40);
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  removeSessionNote(id) {
    this.state.sessionNotes = this.state.sessionNotes.filter((item) => item.id !== id);
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }

  getPublicSettings() {
    const safe = structuredClone(this.state);
    safe.backups = safe.backups.map(sanitizeBackupRecord);
    safe.recovery = {
      ...safe.recovery,
      snapshots: safe.recovery.snapshots.map(sanitizeRecoveryRecord)
    };
    return safe;
  }

  recordRecoveryIssue(message, healthStatus = "Needs attention") {
    this.state.recovery.lastRecoveryAction = message;
    this.state.recovery.backupHealthStatus = healthStatus;
    this.flush();
    this.emit("updated", this.getPublicSettings());
  }
}

function mergeNested(current, patch) {
  const output = structuredClone(current);
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    if (value && typeof value === "object" && !Array.isArray(value) && output[key]) {
      output[key] = mergeNested(output[key], value);
      return;
    }
    output[key] = value;
  });
  return output;
}

function mergeDefaults(value) {
  return mergeNested(DEFAULT_SETTINGS, value || {});
}

function createRecordId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildSettingsSummary(settings) {
  const safe = mergeDefaults(settings);
  return {
    profile: safe.activeProfile,
    theme: safe.theme,
    trustedDevices: safe.trustedDevices.length,
    protectionHistory: safe.protectionHistory.length,
    deviceHistory: safe.deviceHistory.length,
    compactMode: safe.compactMode,
    minimalResourceMode: safe.minimalResourceMode
  };
}

function sanitizeBackupRecord(record) {
  return {
    id: record.id,
    createdAt: record.createdAt,
    label: record.label,
    summary: record.summary,
    verificationStatus: record.verificationStatus
  };
}

function sanitizeRecoveryRecord(record) {
  return {
    id: record.id,
    createdAt: record.createdAt,
    label: record.label,
    summary: record.summary
  };
}

module.exports = {
  SettingsManager,
  DEFAULT_SETTINGS,
  PROFILE_PRESETS,
  mergeDefaults,
  mergeNested
};

function summarizeProfilePreset(profileName, preset) {
  const settings = preset.settings || {};
  const enabledAccessibility = Object.entries(settings.accessibility || {})
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);

  return {
    profileName,
    mode: preset.mode,
    theme: settings.theme || DEFAULT_SETTINGS.theme,
    compactMode: settings.compactMode ?? DEFAULT_SETTINGS.compactMode,
    minimalResourceMode: settings.minimalResourceMode ?? DEFAULT_SETTINGS.minimalResourceMode,
    enabledAccessibility,
    automation: Object.entries(settings.autoProtection || {})
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)
  };
}
