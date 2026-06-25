const { BrowserWindow, session } = require("electron");
const path = require("path");

function createMainWindow(indexPath) {
  const window = new BrowserWindow({
    width: 1480,
    height: 980,
    minWidth: 1080,
    minHeight: 760,
    show: false,
    backgroundColor: "#07111b",
    icon: path.join(__dirname, "../../build/icon.png"),
    title: "Developer Anti Ghosting Keyboard Privacy Shield",
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: !process.env.SHIELD_DISABLE_DEVTOOLS && !process.env.NODE_ENV?.startsWith("production")
    }
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
        ]
      }
    });
  });

  window.loadFile(indexPath);
  return window;
}

function createOverlayWindow(indexPath) {
  const window = new BrowserWindow({
    width: 280,
    height: 160,
    minWidth: 240,
    minHeight: 120,
    show: false,
    frame: false,
    transparent: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: "#08111a",
    title: "Privacy Status Overlay",
    webPreferences: {
      preload: path.join(__dirname, "../preload.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: false
    }
  });

  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  window.loadFile(indexPath);
  return window;
}

module.exports = { createMainWindow, createOverlayWindow };
