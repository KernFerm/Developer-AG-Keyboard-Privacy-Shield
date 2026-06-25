const test = require("node:test");
const assert = require("node:assert/strict");

const { classifyWorkspace, buildWorkspaceRecommendations } = require("../src/modules/workspace-monitor");

test("workspace classification prefers remote work when remote desktop is detected", () => {
  const result = classifyWorkspace({
    remoteDesktopDetected: true,
    activeEnvironments: [],
    monitorCount: 1,
    meetingEnvironmentMode: false
  });

  assert.equal(result, "Remote Work Mode");
});

test("workspace recommendations explain multi-monitor and sharing risks", () => {
  const tips = buildWorkspaceRecommendations({
    monitorCount: 2,
    activeEnvironments: ["obs64", "teams"],
    remoteDesktopDetected: false,
    publicWorkspaceRisk: true
  });

  assert.equal(tips.some((tip) => /multiple displays/i.test(tip)), true);
  assert.equal(tips.some((tip) => /sharing or streaming environment/i.test(tip)), true);
  assert.equal(tips.some((tip) => /public workspace risk/i.test(tip)), true);
});
