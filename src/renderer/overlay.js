const root = document.querySelector("#overlay-root");

function render(snapshot) {
  if (!snapshot) {
    return;
  }

  root.innerHTML = `
    <div class="pill">${snapshot.protection.protectionEnabled ? "Protection On" : "Protection Off"}</div>
    <div class="metric">
      <div class="row"><span>Mode</span><strong>${snapshot.protection.emergencyMode ? "Emergency" : "Normal"}</strong></div>
      <div class="row"><span>Sharing</span><strong>${snapshot.workspace.screenSharingDetected || snapshot.workspace.streamingEnvironmentDetected ? "Active" : "Idle"}</strong></div>
      <div class="row"><span>Trusted keyboards</span><strong>${snapshot.devices.trustedCount}</strong></div>
      <div class="row"><span>Workspace risk</span><strong>${snapshot.workspace.workspaceRiskScore}%</strong></div>
      <div class="muted">Local-only status overlay. No typed content is shown.</div>
    </div>
  `;
}

window.shieldApi.getState().then(render);
window.shieldApi.onStateUpdate(render);
