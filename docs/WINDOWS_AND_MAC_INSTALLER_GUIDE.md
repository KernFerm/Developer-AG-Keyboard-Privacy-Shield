# Windows And macOS Installer Guide

This project uses `electron-builder` to package desktop releases.

Important platform note:

- Windows installer output is an `.exe`.
- macOS does not use `.exe` files.
- For this repository, macOS now builds a `.dmg` for Mac users.

## Prerequisites

Before building, make sure you have:

- Node.js installed
- npm installed
- project dependencies installed with `npm install`
- a clean tested version of the app

Platform note:

- build the Windows `.exe` on Windows
- build the macOS `.dmg` on a Mac
- macOS packaging such as `.dmg`, signing, and notarization is most reliable when run on macOS

Recommended validation before packaging:

```powershell
npm run qa:release
```

## Build A Windows Installer

From the project root, run:

```powershell
npm run build:win
```

What this does:

- builds a Windows NSIS installer
- builds a Windows portable executable

How Windows creates the `.exe`:

- `electron-builder` reads the `build.win.target` setting in `package.json`
- this project uses the `nsis` target
- NSIS packages the Electron app into a Windows installer `.exe`
- the `portable` target creates a second standalone Windows `.exe`

Current Windows targets from `package.json`:

- `nsis`
- `portable`

Expected output location:

- `dist\`

Typical artifacts:

- `Developer Anti Ghosting Keyboard Privacy Shield Setup <version>.exe`
- `Developer Anti Ghosting Keyboard Privacy Shield-Portable-<version>.exe`

Use the NSIS `.exe` when someone asks for the normal Windows installer.

## Build A macOS Release

From the project root, run:

```bash
npm run build:mac
```

What this does:

- builds a macOS `.dmg`
- packages the app for standard Mac installation

Expected output location:

- `dist\`

Typical artifact:

- `Developer Anti Ghosting Keyboard Privacy Shield-<version>-mac.dmg`

Important:

- macOS uses `.dmg` instead of `.exe`
- Mac users usually open the `.dmg` and drag the app into `Applications`
- build this on macOS, not Windows

## Code Signing Notes

### Windows

For public distribution, sign the generated `.exe` files with your Windows code signing certificate after build.

See:

- `docs/CODE_SIGNING_AND_WINDOWS_RELEASE.md`

### macOS

Unsigned macOS apps may show Gatekeeper warnings on other Macs.

For wider public distribution, plan for:

- Apple Developer signing
- notarization

This repository does not currently store Apple signing secrets or notarization setup.

## Simple Instructions You Can Send Someone

### Windows

```text
1. Open PowerShell in the project folder.
2. Run npm install
3. Run npm run build:win
4. Open the dist folder.
5. Use the Setup .exe for the normal Windows installer.
```

### macOS

```text
1. Open Terminal in the project folder.
2. Run npm install
3. Run npm run build:mac
4. Open the dist folder.
5. Share the generated `.dmg` file.
6. The Mac user opens the `.dmg` and installs the app from there.
```

## Related Docs

- `docs/RELEASE_PROCESS.md`
- `docs/INSTALLER_AND_UPGRADE_QA.md`
- `docs/CODE_SIGNING_AND_WINDOWS_RELEASE.md`
