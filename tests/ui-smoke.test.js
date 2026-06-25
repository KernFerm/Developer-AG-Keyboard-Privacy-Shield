const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

test("renderer shell exposes accessible top-level navigation controls", () => {
  const html = fs.readFileSync(path.join(root, "src/renderer/index.html"), "utf8");

  assert.match(html, /aria-label="Protection mode"/);
  assert.match(html, /aria-label="Quick menu"/);
  assert.match(html, /id="detail-panels"/);
});

test("renderer includes device timeline clear action and emergency controls", () => {
  const appSource = fs.readFileSync(path.join(root, "src/renderer/app.js"), "utf8");

  assert.match(appSource, /clear-device-history/);
  assert.match(appSource, /Emergency Privacy Mode/);
  assert.match(appSource, /renderHowToUsePanels/);
  assert.match(appSource, /Keyboard Detection Notes/);
  assert.match(appSource, /Backup verified locally/);
  assert.match(appSource, /Diagnostics Center/);
  assert.match(appSource, /create-support-bundle/);
});

test("styles include visible focus-capable dropdown layering fixes", () => {
  const css = fs.readFileSync(path.join(root, "src/renderer/styles.css"), "utf8");

  assert.match(css, /\.custom-select\[open\]/);
  assert.match(css, /\.detail-panels \.panel:focus-within/);
  assert.match(css, /\.notice-danger/);
});

test("overlay renderer exists and avoids typed-content display", () => {
  const overlayHtml = fs.readFileSync(path.join(root, "src/renderer/overlay.html"), "utf8");
  const overlayJs = fs.readFileSync(path.join(root, "src/renderer/overlay.js"), "utf8");

  assert.match(overlayHtml, /Privacy Status Overlay/);
  assert.match(overlayJs, /No typed content is shown/);
});
