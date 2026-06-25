function sanitizeString(value, maxLength = 120) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/[<>&"'`]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function sanitizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function sanitizeArray(value, maxItems = 24) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, maxItems);
}

function sanitizeShortcut(value) {
  return sanitizeString(value, 40).replace(/[^A-Za-z0-9+]/g, "");
}

function sanitizeCloseBehavior(value) {
  const normalized = sanitizeString(value, 16).toLowerCase();
  return ["exit", "tray"].includes(normalized) ? normalized : undefined;
}

function sanitizeSettingsPatch(payload) {
  const safe = payload && typeof payload === "object" ? payload : {};
  return {
    theme: sanitizeString(safe.theme, 24) || undefined,
    compactMode: sanitizeBoolean(safe.compactMode, undefined),
    minimalResourceMode: sanitizeBoolean(safe.minimalResourceMode, undefined),
    startupOptimizationMode: sanitizeBoolean(safe.startupOptimizationMode, undefined),
    trayEnabled: sanitizeBoolean(safe.trayEnabled, undefined),
    closeBehavior: sanitizeCloseBehavior(safe.closeBehavior),
    autoProtection: {
      onScreenSharing: sanitizeBoolean(safe.autoProtection?.onScreenSharing),
      onScreenCapture: sanitizeBoolean(safe.autoProtection?.onScreenCapture),
      onPresentation: sanitizeBoolean(safe.autoProtection?.onPresentation),
      onLiveStream: sanitizeBoolean(safe.autoProtection?.onLiveStream),
      onDeveloperMode: sanitizeBoolean(safe.autoProtection?.onDeveloperMode),
      onPublicWorkspace: sanitizeBoolean(safe.autoProtection?.onPublicWorkspace),
      onTrustedWorkflow: sanitizeBoolean(safe.autoProtection?.onTrustedWorkflow)
    },
    accessibility: {
      highContrast: sanitizeBoolean(safe.accessibility?.highContrast),
      largeText: sanitizeBoolean(safe.accessibility?.largeText),
      reducedMotion: sanitizeBoolean(safe.accessibility?.reducedMotion),
      dyslexiaFriendlyFont: sanitizeBoolean(safe.accessibility?.dyslexiaFriendlyFont),
      simplifiedMode: sanitizeBoolean(safe.accessibility?.simplifiedMode),
      cognitiveFriendly: sanitizeBoolean(safe.accessibility?.cognitiveFriendly),
      voiceGuidance: sanitizeBoolean(safe.accessibility?.voiceGuidance),
      lowSensoryMode: sanitizeBoolean(safe.accessibility?.lowSensoryMode),
      adhdFriendlyMode: sanitizeBoolean(safe.accessibility?.adhdFriendlyMode),
      largeTargetMode: sanitizeBoolean(safe.accessibility?.largeTargetMode)
    },
    activeProfile: sanitizeString(safe.activeProfile, 48) || undefined,
    organizationPolicy: {
      offlineDeploymentMode: sanitizeBoolean(safe.organizationPolicy?.offlineDeploymentMode),
      portableUsbMode: sanitizeBoolean(safe.organizationPolicy?.portableUsbMode),
      kioskMode: sanitizeBoolean(safe.organizationPolicy?.kioskMode),
      readOnlyProfileMode: sanitizeBoolean(safe.organizationPolicy?.readOnlyProfileMode),
      sharedWorkstationMode: sanitizeBoolean(safe.organizationPolicy?.sharedWorkstationMode),
      managedPolicySupport: sanitizeBoolean(safe.organizationPolicy?.managedPolicySupport)
    },
    windowsIntegration: {
      themeSynchronization: sanitizeBoolean(safe.windowsIntegration?.themeSynchronization),
      accessibilitySynchronization: sanitizeBoolean(safe.windowsIntegration?.accessibilitySynchronization),
      powerProfileAwareness: sanitizeBoolean(safe.windowsIntegration?.powerProfileAwareness),
      focusAssistAwareness: sanitizeBoolean(safe.windowsIntegration?.focusAssistAwareness),
      securityCenterAwareness: sanitizeBoolean(safe.windowsIntegration?.securityCenterAwareness)
    },
    overlay: {
      panelVisible: sanitizeBoolean(safe.overlay?.panelVisible)
    },
    wellbeing: {
      focusSessionMinutes: Math.max(15, Math.min(120, Number(safe.wellbeing?.focusSessionMinutes) || 45)),
      breakReminders: sanitizeBoolean(safe.wellbeing?.breakReminders),
      deepFocusMode: sanitizeBoolean(safe.wellbeing?.deepFocusMode),
      reducedDistractionMode: sanitizeBoolean(safe.wellbeing?.reducedDistractionMode)
    },
    extensionFramework: {
      enabled: sanitizeBoolean(safe.extensionFramework?.enabled),
      approvedExtensions: sanitizeArray(safe.extensionFramework?.approvedExtensions, 20).map((item) =>
        sanitizeString(item, 80)
      )
    },
    personalization: {
      dashboardLayout: sanitizeString(safe.personalization?.dashboardLayout, 32) || undefined,
      visibleWidgets: sanitizeArray(safe.personalization?.visibleWidgets, 24).map((item) => sanitizeString(item, 48))
    },
    featureFlags: {
      dashboardPersonalization: sanitizeBoolean(safe.featureFlags?.dashboardPersonalization),
      searchableSettings: sanitizeBoolean(safe.featureFlags?.searchableSettings),
      knowledgeBaseSearch: sanitizeBoolean(safe.featureFlags?.knowledgeBaseSearch),
      reducedInterfaceMotion: sanitizeBoolean(safe.featureFlags?.reducedInterfaceMotion)
    },
    shortcuts: {
      toggleProtection: sanitizeShortcut(safe.shortcuts?.toggleProtection) || undefined,
      emergencyMode: sanitizeShortcut(safe.shortcuts?.emergencyMode) || undefined,
      quickHide: sanitizeShortcut(safe.shortcuts?.quickHide) || undefined,
      openDeviceCenter: sanitizeShortcut(safe.shortcuts?.openDeviceCenter) || undefined,
      refreshStatus: sanitizeShortcut(safe.shortcuts?.refreshStatus) || undefined
    },
    releaseChecks: {
      versionAligned: sanitizeBoolean(safe.releaseChecks?.versionAligned),
      qaPassed: sanitizeBoolean(safe.releaseChecks?.qaPassed),
      signedBuild: sanitizeBoolean(safe.releaseChecks?.signedBuild),
      hardwareQaComplete: sanitizeBoolean(safe.releaseChecks?.hardwareQaComplete),
      accessibilityQaComplete: sanitizeBoolean(safe.releaseChecks?.accessibilityQaComplete),
      installerQaComplete: sanitizeBoolean(safe.releaseChecks?.installerQaComplete)
    }
  };
}

function sanitizeTrustPayload(payload) {
  const safe = payload && typeof payload === "object" ? payload : {};
  return {
    fingerprint: sanitizeString(safe.fingerprint, 200),
    name: sanitizeString(safe.name, 120),
    vendorId: sanitizeString(safe.vendorId, 40),
    productId: sanitizeString(safe.productId, 40),
    trustLevel: sanitizeString(safe.trustLevel, 24) || "Trusted"
  };
}

function sanitizeDevice(device) {
  return {
    name: sanitizeString(device.name, 120) || "Unknown keyboard",
    connectionType: sanitizeString(device.connectionType, 48) || "Unknown",
    vendorId: sanitizeString(device.vendorId, 40) || "Unavailable",
    productId: sanitizeString(device.productId, 40) || "Unavailable",
    deviceId: sanitizeString(device.deviceId, 200) || "Unavailable",
    status: sanitizeString(device.status, 48) || "Unknown"
  };
}

function sanitizeList(list, mapper, maxItems = 50) {
  return sanitizeArray(list, maxItems).map(mapper);
}

function sanitizeReportRequest(payload) {
  const safe = payload && typeof payload === "object" ? payload : {};
  return {
    type: sanitizeString(safe.type, 64) || "Privacy Readiness Report",
    includeHistory: sanitizeBoolean(safe.includeHistory, true),
    includeRecommendations: sanitizeBoolean(safe.includeRecommendations, true)
  };
}

function sanitizeBackupPayload(payload) {
  if (typeof payload === "string") {
    return payload.trim().slice(0, 200000);
  }
  return "";
}

function sanitizeRecordId(value) {
  return sanitizeString(value, 120);
}

function sanitizeSnapshotRequest(payload) {
  const safe = payload && typeof payload === "object" ? payload : {};
  return {
    label: sanitizeString(safe.label, 64) || "Manual restore point"
  };
}

function sanitizeNotePayload(payload) {
  const safe = payload && typeof payload === "object" ? payload : {};
  return {
    text: sanitizeString(safe.text, 240)
  };
}

module.exports = {
  sanitizeString,
  sanitizeSettingsPatch,
  sanitizeTrustPayload,
  sanitizeDevice,
  sanitizeList,
  sanitizeReportRequest,
  sanitizeBackupPayload,
  sanitizeRecordId,
  sanitizeSnapshotRequest,
  sanitizeNotePayload
};
