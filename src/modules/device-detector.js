const EventEmitter = require("events");
const crypto = require("crypto");
const { execFile } = require("child_process");
const { sanitizeDevice, sanitizeList } = require("./sanitizer");

class DeviceDetector extends EventEmitter {
  constructor() {
    super();
    this.devices = [];
    this.previousDevices = [];
    this.lastRefresh = 0;
    this.lastRefreshAt = "";
    this.relatedDevices = [];
    this.relatedSignature = "";
    this.refreshTimer = null;
    this.refreshInFlight = false;
    this.lastStateSignature = "";
    this.comparison = { added: [], removed: [], changed: [] };
    this.health = {
      status: "Initializing",
      message: initialHealthMessage(),
      source: detectionSource()
    };
  }

  async refresh() {
    if (this.refreshInFlight) {
      return;
    }
    this.refreshInFlight = true;
    const now = Date.now();
    if (now - this.lastRefresh < 1500) {
      this.refreshInFlight = false;
      return;
    }
    this.lastRefresh = now;
    try {
      if (process.platform === "darwin") {
        await this.refreshMacDevices();
      } else if (process.platform === "win32") {
        await this.refreshWindowsDevices();
      } else {
        this.health = {
          status: "Unavailable",
          message: "Keyboard detection is currently implemented for Windows and macOS local device inventory.",
          source: detectionSource()
        };
        this.updateDeviceState([]);
      }
    } finally {
      this.refreshInFlight = false;
    }
  }

  async refreshWindowsDevices() {
    const keyboardOutput = await runPnPUtil(["/enum-devices", "/connected", "/class", "Keyboard"]);
    const raw = parsePnPUtilDevices(keyboardOutput);
    const list = collapseDeviceEntries(raw);
    if (!keyboardOutput.trim()) {
      this.health = {
        status: "Unavailable",
        message: "Windows did not return any connected keyboard-class devices for local detection.",
        source: "pnputil"
      };
    } else if (!list.length) {
      this.health = {
        status: "Limited",
        message: "Windows reported keyboard-class inventory, but no physical keyboard candidates survived filtering.",
        source: "pnputil"
      };
    } else {
      this.health = {
        status: "Ready",
        message: "Keyboard detection is using local Windows connected-device inventory.",
        source: "pnputil"
      };
    }
    const relatedSignature = buildHardwareSignature(list);
    if (relatedSignature && relatedSignature !== this.relatedSignature) {
      this.relatedDevices = await fetchRelatedDevices(list);
      this.relatedSignature = relatedSignature;
    } else if (!relatedSignature) {
      this.relatedDevices = [];
      this.relatedSignature = "";
    }

    const relatedDevices = this.relatedDevices;
    const filteredList = filterPhysicalKeyboards(list, relatedDevices);
    const devices = sanitizeList(filteredList, (item) => {
      const matchedDevices = findRelatedDevices(item, relatedDevices);
      const device = sanitizeDevice({
        name: pickBestKeyboardName(item, matchedDevices),
        connectionType: inferConnectionType(item.InstanceId, matchedDevices),
        vendorId: extractPart(item.InstanceId, "VID_"),
        productId: extractPart(item.InstanceId, "PID_"),
        deviceId: item.InstanceId,
        status: item.Status || "Unknown"
      });
      return {
        ...device,
        confidence: scoreDetectionConfidence(item, matchedDevices),
        confidenceReason: explainDetectionConfidence(item, matchedDevices),
        fingerprint: crypto.createHash("sha256").update(device.deviceId).digest("hex")
      };
    });
    this.updateDeviceState(devices);
  }

  async refreshMacDevices() {
    const [usbInventory, bluetoothInventory, builtInInventory] = await Promise.all([
      runJsonCommand("system_profiler", ["SPUSBDataType", "-json"]),
      runJsonCommand("system_profiler", ["SPBluetoothDataType", "-json"]),
      runTextCommand("ioreg", ["-r", "-l", "-w", "0", "-c", "AppleEmbeddedKeyboard"])
    ]);

    const parsed = parseMacKeyboardInventory({
      usbInventory,
      bluetoothInventory,
      builtInInventory
    });
    const devices = sanitizeList(collapseMacDevices(parsed), (item) => {
      const device = sanitizeDevice({
        name: item.name,
        connectionType: item.connectionType,
        vendorId: item.vendorId,
        productId: item.productId,
        deviceId: item.deviceId,
        status: item.status || "Connected"
      });
      return {
        ...device,
        confidence: item.confidence || "Limited macOS metadata",
        confidenceReason: item.confidenceReason || "macOS exposed limited keyboard metadata for this device path.",
        fingerprint: crypto.createHash("sha256").update(device.deviceId).digest("hex")
      };
    });

    this.relatedDevices = [];
    this.relatedSignature = "";
    this.health = devices.length
      ? {
          status: "Ready",
          message: "Keyboard detection is using local macOS hardware inventory.",
          source: "system_profiler and ioreg"
        }
      : {
          status: "Limited",
          message: "macOS did not expose clear physical keyboard metadata from the current local hardware queries.",
          source: "system_profiler and ioreg"
        };
    this.updateDeviceState(devices);
  }

  updateDeviceState(nextDevices) {
    const previous = new Map(this.devices.map((device) => [device.fingerprint, device]));
    this.previousDevices = [...this.devices];
    this.devices = nextDevices;
    this.lastRefreshAt = new Date().toISOString();
    this.comparison = buildDetectionComparison(this.previousDevices, this.devices);

    const current = new Map(this.devices.map((device) => [device.fingerprint, device]));
    const events = [];
    current.forEach((device) => {
      if (!previous.has(device.fingerprint)) {
        events.push({
          title: "Keyboard connected",
          body: `${device.name} is now available.`,
          type: "connected",
          device
        });
      }
    });
    previous.forEach((device) => {
      if (!current.has(device.fingerprint)) {
        events.push({
          title: "Keyboard disconnected",
          body: `${device.name} was removed.`,
          type: "disconnected",
          device
        });
      }
    });

    const nextSignature = JSON.stringify(this.devices);
    if (nextSignature !== this.lastStateSignature) {
      this.lastStateSignature = nextSignature;
      this.emit("updated", this.devices);
    }

    if (events.length) {
      this.emit("events", events);
    }
  }

  startMonitoring(intervalMs = 2000) {
    this.stopMonitoring();
    this.refresh().catch(() => {});
    this.refreshTimer = setInterval(() => {
      this.refresh().catch(() => {});
    }, intervalMs);
  }

  getSnapshot(trustedDevices) {
    const trustedLookup = new Map(trustedDevices.map((item) => [item.fingerprint, item]));
    const devices = this.devices.map((device) => ({
      ...device,
      trusted: trustedLookup.has(device.fingerprint),
      trustLevel: trustedLookup.get(device.fingerprint)?.trustLevel || "Known"
    }));
    const groupedByConnection = groupDevices(devices, (device) => device.connectionType || "Unknown");
    const groupedByTrustLevel = groupDevices(devices, (device) => device.trustLevel || "Known");
    return {
      devices,
      total: devices.length,
      trustedCount: devices.filter((device) => device.trusted).length,
      groups: {
        connectionTypes: groupedByConnection,
        trustLevels: groupedByTrustLevel
      },
      compatibility: buildCompatibilitySummary(devices),
      health: { ...this.health },
      lastRefreshAt: this.lastRefreshAt,
      comparison: structuredClone(this.comparison)
    };
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

function stripSystemPrefix(value = "") {
  const text = String(value).trim();
  const parts = text.split(";");
  return (parts[parts.length - 1] || text).trim();
}

function inferConnectionType(instanceId = "", relatedDevices = []) {
  const normalized = String(instanceId).toUpperCase();
  const joinedRelatedText = relatedDevices
    .map((device) =>
      [device.InstanceId, device.Class, device.FriendlyName, device.BusReportedDeviceDesc, device.DeviceDesc, device.Name]
        .join(" ")
        .toUpperCase()
    )
    .join(" ");

  if (normalized.includes("BTH") || normalized.includes("BLUETOOTH") || joinedRelatedText.includes("BTH")) {
    return "Bluetooth";
  }
  if (joinedRelatedText.includes("USB\\")) {
    return "USB";
  }
  if (normalized.includes("BTH") || normalized.includes("BLUETOOTH")) {
    return "Bluetooth";
  }
  if (
    normalized.startsWith("ACPI\\") ||
    normalized.includes("ACPI\\PNP0303") ||
    normalized.includes("ACPI\\PNP030B") ||
    normalized.includes("I8042") ||
    normalized.includes("PS2")
  ) {
    return "Built-in";
  }
  if (normalized.startsWith("USB\\") || normalized.includes("HID\\VID_") || normalized.includes("VID_")) {
    return "USB";
  }
  if (normalized.includes("HID")) {
    return "Built-in / HID";
  }
  return "Built-in / system";
}

async function fetchRelatedDevices(devices) {
  const hardwareKeys = [...new Set(devices.map((device) => extractHardwareKey(device.InstanceId)).filter(Boolean))];
  if (!hardwareKeys.length) {
    return [];
  }
  const connectedOutput = await runPnPUtil(["/enum-devices", "/connected"]);
  return parsePnPUtilDevices(connectedOutput).filter((device) => {
    const hardwareKey = extractHardwareKey(device.InstanceId);
    return hardwareKey && hardwareKeys.includes(hardwareKey);
  });
}

function collapseDeviceEntries(devices = []) {
  const grouped = new Map();

  devices
    .filter((device) => isLikelyKeyboardCandidate(device))
    .forEach((device) => {
      const key = buildDeviceGroupKey(device);
      const existing = grouped.get(key);
      if (!existing || scoreDeviceCandidate(device) > scoreDeviceCandidate(existing)) {
        grouped.set(key, device);
      }
    });

  return [...grouped.values()];
}

function extractHardwareKey(instanceId = "") {
  const match = String(instanceId).toUpperCase().match(/VID_[A-Z0-9]{4}&PID_[A-Z0-9]{4}/);
  return match ? match[0] : "";
}

function buildDeviceGroupKey(device = {}) {
  const instanceId = String(device.InstanceId || "").toUpperCase();
  const hardwareKey = extractHardwareKey(instanceId);
  if (hardwareKey) {
    return hardwareKey;
  }

  return instanceId
    .replace(/&MI_[0-9A-F]{2}/g, "")
    .replace(/&COL[0-9A-F]{2}/g, "")
    .replace(/\\\d+$/, "")
    .trim();
}

function isLikelyKeyboardCandidate(device = {}) {
  const instanceId = String(device.InstanceId || "");
  const className = String(device.Class || device.ClassName || "");
  const combinedText = [
    device.FriendlyName,
    device.DeviceDescription,
    device.BusReportedDeviceDesc,
    device.DeviceDesc,
    device.Name,
    device.Manufacturer,
    className,
    instanceId
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (combinedText.includes("microsoft input configuration device")) {
    return false;
  }

  if (/(touchpad|mouse|consumer control|digitizer|tablet|pen|gamepad|controller)/i.test(combinedText)) {
    return false;
  }

  if (className.toLowerCase() === "keyboard") {
    return true;
  }

  if (combinedText.includes("keyboard")) {
    return true;
  }

  return /^hid\\vid_[a-z0-9]{4}&pid_[a-z0-9]{4}/i.test(instanceId);
}

function scoreDeviceCandidate(device = {}) {
  const text = [
    device.DeviceDescription,
    device.BusReportedDeviceDesc,
    device.FriendlyName,
    device.Name,
    device.DeviceDesc
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;
  if (String(device.Class || "").toLowerCase() === "keyboard") {
    score += 10;
  }
  if (text.includes("keyboard")) {
    score += 6;
  }
  if (extractHardwareKey(device.InstanceId)) {
    score += 4;
  }
  if (!isGenericKeyboardLabel(text) && !isGenericInputLabel(text)) {
    score += 3;
  }
  if (text.includes("hp")) {
    score += 2;
  }
  return score;
}

function buildHardwareSignature(devices = []) {
  return [...new Set(devices.map((device) => extractHardwareKey(device.InstanceId)).filter(Boolean))]
    .sort()
    .join("|");
}

function findRelatedDevices(item = {}, relatedDevices = []) {
  const hardwareKey = extractHardwareKey(item.InstanceId);
  if (!hardwareKey) {
    return [];
  }
  return relatedDevices.filter((device) => extractHardwareKey(device.InstanceId) === hardwareKey);
}

function pickBestKeyboardName(item = {}, relatedDevices = []) {
  const directCandidates = [
    item.DeviceDescription,
    item.BusReportedDeviceDesc,
    item.FriendlyName,
    item.Name,
    stripSystemPrefix(item.DeviceDesc)
  ]
    .map(cleanCandidate)
    .filter(Boolean);

  const relatedCandidates = relatedDevices.flatMap((device) =>
    [device.DeviceDescription, device.BusReportedDeviceDesc, device.FriendlyName, device.Name, stripSystemPrefix(device.DeviceDesc)]
      .map(cleanCandidate)
      .filter(Boolean)
  );

  const allCandidates = [...directCandidates, ...relatedCandidates].filter((value) => !/^keyboard$/i.test(value));
  const explicitKeyboardName = allCandidates.find(
    (value) => /keyboard/i.test(value) && !isGenericKeyboardLabel(value) && !isGenericInputLabel(value)
  );
  const directSpecificName = directCandidates.find(
    (value) => !isGenericKeyboardLabel(value) && !isGenericInputLabel(value)
  );
  const relatedSpecificBrandName = relatedCandidates.find(
    (value) =>
      !isGenericKeyboardLabel(value) &&
      !isGenericInputLabel(value) &&
      !/^(hid-compliant|usb input device|input device|standard ps\/2 keyboard)$/i.test(value)
  );
  const relatedSpecificName = relatedCandidates.find(
    (value) => /keyboard/i.test(value) && !isGenericKeyboardLabel(value) && !isGenericInputLabel(value)
  );
  const preferred = explicitKeyboardName || directSpecificName || relatedSpecificBrandName || relatedSpecificName;

  return preferred || fallbackKeyboardName(inferConnectionType(item.InstanceId, relatedDevices));
}

function filterPhysicalKeyboards(devices = [], relatedDevices = []) {
  const builtInDevices = [];
  const usbCandidates = [];

  devices.forEach((device) => {
    const related = findRelatedDevices(device, relatedDevices);
    const connectionType = inferConnectionType(device.InstanceId, related);
    const relatedText = buildRelatedText(related);
    const ownText = buildRelatedText([device]);
    const combinedText = `${ownText} ${relatedText}`.toLowerCase();

    if (/(mouse|lightsync|lamparray)/i.test(combinedText)) {
      return;
    }

    if (/(wireless radio controls|system controller)/i.test(combinedText) && !/keyboard/i.test(ownText)) {
      return;
    }

    if (connectionType === "Built-in") {
      builtInDevices.push(device);
      return;
    }

    usbCandidates.push({
      device,
      related,
      combinedText,
      score: scorePhysicalKeyboardCandidate(device, related, combinedText)
    });
  });

  const strongUsbCandidates = usbCandidates.filter((entry) => isStrongPhysicalKeyboardCandidate(entry.device, entry.related, entry.combinedText));
  const candidatePool = strongUsbCandidates.length ? strongUsbCandidates : usbCandidates;

  const bestUsbCandidates = candidatePool
    .sort((left, right) => right.score - left.score)
    .filter((entry) => entry.score >= 8)
    .filter((entry, index, entries) => index === entries.findIndex((item) => entrySignature(item.device) === entrySignature(item.device)))
    .map((entry) => entry.device);

  const selected = [...builtInDevices, ...bestUsbCandidates];
  return selected.length ? selected : devices;
}

function scorePhysicalKeyboardCandidate(device = {}, relatedDevices = [], combinedText = "") {
  let score = 0;
  const upperInstance = String(device.InstanceId || "").toUpperCase();
  const text = combinedText.toLowerCase();

  if (upperInstance.startsWith("HID\\VID_")) {
    score += 5;
  }
  if (upperInstance.includes("&MI_00")) {
    score += 3;
  }
  if (/keyboard/i.test(text)) {
    score += 4;
  }
  if (/consumer control/i.test(text)) {
    score += 1;
  }
  if (/vendor-defined/i.test(text)) {
    score += 1;
  }
  if (/wireless radio controls|system controller|mouse|lamparray|lightsync/i.test(text)) {
    score -= 6;
  }
  if (relatedDevices.some((related) => String(related.InstanceId || "").toUpperCase().startsWith("USB\\VID_"))) {
    score += 2;
  }

  return score;
}

function isStrongPhysicalKeyboardCandidate(device = {}, relatedDevices = [], combinedText = "") {
  const ownLabelText = [
    device.DeviceDescription,
    device.BusReportedDeviceDesc,
    device.FriendlyName,
    device.Name,
    device.DeviceDesc
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const relatedLabelText = relatedDevices
    .flatMap((related) => [
      related.DeviceDescription,
      related.BusReportedDeviceDesc,
      related.FriendlyName,
      related.Name,
      related.DeviceDesc
    ])
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const text = `${ownLabelText} ${relatedLabelText} ${combinedText}`.toLowerCase();
  const hasExplicitKeyboardName = /keyboard/i.test(`${ownLabelText} ${relatedLabelText}`);
  const hasUsbParent = relatedDevices.some((related) => String(related.InstanceId || "").toUpperCase().startsWith("USB\\VID_"));
  const looksLikeNoise = /(mouse|lightsync|lamparray|wireless radio controls|system controller|vendor-defined device)$/i.test(text);
  const hasBrandSignal = !isGenericKeyboardLabel(text) && !isGenericInputLabel(text) && /(hp|dell|lenovo|microsoft|corsair|razer|steelseries|keychron|logitech|asus|hyperx|redragon|royal kludge|epomaker)/i.test(text);

  if (looksLikeNoise) {
    return false;
  }

  return hasExplicitKeyboardName || (hasUsbParent && hasBrandSignal);
}

function entrySignature(device = {}) {
  const hardwareKey = extractHardwareKey(device.InstanceId);
  if (hardwareKey) {
    return hardwareKey;
  }
  return buildDeviceGroupKey(device);
}

function buildRelatedText(devices = []) {
  return devices
    .flatMap((device) => [
      device.DeviceDescription,
      device.BusReportedDeviceDesc,
      device.FriendlyName,
      device.Name,
      device.DeviceDesc,
      device.Manufacturer,
      device.Class,
      device.InstanceId
    ])
    .filter(Boolean)
    .join(" ");
}

function cleanCandidate(value) {
  return String(value || "").trim();
}

function isGenericKeyboardLabel(value = "") {
  return /^(hid keyboard device|standard ps\/2 keyboard|keyboard)$/i.test(String(value).trim());
}

function isGenericInputLabel(value = "") {
  return /^(usb input device|usb composite device|input device|hid-compliant .+|hid vendor-defined .+)$/i.test(
    String(value).trim()
  );
}

function fallbackKeyboardName(connectionType = "") {
  if (connectionType === "Bluetooth") {
    return "Bluetooth Keyboard";
  }
  if (connectionType === "USB") {
    return "USB Keyboard";
  }
  if (connectionType === "Built-in") {
    return "Built-in Keyboard";
  }
  if (connectionType === "Built-in / HID") {
    return "HID Keyboard";
  }
  return "Keyboard";
}

function extractPart(instanceId = "", marker) {
  const match = instanceId.match(new RegExp(`${marker}([A-Z0-9]{4})`, "i"));
  return match ? match[1].toUpperCase() : "Unavailable";
}

function groupDevices(devices, selector) {
  const counts = {};
  for (const device of devices) {
    const key = selector(device);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function buildCompatibilitySummary(devices) {
  const usbCount = devices.filter((device) => device.connectionType === "USB").length;
  const bluetoothCount = devices.filter((device) => device.connectionType === "Bluetooth").length;
  const builtInCount = devices.filter((device) => String(device.connectionType).startsWith("Built-in")).length;
  const restrictedCount = devices.filter((device) => device.trustLevel === "Restricted").length;
  const unknownCount = devices.filter((device) => device.trustLevel === "Unknown").length;
  const highConfidenceCount = devices.filter((device) => device.confidence === "High confidence").length;
  const mediumConfidenceCount = devices.filter((device) => device.confidence === "Medium confidence").length;
  const limitedConfidenceCount = devices.filter((device) => /^Limited /i.test(String(device.confidence || ""))).length;

  return {
    usbCount,
    bluetoothCount,
    builtInCount,
    restrictedCount,
    unknownCount,
    highConfidenceCount,
    mediumConfidenceCount,
    limitedConfidenceCount,
    hotSwapReady: usbCount > 0 || bluetoothCount > 0,
    compatibilityStatus: devices.length
      ? "Local keyboard compatibility metadata is available"
      : "No keyboard compatibility metadata is currently available"
  };
}

function scoreDetectionConfidence(item = {}, relatedDevices = []) {
  const directText = [
    item.DeviceDescription,
    item.BusReportedDeviceDesc,
    item.FriendlyName,
    item.Name,
    item.DeviceDesc
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const relatedText = relatedDevices
    .flatMap((device) => [device.DeviceDescription, device.BusReportedDeviceDesc, device.FriendlyName, device.Name, device.DeviceDesc])
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const combined = `${directText} ${relatedText}`;
  const hasSpecificKeyboardName = /keyboard/i.test(combined) && !isGenericKeyboardLabel(combined) && !isGenericInputLabel(combined);
  const hasUsbParent = relatedDevices.some((device) => String(device.InstanceId || "").toUpperCase().startsWith("USB\\VID_"));
  const hasVidPid = Boolean(extractHardwareKey(item.InstanceId));

  if (hasSpecificKeyboardName && hasVidPid) {
    return "High confidence";
  }
  if ((hasUsbParent || String(item.InstanceId || "").toUpperCase().startsWith("ACPI\\")) && hasVidPid) {
    return "Medium confidence";
  }
  return "Limited Windows metadata";
}

function explainDetectionConfidence(item = {}, relatedDevices = []) {
  const confidence = scoreDetectionConfidence(item, relatedDevices);
  if (confidence === "High confidence") {
    return "Windows exposed a keyboard-specific name with stable hardware identifiers.";
  }
  if (confidence === "Medium confidence") {
    return "Windows exposed stable hardware identifiers, but the visible name is still partly generic.";
  }
  return "Windows only exposed limited or generic device metadata for this keyboard path.";
}

function buildDetectionComparison(previousDevices = [], currentDevices = []) {
  const previous = new Map(previousDevices.map((device) => [device.fingerprint, device]));
  const current = new Map(currentDevices.map((device) => [device.fingerprint, device]));

  return {
    added: currentDevices.filter((device) => !previous.has(device.fingerprint)).map((device) => device.name),
    removed: previousDevices.filter((device) => !current.has(device.fingerprint)).map((device) => device.name),
    changed: currentDevices
      .filter((device) => previous.has(device.fingerprint) && previous.get(device.fingerprint).name !== device.name)
      .map((device) => ({
        before: previous.get(device.fingerprint).name,
        after: device.name
      }))
  };
}

function parsePnPUtilDevices(output = "") {
  const text = String(output || "").replace(/\r/g, "");
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith("Instance ID:"));

  return blocks.map((block) => {
    const device = {};
    block.split("\n").forEach((line) => {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (!match) {
        return;
      }
      const key = match[1].trim();
      const value = match[2].trim();
      device[key] = value;
    });

    return {
      InstanceId: device["Instance ID"] || "",
      DeviceDescription: device["Device Description"] || "",
      FriendlyName: device["Device Description"] || "",
      Name: device["Device Description"] || "",
      DeviceDesc: device["Device Description"] || "",
      BusReportedDeviceDesc: device["Device Description"] || "",
      Status: device.Status || "",
      Class: device["Class Name"] || "",
      ClassName: device["Class Name"] || "",
      Manufacturer: device["Manufacturer Name"] || ""
    };
  });
}

function runPnPUtil(args) {
  return new Promise((resolve) => {
    execFile(
      "pnputil.exe",
      args,
      { windowsHide: true, timeout: 15000, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve("");
          return;
        }
        resolve(stdout);
      }
    );
  });
}

function initialHealthMessage() {
  if (process.platform === "darwin") {
    return "Keyboard detection is preparing local macOS hardware inventory access.";
  }
  if (process.platform === "win32") {
    return "Keyboard detection is preparing local Windows inventory access.";
  }
  return "Keyboard detection is preparing local hardware inventory access.";
}

function detectionSource() {
  if (process.platform === "darwin") {
    return "system_profiler and ioreg";
  }
  if (process.platform === "win32") {
    return "pnputil";
  }
  return "local inventory";
}

function parseMacKeyboardInventory({ usbInventory, bluetoothInventory, builtInInventory }) {
  const usbDevices = walkMacInventory(usbInventory).flatMap((item) => mapMacInventoryItem(item, "USB"));
  const bluetoothDevices = walkMacInventory(bluetoothInventory).flatMap((item) => mapMacInventoryItem(item, "Bluetooth"));
  const builtInDevices = parseMacBuiltInKeyboard(builtInInventory);
  return [...builtInDevices, ...usbDevices, ...bluetoothDevices];
}

function walkMacInventory(payload) {
  const results = [];
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
    results.push(node);
    Object.values(node).forEach(visit);
  };
  visit(payload);
  return results;
}

function mapMacInventoryItem(item, connectionType) {
  const text = collectMacText(item).toLowerCase();
  if (!looksLikeMacKeyboard(item, text)) {
    return [];
  }

  const name = bestMacName(item, connectionType);
  const vendorId = normalizeMacId(findMacValue(item, ["vendor_id", "vendor id", "vendorid"]));
  const productId = normalizeMacId(findMacValue(item, ["product_id", "product id", "productid"]));
  const manufacturer = findMacValue(item, ["manufacturer", "vendor_name", "_name"]);
  const identifier = [
    connectionType,
    name,
    vendorId,
    productId,
    manufacturer,
    findMacValue(item, ["serial_num", "serial number", "address", "device_address"])
  ]
    .filter(Boolean)
    .join("|");

  return [{
    name,
    connectionType,
    vendorId: vendorId || "Unavailable",
    productId: productId || "Unavailable",
    deviceId: identifier || `${connectionType}|${name}`,
    status: "Connected",
    confidence: vendorId !== "Unavailable" && productId !== "Unavailable" ? "High confidence" : "Limited macOS metadata",
    confidenceReason:
      vendorId !== "Unavailable" && productId !== "Unavailable"
        ? "macOS exposed a keyboard name with stable local hardware identifiers."
        : "macOS exposed a keyboard entry, but hardware identifiers were limited or generic."
  }];
}

function parseMacBuiltInKeyboard(output = "") {
  const text = String(output || "");
  if (!/AppleEmbeddedKeyboard|Keyboard/i.test(text)) {
    return [];
  }

  return [{
    name: "Built-in Keyboard",
    connectionType: "Built-in",
    vendorId: "Apple",
    productId: "Built-in",
    deviceId: "macos-built-in-keyboard",
    status: "Connected",
    confidence: "Medium confidence",
    confidenceReason: "macOS exposed a built-in keyboard path through local I/O registry data."
  }];
}

function collapseMacDevices(devices = []) {
  const seen = new Map();
  devices.forEach((device) => {
    const key = [device.connectionType, device.vendorId, device.productId, device.name].join("|");
    if (!seen.has(key)) {
      seen.set(key, device);
    }
  });
  return [...seen.values()];
}

function looksLikeMacKeyboard(item, text = "") {
  if (!text) {
    text = collectMacText(item).toLowerCase();
  }
  if (/(mouse|trackpad|headset|speaker|camera|microphone|gamepad|controller)/i.test(text)) {
    return false;
  }
  return /(keyboard|keychron|logitech|hp|dell|microsoft|corsair|razer|steelseries|epomaker|royal kludge)/i.test(text);
}

function collectMacText(item = {}) {
  return Object.entries(item)
    .flatMap(([key, value]) => [key, typeof value === "string" ? value : ""])
    .filter(Boolean)
    .join(" ");
}

function bestMacName(item, connectionType) {
  return (
    findMacValue(item, ["_name", "device_title", "device_name", "product_name", "product", "name"]) ||
    fallbackKeyboardName(connectionType)
  );
}

function findMacValue(item, keys) {
  const lowerKeys = new Set(keys.map((key) => key.toLowerCase()));
  for (const [key, value] of Object.entries(item || {})) {
    if (lowerKeys.has(String(key).toLowerCase()) && typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function normalizeMacId(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "Unavailable";
  }
  const match = text.match(/0x([a-f0-9]+)/i);
  return match ? match[1].toUpperCase() : text.slice(0, 20);
}

function runJsonCommand(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 15000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout) => {
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

function runTextCommand(command, args) {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 15000, maxBuffer: 4 * 1024 * 1024 }, (error, stdout) => {
      resolve(error ? "" : String(stdout || ""));
    });
  });
}

module.exports = {
  DeviceDetector,
  parsePnPUtilDevices,
  parseMacKeyboardInventory,
  collapseDeviceEntries,
  filterPhysicalKeyboards,
  isStrongPhysicalKeyboardCandidate,
  pickBestKeyboardName,
  inferConnectionType,
  extractHardwareKey,
  buildDeviceGroupKey,
  scoreDetectionConfidence,
  buildDetectionComparison
};
