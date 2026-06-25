const { Menu, Tray } = require("electron");

function registerTray({ app, iconPath, onOpen, onNavigate, onToggleProtection, onEmergency, getState }) {
  const tray = new Tray(iconPath);
  tray.setToolTip("Developer Anti Ghosting Keyboard Privacy Shield");

  function update() {
    const protection = getState();
    const label = protection.protectionEnabled ? "Protection: On" : "Protection: Off";
    const emergency = protection.emergencyMode ? "Emergency Mode: Active" : "Emergency Mode: Inactive";
    const menu = Menu.buildFromTemplate([
      { label, enabled: false },
      { label: emergency, enabled: false },
      { type: "separator" },
      { label: "Enable Protection", click: () => onToggleProtection(true) },
      { label: "Disable Protection", click: () => onToggleProtection(false) },
      { label: "Emergency Privacy Mode", click: onEmergency },
      { type: "separator" },
      { label: "Open Main Window", click: onOpen },
      { label: "About", click: () => onNavigate("about") },
      { label: "How To Use", click: () => onNavigate("how-to-use") },
      { type: "separator" },
      { label: "Exit", click: () => app.quit() }
    ]);
    tray.setContextMenu(menu);
  }

  tray.on("double-click", onOpen);
  update();
  return { update };
}

module.exports = { registerTray };
