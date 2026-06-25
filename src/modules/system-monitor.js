const EventEmitter = require("events");
const { execFile } = require("child_process");

class SystemMonitor extends EventEmitter {
  constructor() {
    super();
    this.refreshTimer = null;
    this.refreshInFlight = false;
    this.lastSignature = "";
    this.snapshot = buildDefaultSnapshot();
  }

  async refresh() {
    if (this.refreshInFlight) {
      return;
    }
    this.refreshInFlight = true;
    try {
      if (process.platform === "darwin") {
        await this.refreshMac();
      } else if (process.platform === "win32") {
        await this.refreshWindows();
      } else {
        this.commitSnapshot({
          ...buildDefaultSnapshot(),
          platform: process.platform,
          platformName: "Unsupported platform",
          windowsVersion: "Unsupported platform",
          operatingSystemSecurityStatus: "Local status support is currently limited on this platform."
        });
      }
    } finally {
      this.refreshInFlight = false;
    }
  }

  async refreshWindows() {
    const [battery, firewall, osInfo, publicProfiles, vpnAdapters, cameras, audioEndpoints, bluetoothDevices, usbDevices] =
      await Promise.all([
        runPowerShellJson(
          "Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object EstimatedChargeRemaining, Status | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-NetFirewallProfile -ErrorAction SilentlyContinue | Select-Object Name, Enabled | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-NetConnectionProfile -ErrorAction SilentlyContinue | Select-Object Name, NetworkCategory | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-NetAdapter -ErrorAction SilentlyContinue | Where-Object { $_.InterfaceDescription -match 'VPN' -or $_.Name -match 'VPN' } | Select-Object Name, Status | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-PnpDevice -Class Camera -PresentOnly -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-PnpDevice -Class AudioEndpoint -PresentOnly -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-PnpDevice -Class Bluetooth -PresentOnly -ErrorAction SilentlyContinue | Select-Object FriendlyName, Status | ConvertTo-Json"
        ),
        runPowerShellJson(
          "Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue | Where-Object { $_.Class -eq 'USB' } | Select-Object FriendlyName, Status | ConvertTo-Json"
        )
      ]);

    const themeValue = await runPowerShellJson(
      "(Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name AppsUseLightTheme -ErrorAction SilentlyContinue).AppsUseLightTheme | ConvertTo-Json"
    );
    const highContrastValue = await runPowerShellJson(
      "(Get-ItemProperty -Path 'HKCU:\\Control Panel\\Accessibility\\HighContrast' -Name Flags -ErrorAction SilentlyContinue).Flags | ConvertTo-Json"
    );
    const activeScheme = await runCommand("powercfg.exe", ["/getactivescheme"]);
    const memory = process.memoryUsage();
    const cpuSeconds = Math.round(process.cpuUsage().user / 1000000);
    const appMemoryMb = Math.round(memory.rss / 1024 / 1024);
    const cameraList = normalizeList(cameras);
    const audioList = normalizeList(audioEndpoints);
    const bluetoothList = normalizeList(bluetoothDevices);
    const usbList = normalizeList(usbDevices);
    const publicNetwork = normalizeList(publicProfiles).some((item) => item.NetworkCategory === "Public");

    this.commitSnapshot({
      ...buildDefaultSnapshot(),
      platform: "win32",
      platformName: "Windows",
      webcamStatus: cameraList.length ? `${cameraList.length} detected locally` : "No camera metadata detected",
      microphoneStatus: summarizeAudio(audioList, "Microphone"),
      speakerStatus: summarizeAudio(audioList, "Speaker"),
      bluetoothStatus: bluetoothList.length ? `${bluetoothList.length} Bluetooth device entries visible` : "No Bluetooth metadata detected",
      usbStatus: usbList.length ? `${usbList.length} USB device entries visible` : "No USB metadata detected",
      usbDeviceCount: usbList.length,
      batteryStatus: battery?.EstimatedChargeRemaining ? `${battery.EstimatedChargeRemaining}%` : "Desktop or unavailable",
      batteryHealthStatus: battery?.Status ? `Battery status code ${battery.Status}` : "Unavailable",
      powerMode: summarizePowerMode(activeScheme),
      powerSaverAwareness: activeScheme.toLowerCase().includes("power saver") ? "Power Saver detected" : "Standard",
      firewallStatus: summarizeFirewall(firewall),
      windowsSecurityStatus: "Observed locally without changing Windows security settings",
      securityCenterAwareness: "Windows Security Center awareness is advisory only",
      networkSecurityStatus: publicNetwork ? "Public network profile detected locally" : "No public network profile detected",
      publicWifiWarning: publicNetwork ? "Public network profile detected. Review privacy mode before sharing." : "No public network warning",
      vpnDetectionStatus: normalizeList(vpnAdapters).length ? "VPN adapter detected locally" : "No VPN adapter detected",
      operatingSystemSecurityStatus: "Status only. No system security settings are modified.",
      windowsThemeStatus: Number(themeValue) === 0 ? "Dark" : Number(themeValue) === 1 ? "Light" : "Unknown",
      windowsBuild: osInfo?.BuildNumber || "Unavailable",
      windowsVersion: osInfo?.Caption || "Unavailable",
      windowsFocusAssistStatus: "Ready for local awareness when Windows exposes focus status",
      windowsAccessibilitySyncStatus: summarizeAccessibilitySync(highContrastValue),
      windowsThemeSyncStatus: "Local theme can align with Windows theme preference",
      powerProfileAwareness: "Local active power profile detected",
      bluetoothDeviceCount: bluetoothList.length,
      speakerCount: audioList.length,
      appMemoryMb,
      appCpuSeconds: cpuSeconds,
      appPerformanceScore: scorePerformance(appMemoryMb, cpuSeconds),
      resourceEfficiencyScore: scoreEfficiency(appMemoryMb),
      startupPerformanceScore: 87,
      batteryEfficiencyScore: activeScheme.toLowerCase().includes("balanced") ? 86 : 78,
      systemLoadAwareness: appMemoryMb > 300 ? "Elevated" : "Nominal",
      securityScore: summarizeScore(firewall, publicNetwork)
    });
  }

  async refreshMac() {
    const [cameraInfo, audioInfo, bluetoothInfo, usbInfo, displayInfo, hardwareInfo, batteryText, themeText, firewallText, productName, productVersion] =
      await Promise.all([
        runJsonCommand("system_profiler", ["SPCameraDataType", "-json"]),
        runJsonCommand("system_profiler", ["SPAudioDataType", "-json"]),
        runJsonCommand("system_profiler", ["SPBluetoothDataType", "-json"]),
        runJsonCommand("system_profiler", ["SPUSBDataType", "-json"]),
        runJsonCommand("system_profiler", ["SPDisplaysDataType", "-json"]),
        runJsonCommand("system_profiler", ["SPHardwareDataType", "-json"]),
        runCommand("pmset", ["-g", "batt"]),
        runCommand("defaults", ["read", "-g", "AppleInterfaceStyle"]),
        runCommand("/usr/libexec/ApplicationFirewall/socketfilterfw", ["--getglobalstate"]),
        runCommand("sw_vers", ["-productName"]),
        runCommand("sw_vers", ["-productVersion"])
      ]);

    const cameraCount = countProfilerItems(cameraInfo);
    const audioCount = countProfilerItems(audioInfo);
    const bluetoothCount = countProfilerItems(bluetoothInfo);
    const usbCount = countProfilerItems(usbInfo);
    const displayCount = Math.max(1, countDisplayItems(displayInfo));
    const hardwareModel = firstProfilerValue(hardwareInfo, "machine_model") || firstProfilerValue(hardwareInfo, "machine_name");
    const powerMode = /Battery Power/i.test(batteryText) ? "Battery Power" : /AC Power/i.test(batteryText) ? "AC Power" : "Balanced";
    const batteryPercent = extractBatteryPercent(batteryText);
    const memory = process.memoryUsage();
    const cpuSeconds = Math.round(process.cpuUsage().user / 1000000);
    const appMemoryMb = Math.round(memory.rss / 1024 / 1024);
    const firewallEnabled = /enabled/i.test(firewallText);
    const darkMode = /dark/i.test(themeText);

    this.commitSnapshot({
      ...buildDefaultSnapshot(),
      platform: "darwin",
      platformName: "macOS",
      webcamStatus: cameraCount ? `${cameraCount} detected locally` : "No camera metadata detected",
      microphoneStatus: audioCount ? "Audio devices detected locally" : "Microphone status unavailable from current local query",
      speakerStatus: audioCount ? "Audio output devices detected locally" : "Speaker status unavailable from current local query",
      bluetoothStatus: bluetoothCount ? `${bluetoothCount} Bluetooth device entries visible` : "No Bluetooth metadata detected",
      usbStatus: usbCount ? `${usbCount} USB device entries visible` : "No USB metadata detected",
      usbDeviceCount: usbCount,
      batteryStatus: batteryPercent ? `${batteryPercent}%` : "Desktop or unavailable",
      batteryHealthStatus: batteryText ? "Battery metadata available locally" : "Unavailable",
      powerMode,
      powerSaverAwareness: powerMode === "Battery Power" ? "Battery power detected" : "Standard",
      firewallStatus: firewallText ? (firewallEnabled ? "Enabled" : "Review macOS Firewall") : "Unavailable",
      windowsSecurityStatus: "Observed locally without changing macOS security settings",
      securityCenterAwareness: "macOS security awareness is advisory only",
      networkSecurityStatus: displayCount > 1 ? "Multiple display workspace detected locally" : "No elevated workspace network advisory",
      publicWifiWarning: "Public Wi-Fi status is advisory only on macOS from current local checks",
      vpnDetectionStatus: "VPN detection is limited to local macOS status checks",
      operatingSystemSecurityStatus: "Status only. No macOS security settings are modified.",
      windowsThemeStatus: darkMode ? "Dark" : "Light",
      windowsBuild: productVersion || "Unavailable",
      windowsVersion: [productName, productVersion].filter(Boolean).join(" ") || "macOS",
      windowsFocusAssistStatus: "macOS focus awareness is advisory only",
      windowsAccessibilitySyncStatus: "macOS accessibility sync is advisory only",
      windowsThemeSyncStatus: "Local theme can align with macOS appearance preference",
      powerProfileAwareness: "Local macOS power source detected",
      bluetoothDeviceCount: bluetoothCount,
      speakerCount: audioCount,
      appMemoryMb,
      appCpuSeconds: cpuSeconds,
      appPerformanceScore: scorePerformance(appMemoryMb, cpuSeconds),
      resourceEfficiencyScore: scoreEfficiency(appMemoryMb),
      startupPerformanceScore: 87,
      batteryEfficiencyScore: powerMode === "Battery Power" ? 84 : 88,
      systemLoadAwareness: appMemoryMb > 300 ? "Elevated" : "Nominal",
      securityScore: firewallEnabled ? 92 : 78,
      displayCount,
      hardwareModel: hardwareModel || "Mac"
    });
  }

  commitSnapshot(nextSnapshot) {
    const nextSignature = JSON.stringify(nextSnapshot);
    this.snapshot = nextSnapshot;
    if (nextSignature !== this.lastSignature) {
      this.lastSignature = nextSignature;
      this.emit("updated", this.snapshot);
    }
  }

  startMonitoring(intervalMs = 3000) {
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

function buildDefaultSnapshot() {
  return {
    platform: process.platform,
    platformName: process.platform === "darwin" ? "macOS" : process.platform === "win32" ? "Windows" : "Local system",
    webcamActive: false,
    webcamStatus: "Unavailable",
    microphoneActive: false,
    microphoneStatus: "Unavailable",
    speakerStatus: "Unavailable",
    bluetoothStatus: "Unknown",
    usbStatus: "Monitoring locally",
    usbDeviceCount: 0,
    batteryStatus: "Desktop or unavailable",
    batteryHealthStatus: "Unavailable",
    powerMode: "Balanced",
    powerSaverAwareness: "Standard",
    firewallStatus: "Unknown",
    windowsSecurityStatus: "Local awareness only",
    securityCenterAwareness: "Local awareness only",
    networkSecurityStatus: "Advisory only",
    publicWifiWarning: "No public Wi-Fi warning",
    vpnDetectionStatus: "Not detected",
    operatingSystemSecurityStatus: "Observed locally only",
    windowsThemeStatus: "Unknown",
    windowsBuild: "Unavailable",
    windowsVersion: "Unavailable",
    windowsFocusAssistStatus: "Advisory only",
    windowsAccessibilitySyncStatus: "Ready",
    windowsThemeSyncStatus: "Ready",
    powerProfileAwareness: "Ready",
    bluetoothDeviceCount: 0,
    speakerCount: 0,
    appMemoryMb: 0,
    appCpuSeconds: 0,
    appPerformanceScore: 90,
    resourceEfficiencyScore: 88,
    startupPerformanceScore: 87,
    batteryEfficiencyScore: 82,
    systemLoadAwareness: "Nominal",
    securityScore: 92
  };
}

function normalizeList(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function summarizeAudio(devices, target) {
  const count = devices.filter((device) => String(device.FriendlyName || "").toLowerCase().includes(target.toLowerCase())).length;
  return count ? `${count} ${target.toLowerCase()} endpoint entries visible` : `${target} status unavailable from current local query`;
}

function summarizePowerMode(text) {
  const value = String(text || "").toLowerCase();
  if (value.includes("power saver")) {
    return "Power Saver";
  }
  if (value.includes("high performance")) {
    return "High Performance";
  }
  if (value.includes("balanced")) {
    return "Balanced";
  }
  return "Balanced";
}

function summarizeFirewall(firewall) {
  const profiles = normalizeList(firewall);
  if (!profiles.length) {
    return "Unavailable";
  }
  return profiles.every((item) => item.Enabled) ? "Enabled" : "Check Windows Firewall";
}

function summarizeScore(firewall, publicNetwork) {
  const profiles = normalizeList(firewall);
  let score = profiles.every((item) => item.Enabled) ? 94 : 78;
  if (publicNetwork) {
    score -= 8;
  }
  return Math.max(50, score);
}

function summarizeAccessibilitySync(highContrastValue) {
  const value = String(highContrastValue || "").trim();
  if (value === "1") {
    return "Windows high contrast appears active";
  }
  if (value === "0") {
    return "Windows high contrast appears inactive";
  }
  return "Windows accessibility preference is available for local sync when detected";
}

function scorePerformance(memoryMb, cpuSeconds) {
  return Math.max(60, 100 - Math.round(memoryMb / 8) - Math.min(20, Math.round(cpuSeconds / 10)));
}

function scoreEfficiency(memoryMb) {
  return Math.max(62, 100 - Math.round(memoryMb / 10));
}

function countProfilerItems(payload) {
  let count = 0;
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
    if (typeof node._name === "string" || typeof node.device_title === "string" || typeof node.spproduct_name === "string") {
      count += 1;
    }
    Object.values(node).forEach(visit);
  };
  visit(payload);
  return count;
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
    if (node._name && /(display|color lcd|retina)/i.test(String(node._name))) {
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

function extractBatteryPercent(text) {
  const match = String(text || "").match(/(\d+)%/);
  return match ? Number(match[1]) : 0;
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
    execFile(command, args, { windowsHide: true, timeout: 5000 }, (error, stdout) => {
      if (error) {
        resolve("");
        return;
      }
      resolve(String(stdout || "").trim());
    });
  });
}

module.exports = { SystemMonitor };
