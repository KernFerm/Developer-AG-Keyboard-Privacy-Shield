# Developer Anti Ghosting Keyboard Privacy Shield
## Change Log

### V 0.1.0

- Reworked keyboard detection to use Windows-connected device inventory through `pnputil`, replacing the less reliable path that was returning empty or inconsistent results on some systems.
- Added stronger filtering so obvious false positives such as keyboard-like mouse interfaces and generic side-channel HID entries are less likely to appear as full keyboards.
- Improved physical-keyboard selection logic so the app better narrows down the connected list toward real built-in and USB keyboards instead of showing every keyboard-related interface Windows exposes.
- Improved keyboard naming logic so the app can prefer clearer product names from related Windows device inventory when available instead of always falling back to generic labels like `USB Keyboard`.
- Added keyboard-detection health state messaging so the app can distinguish between ready, limited, and unavailable Windows inventory conditions.
- Fixed Device Center trust-level dropdown stacking so the menu can open above neighboring panels instead of being clipped by the layout.
- Added a `Clear list` action to the `Connected Device Timeline` panel so users can remove saved local device history entries directly from Device Center.
- Improved the `How To Use` section with clearer practical guidance for setup, profiles, trusted devices, screen sharing, and emergency workflows.
- Updated the dashboard workspace summary card to use the same live workspace risk metric shown in Workspace Center so the two views no longer disagree.
- Added a direct `Exit` action to the top-right menu instead of only pointing users to the tray.
- Hardened production defaults by disabling always-on devtools in packaged builds and adding a CSP meta tag alongside header-based CSP protection.
- Made local encryption helpers test-friendly so module tests can run outside Electron while the app still uses `safeStorage` when available.
- Added automated Node-based tests covering settings flows, profile switching, backup and restore, device parsing and filtering, IPC registration, and renderer smoke checks.
- Added a `test` script plus a `qa:release` script to standardize release verification.
- Added public-release docs for privacy policy, support and troubleshooting, known limitations, release process, security review, accessibility QA, and production-readiness review.
- Improved corrupted-settings recovery messaging so resets back to secure defaults are more explicit in stored recovery status.
- Cleaned up lint warnings introduced during recent UI and detection work.

### V 0.0.6

- Expanded the emergency workflow with a richer local-only safe-view system, including quick-hide dashboard state, emergency readiness scoring, emergency checklist items, and a dedicated restore-to-normal action.
- Added a protected emergency path that creates a local restore point before activating Emergency Privacy Mode, plus a quick restore-latest-restore-point action in the Backup Center.
- Improved the Emergency Center UI with `Create Restore Point + Activate`, `Restore Normal View`, `Enable/Disable Quick Hide`, and a clearer emergency safe-view summary panel.
- Added a Windows-aware local app sync action so the Windows Center can align the app's own theme, high-contrast state, and minimal-resource mode with detected Windows preferences without modifying Windows settings.
- Expanded Windows awareness to report clearer accessibility sync state and added a `Windows-Aware App Alignment` summary panel in the Windows Center.
- Enriched the device snapshot with connection-type grouping, trust-level grouping, compatibility summaries, hot-swap readiness, and richer counts for USB, Bluetooth, built-in, unknown, and restricted devices.
- Expanded the Device Center with a `Trusted Hardware Dashboard`, `Device Categories`, and `Device Compatibility Dashboard`, along with clearer approval guidance for local device trust decisions.

### V 0.0.5

- Added a real profile preset engine so bundled profiles now apply actual local settings across theme, compact/minimal-resource behavior, accessibility options, wellbeing defaults, policy hints, and auto-protection preferences instead of only changing the saved profile name.
- Added one-click profile application support through the secure IPC and preload bridge, so applying a profile now updates both the stored settings and the active protection mode together.
- Expanded the Profile Center with quick profile switching, profile descriptions, and active preset summaries so users can understand what each local profile changes before or after applying it.
- Added a live local-only wellbeing service with focus-session start/stop behavior, remaining-time tracking, break reminder timing, and completion reminders without monitoring user content.
- Wired wellbeing session state into the main application snapshot and notifications so the app can show live focus-session status and local reminder events while keeping everything offline.
- Upgraded the Wellbeing Center UI with active focus-session controls, live session status, minutes remaining, break reminder status, and session start visibility instead of only static wellbeing settings.

### V 0.0.4

- Added cross-platform packaged build support for Windows, macOS, and Linux, with Windows now targeting both `nsis` and `portable`, macOS targeting portable-style `zip` output, and Linux targeting `AppImage`.
- Added cross-platform external-drive enforcement so packaged builds now require removable or external storage and refuse to run from an internal disk, while development mode continues to work locally.
- Added Windows NSIS installer customization so installs create launch shortcuts inside the install folder and at the install drive root, with matching uninstall cleanup for both shortcuts.
- Improved privacy scoring so the dashboard privacy readiness now reflects actual privacy posture instead of workspace exposure, allowing secure active protection states to report `100%` when appropriate.
- Expanded recovery and resilience with encrypted backup verification, local restore-point snapshots, saved backup restore actions, snapshot restore actions, backup health status, and recovery action history in the Backup Center.
- Added dedicated local decision-history tracking for protection and privacy explanations, including plain-language trigger and impact entries surfaced in the Transparency Center and local reports.
- Replaced the placeholder extension framework with a real local-only extension registry that discovers offline manifest-based modules from bundled, portable, and user-data extension folders.
- Added bundled offline extension manifests for workspace, accessibility, privacy learning, and protection preset packs, and updated packaged build files so these extension manifests ship with the app.
- Expanded the offline Knowledge Base into a fuller local learning center with privacy guides, accessibility learning content, workspace security tips, troubleshooting content, and extension-pack awareness.
- Updated protected build handling so the protected release flow stays aligned with the current multi-target Windows build configuration and cross-platform packaging setup.

### V 0.0.3

- Added local report preview support so reports can now be reviewed inside the app before export, including section summaries, preview content, and export controls in the Reports Center.
- Added secure `reports:preview` IPC support and preload bridge updates for preview-before-export workflows while keeping report generation local only.
- Expanded profile and personalization features with dashboard layout presets, widget visibility controls, compact mode, minimal resource mode, startup optimization mode, and a local feature flag system.
- Added searchable settings behavior across non-dashboard centers, with section-specific filtering and empty-state feedback.
- Improved light and dark theme behavior so shared UI surfaces, menus, cards, tags, and controls switch more consistently between themes.
- Added portable storage path support so portable builds automatically keep encrypted settings, reports, and session data beside the portable executable on flash drives, external HDDs, and external SSDs.
- Updated the Windows portable Electron Builder configuration with maximum compression, portable artifact naming, user-level execution, and corrected portable icon resolution.
- Added protected portable build script names to `package.json`, including `prepare:protected`, `pack:protected`, and `dist:protected`.
- Added shell command helpers for protected portable build flows.
- Rebuilt `build-protected-release.js` for the current project structure so it now stages the correct `src/` layout, runs the current protection checks, supports optional obfuscation, and builds the Windows portable target instead of the old NSIS-only flow.

### V 0.0.2

- Expanded the Electron app into a larger local-only privacy platform with dedicated centers for privacy, security, Windows, hardware, accessibility, devices, workspace, policy, wellbeing, reports, backup, extensions, transparency, emergency controls, and knowledge base access.
- Added secure local settings, encrypted backup and restore support, trusted device storage, device history, protection history, generated report tracking, and stronger settings sanitization.
- Improved keyboard detection to use Windows device metadata more reliably, recover from slow property lookups, detect built-in and USB connection types more accurately, and surface real device names like `HP USB Multimedia Keyboard` when Windows provides them.
- Added trust-level management for connected keyboards and a dedicated `Device Trust Center` with local-only trust state updates.
- Reworked unreadable native dropdowns into custom in-app dropdown menus for mode selection, quick menu actions, trust levels, profile selection, theme selection, report selection, and dashboard personalization controls.
- Refined the dashboard layout to feel more like a real control surface, with compact dropdown device cards, cleaner section-only navigation behavior, denser layouts, and more consistent card sizing across the application.
- Fixed light mode by moving major UI surfaces to shared theme variables so sidebar, topbar, menus, cards, tags, quick actions, and list rows now switch cleanly between dark and light themes.
- Added searchable settings and section search for non-dashboard centers, including filtered results and empty-state handling.
- Added a personalization system with saved dashboard layouts, widget visibility controls, compact mode, minimal resource mode, startup optimization mode, and local feature flags for advanced UI behaviors.
- Improved startup behavior so the main window opens before heavier device, workspace, and system refresh work completes.
- Extended reporting, recommendation, workspace, Windows, hardware, and privacy-awareness logic across the app while keeping processing local only.

### V 0.0.1

- Created the initial project structure and early application files.
