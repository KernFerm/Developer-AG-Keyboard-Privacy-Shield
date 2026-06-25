const fs = require("fs");
const path = require("path");

class ExtensionsManager {
  constructor(app, storageContext) {
    this.app = app;
    this.storageContext = storageContext;
    this.userExtensionsDir = path.join(app.getPath("userData"), "extensions");
    fs.mkdirSync(this.userExtensionsDir, { recursive: true });
  }

  getSnapshot(approvedExtensions = []) {
    const approved = new Set((approvedExtensions || []).map((item) => String(item)));
    const discovered = this.discoverExtensions().map((item) => ({
      ...item,
      approved: approved.has(item.id)
    }));

    return {
      total: discovered.length,
      approvedCount: discovered.filter((item) => item.approved).length,
      discovered
    };
  }

  discoverExtensions() {
    const manifests = new Map();

    for (const source of this.getSearchPaths()) {
      if (!fs.existsSync(source.dir)) {
        continue;
      }

      const entries = fs.readdirSync(source.dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }
        const manifestPath = path.join(source.dir, entry.name, "manifest.json");
        if (!fs.existsSync(manifestPath)) {
          continue;
        }

        const parsed = readManifest(manifestPath, source.type);
        if (!parsed || manifests.has(parsed.id)) {
          continue;
        }
        manifests.set(parsed.id, parsed);
      }
    }

    return [...manifests.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  getSearchPaths() {
    const paths = [
      { type: "bundled", dir: path.join(this.app.getAppPath(), "extensions") },
      { type: "user-data", dir: this.userExtensionsDir }
    ];

    if (this.storageContext?.portableRoot) {
      paths.push({
        type: "portable",
        dir: path.join(this.storageContext.portableRoot, "extensions")
      });
    }

    return paths;
  }
}

function readManifest(manifestPath, source) {
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const id = sanitizeIdentifier(raw.id || path.basename(path.dirname(manifestPath)));
    const name = sanitizeString(raw.name, 80) || id;
    if (!id || !name) {
      return null;
    }

    return {
      id,
      name,
      version: sanitizeString(raw.version, 24) || "1.0.0",
      description: sanitizeString(raw.description, 220) || "Local-only extension module.",
      category: sanitizeString(raw.category, 48) || "General",
      entryPoint: sanitizeString(raw.entryPoint, 120) || "manifest-only",
      approvalRequired: raw.approvalRequired !== false,
      localOnly: raw.localOnly !== false,
      permissions: sanitizeArray(raw.permissions, 8).map((item) => sanitizeString(item, 48)).filter(Boolean),
      source,
      manifestPath
    };
  } catch {
    return null;
  }
}

function sanitizeString(value, maxLength = 120) {
  if (typeof value !== "string") {
    return "";
  }
  return value.replace(/[<>&"'`]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function sanitizeIdentifier(value) {
  return sanitizeString(String(value || ""), 64).toLowerCase().replace(/[^a-z0-9-_.]/g, "");
}

function sanitizeArray(value, maxItems = 12) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.slice(0, maxItems);
}

module.exports = { ExtensionsManager };
