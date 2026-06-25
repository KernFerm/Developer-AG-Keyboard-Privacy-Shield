const EventEmitter = require("events");
const { execFile } = require("child_process");

const STREAMING_PROCESSES = [
  "obs64",
  "obs",
  "discord",
  "zoom",
  "teams",
  "ms-teams",
  "slack",
  "chrome",
  "msedge",
  "firefox",
  "safari",
  "livestreamer",
  "twitchstudio",
  "streamlabs",
  "xsplit",
  "screensharingagent"
];

class WorkspaceMonitor extends EventEmitter {
  constructor() {
    super();
    this.refreshTimer = null;
    this.refreshInFlight = false;
    this.lastSignature = "";
    this.snapshot = {
      monitorCount: 1,
      presentationDisplayDetected: false,
      projectorDetected: false,
      dockingStationDetected: false,
      sharedWorkspaceAwareness: "Stable",
      workspaceRiskScore: 24,
      workspaceExposureScore: 24,
      workspaceClassification: "Personal Workspace Mode",
      secureWorkspaceScan: "Healthy",
      screenSharingDetected: false,
      screenCaptureDetected: false,
      streamingEnvironmentDetected: false,
      publicWorkspaceRisk: false,
      remoteDesktopDetected: false,
      virtualMachineAwareness: false,
      sharedComputerAwareness: false,
      travelModeAwareness: false,
      trainingEnvironmentMode: false,
      meetingEnvironmentMode: false,
      activeEnvironments: [],
      privacyRecommendations: []
    };
  }

  async refresh() {
    if (this.refreshInFlight) {
      return;
    }
    this.refreshInFlight = true;
    try {
      if (process.platform === "darwin") {
        await this.refreshMac();
      } else {
        await this.refreshWindows();
      }
    } finally {
      this.refreshInFlight = false;
    }
  }

  async refreshWindows() {
    const [processNames, monitorInfo, computerSystem, biosInfo] = await Promise.all([
      runPowerShellJson("Get-Process | Select-Object -ExpandProperty ProcessName | ConvertTo-Json"),
      runPowerShellJson(
        "Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorBasicDisplayParams -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count | ConvertTo-Json"
      ),
      runPowerShellJson("Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model | ConvertTo-Json"),
      runPowerShellJson("Get-CimInstance Win32_BIOS | Select-Object SerialNumber | ConvertTo-Json")
    ]);

    const names = normalizeList(processNames).map((name) => String(name).toLowerCase());
    const activeEnvironments = STREAMING_PROCESSES.filter((name) => names.includes(name));
    const monitorCount = Number(monitorInfo) || 1;
    const remoteDesktopDetected = process.env.SESSIONNAME?.toLowerCase().includes("rdp") || false;
    const virtualMachineAwareness = /(virtual|vmware|virtualbox|hyper-v)/i.test(
      `${computerSystem?.Manufacturer || ""} ${computerSystem?.Model || ""}`
    );
    this.commitSnapshot(buildWorkspaceSnapshot({
      names,
      activeEnvironments,
      monitorCount,
      remoteDesktopDetected,
      virtualMachineAwareness,
      modelText: `${computerSystem?.Manufacturer || ""} ${computerSystem?.Model || ""}`,
      serialText: String(biosInfo?.SerialNumber || "")
    }));
  }

  async refreshMac() {
    const [processOutput, displays, hardware, screenSharing] = await Promise.all([
      runCommand("ps", ["-axo", "comm"]),
      runJsonCommand("system_profiler", ["SPDisplaysDataType", "-json"]),
      runJsonCommand("system_profiler", ["SPHardwareDataType", "-json"]),
      runCommand("pgrep", ["-fl", "Screen Sharing"])
    ]);

    const names = String(processOutput || "")
      .split(/\r?\n/)
      .map((item) => item.trim().split("/").pop().toLowerCase())
      .filter(Boolean);
    const activeEnvironments = STREAMING_PROCESSES.filter((name) => names.includes(name));
    const monitorCount = Math.max(1, countDisplayItems(displays));
    const hardwareText = `${firstProfilerValue(hardware, "machine_model")} ${firstProfilerValue(hardware, "machine_name")}`.trim();
    const remoteDesktopDetected =
      /screensharing|remotedesktop/i.test(screenSharing) ||
      names.includes("screensharingagent") ||
      names.includes("applevncserver");
    const virtualMachineAwareness = /(virtualbox|vmware|parallels)/i.test(hardwareText) || names.some((name) => /vmware|parallels|virtualbox/.test(name));

    this.commitSnapshot(buildWorkspaceSnapshot({
      names,
      activeEnvironments,
      monitorCount,
      remoteDesktopDetected,
      virtualMachineAwareness,
      modelText: hardwareText,
      serialText: ""
    }));
  }

  commitSnapshot(nextSnapshot) {
    const nextSignature = JSON.stringify(nextSnapshot);
    this.snapshot = nextSnapshot;
    if (nextSignature !== this.lastSignature) {
      this.lastSignature = nextSignature;
      this.emit("updated", this.snapshot);
    }
  }

  startMonitoring(intervalMs = 2000) {
    this.stopMonitoring();
    this.refresh().catch(() => {});
    this.refreshTimer = setInterval(() => {
      this.refresh().catch(() => {});
    }, intervalMs);
  }

  getSnapshot() {
    return this.snapshot;
  }

  stopMonitoring() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  dispose() {
    this.stopMonitoring();
  }
}

function normalizeList(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function buildWorkspaceSnapshot({ names, activeEnvironments, monitorCount, remoteDesktopDetected, virtualMachineAwareness, modelText, serialText }) {
  const publicWorkspaceRisk = monitorCount > 1 || activeEnvironments.length > 1 || remoteDesktopDetected;
  const meetingEnvironmentMode = activeEnvironments.some((name) =>
    ["zoom", "teams", "discord", "slack"].includes(name)
  );
  const trainingEnvironmentMode = activeEnvironments.some((name) =>
    ["chrome", "msedge", "firefox", "safari"].includes(name)
  );
  const workspaceRiskScore = Math.min(
    92,
    18 +
      (monitorCount - 1) * 15 +
      activeEnvironments.length * 8 +
      (remoteDesktopDetected ? 12 : 0) +
      (virtualMachineAwareness ? 10 : 0)
  );

  return {
    monitorCount,
    presentationDisplayDetected: monitorCount > 1,
    projectorDetected: monitorCount > 1 && trainingEnvironmentMode,
    dockingStationDetected: monitorCount > 1 || /dock|displaylink|thunderbolt/i.test(modelText),
    sharedWorkspaceAwareness: monitorCount > 1 ? "Expanded workspace" : "Single display",
    workspaceRiskScore,
    workspaceExposureScore: workspaceRiskScore,
    workspaceClassification: classifyWorkspace({
      remoteDesktopDetected,
      activeEnvironments,
      monitorCount,
      meetingEnvironmentMode
    }),
    secureWorkspaceScan: publicWorkspaceRisk ? "Review suggested" : "Healthy",
    screenSharingDetected: meetingEnvironmentMode || names.includes("screensharingagent"),
    screenCaptureDetected: activeEnvironments.some((name) => ["obs64", "obs", "twitchstudio", "streamlabs", "xsplit"].includes(name)),
    streamingEnvironmentDetected: activeEnvironments.length > 0,
    publicWorkspaceRisk,
    remoteDesktopDetected,
    virtualMachineAwareness,
    sharedComputerAwareness: Boolean(serialText && String(serialText).toLowerCase().includes("default")),
    travelModeAwareness: remoteDesktopDetected || virtualMachineAwareness,
    trainingEnvironmentMode,
    meetingEnvironmentMode,
    activeEnvironments,
    privacyRecommendations: buildWorkspaceRecommendations({
      monitorCount,
      activeEnvironments,
      remoteDesktopDetected,
      publicWorkspaceRisk
    })
  };
}

function classifyWorkspace({ remoteDesktopDetected, activeEnvironments, monitorCount, meetingEnvironmentMode }) {
  if (remoteDesktopDetected) {
    return "Remote Work Mode";
  }
  if (activeEnvironments.some((name) => ["obs64", "obs", "twitchstudio", "streamlabs", "xsplit"].includes(name))) {
    return "Conference Workspace Mode";
  }
  if (meetingEnvironmentMode) {
    return "Office Workspace Mode";
  }
  if (monitorCount > 1) {
    return "Public Workspace Mode";
  }
  return "Personal Workspace Mode";
}

function buildWorkspaceRecommendations({ monitorCount, activeEnvironments, remoteDesktopDetected, publicWorkspaceRisk }) {
  const tips = [];
  if (monitorCount > 1) {
    tips.push("Consider Presentation Mode or Conference Mode when multiple displays are active.");
  }
  if (activeEnvironments.length) {
    tips.push("A sharing or streaming environment appears active. Review protection mode before continuing.");
  }
  if (remoteDesktopDetected) {
    tips.push("Remote desktop awareness is active. Use a simplified privacy-safe dashboard view.");
  }
  if (publicWorkspaceRisk) {
    tips.push("Public workspace risk is elevated. Emergency Privacy Mode can reduce visible details quickly.");
  }
  return tips;
}

function countDisplayItems(payload) {
  const displays = [];
  const visit = (node) => {
    if (!node) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== "object") {
      return;
    }
    if (node._name && /(display|retina|color lcd)/i.test(String(node._name))) {
      displays.push(node._name);
    }
    Object.values(node).forEach(visit);
  };
  visit(payload);
  return new Set(displays).size;
}

function firstProfilerValue(payload, targetKey) {
  let found = "";
  const visit = (node) => {
    if (found || !node) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== "object") {
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (String(key).toLowerCase() === targetKey.toLowerCase() && typeof value === "string" && value.trim()) {
        found = value.trim();
        return;
      }
    }
    Object.values(node).forEach(visit);
  };
  visit(payload);
  return found;
}

function runPowerShellJson(script) {
  return new Promise((resolve) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
      { windowsHide: true, timeout: 6000, maxBuffer: 1024 * 1024 },
      (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve([]);
          return;
        }
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve([]);
        }
      }
    );
  });
}

function runJsonCommand(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 10000, maxBuffer: 2 * 1024 * 1024 }, (error, stdout) => {
      if (error || !String(stdout || "").trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({});
      }
    });
  });
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 5000, maxBuffer: 1024 * 1024 }, (error, stdout) => {
      resolve(error ? "" : String(stdout || "").trim());
    });
  });
}

module.exports = {
  WorkspaceMonitor,
  classifyWorkspace,
  buildWorkspaceRecommendations
};
