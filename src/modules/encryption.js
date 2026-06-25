const crypto = require("crypto");
let safeStorage;

try {
  ({ safeStorage } = require("electron"));
} catch {
  safeStorage = {
    isEncryptionAvailable: () => false
  };
}

function getFallbackKey() {
  return crypto.createHash("sha256").update("local-only-shield-fallback-key").digest();
}

function encryptObject(data) {
  const serialized = Buffer.from(JSON.stringify(data), "utf8");
  if (safeStorage && typeof safeStorage.isEncryptionAvailable === "function" && safeStorage.isEncryptionAvailable()) {
    return {
      mode: "safeStorage",
      value: safeStorage.encryptString(serialized.toString("utf8")).toString("base64")
    };
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", getFallbackKey(), iv);
  const encrypted = Buffer.concat([cipher.update(serialized), cipher.final()]);
  return {
    mode: "fallback",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    value: encrypted.toString("base64")
  };
}

function decryptObject(payload) {
  if (
    payload.mode === "safeStorage" &&
    safeStorage &&
    typeof safeStorage.decryptString === "function"
  ) {
    const decrypted = safeStorage.decryptString(Buffer.from(payload.value, "base64"));
    return JSON.parse(decrypted);
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getFallbackKey(),
    Buffer.from(payload.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.value, "base64")),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}

module.exports = { encryptObject, decryptObject };
