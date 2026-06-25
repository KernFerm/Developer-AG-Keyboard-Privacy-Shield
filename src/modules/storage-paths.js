const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PORTABLE_DATA_DIR = "ShieldPortableData";
const EXTERNAL_BUS_TYPES = new Set(["usb", "thunderbolt", "firewire", "sd"]);

function configureStoragePaths(app) {
  const runtime = resolveRuntimeStorage(app);

  if (!runtime.portableMode || !runtime.portableRoot) {
    return runtime;
  }

  const userDataPath = path.join(runtime.portableRoot, PORTABLE_DATA_DIR);
  const sessionDataPath = path.join(userDataPath, "session");
  const reportsDataPath = path.join(userDataPath, "reports");

  fs.mkdirSync(userDataPath, { recursive: true });
  fs.mkdirSync(sessionDataPath, { recursive: true });
  fs.mkdirSync(reportsDataPath, { recursive: true });

  app.setPath("userData", userDataPath);
  app.setPath("sessionData", sessionDataPath);

  return {
    ...runtime,
    userDataPath
  };
}

function resolveRuntimeStorage(app) {
  const portableExecutableDir = sanitizePath(process.env.PORTABLE_EXECUTABLE_DIR);
  if (portableExecutableDir) {
    return buildRuntimeContext({
      app,
      portableMode: true,
      portableRoot: portableExecutableDir,
      source: "electron-builder-portable"
    });
  }

  if (!app.isPackaged) {
    return {
      portableMode: false,
      portableRoot: "",
      source: "development",
      externalDriveRequired: false,
      externalDriveDetected: true,
      allowed: true,
      blockReason: "",
      userDataPath: app.getPath("userData")
    };
  }

  if (process.platform !== "win32") {
    return {
      portableMode: false,
      portableRoot: "",
      source: process.platform,
      externalDriveRequired: false,
      externalDriveDetected: true,
      allowed: true,
      blockReason: "",
      userDataPath: app.getPath("userData")
    };
  }

  const packagedRoot = sanitizePath(path.dirname(process.execPath));
  return buildRuntimeContext({
    app,
    portableMode: true,
    portableRoot: packagedRoot,
    source: process.platform
  });
}

function buildRuntimeContext({ app, portableMode, portableRoot, source }) {
  const externalDriveRequired = portableMode && app.isPackaged;
  const detection = portableRoot ? detectExternalDrive(portableRoot) : fallbackDetection();
  const allowed = !externalDriveRequired || detection.external;

  return {
    portableMode,
    portableRoot,
    source,
    externalDriveRequired,
    externalDriveDetected: detection.external,
    allowed,
    blockReason: allowed
      ? ""
      : "Packaged builds must run from a flash drive, external HDD, or external SSD.",
    driveDetails: detection.details,
    userDataPath: app.getPath("userData")
  };
}

function detectExternalDrive(basePath) {
  try {
    if (process.platform === "win32") {
      return detectWindowsExternalDrive(basePath);
    }
    if (process.platform === "darwin") {
      return detectMacExternalDrive(basePath);
    }
    if (process.platform === "linux") {
      return detectLinuxExternalDrive(basePath);
    }
  } catch (error) {
    return {
      external: false,
      details: `Detection failed: ${error.message}`
    };
  }

  return fallbackDetection("Unsupported platform for external-drive detection.");
}

function detectWindowsExternalDrive(basePath) {
  const root = path.parse(basePath).root.replace(/[\\\/]+$/, "");
  const driveLetter = root.replace(":", "");
  if (!driveLetter) {
    return fallbackDetection("No Windows drive letter found.");
  }

  const command = [
    "$ErrorActionPreference='Stop'",
    `$partition = Get-Partition -DriveLetter '${escapePowerShell(driveLetter)}'`,
    "$disk = $partition | Get-Disk",
    `$volume = Get-Volume -DriveLetter '${escapePowerShell(driveLetter)}'`,
    "[pscustomobject]@{",
    "  DriveLetter = $partition.DriveLetter",
    "  BusType = $disk.BusType",
    "  FriendlyName = $disk.FriendlyName",
    "  DriveType = $volume.DriveType",
    "  FileSystemLabel = $volume.FileSystemLabel",
    "} | ConvertTo-Json -Compress"
  ].join("; ");

  const output = execFileSync("powershell.exe", ["-NoProfile", "-Command", command], {
    encoding: "utf8",
    windowsHide: true
  }).trim();

  const parsed = JSON.parse(output);
  const busType = normalizeBusType(parsed.BusType);
  const driveType = String(parsed.DriveType || "").toLowerCase();
  const external = busType === "usb" || driveType === "removable";

  return {
    external,
    details: `${parsed.DriveLetter || driveLetter}: ${parsed.FriendlyName || "Unknown drive"} (${parsed.BusType || "Unknown bus"}, ${parsed.DriveType || "Unknown type"})`
  };
}

function detectMacExternalDrive(basePath) {
  const output = execFileSync("diskutil", ["info", basePath], {
    encoding: "utf8"
  });

  const location = extractDiskutilField(output, "Device Location");
  const protocol = extractDiskutilField(output, "Protocol");
  const removable = extractDiskutilField(output, "Removable Media");
  const external = normalizeMacExternal(location, protocol, removable);

  return {
    external,
    details: `Location: ${location || "Unknown"}, Protocol: ${protocol || "Unknown"}, Removable: ${removable || "Unknown"}`
  };
}

function detectLinuxExternalDrive(basePath) {
  const source = execFileSync("findmnt", ["-no", "SOURCE", "--target", basePath], {
    encoding: "utf8"
  }).trim();

  if (!source) {
    return fallbackDetection("No Linux mount source found.");
  }

  const blockDevice = normalizeLinuxDevice(source);
  const output = execFileSync("lsblk", ["-no", "RM,TRAN,TYPE", blockDevice], {
    encoding: "utf8"
  }).trim();

  const [rm = "0", transport = "", type = ""] = output.split(/\s+/);
  const external = rm === "1" || transport.toLowerCase() === "usb";

  return {
    external,
    details: `${blockDevice} (${type || "device"}, rm=${rm}, transport=${transport || "unknown"})`
  };
}

function fallbackDetection(details = "External-drive detection unavailable.") {
  return {
    external: false,
    details
  };
}

function extractDiskutilField(output, label) {
  const match = output.match(new RegExp(`^\\s*${escapeRegExp(label)}:\\s*(.+)$`, "mi"));
  return match ? match[1].trim() : "";
}

function normalizeMacExternal(location, protocol, removable) {
  const normalizedLocation = String(location || "").toLowerCase();
  const normalizedProtocol = normalizeBusType(protocol);
  const normalizedRemovable = String(removable || "").toLowerCase();

  return (
    normalizedLocation === "external" ||
    EXTERNAL_BUS_TYPES.has(normalizedProtocol) ||
    normalizedRemovable.includes("yes")
  );
}

function normalizeLinuxDevice(source) {
  const mapperPrefix = "/dev/mapper/";
  if (!source.startsWith("/dev/")) {
    return source;
  }
  if (source.startsWith(mapperPrefix)) {
    const pkname = execFileSync("lsblk", ["-no", "PKNAME", source], {
      encoding: "utf8"
    }).trim();
    return pkname ? `/dev/${pkname}` : source;
  }
  return source.replace(/p?\d+$/, "");
}

function normalizeBusType(value) {
  return String(value || "").trim().toLowerCase();
}

function sanitizePath(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }
  return path.resolve(value.trim());
}

function escapePowerShell(value) {
  return String(value).replace(/'/g, "''");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  configureStoragePaths,
  PORTABLE_DATA_DIR
};
