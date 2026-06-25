function buildInsights(snapshot) {
  const recommendations = [];
  const alerts = [];
  const explanations = [];

  if (snapshot.workspace.screenSharingDetected && !snapshot.protection.protectionEnabled) {
    recommendations.push({
      title: "Enable protection before sharing",
      reason: "A meeting or sharing environment appears active while protection is currently off.",
      benefits: "This reduces visible keystroke feedback and simplifies the on-screen dashboard."
    });
    explanations.push(explainRecommendation("Enable protection before sharing", "A local process associated with screen sharing was detected."));
  }

  if (snapshot.workspace.screenCaptureDetected) {
    alerts.push({
      title: "Screen capture awareness alert",
      why: "A local recording environment appears active.",
      nextStep: "Consider Live Stream Mode or Emergency Privacy Mode before continuing."
    });
    explanations.push(explainAlert("Screen capture awareness alert", "A local recording process such as OBS appears active."));
  }

  if (snapshot.devices.devices.some((device) => !device.trusted)) {
    recommendations.push({
      title: "Review unknown keyboards",
      reason: "One or more connected keyboards are not currently marked as trusted.",
      benefits: "Trust review helps maintain an accurate local device trust center."
    });
  }

  if (snapshot.workspace.monitorCount > 1) {
    recommendations.push({
      title: "Use presentation-safe workspace mode",
      reason: "Multiple displays increase the chance of visible workspace exposure.",
      benefits: "Presentation-focused modes reduce clutter and improve awareness during demos or teaching."
    });
  }

  if (!snapshot.settings.accessibility.simplifiedMode && snapshot.protection.emergencyMode) {
    recommendations.push({
      title: "Keep simplified mode enabled for emergency workflows",
      reason: "Emergency privacy view works best when non-essential detail stays minimized.",
      benefits: "This keeps critical status readable with less visual noise."
    });
  }

  if (snapshot.system.firewallStatus !== "Enabled") {
    alerts.push({
      title: "Windows firewall review suggested",
      why: "The local firewall status could not be confirmed as fully enabled.",
      nextStep: "Review Windows Firewall settings directly. This app does not change them automatically."
    });
  }

  if (snapshot.system.publicWifiWarning !== "No public network warning") {
    alerts.push({
      title: "Public network awareness alert",
      why: "Windows reported a public network profile locally.",
      nextStep: "Consider Public Workspace Mode and avoid exposing sensitive workflow details."
    });
  }

  if (snapshot.workspace.remoteDesktopDetected) {
    recommendations.push({
      title: "Use remote-work-safe workspace settings",
      reason: "A remote desktop session appears active.",
      benefits: "This reduces dashboard clutter and keeps privacy indicators prominent during remote work."
    });
  }

  if (snapshot.system.powerMode === "Power Saver" && !snapshot.settings.minimalResourceMode) {
    recommendations.push({
      title: "Enable minimal resource mode",
      reason: "The system is running in Power Saver mode.",
      benefits: "This can lower app overhead while preserving privacy visibility protections."
    });
  }

  if (snapshot.settings.organizationPolicy.sharedWorkstationMode && !snapshot.settings.organizationPolicy.readOnlyProfileMode) {
    recommendations.push({
      title: "Consider read-only profile mode",
      reason: "Shared workstation mode is enabled without read-only profile protections.",
      benefits: "This helps keep shared configuration changes more controlled in local-only environments."
    });
  }

  if (snapshot.workspace.privacyRecommendations.length) {
    snapshot.workspace.privacyRecommendations.forEach((tip, index) => {
      explanations.push(explainRecommendation(`Workspace recommendation ${index + 1}`, tip));
    });
  }

  const readiness = {
    privacyReadiness: snapshot.protection.privacyReadinessScore,
    workspaceExposure: snapshot.protection.workspaceExposureScore,
    deviceTrust: scoreDevices(snapshot.devices),
    accessibilityReadiness: scoreAccessibility(snapshot.settings),
    securityReadiness: snapshot.system.securityScore,
    performanceReadiness: snapshot.system.appPerformanceScore,
    workspaceReadiness: Math.max(30, 100 - snapshot.workspace.workspaceRiskScore)
  };

  return {
    readiness,
    recommendations,
    alerts,
    explanations,
    commandCenterFeed: [...alerts, ...recommendations].slice(0, 8)
  };
}

function scoreDevices(devices) {
  if (!devices.total) {
    return 60;
  }
  return Math.round((devices.trustedCount / devices.total) * 100);
}

function scoreAccessibility(settings) {
  const enabled = Object.values(settings.accessibility).filter(Boolean).length;
  return Math.min(100, 50 + enabled * 8);
}

function explainRecommendation(title, trigger) {
  return {
    type: "recommendation",
    title,
    trigger,
    impact: "This recommendation may improve privacy readiness, reduce visible exposure, or simplify workspace-safe behavior."
  };
}

function explainAlert(title, trigger) {
  return {
    type: "alert",
    title,
    trigger,
    impact: "This alert appeared to explain a local condition that may increase workspace exposure or reduce privacy confidence."
  };
}

module.exports = { buildInsights };
