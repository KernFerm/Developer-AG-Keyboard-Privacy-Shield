const fs = require("fs");
const path = require("path");

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const packageLock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
const changeLog = fs.readFileSync(path.join(root, "CHANGE-LOG.md"), "utf8");

const expectedVersion = String(packageJson.version || "").trim();
const lockVersion = String(packageLock.version || "").trim();
const changelogMatch = changeLog.match(/^##\s+v([0-9]+\.[0-9]+\.[0-9]+)/m);
const changelogVersion = changelogMatch ? changelogMatch[1] : "";

const failures = [];

if (!expectedVersion) {
  failures.push("package.json is missing a version.");
}
if (lockVersion !== expectedVersion) {
  failures.push(`package-lock.json version (${lockVersion || "missing"}) does not match package.json (${expectedVersion}).`);
}
if (changelogVersion !== expectedVersion) {
  failures.push(`CHANGE-LOG.md top version (${changelogVersion || "missing"}) does not match package.json (${expectedVersion}).`);
}

if (failures.length) {
  console.error("Release version consistency check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release version consistency check passed for v${expectedVersion}.`);
