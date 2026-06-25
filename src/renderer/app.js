const sections = [
  { id: "dashboard", label: "Dashboard" },
  { id: "command-center", label: "Privacy Command Center" },
  { id: "privacy-center", label: "Privacy Center" },
  { id: "security-center", label: "Security Center" },
  { id: "windows-center", label: "Windows Center" },
  { id: "hardware-center", label: "Hardware Center" },
  { id: "accessibility", label: "Accessibility" },
  { id: "device-center", label: "Device Center" },
  { id: "diagnostics-center", label: "Diagnostics Center" },
  { id: "workspace-center", label: "Workspace Center" },
  { id: "policy-center", label: "Policy Center" },
  { id: "wellbeing-center", label: "Wellbeing Center" },
  { id: "profile-center", label: "Profile Center" },
  { id: "reports-center", label: "Reports Center" },
  { id: "backup-center", label: "Backup Center" },
  { id: "extension-center", label: "Extension Center" },
  { id: "transparency-center", label: "Transparency Center" },
  { id: "emergency-center", label: "Emergency Center" },
  { id: "knowledge-base", label: "Knowledge Base" },
  { id: "about", label: "About" },
  { id: "how-to-use", label: "How To Use" },
  { id: "privacy", label: "Privacy Information" },
  { id: "security", label: "Security Information" },
  { id: "what-we-do-not-collect", label: "What We Do Not Collect" }
];

const TRUST_LEVELS = ["Trusted", "Verified", "Known", "Unknown", "Restricted"];
const REPORT_TYPES = [
  "Privacy Readiness Report",
  "Workspace Readiness Report",
  "Accessibility Readiness Report",
  "Device Security Report",
  "Protection Coverage Report",
  "Local Audit Report",
  "Developer Environment Report",
  "Streaming Environment Report",
  "Executive Summary Report"
];
const DASHBOARD_LAYOUTS = [
  { value: "mission-control", label: "Mission Control" },
  { value: "focus", label: "Focus View" },
  { value: "compact", label: "Compact Grid" }
];
const CLOSE_BEHAVIOR_OPTIONS = [
  { value: "exit", label: "Close exits app" },
  { value: "tray", label: "Close minimizes to tray" }
];
const DASHBOARD_WIDGETS = [
  { id: "protection-status", label: "Protection Status Card" },
  { id: "connected-keyboards", label: "Connected Keyboards Card" },
  { id: "trusted-devices", label: "Trusted Devices Card" },
  { id: "screen-sharing", label: "Screen Sharing Status Card" },
  { id: "screen-capture", label: "Screen Capture Status Card" },
  { id: "accessibility-status", label: "Accessibility Status Card" },
  { id: "security-status", label: "Security Status Card" },
  { id: "privacy-status", label: "Privacy Status Card" },
  { id: "system-status", label: "System Status Card" },
  { id: "webcam-status", label: "Webcam Status Card" },
  { id: "microphone-status", label: "Microphone Status Card" },
  { id: "speaker-status", label: "Speaker Status Card" },
  { id: "bluetooth-status", label: "Bluetooth Status Card" },
  { id: "usb-status", label: "USB Device Status Card" },
  { id: "battery-status", label: "Battery Status Card" }
];
const FEATURE_FLAG_OPTIONS = [
  { key: "dashboardPersonalization", label: "Dashboard Personalization", description: "Allow layout presets and widget visibility controls." },
  { key: "searchableSettings", label: "Searchable Settings", description: "Show search within management centers and settings-heavy sections." },
  { key: "knowledgeBaseSearch", label: "Knowledge Base Search", description: "Keep section search active in the offline knowledge base." },
  { key: "reducedInterfaceMotion", label: "Reduced Interface Motion", description: "Reduce non-essential interface motion and animated atmosphere." }
];
const KNOWLEDGE_BASE_CONTENT = {
  privacyGuides: [
    ["No keystroke recording", "The app never stores typed characters, commands, passwords, or private text."],
    ["No typed content display", "Protection status and alerts never echo what you typed."],
    ["No analytics or telemetry", "No usage analytics, ad IDs, or cloud telemetry are sent anywhere."],
    ["Local-only processing", "Device, workspace, and protection decisions remain on this computer or portable drive."]
  ],
  accessibilityGuides: [
    ["Large text and contrast", "Use Large Text and High Contrast when you need clearer reading and stronger separation."],
    ["Reduced motion", "Reduced Motion lowers interface movement for lower sensory load and steadier focus."],
    ["Dyslexia-friendly font", "The accessibility profile can switch to a reading-friendlier presentation style."],
    ["Keyboard-only use", "Primary controls remain reachable without mouse-dependent workflows."]
  ],
  workspaceTips: [
    ["Public workspace safety", "Use Public Workspace Mode or Emergency Privacy Mode before coding in shared environments."],
    ["Streaming readiness", "Keep protection on before OBS, Zoom, Teams, Discord, or similar sharing tools are active."],
    ["Device trust review", "Review newly connected keyboards before marking them trusted on shared or travel setups."],
    ["Portable storage use", "Run packaged builds from your flash drive or external SSD/HDD to keep data portable and local."]
  ],
  troubleshooting: [
    ["Keyboard not identified clearly", "Open Device Center and refresh local status so Windows metadata is re-queried."],
    ["Protection score changed", "Check Transparency Center for protection and privacy decision history explanations."],
    ["Backup restore failed", "Verify the encrypted payload in Backup Center before attempting restore."],
    ["Portable build blocked", "Packaged builds must run from removable or external storage, not an internal drive."]
  ]
};
const PROFILE_PRESET_DESCRIPTIONS = {
  "Developer Profile": "Balanced defaults for coding, demos, and everyday local development work.",
  "Streamer Profile": "Minimizes visible clutter and keeps automatic privacy activation strong during streaming.",
  "Teacher Profile": "Optimized for presentations and classroom sharing with clearer visible guidance.",
  "Student Profile": "Supports focus, reduced distraction, and accessibility-friendly study workflows.",
  "Business Profile": "Prioritizes presentation safety and managed privacy posture for professional use.",
  "Accessibility Profile": "Applies stronger readability, contrast, motion reduction, and larger interaction targets.",
  "Guest Profile": "Safer defaults for shared or temporary use with stronger read-only and public-workspace emphasis.",
  "Personal Profile": "Simple local-only defaults without strong specialization.",
  "Developer Workspace Profile": "Focuses on deep work sessions, trusted workflow automation, and coding privacy.",
  "Creator Mode Profile": "Supports creator and recording workflows with reduced visual noise and stronger automation."
};

let currentState;
let activeSection = "dashboard";
let selectedReportType = REPORT_TYPES[0];
let sectionSearch = "";
let reportIncludeHistory = true;
let reportIncludeRecommendations = true;
let reportPreview = null;
let backupVerification = null;
let backupFeedback = null;
let diagnosticsFeedback = null;

const nav = document.querySelector("#sidebar-nav");
const cardsGrid = document.querySelector("#cards-grid");
const detailPanels = document.querySelector("#detail-panels");
const hero = document.querySelector("#hero");
const quickActions = document.querySelector("#quick-actions");
const pageTitle = document.querySelector("#page-title");
const onboarding = document.querySelector("#onboarding");
const modeSelect = document.querySelector("#mode-select");
const menuSelect = document.querySelector("#menu-select");
const modeMenu = document.querySelector("#mode-menu");
const menuMenu = document.querySelector("#menu-menu");
const toggleButton = document.querySelector("#toggle-protection");
const emergencyButton = document.querySelector("#emergency-button");

const quickMenuItems = [
  { value: "about", label: "About" },
  { value: "how-to-use", label: "How To Use" },
  { value: "privacy", label: "Privacy Information" },
  { value: "security", label: "Security Information" },
  { value: "accessibility", label: "Accessibility" },
  { value: "what-we-do-not-collect", label: "What We Do Not Collect" },
  { value: "exit", label: "Exit" }
];

function renderNavigation() {
  nav.innerHTML = sections
    .map(
      (section) =>
        `<button class="${activeSection === section.id ? "active" : ""}" data-section="${section.id}">${section.label}</button>`
    )
    .join("");
  nav.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.section));
  });
}

function navigate(sectionId) {
  activeSection = sectionId;
  sectionSearch = "";
  render();
}

function getSectionLabel(sectionId = activeSection) {
  return sections.find((section) => section.id === sectionId)?.label || "Dashboard";
}

function percent(value) {
  return `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

function formatBool(value) {
  return value ? "Active" : "Inactive";
}

function platformName() {
  return currentState?.system?.platformName || "Windows";
}

function isMacPlatform() {
  return currentState?.system?.platform === "darwin";
}

function platformMetadataLabel() {
  return isMacPlatform() ? "macOS metadata" : "Windows metadata";
}

function extractCount(value) {
  const match = String(value || "").match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function compactMetricValue(label, system) {
  switch (label) {
    case "webcam":
      return extractCount(system.webcamStatus) ? `${extractCount(system.webcamStatus)} cams` : "None";
    case "microphone":
      return extractCount(system.microphoneStatus) ? `${extractCount(system.microphoneStatus)} mic` : "None";
    case "speaker":
      return extractCount(system.speakerStatus) ? `${extractCount(system.speakerStatus)} spkr` : "None";
    case "bluetooth":
      return system.bluetoothDeviceCount ? `${system.bluetoothDeviceCount} BT` : "None";
    default:
      return "N/A";
  }
}

function formatShortcutLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase())
    .trim();
}

function renderHero() {
  if (activeSection !== "dashboard") {
    renderSectionHero();
    return;
  }
  const { protection, insights, devices, system } = currentState;
  const feed = insights.commandCenterFeed.length
    ? insights.commandCenterFeed.map((item) => `<span class="tag">${item.title}</span>`).join("")
    : '<span class="tag">No urgent recommendations right now</span>';

  hero.innerHTML = `
    <div class="hero-main">
      <div class="status-pill">${protection.protectionEnabled ? "Protection On" : "Protection Off"}</div>
      <h3 class="metric">${percent(protection.privacyReadinessScore)}</h3>
      <p class="muted">${protection.overlaySummary}</p>
      <div class="tag-group">
        <span class="tag">${protection.activeMode}</span>
        <span class="tag">${currentState.settings.activeProfile}</span>
        <span class="tag">${system.windowsVersion}</span>
        ${feed}
      </div>
    </div>
    <div class="hero-stats compact-summary-rail">
      ${metricCard("Trusted Devices", devices.trustedCount, "Encrypted")}
      ${metricCard("Workspace Risk", percent(currentState.workspace.workspaceRiskScore), "Current score")}
      ${metricCard("Security", percent(system.securityScore), "Local only")}
      ${metricCard("Performance", percent(system.appPerformanceScore), "App only")}
    </div>
  `;
}

function renderSectionHero() {
  const sectionTitle = getSectionLabel();
  const { protection, system, insights } = currentState;
  const searchEnabled = currentState.settings.featureFlags?.searchableSettings !== false;
  const summaryMap = {
    "command-center": "Live local recommendations, alerts, and readiness signals.",
    "privacy-center": "Privacy guarantees, history, and local-only processing status.",
    "security-center": "Integrity, encryption, and local security awareness.",
    "windows-center": `${platformName()}-focused awareness, theme, power, and focus status.`,
    "hardware-center": "Camera, microphone, speaker, USB, Bluetooth, and battery summaries.",
    "diagnostics-center": "Keyboard detection details, local report ZIP files, scan comparisons, and release health.",
    "how-to-use": "Step-by-step guidance for setup, trusted devices, sharing, and emergency privacy actions.",
    "device-center": "Connected keyboard trust, approval workflow, and local device timeline.",
    "workspace-center": "Workspace exposure, sharing awareness, and environment classification.",
    "policy-center": "Enterprise, shared workstation, kiosk, and managed policy settings.",
    "wellbeing-center": "Performance, focus session, and distraction reduction settings.",
    "reports-center": "Local-only reports and saved export summaries.",
    "backup-center": "Encrypted backup and restore workflows.",
    "extension-center": "Approved local modules and extension framework controls.",
    "transparency-center": "Why alerts appeared, what is monitored, and what is never collected.",
    "emergency-center": "Rapid privacy controls and emergency workspace readiness.",
    "knowledge-base": "Offline help, privacy guides, and troubleshooting references."
  };

  hero.innerHTML = `
    <div class="hero-main section-hero-main">
      <div class="status-pill">${protection.protectionEnabled ? "Protection On" : "Protection Off"}</div>
      <h3 class="metric section-hero-title">${sectionTitle}</h3>
      <p class="muted">${summaryMap[activeSection] || "Local-only privacy and workspace controls for this section."}</p>
      ${searchEnabled ? `
        <div class="section-search">
          <label for="section-search-input">Search this section</label>
          <input
            id="section-search-input"
            class="section-search-input"
            type="search"
            value="${escapeHtml(sectionSearch)}"
            placeholder="${sectionSearchPlaceholder()}"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      ` : ""}
      <div class="tag-group">
        <span class="tag">${protection.activeMode}</span>
        <span class="tag">${currentState.settings.activeProfile}</span>
        <span class="tag">${system.windowsVersion}</span>
        <span class="tag">${percent(insights.readiness.privacyReadiness)} privacy</span>
      </div>
    </div>
  `;
}

function sectionSearchPlaceholder() {
  if (activeSection === "knowledge-base" && currentState.settings.featureFlags?.knowledgeBaseSearch === false) {
    return "Knowledge base search is disabled in feature flags.";
  }
  const map = {
    "windows-center": "Search theme, power, focus, security...",
    "accessibility": "Search large text, contrast, motion, font...",
    "how-to-use": "Search setup, trusted device, sharing, emergency...",
    "device-center": "Search keyboard, USB, trust, timeline...",
    "diagnostics-center": "Search diagnostics, release, overlay, support...",
    "policy-center": "Search kiosk, portable, offline, shared...",
    "profile-center": "Search profile, theme, mode...",
    "reports-center": "Search reports, readiness, accessibility...",
    "backup-center": "Search backup, restore, recovery...",
    "knowledge-base": "Search guides, troubleshooting, privacy..."
  };
  return map[activeSection] || "Search settings, status, and explanations...";
}

function metricCard(title, value, caption) {
  return `<div class="card compact-stat hero-stat-card"><h3>${title}</h3><div class="metric">${value}</div><p class="muted">${caption}</p></div>`;
}

const quickActionsMap = {};
function renderQuickActions() {
  Object.keys(quickActionsMap).forEach((key) => delete quickActionsMap[key]);
  quickActions.innerHTML = [
    quickButton("Refresh local status", () => window.shieldApi.refreshAll()),
    quickButton("Generate privacy report", () => generateReport("Privacy Readiness Report")),
    quickButton("Enable Emergency Privacy Mode", () => window.shieldApi.triggerEmergency()),
    quickButton("Switch to Streamer Profile", () => window.shieldApi.updateSettings({ activeProfile: "Streamer Profile" })),
    quickButton("Enable High Contrast", () => patchAccessibility("highContrast", true)),
    quickButton("Enable Portable USB Mode", () => patchPolicy("portableUsbMode", true)),
    quickButton("Start Coding Stream", () => window.shieldApi.applyPreset("Start Coding Stream")),
    quickButton("Start Presentation", () => window.shieldApi.applyPreset("Start Presentation")),
    quickButton("Start Public Workspace Mode", () => window.shieldApi.applyPreset("Start Public Workspace Mode"))
  ].join("");

  quickActions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => quickActionsMap[button.dataset.action]?.());
  });
}

function quickButton(label, handler) {
  const id = `action-${Math.random().toString(36).slice(2)}`;
  quickActionsMap[id] = handler;
  return `<button data-action="${id}">${label}</button>`;
}

async function generateReport(type) {
  const result = await window.shieldApi.generateReport({
    type,
    includeHistory: reportIncludeHistory,
    includeRecommendations: reportIncludeRecommendations
  });
  alert(`Local report generated.\n\n${result.filePath}`);
}

async function previewReport(type) {
  reportPreview = await window.shieldApi.previewReport({
    type,
    includeHistory: reportIncludeHistory,
    includeRecommendations: reportIncludeRecommendations
  });
  renderPanels();
}

async function backupSettings() {
  const payload = await window.shieldApi.backupSettings();
  backupFeedback = {
    tone: "success",
    title: "Encrypted backup created locally",
    message: "You can verify or restore this payload later from Backup Center. Nothing was uploaded."
  };
  const textarea = document.querySelector("#backup-output");
  if (textarea) {
    textarea.value = payload;
    renderPanels();
  } else {
    alert(`Encrypted settings backup generated locally.\n\n${payload.slice(0, 220)}...`);
  }
}

async function restoreSettings() {
  const textarea = document.querySelector("#restore-input");
  if (!textarea?.value.trim()) {
    backupFeedback = {
      tone: "warning",
      title: "Backup payload needed",
      message: "Paste a full encrypted backup payload before trying to restore settings locally."
    };
    renderPanels();
    alert("Paste an encrypted backup payload first.");
    return;
  }
  try {
    await window.shieldApi.restoreSettings(textarea.value);
    textarea.value = "";
    backupFeedback = {
      tone: "success",
      title: "Encrypted backup restored locally",
      message: "Your saved settings were restored on this device. Review Backup Center and Security Center if anything looks unexpected."
    };
    renderPanels();
    alert("Encrypted settings restored locally.");
  } catch (error) {
    backupFeedback = {
      tone: "danger",
      title: "Restore was blocked",
      message: error?.message || "The backup payload could not be restored safely on this device."
    };
    renderPanels();
    alert(backupFeedback.message);
  }
}

async function verifyBackupSettings() {
  const textarea = document.querySelector("#restore-input");
  if (!textarea?.value.trim()) {
    backupFeedback = {
      tone: "warning",
      title: "Backup payload needed",
      message: "Paste a full encrypted backup payload before running local verification."
    };
    renderPanels();
    alert("Paste an encrypted backup payload first.");
    return;
  }
  try {
    backupVerification = await window.shieldApi.verifyBackupSettings(textarea.value);
    backupFeedback = {
      tone: "success",
      title: "Backup verified locally",
      message: "The encrypted payload can be read on this device and is ready for local restore when needed."
    };
    renderPanels();
  } catch (error) {
    backupVerification = null;
    backupFeedback = {
      tone: "danger",
      title: "Verification failed",
      message: error?.message || "The backup payload could not be verified safely on this device."
    };
    renderPanels();
    alert(backupFeedback.message);
  }
}

async function createSnapshot() {
  const label = `Restore point ${new Date().toLocaleString()}`;
  await window.shieldApi.createSnapshot(label);
  backupFeedback = {
    tone: "success",
    title: "Restore point created locally",
    message: "A configuration snapshot is now available from Backup Center."
  };
  renderPanels();
  alert("Local restore point created.");
}

async function prepareEmergencyMode() {
  await window.shieldApi.prepareEmergencyMode();
  alert("Emergency restore point created and Emergency Privacy Mode activated.");
}

async function restoreLatestSnapshot() {
  const snapshots = currentState.settings.recovery?.snapshots || [];
  if (!snapshots.length) {
    alert("No local restore points are available yet.");
    return;
  }
  await window.shieldApi.restoreSnapshot(snapshots[0].id);
  alert("Latest local restore point restored.");
}

async function restoreSavedBackup(id) {
  try {
    await window.shieldApi.restoreSavedBackup(id);
    backupVerification = null;
    alert("Saved encrypted backup restored locally.");
  } catch {
    alert("That saved backup could not be restored.");
  }
}

async function restoreSnapshotAction(id) {
  try {
    await window.shieldApi.restoreSnapshot(id);
    backupVerification = null;
    alert("Configuration snapshot restored locally.");
  } catch {
    alert("That configuration snapshot could not be restored.");
  }
}

async function applyProfilePreset(profileName) {
  const result = await window.shieldApi.applyProfile(profileName);
  alert(`Applied ${result.profile}.\n\nMode: ${result.mode}`);
}

function patchAccessibility(key, value) {
  return window.shieldApi.updateSettings({
    accessibility: {
      ...currentState.settings.accessibility,
      [key]: value
    }
  });
}

function patchPolicy(key, value) {
  return window.shieldApi.updateSettings({
    organizationPolicy: {
      ...currentState.settings.organizationPolicy,
      [key]: value
    }
  });
}

function patchWindowsIntegration(key, value) {
  return window.shieldApi.updateSettings({
    windowsIntegration: {
      ...currentState.settings.windowsIntegration,
      [key]: value
    }
  });
}

function patchWellbeing(key, value) {
  return window.shieldApi.updateSettings({
    wellbeing: {
      ...currentState.settings.wellbeing,
      [key]: value
    }
  });
}

function card(title, body, footer = "") {
  return `<article class="card"><h3>${title}</h3>${body}${footer ? `<p class="muted">${footer}</p>` : ""}</article>`;
}

function list(items) {
  return `<div class="list">${items.map((item) => `<div class="list-item">${item}</div>`).join("")}</div>`;
}

function noticeCard(title, message, tone = "info") {
  return `
    <div class="notice notice-${tone}" role="status" aria-live="polite">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function confidenceBadge(device) {
  return `<span class="tag">${escapeHtml(device.confidence || "Limited Windows metadata")}</span>`;
}

function renderDashboardCards() {
  const { protection, devices, workspace, system, security, settings } = currentState;
  const emergency = protection.emergencyMode;
  const quickHide = protection.quickHideActive;
  const personalizationEnabled = settings.featureFlags?.dashboardPersonalization !== false;
  const registry = emergency
    ? {
        "protection-status": card("Protection Status Card", `<div class="metric">Emergency</div>`, "Critical-only privacy view is active."),
        "privacy-status": card("Privacy Status Card", `<div class="metric">${percent(protection.privacyReadinessScore)}</div>`, "Visible details are reduced to essential indicators."),
        "security-status": card("Security Status Card", `<div class="metric">${security.status}</div>`, "Security and integrity monitoring remain active.")
      }
    : {
        "protection-status": card("Protection Status Card", `<div class="metric">${protection.protectionEnabled ? "On" : "Off"}</div>`, "Anti Ghosting Privacy Overlay is available without collecting typed content."),
        "connected-keyboards": card("Connected Keyboards Card", `<div class="metric">${devices.total}</div>${deviceDropdown("Connected keyboards", `${devices.total} detected`, deviceSummary(devices.devices, false, 5, true))}`),
        "trusted-devices": card("Trusted Devices Card", `<div class="metric">${devices.trustedCount}</div>${deviceDropdown("Trusted devices", `${devices.trustedCount} trusted`, trustedDeviceControls(devices.devices, 5, true))}`),
        "screen-sharing": card("Screen Sharing Status Card", `<div class="metric">${formatBool(workspace.screenSharingDetected)}</div>`, "Detected from local process heuristics only. No screen contents are captured."),
        "screen-capture": card("Screen Capture Status Card", `<div class="metric">${formatBool(workspace.screenCaptureDetected)}</div>`, "Local process awareness only."),
        "accessibility-status": card("Accessibility Status Card", `<div class="metric">${settings.accessibility.highContrast || settings.accessibility.largeText ? "Customized" : "Default"}</div>`, "Accessibility settings are stored locally using encrypted preferences."),
        "security-status": card("Security Status Card", `<div class="metric">${security.status}</div>`, "Configuration integrity and IPC allowlists validated at startup."),
        "privacy-status": card("Privacy Status Card", `<div class="metric">${percent(protection.privacyReadinessScore)}</div>`, "Your keystrokes are not recorded. Typed content is never saved."),
        "system-status": card("System Status Card", `<div class="metric">${system.firewallStatus}</div>`, "Windows status is displayed locally and never uploaded."),
        "webcam-status": card("Webcam Status Card", `<div class="metric">${compactMetricValue("webcam", system)}</div>`, "Local camera status only."),
        "microphone-status": card("Microphone Status Card", `<div class="metric">${compactMetricValue("microphone", system)}</div>`, "Local microphone status only."),
        "speaker-status": card("Speaker Status Card", `<div class="metric">${compactMetricValue("speaker", system)}</div>`, "Audio endpoint awareness only."),
        "bluetooth-status": card("Bluetooth Status Card", `<div class="metric">${compactMetricValue("bluetooth", system)}</div>`, "Bluetooth device metadata only."),
        "usb-status": card("USB Device Status Card", `<div class="metric">${system.usbDeviceCount}</div>`, "USB device counts are local-only summaries."),
        "battery-status": card("Battery Status Card", `<div class="metric">${system.batteryStatus}</div>`, "Battery and power mode are advisory local status only.")
      };

  const preferredWidgets = personalizationEnabled && settings.personalization?.visibleWidgets?.length
    ? settings.personalization.visibleWidgets
    : DASHBOARD_WIDGETS.map((widget) => widget.id);
  const widgetOrder = emergency
    ? preferredWidgets.filter((id) => registry[id])
    : preferredWidgets.filter((id) => registry[id]);
  const cards = quickHide
    ? [registry["protection-status"], registry["privacy-status"], registry["security-status"]].filter(Boolean)
    : widgetOrder.length ? widgetOrder.map((id) => registry[id]) : Object.values(registry);

  cardsGrid.dataset.dashboardLayout = personalizationEnabled
    ? settings.personalization?.dashboardLayout || "mission-control"
    : "mission-control";
  cardsGrid.innerHTML = cards.join("");
  bindDeviceButtons(cardsGrid);
}

function deviceDropdown(label, summary, content) {
  return `
    <details class="card-dropdown">
      <summary>
        <span>${label}</span>
        <span class="card-dropdown-meta">${summary}</span>
      </summary>
      <div class="card-dropdown-body">
        ${content}
      </div>
    </details>
  `;
}

function deviceSummary(devices, withControls, limit = devices.length, accordion = false) {
  if (!devices.length) {
    return `<p class="muted">No keyboard metadata is currently available from local ${platformName()} device queries.</p>`;
  }
  const visibleDevices = devices.slice(0, limit);
  const hiddenCount = Math.max(0, devices.length - visibleDevices.length);
  if (accordion) {
    return `<div class="list compact-list">${visibleDevices
      .map(
        (device) => `
          <details class="device-accordion">
            <summary>
              <span class="device-accordion-title">${device.name}</span>
              <span class="tag">${device.connectionType}</span>
            </summary>
            <div class="device-accordion-body">
              <div class="muted">${device.connectionType}</div>
              <div class="muted">VID ${device.vendorId} | PID ${device.productId}</div>
              <div class="muted">${escapeHtml(device.confidence || "Limited Windows metadata")}</div>
            </div>
          </details>
        `
      )
      .join("")}${hiddenCount ? `<div class="list-item compact-overflow"><span>More devices</span><strong>+${hiddenCount}</strong></div>` : ""}</div>`;
  }
  return `<div class="list compact-list">${visibleDevices
    .map(
      (device) => `
          <div class="device-row">
            <div>
              <strong title="${escapeHtml(device.name)}">${device.name}</strong>
              <div class="muted">${device.connectionType} | ${device.vendorId}/${device.productId}</div>
              <div class="muted">${escapeHtml(device.confidence || "Limited Windows metadata")}</div>
            </div>
            <div class="tag-group">
            <span class="tag">${device.connectionType}</span>
            ${confidenceBadge(device)}
            ${withControls ? trustLevelSelect(device) : ""}
            </div>
          </div>
      `
    )
    .join("")}${hiddenCount ? `<div class="list-item compact-overflow"><span>More devices</span><strong>+${hiddenCount}</strong></div>` : ""}</div>`;
}

function trustedDeviceControls(devices, limit = devices.length) {
  const visibleDevices = devices.slice(0, limit);
  const hiddenCount = Math.max(0, devices.length - visibleDevices.length);
  if (limit && limit !== devices.length) {
    return `<div class="list compact-list">${visibleDevices
      .map((device) => {
        const action = device.trusted ? "Remove trusted" : "Mark trusted";
        return `
          <details class="device-accordion">
            <summary>
              <span class="device-accordion-title">${device.name}</span>
              <span class="tag">${device.connectionType}</span>
            </summary>
            <div class="device-accordion-body">
              <div class="muted">${device.trusted ? "Trusted" : "Untrusted"}</div>
              <div class="muted">${escapeHtml(device.confidence || "Limited Windows metadata")}</div>
              <div class="accordion-actions">
                <button data-fingerprint="${device.fingerprint}" data-name="${device.name}" data-trusted="${device.trusted}">${action}</button>
                ${trustLevelSelect(device)}
              </div>
            </div>
          </details>
        `;
      })
      .join("")}${hiddenCount ? `<div class="list-item compact-overflow"><span>More devices</span><strong>+${hiddenCount}</strong></div>` : ""}</div>`;
  }
  return `<div class="list compact-list">${visibleDevices
    .map((device) => {
      const action = device.trusted ? "Remove trusted" : "Mark trusted";
      return `
        <div class="device-row">
          <div>
            <strong title="${escapeHtml(device.name)}">${device.name}</strong>
            <div class="muted">${device.connectionType} | ${device.trusted ? "Trusted" : "Untrusted"}</div>
            <div class="muted">${escapeHtml(device.confidence || "Limited Windows metadata")}</div>
          </div>
          <div class="tag-group">
            <button data-fingerprint="${device.fingerprint}" data-name="${device.name}" data-trusted="${device.trusted}">${action}</button>
            ${trustLevelSelect(device)}
          </div>
        </div>
      `;
    })
    .join("")}${hiddenCount ? `<div class="list-item compact-overflow"><span>More devices</span><strong>+${hiddenCount}</strong></div>` : ""}</div>`;
}

function trustLevelSelect(device) {
  return customSelect({
    id: `trust-${device.fingerprint}`,
    value: device.trustLevel,
    options: TRUST_LEVELS.map((level) => ({ value: level, label: level })),
    triggerClass: "trust-level-select",
    menuClass: "trust-level-menu",
    optionData: {
      "data-trust-device": device.fingerprint
    }
  });
}

function bindDeviceButtons(root) {
  root.querySelectorAll("[data-fingerprint]").forEach((button) => {
    button.addEventListener("click", async () => {
      const fingerprint = button.dataset.fingerprint;
      if (button.dataset.trusted === "true") {
        await window.shieldApi.removeTrustedDevice(fingerprint);
      } else {
        await window.shieldApi.trustDevice({
          fingerprint,
          name: button.dataset.name,
          trustLevel: "Trusted"
        });
      }
    });
  });

  root.querySelectorAll("[data-trust-device]").forEach((option) => {
    option.addEventListener("click", () => {
      commitCustomSelectOption(option);
      window.shieldApi.setDeviceTrustLevel(option.dataset.trustDevice, option.dataset.value);
    });
  });
}

function customSelect({ id, value, options, triggerClass = "", menuClass = "", optionData = {} }) {
  const selected = options.find((option) => option.value === value) || options[0];
  const sharedData = Object.entries(optionData)
    .map(([key, val]) => `${key}="${val}"`)
    .join(" ");

  return `
    <details class="custom-select ${triggerClass}" data-custom-select="${id}">
      <summary class="custom-select-trigger">
        <span>${selected?.label || ""}</span>
      </summary>
      <div class="custom-select-menu ${menuClass}">
        ${options
          .map(
            (option) => `
              <button
                class="custom-select-option ${option.value === selected?.value ? "active" : ""}"
                type="button"
                data-select-option="${id}"
                data-value="${option.value}"
                ${sharedData}
              >${option.label}</button>
            `
          )
          .join("")}
      </div>
    </details>
  `;
}

function commitCustomSelectOption(option) {
  const select = option.closest(".custom-select");
  if (!select) {
    return;
  }
  select.querySelectorAll(".custom-select-option").forEach((item) => {
    item.classList.toggle("active", item === option);
  });
  const label = option.textContent.trim();
  const triggerLabel = select.querySelector(".custom-select-trigger span");
  if (triggerLabel) {
    triggerLabel.textContent = label;
  }
  select.dataset.value = option.dataset.value;
  select.open = false;
}

function closeCustomSelects(except = null) {
  document.querySelectorAll(".custom-select[open]").forEach((select) => {
    if (select !== except) {
      select.open = false;
    }
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderPanels() {
  const panelsBySection = {
    dashboard: renderDashboardPanels(),
    "command-center": renderCommandCenterPanels(),
    "privacy-center": renderPrivacyCenterPanels(),
    "security-center": renderSecurityCenterPanels(),
    "windows-center": renderWindowsCenterPanels(),
    "hardware-center": renderHardwareCenterPanels(),
    accessibility: renderAccessibilityPanels(),
    "device-center": renderDeviceCenterPanels(),
    "diagnostics-center": renderDiagnosticsCenterPanels(),
    "workspace-center": renderWorkspaceCenterPanels(),
    "policy-center": renderPolicyCenterPanels(),
    "wellbeing-center": renderWellbeingPanels(),
    "profile-center": renderProfileCenterPanels(),
    "reports-center": renderReportsCenterPanels(),
    "backup-center": renderBackupCenterPanels(),
    "extension-center": renderExtensionCenterPanels(),
    "transparency-center": renderTransparencyPanels(),
    "emergency-center": renderEmergencyPanels(),
    "knowledge-base": renderKnowledgePanels(),
    about: [panel("About", `
      <p>Developer Anti Ghosting Keyboard Privacy Shield is a privacy-first, local-only Windows-focused desktop app for reducing visible keystroke exposure while you code, teach, stream, or present.</p>
      ${list([
        "<span>Local-only processing</span><strong>Yes</strong>",
        "<span>Keystroke recording</span><strong>Never</strong>",
        "<span>Public release docs</span><strong>Included in the repo and summarized in-app</strong>",
        "<span>Windows hardware QA</span><strong>Required before public release</strong>"
      ])}
    `)],
    "how-to-use": renderHowToUsePanels(),
    privacy: [panel("Privacy Information", `
      <p>Everything stays on your computer. No analytics are used. No telemetry is used. No logs containing personal information are collected.</p>
      ${list([
        "<span>Privacy policy</span><strong>Available in the repo public release docs</strong>",
        "<span>Known limitations</span><strong>Documented for Windows device metadata and naming variance</strong>",
        "<span>Support and troubleshooting</span><strong>Included offline in the repo docs and Knowledge Base guidance</strong>",
        "<span>Windows detection explanation</span><strong>Available from Device Center and Knowledge Base</strong>"
      ])}
    `)],
    security: [panel("Security Information", `
      <p>Context isolation, sandbox mode, disabled Node integration, strict IPC allowlists, input sanitization, and encrypted local settings are enabled by design.</p>
      ${list([
        "<span>IPC</span><strong>Allowlisted channels only</strong>",
        "<span>Preload bridge</span><strong>Restricted surface only</strong>",
        "<span>Renderer CSP</span><strong>Strict self-only policy</strong>",
        "<span>Manual release review</span><strong>Code signing, accessibility QA, and installer QA still required</strong>"
      ])}
    `)],
    "what-we-do-not-collect": [panel("What We Do Not Collect", `
      <div class="tag-group">
        <span class="tag">Keystrokes</span>
        <span class="tag">Typed content</span>
        <span class="tag">Passwords</span>
        <span class="tag">Clipboard contents</span>
        <span class="tag">Documents</span>
        <span class="tag">Source code</span>
        <span class="tag">Screen contents</span>
        <span class="tag">Screen recordings</span>
        <span class="tag">Webcam footage</span>
        <span class="tag">Microphone recordings</span>
        <span class="tag">Personal information</span>
        <span class="tag">Analytics</span>
        <span class="tag">Telemetry</span>
        <span class="tag">Advertising identifiers</span>
        <span class="tag">User profiles for tracking</span>
      </div>
    `)]
  };

  detailPanels.innerHTML = (panelsBySection[activeSection] || renderDashboardPanels()).join("");
  bindSectionControls();
  applySectionSearchFilter();
}

function renderDashboardPanels() {
  return [
    panel("Privacy Mission Control", `
      <p>Your keystrokes are not recorded. Your typed content is never saved. No analytics or telemetry are used.</p>
      ${readinessList()}
    `),
    panel("Security Health Dashboard", `
      ${list([
        `<span>Encryption status</span><strong>${currentState.security.encryptionStatus}</strong>`,
        `<span>IPC security status</span><strong>${currentState.security.ipcSecurityStatus}</strong>`,
        `<span>Configuration status</span><strong>${currentState.security.configurationStatus}</strong>`,
        `<span>Permission status</span><strong>${currentState.security.permissionStatus}</strong>`
      ])}
    `),
    panel(`${platformName()} Integration`, `
      ${list([
        `<span>${platformName()} version</span><strong>${currentState.system.windowsVersion}</strong>`,
        `<span>Theme status</span><strong>${currentState.system.windowsThemeStatus}</strong>`,
        `<span>Power mode</span><strong>${currentState.system.powerMode}</strong>`,
        `<span>Focus assist awareness</span><strong>${currentState.system.windowsFocusAssistStatus}</strong>`
      ])}
    `),
    panel("Performance Intelligence", `
      ${list([
        `<span>Application performance score</span><strong>${percent(currentState.system.appPerformanceScore)}</strong>`,
        `<span>Resource efficiency score</span><strong>${percent(currentState.system.resourceEfficiencyScore)}</strong>`,
        `<span>Battery efficiency score</span><strong>${percent(currentState.system.batteryEfficiencyScore)}</strong>`,
        `<span>System load awareness</span><strong>${currentState.system.systemLoadAwareness}</strong>`
      ])}
    `)
  ];
}

function renderCommandCenterPanels() {
  return [
    panel("Unified Privacy Command Center", `
      <p>This command center summarizes privacy, accessibility, security, device trust, workspace awareness, hardware status, and protection readiness using local-only processing.</p>
      ${readinessList()}
    `),
    panel("One-Click Safe Sharing Presets", `
      <div class="panel-actions">
        <button class="sharing-preset-button" data-preset="Start Coding Stream">Start Coding Stream</button>
        <button class="sharing-preset-button" data-preset="Start Presentation">Start Presentation</button>
        <button class="sharing-preset-button" data-preset="Start Public Workspace Mode">Start Public Workspace Mode</button>
      </div>
      <p class="muted">These presets apply local-only profile, mode, and interface adjustments without collecting typed content.</p>
    `),
    panel("Recommendations Feed", recommendationList()),
    panel("Alerts", alertList()),
    panel("Recent Protection Events", renderEventList())
  ];
}

function renderPrivacyCenterPanels() {
  return [
    panel("Privacy Center", `
      <p>All processing occurs locally on your computer. The app never records keystrokes, passwords, source code, clipboard contents, or screen contents.</p>
      ${list([
        "<span>Privacy readiness report</span><strong>Available locally</strong>",
        "<span>Protection decision history</span><strong>State changes only</strong>",
        "<span>Workspace recommendations</span><strong>Informational only</strong>",
        "<span>Data uploads</span><strong>Disabled by design</strong>"
      ])}
      <div class="tag-group">
        <span class="tag">In-app privacy policy available</span>
        <span class="tag">Known limitations explained</span>
        <span class="tag">Support flow available offline</span>
        <span class="tag">Release readiness documented</span>
      </div>
    `),
    panel("Privacy Event Timeline", deviceTimeline(currentState.settings.deviceHistory)),
    panel("Privacy Release Information", `
      ${list([
        "<span>Privacy policy</span><strong>Available from Privacy Information and README public release docs</strong>",
        `<span>What ${platformMetadataLabel()} is used</span><strong>Connected device inventory only. No typed content is captured.</strong>`,
        `<span>Known limitations</span><strong>Device names can vary based on what ${platformName()} exposes on the current machine.</strong>`,
        "<span>Support path</span><strong>Use the offline support and troubleshooting guide before public reporting or release sign-off.</strong>"
      ])}
    `)
  ];
}

function renderSecurityCenterPanels() {
  return [
    panel("Security Center", `
      ${list([
        `<span>Settings integrity</span><strong>${currentState.security.configurationStatus}</strong>`,
        `<span>Trusted device status</span><strong>${currentState.devices.trustedCount} trusted now connected</strong>`,
        `<span>Encryption status</span><strong>${currentState.security.encryptionStatus}</strong>`,
        `<span>Application health</span><strong>${currentState.security.status}</strong>`
      ])}
    `),
    panel("Security Awareness Center", `
      ${list([
        `<span>${platformName()} firewall</span><strong>${currentState.system.firewallStatus}</strong>`,
        `<span>${platformName()} security</span><strong>${currentState.system.windowsSecurityStatus}</strong>`,
        "<span>Operating system security</span><strong>" + currentState.system.operatingSystemSecurityStatus + "</strong>",
        "<span>Public network awareness</span><strong>" + currentState.system.publicWifiWarning + "</strong>"
      ])}
    `),
    panel("Security Review Scope", `
      ${list([
        `<span>IPC surface</span><strong>${currentState.security.ipcSecurityStatus}</strong>`,
        "<span>Preload exposure</span><strong>Allowlisted bridge only</strong>",
        "<span>Backup and restore flow</span><strong>Encrypted local-only import, verify, and restore path</strong>",
        "<span>Content Security Policy</span><strong>Strict self-only CSP applied in the renderer</strong>",
        `<span>Manual release review</span><strong>Code signing, accessibility QA, and ${platformName()} hardware QA are still required before public launch</strong>`
      ])}
    `)
  ];
}

function renderWindowsCenterPanels() {
  const win = currentState.settings.windowsIntegration;
  return [
    panel(`${platformName()} Integration Awareness`, `
      ${list([
        `<span>${platformName()} version</span><strong>${currentState.system.windowsVersion}</strong>`,
        `<span>Build number</span><strong>${currentState.system.windowsBuild}</strong>`,
        `<span>Theme synchronization status</span><strong>${currentState.system.windowsThemeSyncStatus}</strong>`,
        `<span>Accessibility synchronization status</span><strong>${currentState.system.windowsAccessibilitySyncStatus}</strong>`
      ])}
    `),
    panel(`${platformName()} Settings`, `
      <div class="form-grid">
        ${toggle("win-theme-sync", "Theme Synchronization", win.themeSynchronization)}
        ${toggle("win-a11y-sync", "Accessibility Synchronization", win.accessibilitySynchronization)}
        ${toggle("win-power-awareness", "Power Profile Awareness", win.powerProfileAwareness)}
        ${toggle("win-focus-awareness", "Focus Assist Awareness", win.focusAssistAwareness)}
        ${toggle("win-security-awareness", "Security Center Awareness", win.securityCenterAwareness)}
      </div>
      <div class="panel-actions">
        <button id="sync-with-windows" class="primary">Align App With ${platformName()}</button>
      </div>
    `),
    panel(`${platformName()} Awareness Summary`, `
      ${list([
        `<span>Current theme</span><strong>${currentState.system.windowsThemeStatus}</strong>`,
        `<span>Accessibility sync status</span><strong>${currentState.system.windowsAccessibilitySyncStatus}</strong>`,
        `<span>Focus assist awareness</span><strong>${currentState.system.windowsFocusAssistStatus}</strong>`,
        `<span>Power profile awareness</span><strong>${currentState.system.powerProfileAwareness}</strong>`,
        `<span>Security Center awareness</span><strong>${currentState.system.securityCenterAwareness}</strong>`
      ])}
    `),
    panel(`${platformName()}-Aware App Alignment`, `
      ${list([
        `<span>App theme</span><strong>${currentState.settings.theme}</strong>`,
        `<span>App high contrast</span><strong>${formatBool(currentState.settings.accessibility.highContrast)}</strong>`,
        `<span>Minimal resource mode</span><strong>${formatBool(currentState.settings.minimalResourceMode)}</strong>`,
        `<span>Detected power mode</span><strong>${currentState.system.powerMode}</strong>`
      ])}
      <p class="muted">This action only changes this app's local settings. It does not modify ${platformName()} theme, security, or accessibility settings.</p>
    `)
  ];
}

function renderHardwareCenterPanels() {
  return [
    panel("Hardware Awareness Dashboard", `
      ${list([
        `<span>Webcam status</span><strong>${currentState.system.webcamStatus}</strong>`,
        `<span>Microphone status</span><strong>${currentState.system.microphoneStatus}</strong>`,
        `<span>Speaker status</span><strong>${currentState.system.speakerStatus}</strong>`,
        `<span>Bluetooth status</span><strong>${currentState.system.bluetoothStatus}</strong>`
      ])}
    `),
    panel("Device and Power Summary", `
      ${list([
        `<span>USB device count</span><strong>${currentState.system.usbDeviceCount}</strong>`,
        `<span>Battery status</span><strong>${currentState.system.batteryStatus}</strong>`,
        `<span>Battery health status</span><strong>${currentState.system.batteryHealthStatus}</strong>`,
        `<span>Power mode</span><strong>${currentState.system.powerMode}</strong>`
      ])}
    `),
    panel("Hardware Privacy Guarantees", `
      ${list([
        "<span>Camera recording</span><strong>Never performed</strong>",
        "<span>Microphone recording</span><strong>Never performed</strong>",
        "<span>Screen capture</span><strong>Never performed</strong>",
        "<span>Hardware data uploads</span><strong>Disabled by design</strong>"
      ])}
    `)
  ];
}

function renderAccessibilityPanels() {
  const a11y = currentState.settings.accessibility;
  return [
    panel("Accessibility Center", `
      <div class="form-grid">
        ${checkbox("highContrast", "High Contrast Mode", a11y.highContrast)}
        ${checkbox("largeText", "Large Text Mode", a11y.largeText)}
        ${checkbox("reducedMotion", "Reduced Motion Mode", a11y.reducedMotion)}
        ${checkbox("dyslexiaFriendlyFont", "Dyslexia-Friendly Font", a11y.dyslexiaFriendlyFont)}
        ${checkbox("simplifiedMode", "Simplified Mode", a11y.simplifiedMode)}
        ${checkbox("cognitiveFriendly", "Cognitive-Friendly Mode", a11y.cognitiveFriendly)}
        ${checkbox("voiceGuidance", "Voice Guidance Mode", a11y.voiceGuidance)}
        ${checkbox("lowSensoryMode", "Low Sensory Mode", a11y.lowSensoryMode)}
        ${checkbox("adhdFriendlyMode", "ADHD-Friendly Mode", a11y.adhdFriendlyMode)}
        ${checkbox("largeTargetMode", "Large Target Mode", a11y.largeTargetMode)}
      </div>
    `),
    panel("Accessibility Learning Center", `
      ${list([
        "<span>Visual accessibility</span><strong>High contrast and large text are available</strong>",
        "<span>Cognitive accessibility</span><strong>Simplified mode, low sensory mode, and reduced clutter are supported</strong>",
        "<span>Motor accessibility</span><strong>Keyboard-only navigation and larger targets are supported</strong>",
        "<span>Sensory accessibility</span><strong>Reduced motion and voice guidance are available</strong>"
      ])}
    `)
  ];
}

function renderDeviceCenterPanels() {
  const groups = currentState.devices.groups || { connectionTypes: {}, trustLevels: {} };
  const compatibility = currentState.devices.compatibility || {
    usbCount: 0,
    bluetoothCount: 0,
    builtInCount: 0,
    restrictedCount: 0,
    unknownCount: 0,
    hotSwapReady: false,
    compatibilityStatus: "No keyboard compatibility metadata is currently available"
  };
  const deviceHealth = currentState.devices.health || {
    status: "Unknown",
    message: "Keyboard detection health is not currently available.",
    source: "Windows inventory"
  };
  const reviewDevice = currentState.devices.devices.find((device) => !device.trusted) || currentState.devices.devices[0];
  return [
    panel("Device Trust Center", `
      <p>Trusted device information is encrypted locally. No device information is uploaded or transmitted.</p>
      <p class="muted">Detection status: ${escapeHtml(deviceHealth.status)}. ${escapeHtml(deviceHealth.message)}</p>
      ${deviceSummary(currentState.devices.devices, true)}
    `),
    panel("Trusted Hardware Dashboard", `
      ${list([
        `<span>Connected keyboards</span><strong>${currentState.devices.total}</strong>`,
        `<span>Trusted devices</span><strong>${currentState.devices.trustedCount}</strong>`,
        `<span>Unknown trust level</span><strong>${compatibility.unknownCount}</strong>`,
        `<span>Restricted devices</span><strong>${compatibility.restrictedCount}</strong>`
      ])}
    `),
    panel("Device Categories", `
      ${list([
        `<span>USB keyboards</span><strong>${groups.connectionTypes?.USB || 0}</strong>`,
        `<span>Bluetooth keyboards</span><strong>${groups.connectionTypes?.Bluetooth || 0}</strong>`,
        `<span>Built-in keyboards</span><strong>${compatibility.builtInCount}</strong>`,
        `<span>Known trust level</span><strong>${groups.trustLevels?.Known || 0}</strong>`,
        `<span>Verified trust level</span><strong>${groups.trustLevels?.Verified || 0}</strong>`,
        `<span>Trusted trust level</span><strong>${groups.trustLevels?.Trusted || 0}</strong>`
      ])}
    `),
    panel("Connected Device Timeline", deviceTimelinePanel(currentState.settings.deviceHistory)),
    panel("Device Compatibility Dashboard", `
      ${list([
        `<span>Compatibility status</span><strong>${compatibility.compatibilityStatus}</strong>`,
        `<span>Detection source</span><strong>${escapeHtml(deviceHealth.source || "Windows inventory")}</strong>`,
        `<span>Hot-swap awareness</span><strong>${compatibility.hotSwapReady ? "Ready from local refresh comparisons" : "No hot-swap-capable metadata visible yet"}</strong>`,
        `<span>USB recognition</span><strong>${compatibility.usbCount ? "Detected locally" : "No USB keyboard metadata right now"}</strong>`,
        `<span>Bluetooth recognition</span><strong>${compatibility.bluetoothCount ? "Detected locally" : "No Bluetooth keyboard metadata right now"}</strong>`
      ])}
    `),
    panel("Device Approval Workflow", `
      ${list([
        "<span>Trust levels</span><strong>Trusted, Verified, Known, Unknown, Restricted</strong>",
        "<span>Connection timeline</span><strong>Connection events only</strong>",
        "<span>Keyboard content</span><strong>Never collected</strong>",
        "<span>Hot swap awareness</span><strong>Detected from local refresh comparisons</strong>",
        "<span>Approval guidance</span><strong>Review device name, connection type, and trust level before approving</strong>"
      ])}
    `),
    panel("Keyboard Detection Notes", `
      ${list([
        "<span>How detection works</span><strong>Windows connected-device inventory is queried locally, then duplicate or non-keyboard side interfaces are filtered out.</strong>",
        "<span>Why names vary</span><strong>Windows sometimes exposes a branded keyboard name and sometimes only a generic HID or USB interface label.</strong>",
        "<span>If a keyboard is missing</span><strong>Refresh local status, reconnect the device, and review Detection status above for limited or unavailable metadata.</strong>",
        "<span>If duplicates appear</span><strong>The app prefers stronger keyboard signals and filters likely side interfaces, but release QA should still confirm behavior on each Windows hardware setup.</strong>"
      ])}
    `),
    panel("Guided Hardware Review", reviewDevice ? `
      ${list([
        `<span>Keyboard name</span><strong>${escapeHtml(reviewDevice.name)}</strong>`,
        `<span>Connection type</span><strong>${escapeHtml(reviewDevice.connectionType)}</strong>`,
        `<span>Vendor and product</span><strong>${escapeHtml(reviewDevice.vendorId)}/${escapeHtml(reviewDevice.productId)}</strong>`,
        `<span>Trust level</span><strong>${escapeHtml(reviewDevice.trustLevel || "Known")}</strong>`,
        `<span>Detection confidence</span><strong>${escapeHtml(reviewDevice.confidence || "Limited Windows metadata")}</strong>`,
        `<span>Why it may look generic</span><strong>${escapeHtml(reviewDevice.confidenceReason || "Windows may expose only generic metadata for some keyboard interfaces.")}</strong>`
      ])}
      <div class="panel-actions">
        <button data-fingerprint="${reviewDevice.fingerprint}" data-name="${escapeHtml(reviewDevice.name)}" data-trusted="${reviewDevice.trusted}">${reviewDevice.trusted ? "Remove trusted" : "Mark trusted"}</button>
      </div>
    ` : "<p class='muted'>Connect a keyboard to start the guided hardware review flow.</p>")
  ];
}

function renderDiagnosticsCenterPanels() {
  const diagnostics = currentState.diagnostics || { total: 0, files: [] };
  const release = currentState.releaseHealth || {};
  const comparison = currentState.devices.comparison || { added: [], removed: [], changed: [] };
  const compatibility = currentState.devices.compatibility || {};
  const storage = currentState.storage || {};

  return [
    panel("Diagnostics Center", `
      <p>Diagnostics stay local only. Local report ZIP files are saved to your Documents folder and contain only the minimum device, workspace, system, and release-health metadata needed to debug the app without keystrokes, typed content, passwords, file paths, or personal documents.</p>
      ${diagnosticsFeedback ? noticeCard(diagnosticsFeedback.title, diagnosticsFeedback.message, diagnosticsFeedback.tone) : ""}
      <div class="panel-actions">
        <button id="create-support-bundle" class="primary">Create local report ZIP</button>
        <button id="toggle-overlay">${currentState.settings.overlay?.panelVisible ? "Hide privacy overlay" : "Show privacy overlay"}</button>
      </div>
      ${list([
        `<span>Detection source</span><strong>${escapeHtml(currentState.devices.health?.source || "Windows inventory")}</strong>`,
        `<span>Last keyboard refresh</span><strong>${currentState.devices.lastRefreshAt ? new Date(currentState.devices.lastRefreshAt).toLocaleString() : "Not refreshed yet"}</strong>`,
        `<span>Metadata status</span><strong>${escapeHtml(currentState.devices.health?.status || "Unknown")}</strong>`,
        `<span>Saved local report ZIP files</span><strong>${diagnostics.total}</strong>`,
        `<span>Overlay visibility</span><strong>${formatBool(currentState.settings.overlay?.panelVisible)}</strong>`
      ])}
    `),
    panel("Keyboard Detection Confidence", `
      ${list([
        `<span>High confidence devices</span><strong>${compatibility.highConfidenceCount || 0}</strong>`,
        `<span>Medium confidence devices</span><strong>${compatibility.mediumConfidenceCount || 0}</strong>`,
        `<span>Limited metadata devices</span><strong>${compatibility.limitedConfidenceCount || 0}</strong>`,
        `<span>Hot-swap awareness</span><strong>${compatibility.hotSwapReady ? "Ready" : "Limited"}</strong>`
      ])}
    `),
    panel("Detection History Compare", `
      ${list([
        `<span>Added in latest scan</span><strong>${comparison.added.join(", ") || "None"}</strong>`,
        `<span>Removed in latest scan</span><strong>${comparison.removed.join(", ") || "None"}</strong>`,
        `<span>Renamed in latest scan</span><strong>${comparison.changed.length ? comparison.changed.map((item) => `${item.before} -> ${item.after}`).join(", ") : "None"}</strong>`,
        `<span>Connected keyboards now</span><strong>${currentState.devices.total}</strong>`
      ])}
    `),
    panel("Portable Privacy Workspace", `
      ${list([
        `<span>Portable mode</span><strong>${formatBool(storage.portableMode)}</strong>`,
        `<span>External drive required</span><strong>${formatBool(storage.externalDriveRequired)}</strong>`,
        `<span>External drive detected</span><strong>${formatBool(storage.externalDriveDetected)}</strong>`,
        `<span>Path safety</span><strong>${storage.allowed ? "Allowed" : escapeHtml(storage.blockReason || "Blocked")}</strong>`,
        `<span>Drive details</span><strong>${escapeHtml(storage.driveDetails || storage.source || "Unavailable")}</strong>`,
        `<span>Backup health</span><strong>${escapeHtml(currentState.settings.recovery?.backupHealthStatus || "Ready")}</strong>`
      ])}
    `),
    panel("Release Health Dashboard", `
      <div class="list">
        <label class="checkbox"><input class="release-check-toggle" data-release-key="qaPassed" type="checkbox" ${release.qaPassed ? "checked" : ""} />QA passed</label>
        <label class="checkbox"><input class="release-check-toggle" data-release-key="signedBuild" type="checkbox" ${release.signedBuild ? "checked" : ""} />Signed build</label>
        <label class="checkbox"><input class="release-check-toggle" data-release-key="hardwareQaComplete" type="checkbox" ${release.hardwareQaComplete ? "checked" : ""} />Hardware QA complete</label>
        <label class="checkbox"><input class="release-check-toggle" data-release-key="accessibilityQaComplete" type="checkbox" ${release.accessibilityQaComplete ? "checked" : ""} />Accessibility QA complete</label>
        <label class="checkbox"><input class="release-check-toggle" data-release-key="installerQaComplete" type="checkbox" ${release.installerQaComplete ? "checked" : ""} />Installer QA complete</label>
      </div>
      ${list([
        `<span>Version</span><strong>${escapeHtml(release.version || "Unavailable")}</strong>`,
        `<span>Version aligned</span><strong>${formatBool(release.versionAligned)}</strong>`,
        `<span>Release ready</span><strong>${formatBool(release.releaseReady)}</strong>`
      ])}
    `),
    panel("Recent Local Report ZIP Files", diagnostics.files.length
      ? `<div class="list">${diagnostics.files.map((file) => `<div class="list-item"><span>${escapeHtml(file.fileName)}</span><strong>${new Date(file.createdAt).toLocaleString()}</strong></div>`).join("")}</div>`
      : "<p class='muted'>No local report ZIP files have been created yet.</p>")
  ];
}

function renderWorkspaceCenterPanels() {
  return [
    panel("Workspace Center", `
      ${list([
        `<span>Workspace classification</span><strong>${currentState.workspace.workspaceClassification}</strong>`,
        `<span>Workspace risk score</span><strong>${percent(currentState.workspace.workspaceRiskScore)}</strong>`,
        `<span>Presentation display detection</span><strong>${formatBool(currentState.workspace.presentationDisplayDetected)}</strong>`,
        `<span>Docking station awareness</span><strong>${formatBool(currentState.workspace.dockingStationDetected)}</strong>`
      ])}
    `),
    panel("Workspace Awareness Features", `
      ${list([
        `<span>Remote desktop awareness</span><strong>${formatBool(currentState.workspace.remoteDesktopDetected)}</strong>`,
        `<span>Virtual machine awareness</span><strong>${formatBool(currentState.workspace.virtualMachineAwareness)}</strong>`,
        `<span>Meeting environment mode</span><strong>${formatBool(currentState.workspace.meetingEnvironmentMode)}</strong>`,
        `<span>Training environment mode</span><strong>${formatBool(currentState.workspace.trainingEnvironmentMode)}</strong>`
      ])}
    `),
    panel("Workspace Recommendations", currentState.workspace.privacyRecommendations.length
      ? `<div class="list">${currentState.workspace.privacyRecommendations.map((item) => `<div class="list-item"><span>Tip</span><strong>${item}</strong></div>`).join("")}</div>`
      : "<p class='muted'>No workspace-specific recommendations are active.</p>")
  ];
}

function renderHowToUsePanels() {
  return [
    panel("Quick Start", `
      ${list([
        "<span>1</span><strong>Leave Protection On and choose the mode that best matches what you are doing right now.</strong>",
        "<span>2</span><strong>Open Device Center when a keyboard appears and mark only known hardware as trusted.</strong>",
        "<span>3</span><strong>Check Workspace Center before streaming, screen sharing, teaching, or presenting.</strong>",
        "<span>4</span><strong>Use Emergency Privacy Mode when you want the fastest reduced-detail safe view.</strong>",
        "<span>5</span><strong>Review Privacy Center and Security Center any time you want to confirm what stays local and what is never collected.</strong>"
      ])}
    `),
    panel("When To Use Each Mode", `
      ${list([
        "<span>Developer Protection Mode</span><strong>Best for normal coding, pair programming, and day-to-day development work.</strong>",
        "<span>Presentation or Classroom modes</span><strong>Use these before demos, teaching, interviews, or conference sessions.</strong>",
        "<span>Live Stream or Creator modes</span><strong>Use these when OBS, Discord, Zoom, Teams, or recording tools are active.</strong>",
        "<span>Public Workspace or Coffee Shop modes</span><strong>Use these in shared environments where shoulder surfing or workspace exposure is more likely.</strong>"
      ])}
    `),
    panel("Trusted Keyboard Workflow", `
      ${list([
        "<span>What to review</span><strong>Check the keyboard name, connection type, vendor ID, product ID, and current status before trusting it.</strong>",
        "<span>When to trust</span><strong>Trust only keyboards you recognize and personally expect to be connected.</strong>",
        "<span>When not to trust</span><strong>Leave a device untrusted if the name looks unfamiliar, generic in a suspicious way, or unexpected for your setup.</strong>",
        "<span>What is stored</span><strong>Only local encrypted trust preferences are stored. No keystrokes or typed content are ever saved.</strong>"
      ])}
    `),
    panel("Before You Share Your Screen", `
      ${list([
        "<span>Workspace check</span><strong>Open Workspace Center and confirm the current workspace risk score, sharing detection, and recommendations.</strong>",
        "<span>Device check</span><strong>Make sure only expected keyboards are connected and trusted.</strong>",
        "<span>Visibility check</span><strong>Use a simpler mode or Quick Hide if you want less on-screen status detail visible.</strong>",
        "<span>Emergency fallback</span><strong>If something changes suddenly, activate Emergency Privacy Mode immediately from the main window or tray.</strong>"
      ])}
    `),
    panel("If Something Looks Wrong", `
      ${list([
        "<span>Keyboard list looks incomplete</span><strong>Use Refresh local status, reconnect the keyboard, and review Device Center detection status for limited Windows metadata.</strong>",
        "<span>Generic keyboard names appear</span><strong>Windows may only expose HID or USB interface labels on some hardware. Review vendor and product IDs before trusting the device.</strong>",
        "<span>Backup restore failed</span><strong>Use Verify locally first. If verification fails, paste the full payload again and check Backup Center recovery status.</strong>",
        "<span>Need a release reference</span><strong>Open Knowledge Base for support, known limitations, release process, and production-readiness notes.</strong>"
      ])}
    `)
  ];
}

function renderPolicyCenterPanels() {
  const policy = currentState.settings.organizationPolicy;
  return [
    panel("Enterprise and Policy Modes", `
      <div class="form-grid">
        ${toggle("policy-offline", "Offline Deployment Mode", policy.offlineDeploymentMode)}
        ${toggle("policy-portable", "Portable USB Mode", policy.portableUsbMode)}
        ${toggle("policy-kiosk", "Kiosk Mode", policy.kioskMode)}
        ${toggle("policy-readonly", "Read-Only Profile Mode", policy.readOnlyProfileMode)}
        ${toggle("policy-shared", "Shared Workstation Mode", policy.sharedWorkstationMode)}
        ${toggle("policy-managed", "Managed Policy Support", policy.managedPolicySupport)}
      </div>
    `),
    panel("Policy Summary", `
      ${list([
        `<span>Offline deployment mode</span><strong>${formatBool(policy.offlineDeploymentMode)}</strong>`,
        `<span>Portable USB mode</span><strong>${formatBool(policy.portableUsbMode)}</strong>`,
        `<span>Kiosk mode</span><strong>${formatBool(policy.kioskMode)}</strong>`,
        `<span>Shared workstation mode</span><strong>${formatBool(policy.sharedWorkstationMode)}</strong>`
      ])}
    `),
    panel("Enterprise Privacy Guarantees", `
      ${list([
        "<span>Cloud accounts</span><strong>Not supported</strong>",
        "<span>Telemetry</span><strong>Disabled by design</strong>",
        "<span>Remote tracking</span><strong>Disabled by design</strong>",
        "<span>Organization data collection</span><strong>Not performed</strong>"
      ])}
    `)
  ];
}

function renderWellbeingPanels() {
  const wellbeing = currentState.settings.wellbeing;
  const wellbeingState = currentState.wellbeing || {
    sessionActive: false,
    minutesRemaining: 0,
    status: "Ready",
    breakReminderStatus: "Break reminders idle"
  };
  return [
    panel("Digital Wellbeing Center", `
      <div class="form-grid">
        <div>
          <label for="focus-session-minutes">Focus session minutes</label>
          <input id="focus-session-minutes" type="range" min="15" max="120" step="5" value="${wellbeing.focusSessionMinutes}" />
          <div class="muted">${wellbeing.focusSessionMinutes} minutes</div>
        </div>
        <div>
          ${toggle("wellbeing-breaks", "Break Reminders", wellbeing.breakReminders)}
          ${toggle("wellbeing-deep-focus", "Deep Focus Mode", wellbeing.deepFocusMode)}
          ${toggle("wellbeing-reduced-distraction", "Reduced Distraction Mode", wellbeing.reducedDistractionMode)}
        </div>
      </div>
      <div class="panel-actions">
        <button id="start-focus-session" class="primary">${wellbeingState.sessionActive ? "Restart Focus Session" : "Start Focus Session"}</button>
        <button id="stop-focus-session" ${wellbeingState.sessionActive ? "" : "disabled"}>Stop Focus Session</button>
      </div>
    `),
    panel("Focus Session Status", `
      ${list([
        `<span>Session status</span><strong>${escapeHtml(wellbeingState.status)}</strong>`,
        `<span>Minutes remaining</span><strong>${wellbeingState.sessionActive ? wellbeingState.minutesRemaining : 0}</strong>`,
        `<span>Break reminder status</span><strong>${escapeHtml(wellbeingState.breakReminderStatus)}</strong>`,
        `<span>Session started</span><strong>${wellbeingState.sessionStartedAt ? new Date(wellbeingState.sessionStartedAt).toLocaleString() : "Not active"}</strong>`
      ])}
    `),
    panel("Performance Intelligence", `
      ${list([
        `<span>Application performance score</span><strong>${percent(currentState.system.appPerformanceScore)}</strong>`,
        `<span>Resource efficiency score</span><strong>${percent(currentState.system.resourceEfficiencyScore)}</strong>`,
        `<span>Startup performance score</span><strong>${percent(currentState.system.startupPerformanceScore)}</strong>`,
        `<span>Battery efficiency score</span><strong>${percent(currentState.system.batteryEfficiencyScore)}</strong>`
      ])}
    `),
    panel("Wellbeing Guidance", `
      ${list([
        "<span>Focus session timer</span><strong>Active local-only timer support</strong>",
        "<span>Eye strain awareness</span><strong>Advisory only</strong>",
        "<span>Workspace wellness reminders</span><strong>Local-only timer and reminder flow</strong>",
        "<span>User content monitoring</span><strong>Never performed</strong>"
      ])}
    `)
  ];
}

function renderProfileCenterPanels() {
  const activeProfile = currentState.settings.activeProfile;
  const panels = [
    panel("Profile Center", `
      <div class="form-grid">
        <div>
          <label for="profile-select">Active profile</label>
          ${customSelect({
            id: "profile-select",
            value: currentState.settings.activeProfile,
            options: currentState.settings.profiles.map((profile) => ({ value: profile, label: profile })),
            menuClass: "field-select-menu"
          })}
        </div>
        <div>
          <label for="theme-select">Theme</label>
          ${customSelect({
            id: "theme-select",
            value: currentState.settings.theme,
            options: [
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" }
            ],
            menuClass: "field-select-menu"
          })}
        </div>
        <div>
          <label for="close-behavior-select">Close button behavior</label>
          ${customSelect({
            id: "close-behavior-select",
            value: currentState.settings.closeBehavior || "exit",
            options: CLOSE_BEHAVIOR_OPTIONS,
            menuClass: "field-select-menu"
          })}
        </div>
      </div>
      <p class="muted">${PROFILE_PRESET_DESCRIPTIONS[activeProfile] || "Local-only profile settings are stored securely on this device."}</p>
      <p class="muted">Choose whether clicking the window close button fully exits the app or hides it in the system tray.</p>
    `),
    panel("Quick Profile Switching", `
      <div class="list">
        ${currentState.settings.profiles.map((profile) => `
          <div class="list-item">
            <span>${profile}<br><small>${escapeHtml(PROFILE_PRESET_DESCRIPTIONS[profile] || "Local-only secure profile preset.")}</small></span>
            <strong><button class="apply-profile-button" data-profile="${escapeHtml(profile)}">${profile === activeProfile ? "Reapply" : "Apply"}</button></strong>
          </div>
        `).join("")}
      </div>
    `),
    panel("Profile Preset Summary", `
      ${list([
        `<span>Active profile</span><strong>${escapeHtml(activeProfile)}</strong>`,
        `<span>Protection mode</span><strong>${escapeHtml(currentState.protection.activeMode)}</strong>`,
        `<span>Theme</span><strong>${escapeHtml(currentState.settings.theme)}</strong>`,
        `<span>Close button behavior</span><strong>${currentState.settings.closeBehavior === "tray" ? "Close minimizes to tray" : "Close exits app"}</strong>`,
        `<span>Compact mode</span><strong>${formatBool(currentState.settings.compactMode)}</strong>`,
        `<span>Minimal resource mode</span><strong>${formatBool(currentState.settings.minimalResourceMode)}</strong>`,
        `<span>Startup optimization</span><strong>${formatBool(currentState.settings.startupOptimizationMode)}</strong>`
      ])}
    `),
    panel("Protection Modes", `<div class="tag-group">${currentState.protection.availableModes.map((mode) => `<span class="tag">${mode}</span>`).join("")}</div>`)
  ];

  if (currentState.settings.featureFlags?.dashboardPersonalization !== false) {
    panels.push(panel("Personalization Engine", `
      <div class="form-grid">
        <div>
          <label for="dashboard-layout-select">Dashboard layout</label>
          ${customSelect({
            id: "dashboard-layout-select",
            value: currentState.settings.personalization?.dashboardLayout || "mission-control",
            options: DASHBOARD_LAYOUTS,
            menuClass: "field-select-menu"
          })}
        </div>
        <div class="stacked-toggles">
          ${toggle("compact-mode-toggle", "Compact Mode", currentState.settings.compactMode)}
          ${toggle("minimal-resource-toggle", "Minimal Resource Mode", currentState.settings.minimalResourceMode)}
          ${toggle("startup-optimization-toggle", "Startup Optimization Mode", currentState.settings.startupOptimizationMode)}
        </div>
      </div>
      <div class="list widget-toggle-list">
        ${DASHBOARD_WIDGETS.map((widget) => `
          <label class="checkbox">
            <input
              class="widget-visibility-toggle"
              data-widget-id="${widget.id}"
              type="checkbox"
              ${(currentState.settings.personalization?.visibleWidgets || []).includes(widget.id) ? "checked" : ""}
            />
            ${widget.label}
          </label>
        `).join("")}
      </div>
    `));
  }

  panels.push(panel("Feature Flag System", `
      <div class="list">
        ${FEATURE_FLAG_OPTIONS.map((flag) => `
          <label class="checkbox">
            <input
              class="feature-flag-toggle"
              data-flag-key="${flag.key}"
              type="checkbox"
              ${currentState.settings.featureFlags?.[flag.key] ? "checked" : ""}
            />
            ${flag.label}
          </label>
        `).join("")}
      </div>
      <p class="muted">Feature flags stay local and let you enable or disable advanced dashboard and settings behaviors without affecting privacy protections.</p>
    `));

  panels.push(panel("Session Notes", `
      <p>Store short local-only notes for recurring workflows, teaching setups, or hardware reminders.</p>
      <label for="session-note-input">New session note</label>
      <textarea id="session-note-input" rows="4" placeholder="Use this profile for Zoom teaching..."></textarea>
      <div class="panel-actions">
        <button id="add-session-note">Add note</button>
      </div>
      ${(currentState.settings.sessionNotes || []).length
        ? `<div class="list">${currentState.settings.sessionNotes.map((note) => `
            <div class="list-item">
              <span>${escapeHtml(note.text)}<br><small>${new Date(note.createdAt).toLocaleString()}</small></span>
              <strong><button class="remove-note-button" data-note-id="${note.id}">Remove</button></strong>
            </div>
          `).join("")}</div>`
        : "<p class='muted'>No local session notes yet.</p>"}
    `));

  panels.push(panel("Keyboard Shortcuts Center", `
      <p>These shortcuts work inside the app window and stay local to this device.</p>
      <div class="form-grid">
        ${Object.entries(currentState.settings.shortcuts || {}).map(([key, value]) => `
          <div>
            <label for="shortcut-${key}">${escapeHtml(formatShortcutLabel(key))}</label>
            <input id="shortcut-${key}" class="shortcut-input" data-shortcut-key="${key}" type="text" value="${escapeHtml(value)}" />
          </div>
        `).join("")}
      </div>
      <div class="panel-actions">
        <button id="save-shortcuts">Save shortcuts</button>
      </div>
    `));

  return panels;
}

function renderReportsCenterPanels() {
  if (!REPORT_TYPES.includes(selectedReportType)) {
    selectedReportType = REPORT_TYPES[0];
  }
  return [
    panel("Professional Reports", `
      <div class="form-grid">
        <div>
          <label for="report-type">Report type</label>
          ${customSelect({
            id: "report-type",
            value: selectedReportType,
            options: REPORT_TYPES.map((type) => ({ value: type, label: type })),
            menuClass: "field-select-menu"
          })}
        </div>
        <div class="stacked-toggles">
          ${toggle("report-include-history", "Include protection and device history", reportIncludeHistory)}
          ${toggle("report-include-recommendations", "Include recommendations", reportIncludeRecommendations)}
        </div>
      </div>
      <div class="panel-actions">
        <button id="preview-report">Preview local report</button>
        <button id="clear-report-preview">Clear preview</button>
        <button id="generate-report" class="primary">Generate local report</button>
      </div>
      ${reportPreview ? `
        <div class="report-preview-shell">
          <div class="list">
            <div class="list-item"><span>Preview type</span><strong>${reportPreview.type}</strong></div>
            <div class="list-item"><span>Sections</span><strong>${reportPreview.summary.sections.length}</strong></div>
            <div class="list-item"><span>Privacy readiness</span><strong>${percent(reportPreview.summary.privacyReadiness)}</strong></div>
            <div class="list-item"><span>Security readiness</span><strong>${percent(reportPreview.summary.securityScore)}</strong></div>
            <div class="list-item"><span>Connected keyboards</span><strong>${reportPreview.summary.connectedKeyboards}</strong></div>
            <div class="list-item"><span>Trusted devices</span><strong>${reportPreview.summary.trustedDevices}</strong></div>
          </div>
          <div class="tag-group">
            ${reportPreview.summary.sections.map((section) => `<span class="tag">${section}</span>`).join("")}
          </div>
          <label for="report-preview-content">Preview content</label>
          <textarea id="report-preview-content" rows="18" readonly>${escapeHtml(reportPreview.content)}</textarea>
        </div>
      ` : `
        <p class="muted">Preview a report locally before exporting it. No report data leaves this device.</p>
      `}
      ${list([
        "<span>Privacy readiness report</span><strong>Local-only</strong>",
        "<span>Workspace security report</span><strong>Local-only</strong>",
        "<span>Accessibility compliance report</span><strong>Local-only</strong>",
        "<span>Protection coverage report</span><strong>Local-only</strong>",
        "<span>Local audit report</span><strong>Includes release health and diagnostics summary</strong>"
      ])}
    `),
    panel("Saved Reports", currentState.reports.files.length
      ? `<div class="list">${currentState.reports.files.map((file) => `<div class="list-item"><span>${file.fileName}</span><strong>${file.createdAt}</strong></div>`).join("")}</div>`
      : "<p class='muted'>No local reports have been generated yet.</p>"
    )
  ];
}

function renderBackupCenterPanels() {
  const backups = currentState.settings.backups || [];
  const recovery = currentState.settings.recovery || { snapshots: [] };
  return [
    panel("Backup Center", `
      <p>Encrypted backup creation, validation, and restore are local-only features.</p>
      ${backupFeedback ? noticeCard(backupFeedback.title, backupFeedback.message, backupFeedback.tone) : ""}
      <div class="panel-actions">
        <button id="backup-now" class="primary">Create encrypted backup</button>
        <button id="snapshot-now">Create restore point</button>
        <button id="restore-latest-snapshot">Restore latest restore point</button>
      </div>
      <label for="backup-output">Latest backup payload</label>
      <textarea id="backup-output" rows="7" readonly></textarea>
      ${list([
        `<span>Backup health</span><strong>${recovery.backupHealthStatus || "Ready"}</strong>`,
        `<span>Last backup</span><strong>${recovery.lastBackupAt || "Not created yet"}</strong>`,
        `<span>Last restore</span><strong>${recovery.lastRestoredAt || "Not restored yet"}</strong>`,
        `<span>Last recovery action</span><strong>${recovery.lastRecoveryAction || "No recovery actions yet"}</strong>`
      ])}
    `),
    panel("Restore Wizard", `
      <p>Paste an encrypted backup payload to restore settings locally. Corrupted payloads are rejected.</p>
      <label for="restore-input">Encrypted backup payload</label>
      <textarea id="restore-input" rows="7"></textarea>
      <div class="panel-actions">
        <button id="verify-backup">Verify locally</button>
        <button id="restore-now">Restore locally</button>
      </div>
      ${backupVerification ? `
        <div class="report-preview">
          <div class="list">
            <div class="list-item"><span>Verification status</span><strong>Verified locally</strong></div>
            <div class="list-item"><span>Exported at</span><strong>${backupVerification.exportedAt || "Unknown"}</strong></div>
            <div class="list-item"><span>Profile</span><strong>${backupVerification.summary.profile}</strong></div>
            <div class="list-item"><span>Theme</span><strong>${backupVerification.summary.theme}</strong></div>
            <div class="list-item"><span>Trusted devices</span><strong>${backupVerification.summary.trustedDevices}</strong></div>
          </div>
        </div>
      ` : `<p class="muted">Verify the pasted payload before restoring it to confirm the encrypted backup can be read safely on this device.</p>`}
    `),
    panel("Saved Encrypted Backups", backups.length
      ? `<div class="list">${backups.map((item) => `
          <div class="list-item">
            <span>${item.label}<br><small>${item.createdAt}</small></span>
            <strong><button class="restore-backup-button" data-backup-id="${item.id}">Restore</button></strong>
          </div>
        `).join("")}</div>`
      : "<p class='muted'>No encrypted backups have been created yet.</p>"
    ),
    panel("Configuration Snapshots", recovery.snapshots?.length
      ? `<div class="list">${recovery.snapshots.map((item) => `
          <div class="list-item">
            <span>${item.label}<br><small>${item.createdAt}</small></span>
            <strong><button class="restore-snapshot-button" data-snapshot-id="${item.id}">Restore</button></strong>
          </div>
        `).join("")}</div>`
      : "<p class='muted'>No local restore points have been created yet.</p>"
    ),
    panel("Recovery and Resilience", `
      ${list([
        "<span>Configuration recovery mode</span><strong>Secure defaults restore automatically if settings are corrupted</strong>",
        `<span>Protected restore points</span><strong>${recovery.snapshots?.length || 0} retained locally</strong>`,
        `<span>Encrypted backup rotation</span><strong>${backups.length}/10 retained locally</strong>`,
        `<span>Backup verification</span><strong>${recovery.lastVerifiedBackupAt || "Run when needed"}</strong>`,
        "<span>Temporary data cleanup</span><strong>In-memory focus with minimal persistence</strong>",
        "<span>Safe mode startup</span><strong>Secure baseline supported through reset behavior</strong>"
      ])}
    `)
  ];
}

function renderExtensionCenterPanels() {
  const discovered = currentState.extensions?.discovered || [];
  return [
    panel("Local Extension Framework", `
      <p>Extensions are local-only and require explicit user approval before use. They cannot bypass privacy protections.</p>
      <div class="panel-actions">
        <button id="refresh-extensions">Refresh local registry</button>
      </div>
      ${list([
        `<span>Framework enabled</span><strong>${formatBool(currentState.settings.extensionFramework.enabled)}</strong>`,
        `<span>Approved extensions</span><strong>${currentState.extensions?.approvedCount || 0}</strong>`,
        `<span>Discovered manifests</span><strong>${currentState.extensions?.total || 0}</strong>`,
        `<span>Managed policy support</span><strong>${formatBool(currentState.settings.organizationPolicy.managedPolicySupport)}</strong>`,
        `<span>Read-only profile mode</span><strong>${formatBool(currentState.settings.organizationPolicy.readOnlyProfileMode)}</strong>`
      ])}
    `),
    panel("Discovered Local Modules", discovered.length
      ? `<div class="list">${discovered.map((item) => `
        <div class="list-item">
          <span>
            ${escapeHtml(item.name)}<br>
            <small>${escapeHtml(item.category)} | v${escapeHtml(item.version)} | ${escapeHtml(item.source)}</small><br>
            <small>${escapeHtml(item.description)}</small>
          </span>
          <strong>
            <button class="extension-toggle" data-extension="${escapeHtml(item.id)}" data-approved="${item.approved}">
              ${item.approved ? "Revoke" : "Approve"}
            </button>
          </strong>
        </div>
      `).join("")}</div>`
      : "<p class='muted'>No local extension manifests were found yet. Add manifest folders under the bundled or portable extensions directory to discover them offline.</p>"
    ),
    panel("Extension Permissions and Trust", discovered.length
      ? `<div class="list">${discovered.map((item) => `
        <div class="list-item">
          <span>${escapeHtml(item.name)}</span>
          <strong>${item.permissions?.length ? escapeHtml(item.permissions.join(", ")) : "Manifest only"}</strong>
        </div>
      `).join("")}</div>`
      : "<p class='muted'>Discovered manifests will show requested local-only permissions here.</p>"
    )
  ];
}

function renderTransparencyPanels() {
  return [
    panel("Why This Recommendation Appeared", explanationList("recommendation")),
    panel("Why This Alert Appeared", explanationList("alert")),
    panel("Protection Decision History", decisionHistoryList(currentState.settings.decisionHistory?.protection)),
    panel("Privacy Decision History", decisionHistoryList(currentState.settings.decisionHistory?.privacy)),
    panel("What We Monitor", `
      <p>We monitor connected device metadata, local process names associated with screen-sharing tools, app configuration health, local Windows device and power status, and workspace conditions. We never monitor typed content, clipboard data, source code, webcam footage, microphone recordings, or screen contents.</p>
    `),
    panel("System Explanation Center", `
      ${list([
        "<span>Why a recommendation appeared</span><strong>Explained locally with trigger and impact details</strong>",
        "<span>Why an alert appeared</span><strong>Explained locally with trigger and next-step context</strong>",
        "<span>Why protection activated</span><strong>Captured in protection decision history</strong>",
        "<span>Why privacy readiness changed</span><strong>Captured in privacy decision history</strong>"
      ])}
    `),
    panel("Data Usage Dashboard", `
      ${list([
        "<span>Keystroke capture</span><strong>Never</strong>",
        "<span>Typed content storage</span><strong>Never</strong>",
        "<span>Cloud synchronization</span><strong>Disabled by design</strong>",
        "<span>Analytics and telemetry</span><strong>Disabled by design</strong>"
      ])}
    `),
    panel("Release Transparency", `
      ${list([
        "<span>Privacy policy availability</span><strong>Documented in the repo and summarized in-app</strong>",
        "<span>Known limitations</span><strong>Documented for Windows metadata, naming variance, and hardware QA expectations</strong>",
        "<span>Support and troubleshooting</span><strong>Offline guidance is included for backups, device detection, and release QA</strong>",
        "<span>Release notes discipline</span><strong>Each shipped version should map to one tested changelog state</strong>"
      ])}
    `)
  ];
}

function renderEmergencyPanels() {
  const checklist = currentState.protection.emergencyChecklist || { readinessScore: 0, items: [] };
  return [
    panel("Emergency Preparedness Center", `
      <p>Emergency features are user controlled, local only, and designed to reduce visible information without locking you out of your system.</p>
      <div class="panel-actions">
        <button id="emergency-panel-button" class="danger">Activate Emergency Privacy Mode</button>
        <button id="emergency-prep-button">Create Restore Point + Activate</button>
        <button id="restore-normal-button">Restore Normal View</button>
        <button id="quick-hide-button">${currentState.protection.quickHideActive ? "Disable Quick Hide" : "Enable Quick Hide"}</button>
      </div>
      ${list([
        "<span>Rapid safe mode activation</span><strong>Available</strong>",
        "<span>Quick recovery guides</span><strong>Built in</strong>",
        "<span>Emergency profile switching</span><strong>Supported</strong>",
        "<span>User lockout</span><strong>Never performed</strong>"
      ])}
    `),
    panel("Emergency Safe View", `
      ${list([
        `<span>Emergency mode</span><strong>${formatBool(currentState.protection.emergencyMode)}</strong>`,
        `<span>Quick hide dashboard</span><strong>${formatBool(currentState.protection.quickHideActive)}</strong>`,
        `<span>Protection readiness</span><strong>${percent(currentState.protection.privacyReadinessScore)}</strong>`,
        `<span>Emergency readiness</span><strong>${percent(checklist.readinessScore)}</strong>`
      ])}
    `),
    panel("Emergency Workspace Checklist", `
      ${list([
        ...checklist.items.map((item) => `<span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.status)}</strong>`),
        `<span>Screen sharing detected</span><strong>${formatBool(currentState.workspace.screenSharingDetected)}</strong>`,
        `<span>Streaming environment detected</span><strong>${formatBool(currentState.workspace.streamingEnvironmentDetected)}</strong>`,
        `<span>Untrusted keyboards connected</span><strong>${currentState.devices.total - currentState.devices.trustedCount}</strong>`
      ])}
    `)
  ];
}

function renderKnowledgePanels() {
  const discoveredExtensions = currentState.extensions?.discovered || [];
  const approvedExtensions = discoveredExtensions.filter((item) => item.approved);
  return [
    panel("Offline Knowledge Base", `
      <p>All guidance in this center stays available without internet access and is designed for privacy-first, local-only use.</p>
      ${list([
        "<span>Built-in documentation</span><strong>Available offline</strong>",
        "<span>Privacy guides</span><strong>Available offline</strong>",
        "<span>Accessibility guides</span><strong>Available offline</strong>",
        "<span>Troubleshooting references</span><strong>Available offline</strong>"
      ])}
    `),
    panel("Privacy Guides", `
      ${list(KNOWLEDGE_BASE_CONTENT.privacyGuides.map(([title, body]) => `<span>${title}</span><strong>${body}</strong>`))}
    `),
    panel("Accessibility Learning Center", `
      ${list(KNOWLEDGE_BASE_CONTENT.accessibilityGuides.map(([title, body]) => `<span>${title}</span><strong>${body}</strong>`))}
    `),
    panel("Workspace Security Tips", `
      ${list(KNOWLEDGE_BASE_CONTENT.workspaceTips.map(([title, body]) => `<span>${title}</span><strong>${body}</strong>`))}
    `),
    panel("Troubleshooting Center", `
      ${list(KNOWLEDGE_BASE_CONTENT.troubleshooting.map(([title, body]) => `<span>${title}</span><strong>${body}</strong>`))}
      <div class="panel-actions">
        <button id="open-support-request">Open GitHub Issue Page</button>
      </div>
      <p class="muted">Create a local report ZIP first, find it in your Documents folder, then open the GitHub issue page and attach the ZIP if you want to report a bug.</p>
    `),
    panel("Public Release Checklist", `
      ${list([
        "<span>Windows hardware QA</span><strong>Test built-in, USB, Bluetooth, docked, and hub-connected keyboards before release.</strong>",
        "<span>Accessibility QA</span><strong>Validate keyboard-only navigation, screen readers, zoom, focus order, and contrast.</strong>",
        "<span>Installer and upgrade QA</span><strong>Test fresh install, upgrade, uninstall cleanup, portable mode, tray restore, and settings survival.</strong>",
        "<span>Code signing</span><strong>Sign Windows builds and plan for SmartScreen reputation before public distribution.</strong>"
      ])}
    `),
    panel("Windows Detection Guide", `
      ${list([
        "<span>Detection source</span><strong>Windows connected-device inventory queried locally through supported system utilities.</strong>",
        "<span>What is filtered</span><strong>Likely duplicate or non-keyboard side interfaces are reduced before rendering the device list.</strong>",
        "<span>What is never captured</span><strong>Keystrokes, typed content, passwords, clipboard data, and screen contents.</strong>",
        "<span>Why QA matters</span><strong>Different Windows machines can expose different friendly names, vendor interfaces, and HID side-devices.</strong>"
      ])}
    `),
    panel("Offline Extension Packs", `
      <p>Bundled local-only extension manifests can expand offline guidance and presets without using cloud services.</p>
      ${discoveredExtensions.length ? list(discoveredExtensions.map((item) =>
        `<span>${escapeHtml(item.name)}</span><strong>${escapeHtml(item.category)} | ${item.approved ? "Approved" : "Approval required"} | ${escapeHtml(item.description)}</strong>`
      )) : "<p class='muted'>No local extension manifests are currently available.</p>"}
      ${approvedExtensions.length ? `<p class="muted">${approvedExtensions.length} extension pack(s) are currently approved for local use.</p>` : "<p class='muted'>Approve packs in Extension Center when you want them available for local workflows.</p>"}
    `)
  ];
}

function readinessList() {
  const r = currentState.insights.readiness;
  return list([
    `<span>Privacy readiness</span><strong>${percent(r.privacyReadiness)}</strong>`,
    `<span>Workspace exposure</span><strong>${percent(r.workspaceExposure)}</strong>`,
    `<span>Workspace readiness</span><strong>${percent(r.workspaceReadiness)}</strong>`,
    `<span>Device trust score</span><strong>${percent(r.deviceTrust)}</strong>`,
    `<span>Accessibility readiness</span><strong>${percent(r.accessibilityReadiness)}</strong>`,
    `<span>Performance readiness</span><strong>${percent(r.performanceReadiness)}</strong>`,
    `<span>Security readiness</span><strong>${percent(r.securityReadiness)}</strong>`
  ]);
}

function recommendationList() {
  return currentState.insights.recommendations.length
    ? `<div class="list">${currentState.insights.recommendations.map((item) => `<div class="list-item"><span>${item.title}</span><strong>${item.reason}</strong></div>`).join("")}</div>`
    : "<p class='muted'>No active recommendations right now.</p>";
}

function alertList() {
  return currentState.insights.alerts.length
    ? `<div class="list">${currentState.insights.alerts.map((item) => `<div class="list-item"><span>${item.title}</span><strong>${item.why}</strong></div>`).join("")}</div>`
    : "<p class='muted'>No active alerts right now.</p>";
}

function explanationList(type) {
  const matches = currentState.insights.explanations.filter((item) => item.type === type);
  return matches.length
    ? `<div class="list">${matches.map((item) => `<div class="list-item"><span>${item.title}</span><strong>${item.trigger}</strong></div>`).join("")}</div>`
    : `<p class="muted">No ${type} explanations are active right now.</p>`;
}

function deviceTimeline(events) {
  return events.length
    ? `<div class="list">${events.map((item) => `<div class="list-item"><span>${new Date(item.timestamp).toLocaleString()}</span><strong>${item.type}: ${item.name} - ${item.details}</strong></div>`).join("")}</div>`
    : "<p class='muted'>No local device timeline events yet.</p>";
}

function deviceTimelinePanel(events) {
  return `
    <div class="panel-action-row">
      <button id="clear-device-history" ${events.length ? "" : "disabled"}>Clear list</button>
    </div>
    ${deviceTimeline(events)}
  `;
}

function renderEventList() {
  return currentState.protection.recentEvents.length
    ? `<div class="list">${currentState.protection.recentEvents.map((event) => `<div class="list-item"><span>${new Date(event.timestamp).toLocaleString()}</span><strong>${event.message}</strong></div>`).join("")}</div>`
    : "<p class='muted'>No protection events yet.</p>";
}

function decisionHistoryList(entries) {
  return entries?.length
    ? `<div class="list">${entries.map((entry) => `<div class="list-item"><span>${new Date(entry.timestamp).toLocaleString()}<br><small>${escapeHtml(entry.trigger)}</small></span><strong>${escapeHtml(entry.title)} - ${escapeHtml(entry.impact)}</strong></div>`).join("")}</div>`
    : "<p class='muted'>No local decision history entries yet.</p>";
}

function checkbox(key, label, checked) {
  return `<label class="checkbox"><input class="a11y-control" data-key="${key}" type="checkbox" ${checked ? "checked" : ""} />${label}</label>`;
}

function toggle(id, label, checked) {
  return `<label class="checkbox"><input id="${id}" type="checkbox" ${checked ? "checked" : ""} />${label}</label>`;
}

function panel(title, body) {
  return `<section class="panel"><h3>${title}</h3>${body}</section>`;
}

function renderOnboarding() {
  if (activeSection !== "dashboard") {
    onboarding.classList.add("hidden");
    return;
  }
  const hasSeenOnboarding = localStorage.getItem("shield.onboarding.complete") === "true";
  onboarding.classList.toggle("hidden", hasSeenOnboarding);
  if (hasSeenOnboarding) {
    return;
  }

  onboarding.innerHTML = `
    <h3>First Launch Wizard</h3>
    <p>Visible keystroke privacy, local only, no key capture.</p>
    <div class="onboarding-steps">
      <div class="step-card"><strong>1. Review guarantees</strong><p>No keystroke recording, no typed content storage, no analytics.</p></div>
      <div class="step-card"><strong>2. Pick a profile</strong><p>Start with Developer, Streamer, or Accessibility.</p></div>
      <div class="step-card"><strong>3. Trust keyboards</strong><p>Mark known keyboards so reconnects are recognized locally.</p></div>
    </div>
    <div class="quick-actions">
      <button id="complete-onboarding" class="primary">Use Safe Defaults</button>
    </div>
  `;
  document.querySelector("#complete-onboarding").addEventListener("click", async () => {
    localStorage.setItem("shield.onboarding.complete", "true");
    await window.shieldApi.updateSettings({
      activeProfile: "Developer Profile",
      accessibility: {
        ...currentState.settings.accessibility,
        simplifiedMode: false
      }
    });
    renderOnboarding();
  });
}

function applyAccessibilityClasses() {
  const { accessibility } = currentState.settings;
  document.body.classList.toggle("accessibility-large-text", accessibility.largeText);
  document.body.classList.toggle("accessibility-dyslexia", accessibility.dyslexiaFriendlyFont);
  document.body.classList.toggle("accessibility-high-contrast", accessibility.highContrast);
  document.body.classList.toggle("compact-mode", currentState.settings.compactMode);
  document.body.classList.toggle("minimal-resource-mode", currentState.settings.minimalResourceMode);
  document.body.classList.toggle(
    "reduced-interface-motion",
    currentState.settings.featureFlags?.reducedInterfaceMotion || accessibility.reducedMotion
  );
  document.body.dataset.theme = currentState.settings.theme;
  document.body.dataset.dashboardLayout = currentState.settings.personalization?.dashboardLayout || "mission-control";
}

function renderModeSelect() {
  modeSelect.textContent = currentState.protection.activeMode;
  modeMenu.innerHTML = currentState.protection.availableModes
    .map(
      (mode) =>
        `<button class="dropdown-option ${mode === currentState.protection.activeMode ? "active" : ""}" type="button" data-mode="${mode}">${mode}</button>`
    )
    .join("");
}

function renderQuickMenu() {
  menuMenu.innerHTML = quickMenuItems
    .map((item) => `<button class="dropdown-option" type="button" data-menu="${item.value}">${item.label}</button>`)
    .join("");
}

function toggleDropdown(trigger, menu) {
  const shouldOpen = menu.classList.contains("hidden");
  closeDropdowns();
  if (shouldOpen) {
    menu.classList.remove("hidden");
    trigger.setAttribute("aria-expanded", "true");
  }
}

function closeDropdowns() {
  modeMenu.classList.add("hidden");
  menuMenu.classList.add("hidden");
  modeSelect.setAttribute("aria-expanded", "false");
  menuSelect.setAttribute("aria-expanded", "false");
}

function bindAccessibilityControls() {
  document.querySelectorAll(".a11y-control").forEach((input) => {
    input.addEventListener("change", () => {
      window.shieldApi.updateSettings({
        accessibility: {
          ...currentState.settings.accessibility,
          [input.dataset.key]: input.checked
        }
      });
    });
  });
}

function bindProfileControls() {
  document.querySelectorAll(".custom-select").forEach((select) => {
    select.addEventListener("toggle", () => {
      if (select.open) {
        closeCustomSelects(select);
      }
    });
  });

  document.querySelectorAll('[data-select-option="profile-select"]').forEach((option) => {
    option.addEventListener("click", () => {
      commitCustomSelectOption(option);
      window.shieldApi.applyProfile(option.dataset.value);
    });
  });
  document.querySelectorAll('[data-select-option="theme-select"]').forEach((option) => {
    option.addEventListener("click", () => {
      commitCustomSelectOption(option);
      window.shieldApi.updateSettings({ theme: option.dataset.value });
    });
  });
  document.querySelectorAll('[data-select-option="close-behavior-select"]').forEach((option) => {
    option.addEventListener("click", () => {
      commitCustomSelectOption(option);
      window.shieldApi.updateSettings({ closeBehavior: option.dataset.value });
    });
  });
  document.querySelectorAll('[data-select-option="report-type"]').forEach((option) => {
    option.addEventListener("click", () => {
      commitCustomSelectOption(option);
      selectedReportType = option.dataset.value;
    });
  });
  document.querySelectorAll('[data-select-option="dashboard-layout-select"]').forEach((option) => {
    option.addEventListener("click", () => {
      commitCustomSelectOption(option);
      window.shieldApi.updateSettings({
        personalization: {
          ...currentState.settings.personalization,
          dashboardLayout: option.dataset.value
        }
      });
    });
  });
}

function bindSectionSearchControl() {
  if (currentState.settings.featureFlags?.searchableSettings === false) {
    return;
  }
  if (activeSection === "knowledge-base" && currentState.settings.featureFlags?.knowledgeBaseSearch === false) {
    return;
  }
  document.querySelector("#section-search-input")?.addEventListener("input", (event) => {
    sectionSearch = event.target.value.trim();
    applySectionSearchFilter();
  });
}

function applySectionSearchFilter() {
  const panels = [...detailPanels.querySelectorAll(".panel")];
  if (!panels.length) {
    return;
  }

  const query = sectionSearch.trim().toLowerCase();
  let visibleCount = 0;

  panels.forEach((panel) => {
    const matches = !query || panel.textContent.toLowerCase().includes(query);
    panel.classList.toggle("hidden-by-search", !matches);
    if (matches) {
      visibleCount += 1;
    }
  });

  let emptyState = detailPanels.querySelector(".search-empty-state");
  if (!visibleCount && query) {
    if (!emptyState) {
      emptyState = document.createElement("section");
      emptyState.className = "panel search-empty-state";
      detailPanels.appendChild(emptyState);
    }
    emptyState.innerHTML = `
      <h3>Search Results</h3>
      <p>No settings or status content matched "${escapeHtml(sectionSearch)}". Try broader words like privacy, trust, report, theme, or accessibility.</p>
    `;
  } else if (emptyState) {
    emptyState.remove();
  }
}

function bindSectionControls() {
  bindSectionSearchControl();
  bindAccessibilityControls();
  bindProfileControls();
  bindDeviceButtons(detailPanels);
  document.querySelector("#backup-now")?.addEventListener("click", backupSettings);
  document.querySelector("#snapshot-now")?.addEventListener("click", createSnapshot);
  document.querySelector("#restore-latest-snapshot")?.addEventListener("click", restoreLatestSnapshot);
  document.querySelector("#verify-backup")?.addEventListener("click", verifyBackupSettings);
  document.querySelector("#restore-now")?.addEventListener("click", restoreSettings);
  document.querySelector("#clear-device-history")?.addEventListener("click", async () => {
    await window.shieldApi.clearDeviceHistory();
  });
  document.querySelectorAll(".restore-backup-button").forEach((button) => {
    button.addEventListener("click", () => restoreSavedBackup(button.dataset.backupId));
  });
  document.querySelectorAll(".restore-snapshot-button").forEach((button) => {
    button.addEventListener("click", () => restoreSnapshotAction(button.dataset.snapshotId));
  });
  document.querySelector("#generate-report")?.addEventListener("click", () => {
    generateReport(selectedReportType || REPORT_TYPES[0]);
  });
  document.querySelector("#preview-report")?.addEventListener("click", () => {
    previewReport(selectedReportType || REPORT_TYPES[0]);
  });
  document.querySelector("#clear-report-preview")?.addEventListener("click", () => {
    reportPreview = null;
    renderPanels();
  });
  document.querySelector("#report-include-history")?.addEventListener("change", (event) => {
    reportIncludeHistory = event.target.checked;
  });
  document.querySelector("#report-include-recommendations")?.addEventListener("change", (event) => {
    reportIncludeRecommendations = event.target.checked;
  });
  document.querySelector("#emergency-panel-button")?.addEventListener("click", () => window.shieldApi.triggerEmergency());
  document.querySelector("#emergency-prep-button")?.addEventListener("click", prepareEmergencyMode);
  document.querySelector("#restore-normal-button")?.addEventListener("click", () => window.shieldApi.restoreNormalProtection());
  document.querySelector("#quick-hide-button")?.addEventListener("click", () => {
    window.shieldApi.setQuickHide(!currentState.protection.quickHideActive);
  });
  document.querySelector("#compact-mode-toggle")?.addEventListener("change", (event) => {
    window.shieldApi.updateSettings({ compactMode: event.target.checked });
  });
  document.querySelector("#minimal-resource-toggle")?.addEventListener("change", (event) => {
    window.shieldApi.updateSettings({ minimalResourceMode: event.target.checked });
  });
  document.querySelector("#startup-optimization-toggle")?.addEventListener("change", (event) => {
    window.shieldApi.updateSettings({ startupOptimizationMode: event.target.checked });
  });
  document.querySelectorAll(".widget-visibility-toggle").forEach((input) => {
    input.addEventListener("change", () => {
      const current = new Set(currentState.settings.personalization?.visibleWidgets || DASHBOARD_WIDGETS.map((widget) => widget.id));
      if (input.checked) {
        current.add(input.dataset.widgetId);
      } else if (current.size > 1) {
        current.delete(input.dataset.widgetId);
      } else {
        input.checked = true;
        return;
      }
      window.shieldApi.updateSettings({
        personalization: {
          ...currentState.settings.personalization,
          visibleWidgets: DASHBOARD_WIDGETS.map((widget) => widget.id).filter((id) => current.has(id))
        }
      });
    });
  });
  document.querySelectorAll(".feature-flag-toggle").forEach((input) => {
    input.addEventListener("change", () => {
      window.shieldApi.updateSettings({
        featureFlags: {
          ...currentState.settings.featureFlags,
          [input.dataset.flagKey]: input.checked
        }
      });
    });
  });
  document.querySelectorAll(".apply-profile-button").forEach((button) => {
    button.addEventListener("click", () => applyProfilePreset(button.dataset.profile));
  });
  document.querySelectorAll(".extension-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.approved === "true") {
        window.shieldApi.revokeExtension(button.dataset.extension);
      } else {
        window.shieldApi.approveExtension(button.dataset.extension);
      }
    });
  });
  document.querySelector("#refresh-extensions")?.addEventListener("click", () => {
    window.shieldApi.refreshExtensions();
  });
  document.querySelector("#open-support-request")?.addEventListener("click", () => {
    window.shieldApi.openSupportRequest();
  });
  document.querySelector("#create-support-bundle")?.addEventListener("click", async () => {
    const bundle = await window.shieldApi.createSupportBundle();
    const instructions = [
      "Local report ZIP created.",
      "",
      `Saved to Documents: ${bundle.fileName}`,
      "",
      "How to report this on GitHub:",
      "1. Open the GitHub issue page from the app.",
      "2. Sign in to GitHub.",
      "3. If you do not have an account, choose Sign up and create one with your email address, a username, and a password.",
      "4. Verify your email if GitHub asks you to.",
      "5. Create a new issue and describe the problem in plain language.",
      "6. Attach the ZIP file from your Documents folder before submitting.",
      "",
      "This ZIP does not include keystrokes, typed content, passwords, clipboard contents, or personal file paths."
    ].join("\n");
    diagnosticsFeedback = {
      tone: "success",
      title: "Local report ZIP created",
      message: `Saved ${bundle.fileName} to your Documents folder. Open the GitHub issue page, sign in or create an account, and attach the ZIP.`
    };
    renderPanels();
    alert(instructions);
  });
  document.querySelector("#toggle-overlay")?.addEventListener("click", () => {
    window.shieldApi.setOverlayVisible(!currentState.settings.overlay?.panelVisible);
  });
  document.querySelectorAll(".sharing-preset-button").forEach((button) => {
    button.addEventListener("click", () => {
      window.shieldApi.applyPreset(button.dataset.preset);
    });
  });
  document.querySelectorAll(".release-check-toggle").forEach((input) => {
    input.addEventListener("change", () => {
      window.shieldApi.updateSettings({
        releaseChecks: {
          ...currentState.settings.releaseChecks,
          [input.dataset.releaseKey]: input.checked
        }
      });
    });
  });
  document.querySelector("#add-session-note")?.addEventListener("click", async () => {
    const input = document.querySelector("#session-note-input");
    const value = input?.value.trim();
    if (!value) {
      return;
    }
    await window.shieldApi.addSessionNote(value);
    if (input) {
      input.value = "";
    }
  });
  document.querySelectorAll(".remove-note-button").forEach((button) => {
    button.addEventListener("click", () => window.shieldApi.removeSessionNote(button.dataset.noteId));
  });
  document.querySelector("#save-shortcuts")?.addEventListener("click", () => {
    const inputs = [...document.querySelectorAll(".shortcut-input")];
    const shortcuts = inputs.reduce((output, input) => {
      output[input.dataset.shortcutKey] = input.value.trim();
      return output;
    }, {});
    window.shieldApi.updateSettings({ shortcuts });
  });

  document.querySelector("#policy-offline")?.addEventListener("change", (event) => patchPolicy("offlineDeploymentMode", event.target.checked));
  document.querySelector("#policy-portable")?.addEventListener("change", (event) => patchPolicy("portableUsbMode", event.target.checked));
  document.querySelector("#policy-kiosk")?.addEventListener("change", (event) => patchPolicy("kioskMode", event.target.checked));
  document.querySelector("#policy-readonly")?.addEventListener("change", (event) => patchPolicy("readOnlyProfileMode", event.target.checked));
  document.querySelector("#policy-shared")?.addEventListener("change", (event) => patchPolicy("sharedWorkstationMode", event.target.checked));
  document.querySelector("#policy-managed")?.addEventListener("change", (event) => patchPolicy("managedPolicySupport", event.target.checked));

  document.querySelector("#win-theme-sync")?.addEventListener("change", (event) => patchWindowsIntegration("themeSynchronization", event.target.checked));
  document.querySelector("#win-a11y-sync")?.addEventListener("change", (event) => patchWindowsIntegration("accessibilitySynchronization", event.target.checked));
  document.querySelector("#win-power-awareness")?.addEventListener("change", (event) => patchWindowsIntegration("powerProfileAwareness", event.target.checked));
  document.querySelector("#win-focus-awareness")?.addEventListener("change", (event) => patchWindowsIntegration("focusAssistAwareness", event.target.checked));
  document.querySelector("#win-security-awareness")?.addEventListener("change", (event) => patchWindowsIntegration("securityCenterAwareness", event.target.checked));
  document.querySelector("#sync-with-windows")?.addEventListener("click", async () => {
    const result = await window.shieldApi.syncWithWindows();
    alert(
      `App aligned with ${platformName()}.\n\nTheme: ${result.theme}\nHigh contrast: ${result.highContrast ? "On" : "Off"}\nMinimal resource mode: ${result.minimalResourceMode ? "On" : "Off"}\nPower mode: ${result.powerMode}`
    );
  });

  document.querySelector("#wellbeing-breaks")?.addEventListener("change", (event) => patchWellbeing("breakReminders", event.target.checked));
  document.querySelector("#wellbeing-deep-focus")?.addEventListener("change", (event) => patchWellbeing("deepFocusMode", event.target.checked));
  document.querySelector("#wellbeing-reduced-distraction")?.addEventListener("change", (event) => patchWellbeing("reducedDistractionMode", event.target.checked));
  document.querySelector("#focus-session-minutes")?.addEventListener("input", (event) => patchWellbeing("focusSessionMinutes", Number(event.target.value)));
  document.querySelector("#start-focus-session")?.addEventListener("click", () => window.shieldApi.startWellbeingSession());
  document.querySelector("#stop-focus-session")?.addEventListener("click", () => window.shieldApi.stopWellbeingSession());
}

function bindTopBar() {
  toggleButton.onclick = () => window.shieldApi.setProtection(!currentState.protection.protectionEnabled);
  emergencyButton.onclick = () => window.shieldApi.triggerEmergency();
  modeSelect.onclick = () => toggleDropdown(modeSelect, modeMenu);
  menuSelect.onclick = () => toggleDropdown(menuSelect, menuMenu);

  modeMenu.onclick = (event) => {
    const option = event.target.closest("[data-mode]");
    if (!option) {
      return;
    }
    window.shieldApi.setMode(option.dataset.mode);
    closeDropdowns();
  };

  menuMenu.onclick = (event) => {
    const option = event.target.closest("[data-menu]");
    if (!option) {
      return;
    }
    if (option.dataset.menu === "exit") {
      window.shieldApi.exitApp();
    } else {
      navigate(option.dataset.menu);
    }
    closeDropdowns();
  };

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".topbar-dropdown")) {
      closeDropdowns();
    }
    if (!event.target.closest(".custom-select")) {
      closeCustomSelects();
    }
  });
}

function bindShortcutHandler() {
  document.addEventListener("keydown", (event) => {
    if (!currentState?.settings?.shortcuts) {
      return;
    }
    if (event.target instanceof HTMLTextAreaElement || (event.target instanceof HTMLInputElement && event.target.type !== "checkbox")) {
      return;
    }

    const shortcuts = currentState.settings.shortcuts;
    if (matchesShortcut(event, shortcuts.toggleProtection)) {
      event.preventDefault();
      window.shieldApi.setProtection(!currentState.protection.protectionEnabled);
    } else if (matchesShortcut(event, shortcuts.emergencyMode)) {
      event.preventDefault();
      window.shieldApi.triggerEmergency();
    } else if (matchesShortcut(event, shortcuts.quickHide)) {
      event.preventDefault();
      window.shieldApi.setQuickHide(!currentState.protection.quickHideActive);
    } else if (matchesShortcut(event, shortcuts.openDeviceCenter)) {
      event.preventDefault();
      navigate("device-center");
    } else if (matchesShortcut(event, shortcuts.refreshStatus)) {
      event.preventDefault();
      window.shieldApi.refreshAll();
    }
  });
}

function matchesShortcut(event, shortcut) {
  const normalized = String(shortcut || "").toLowerCase().split("+").filter(Boolean);
  if (!normalized.length) {
    return false;
  }
  const key = String(event.key || "").toLowerCase();
  const expectedKey = normalized[normalized.length - 1];
  return Boolean(
    key === expectedKey &&
      normalized.includes("ctrl") === event.ctrlKey &&
      normalized.includes("shift") === event.shiftKey &&
      normalized.includes("alt") === event.altKey
  );
}

function render() {
  if (!currentState) {
    return;
  }
  const isDashboard = activeSection === "dashboard";
  cardsGrid.classList.toggle("dashboard-grid", isDashboard);
  detailPanels.classList.toggle("dashboard-panels", isDashboard);
  onboarding.classList.toggle("hidden", !isDashboard || localStorage.getItem("shield.onboarding.complete") === "true");
  quickActions.classList.toggle("hidden", !isDashboard);
  cardsGrid.classList.toggle("hidden", !isDashboard);
  quickActions.classList.toggle("minimal-actions", currentState.settings.minimalResourceMode);
  pageTitle.textContent = getSectionLabel();
  toggleButton.textContent = currentState.protection.protectionEnabled ? "Protection On" : "Protection Off";
  toggleButton.classList.toggle("primary", currentState.protection.protectionEnabled);
  renderNavigation();
  renderModeSelect();
  renderQuickMenu();
  renderOnboarding();
  renderHero();
  renderQuickActions();
  renderDashboardCards();
  renderPanels();
  applyAccessibilityClasses();
}

async function initialize() {
  currentState = await window.shieldApi.getState();
  bindTopBar();
  bindShortcutHandler();
  render();

  window.shieldApi.onStateUpdate((payload) => {
    currentState = payload;
    render();
  });

  window.shieldApi.onNavigate((target) => {
    if (target) {
      navigate(target);
    }
  });
}

initialize();
