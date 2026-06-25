const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const outputDir = path.join(process.cwd(), "diagnostics");

async function runCommand(command, args) {
  return new Promise((resolve) => {
    execFile(
      command,
      args,
      { windowsHide: true, timeout: 20000, maxBuffer: 4 * 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({
          command: `${command} ${args.join(" ")}`.trim(),
          ok: !error,
          stdout: String(stdout || "").trim(),
          stderr: String(stderr || "").trim(),
          error: error ? String(error.message || error) : ""
        });
      }
    );
  });
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(outputDir, `keyboard-diagnostic-${timestamp}.json`);

  const checks = process.platform === "darwin"
    ? await Promise.all([
        runCommand("system_profiler", ["SPUSBDataType", "-json"]),
        runCommand("system_profiler", ["SPBluetoothDataType", "-json"]),
        runCommand("system_profiler", ["SPHardwareDataType", "-json"]),
        runCommand("ioreg", ["-r", "-l", "-w", "0", "-c", "AppleEmbeddedKeyboard"])
      ])
    : await Promise.all([
        runCommand("pnputil.exe", ["/enum-devices", "/connected", "/class", "Keyboard"]),
        runCommand("pnputil.exe", ["/enum-devices", "/connected"]),
        runCommand("powershell.exe", [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-Command",
          "Get-PnpDevice -Class Keyboard -PresentOnly -ErrorAction SilentlyContinue | Select-Object Class, FriendlyName, InstanceId, Status | ConvertTo-Json -Depth 3"
        ]),
        runCommand("powershell.exe", [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-Command",
          "Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer, Model | ConvertTo-Json"
        ])
      ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    purpose: "Local-only keyboard detection QA. No keystrokes or typed content are collected.",
    checks
  };

  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Local keyboard diagnostic saved: ${filePath}`);
}

main().catch((error) => {
  console.error("Keyboard diagnostic failed:", error.message || error);
  process.exitCode = 1;
});
