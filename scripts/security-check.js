const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "package.json",
  "CHANGE-LOG.md",
  "src/main.js",
  "src/preload.js",
  "src/main/window.js",
  "src/modules/diagnostics-manager.js",
  "src/renderer/index.html",
  "src/renderer/overlay.html",
  "src/renderer/overlay.css",
  "src/renderer/overlay.js",
  "src/renderer/styles.css",
  "src/renderer/app.js",
  "docs/PRIVACY_POLICY.md",
  "docs/SUPPORT_AND_TROUBLESHOOTING.md",
  "docs/KNOWN_LIMITATIONS.md",
  "docs/RELEASE_PROCESS.md",
  "docs/WINDOWS_HARDWARE_QA.md",
  "docs/INSTALLER_AND_UPGRADE_QA.md",
  "docs/CODE_SIGNING_AND_WINDOWS_RELEASE.md",
  "docs/SUPPORT_WORKFLOW.md",
  "docs/RELEASE_NOTES_TEMPLATE.md",
  "docs/SECURITY_REVIEW.md",
  "docs/ACCESSIBILITY_QA.md"
];

function digest(filePath) {
  const value = fs.readFileSync(path.join(root, filePath));
  return crypto.createHash("sha256").update(value).digest("hex");
}

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("Missing required files:");
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

const windowSource = fs.readFileSync(path.join(root, "src/main/window.js"), "utf8");
const preloadSource = fs.readFileSync(path.join(root, "src/preload.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(root, "src/renderer/index.html"), "utf8");
const rendererSource = fs.readFileSync(path.join(root, "src/renderer/app.js"), "utf8");

const checks = [
  { ok: windowSource.includes("contextIsolation: true"), label: "contextIsolation enabled" },
  { ok: windowSource.includes("sandbox: true"), label: "sandbox enabled" },
  { ok: windowSource.includes("nodeIntegration: false"), label: "nodeIntegration disabled" },
  { ok: !windowSource.includes("devTools: true"), label: "devTools not forced on in production source" },
  { ok: preloadSource.includes("const channels = new Set(["), label: "IPC allowlist present" },
  { ok: htmlSource.includes("Content-Security-Policy"), label: "CSP meta tag present" },
  { ok: !rendererSource.includes("eval("), label: "renderer does not use eval" }
];

const failedChecks = checks.filter((check) => !check.ok);
if (failedChecks.length) {
  console.error("Security check failed:");
  failedChecks.forEach((check) => console.error(`- ${check.label}`));
  process.exit(1);
}

console.log("Security check passed. Required files present.");
requiredFiles.forEach((file) => {
  console.log(`${file}: ${digest(file).slice(0, 16)}`);
});
