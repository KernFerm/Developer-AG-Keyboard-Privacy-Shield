const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

let JavaScriptObfuscator = null;
try {
  // Optional dependency: keep the protected build usable even if obfuscation
  // tooling is not installed yet in this workspace.
  JavaScriptObfuscator = require("javascript-obfuscator");
} catch (_error) {
  JavaScriptObfuscator = null;
}

const rootDir = path.resolve(__dirname);
const stageDir = path.join(rootDir, ".protected-release");
const args = new Set(process.argv.slice(2));
const prepareOnly = args.has("--prepare-only");
const dirOnly = args.has("--dir");
const skipObfuscation = args.has("--skip-obfuscation");
const targetPlatform = resolveTargetPlatform();

const skipNames = new Set([
  ".git",
  ".protected-release",
  "dist",
  "node_modules",
  "tmp-ai-profile-test",
  "command.sh",
  "commands.sh",
  "build-protected-release.js"
]);

const obfuscationTargets = new Set([
  "src/main.js",
  "src/preload.js",
  "src/main/ipc.js",
  "src/main/tray.js",
  "src/main/window.js",
  "src/modules/device-detector.js",
  "src/modules/encryption.js",
  "src/modules/insights-engine.js",
  "src/modules/protection-service.js",
  "src/modules/reports-manager.js",
  "src/modules/sanitizer.js",
  "src/modules/security.js",
  "src/modules/settings-manager.js",
  "src/modules/storage-paths.js",
  "src/modules/system-monitor.js",
  "src/modules/workspace-monitor.js",
  "scripts/security-check.js"
]);

const obfuscationOptions = {
  compact: true,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.75,
  splitStrings: true,
  splitStringsChunkLength: 8,
  transformObjectKeys: true,
  simplify: true,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,
  debugProtection: false,
  disableConsoleOutput: false
};

function removeStageDirectory() {
  fs.rmSync(stageDir, { recursive: true, force: true });
}

function shouldCopy(sourcePath) {
  const relative = path.relative(rootDir, sourcePath);
  if (!relative || relative.startsWith("..")) {
    return false;
  }
  const firstSegment = relative.split(path.sep)[0];
  return !skipNames.has(firstSegment);
}

function copyProjectToStage() {
  fs.mkdirSync(stageDir, { recursive: true });

  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (skipNames.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(rootDir, entry.name);
    const targetPath = path.join(stageDir, entry.name);
    fs.cpSync(sourcePath, targetPath, {
      recursive: true,
      force: true,
      filter: (src) => shouldCopy(src)
    });
  }
}

function shouldObfuscate(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  return obfuscationTargets.has(normalized);
}

function obfuscateFile(relativePath) {
  const targetPath = path.join(stageDir, relativePath);
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const source = fs.readFileSync(targetPath, "utf8");
  const result = JavaScriptObfuscator.obfuscate(source, obfuscationOptions);
  fs.writeFileSync(targetPath, result.getObfuscatedCode(), "utf8");
}

function obfuscateStageFiles() {
  if (skipObfuscation) {
    console.log("Skipping obfuscation by request.");
    return;
  }

  if (!JavaScriptObfuscator) {
    console.log("javascript-obfuscator is not installed. Continuing without obfuscation.");
    return;
  }

  const queue = ["src"];
  while (queue.length) {
    const current = queue.pop();
    const absolute = path.join(stageDir, current);
    if (!fs.existsSync(absolute)) {
      continue;
    }

    const entries = fs.readdirSync(absolute, { withFileTypes: true });
    for (const entry of entries) {
      const nextRelative = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(nextRelative);
        continue;
      }
      if (entry.isFile() && nextRelative.endsWith(".js") && shouldObfuscate(nextRelative)) {
        obfuscateFile(nextRelative);
      }
    }
  }
}

function updateStagePackageJson() {
  const packagePath = path.join(stageDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  pkg.scripts = {
    build: "electron-builder --dir",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac dmg",
    "build:linux": "electron-builder --linux AppImage"
  };

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2), "utf8");
}

function runChecks() {
  runNpmCommand(["run", "lint"], rootDir);
  runNpmCommand(["run", "security-check"], rootDir);
}

function runBuilder() {
  const cliPath = path.join(rootDir, "node_modules", "electron-builder", "cli.js");
  const builderArgs = [cliPath, "--projectDir", stageDir];

  appendTargetArgs(builderArgs);

  runCommand(process.execPath, builderArgs, rootDir);
}

function appendTargetArgs(builderArgs) {
  if (targetPlatform === "mac") {
    builderArgs.push("--mac", "dmg");
  } else if (targetPlatform === "linux") {
    builderArgs.push("--linux", "AppImage");
  } else {
    builderArgs.push("--win");
  }

  if (dirOnly) {
    builderArgs.push("--dir");
  }
}

function resolveTargetPlatform() {
  if (args.has("--mac")) {
    return "mac";
  }
  if (args.has("--linux")) {
    return "linux";
  }
  return "win";
}

function runCommand(command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: "inherit"
  });

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }

  if (result.error) {
    throw result.error;
  }
}

function runNpmCommand(commandArgs, cwd) {
  const npmCliPath = resolveNpmCliPath();
  if (npmCliPath) {
    runCommand(process.execPath, [npmCliPath, ...commandArgs], cwd);
    return;
  }

  const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";
  runCommand(npmExecutable, commandArgs, cwd);
}

function resolveNpmCliPath() {
  const candidates = [
    path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(path.dirname(process.execPath), "..", "node_modules", "npm", "bin", "npm-cli.js")
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function main() {
  runChecks();
  removeStageDirectory();
  copyProjectToStage();
  updateStagePackageJson();
  obfuscateStageFiles();

  if (prepareOnly) {
    console.log(`Prepared protected portable release stage at ${stageDir}`);
    return;
  }

  runBuilder();
}

main();
