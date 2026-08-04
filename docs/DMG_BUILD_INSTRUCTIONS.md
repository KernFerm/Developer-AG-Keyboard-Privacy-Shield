# macOS `.dmg` Build Instructions

This document is the handoff guide for the developer who will create the macOS `.dmg` for this project.

The repository already includes the required packaging command in `package.json`:

```json
"build:mac": "electron-builder --mac dmg"
```

## Goal

Build a macOS `.dmg` for:

```text
Developer Anti Ghosting Keyboard Privacy Shield
```

Expected artifact name pattern from the current `package.json` configuration:

```text
Developer Anti Ghosting Keyboard Privacy Shield-<version>-mac.dmg
```

## Required Versions

Use these exact versions on the Mac build machine:

- Node.js `v22.22.2`
- npm `10.9.7`

Official version links:

- Node.js `v22.22.2` release index: https://nodejs.org/dist/v22.22.2/
- Node.js `v22.22.2` macOS installer (`.pkg`): https://nodejs.org/dist/v22.22.2/node-v22.22.2.pkg
- npm `10.9.7` package page: https://www.npmjs.com/package/npm/v/10.9.7

## Important Platform Rule

Build the `.dmg` on a real Mac.

Do not treat Windows as the release environment for the macOS installer. `electron-builder` can package for multiple platforms, but `.dmg` creation, signing, and notarization are most reliable when run directly on macOS.

## macOS Build Machine Prerequisites

Before building, the Mac developer should have:

- macOS with Terminal access
- Node.js `v22.22.2`
- npm `10.9.7`
- project source checked out locally
- project dependencies installed
- Xcode Command Line Tools installed

Install Xcode Command Line Tools if needed:

```bash
xcode-select --install
```

Verify toolchain versions:

```bash
node -v
npm -v
xcode-select -p
```

Expected Node and npm output:

```bash
v22.22.2
10.9.7
```

## Build Inputs

The macOS package is driven by the current Electron Builder settings in `package.json`.

Relevant current settings:

- script: `npm run build:mac`
- target: `dmg`
- artifact name: `${productName}-${version}-mac.${ext}`
- product name: `Developer Anti Ghosting Keyboard Privacy Shield`

Current macOS build block:

```json
"mac": {
  "category": "public.app-category.utilities",
  "target": [
    "dmg"
  ],
  "artifactName": "${productName}-${version}-mac.${ext}"
}
```

## Recommended Build Workflow

Run these commands from the repository root on the Mac:

### 1. Install dependencies

```bash
npm ci
```

### 2. Run release validation

```bash
npm run qa:release
```

This project defines `qa:release` as:

```text
npm run release:version-check && npm run lint && npm run test && npm run security-check && npm run build
```

That means the builder should expect:

- version alignment checks
- linting
- tests
- security structure checks
- an unpacked Electron build

### 3. Build the macOS `.dmg`

```bash
npm run build:mac
```

## Output Location

The generated package should be written to:

```text
dist/
```

Expected primary artifact:

```text
dist/Developer Anti Ghosting Keyboard Privacy Shield-<version>-mac.dmg
```

The developer should confirm the `<version>` matches the current version in `package.json`.

## Architecture Notes

This document does not add a custom architecture override. By default, the build will reflect the machine and Electron Builder behavior used on the Mac build environment.

The developer should confirm whether the requested deliverable is:

- Apple Silicon only
- Intel only
- universal build

If you want a universal Mac build later, that should be added intentionally to the build configuration rather than assumed.

## Unsigned Versus Signed Release

There are two common outcomes for a Mac build:

### 1. Unsigned internal/testing build

Use this when the `.dmg` is only for local review or limited trusted testing.

Expected behavior:

- the `.dmg` can be created without Apple signing setup
- other Macs may show Gatekeeper warnings
- users may need to manually allow the app to open

### 2. Signed and notarized distribution build

Use this when the `.dmg` is meant for wider delivery to Mac users.

Expected behavior:

- smoother installation experience
- fewer Gatekeeper warnings
- better trust for downloaded applications

For this path, the Mac developer needs:

- an Apple Developer account
- a valid Developer ID Application certificate
- Apple notarization credentials
- signing and notarization environment variables or local secure credentials

This repository does not currently document stored Apple signing secrets in source control.

## Gatekeeper Notes

If the app is not signed and notarized, macOS may block it on first launch.

That does not necessarily mean the build is broken. It usually means the app is unsigned or unnotarized.

For testing, a user can often open the app by:

1. Opening `Applications` or the copied app bundle.
2. Right-clicking the app.
3. Choosing `Open`.
4. Confirming the security prompt.

For public distribution, signing and notarization are the preferred fix.

## What The Developer Should Send Back

Ask the Mac developer to provide:

- the generated `.dmg`
- the exact Mac model or CPU type used for the build
- the macOS version used
- confirmation of whether the build is unsigned, signed, or signed plus notarized
- any build warnings or Electron Builder warnings

## Quick Build Checklist

- Confirm Node is `v22.22.2`
- Confirm npm is `10.9.7`
- Confirm build is being run on macOS
- Run `npm ci`
- Run `npm run qa:release`
- Run `npm run build:mac`
- Check `dist/` for the `.dmg`
- Confirm artifact version matches `package.json`
- Confirm whether the result is unsigned or signed/notarized

## Copy/Paste Handoff For The Developer

```text
Please build the macOS .dmg for this project on a Mac using Node v22.22.2 and npm 10.9.7.

Setup:
- Install Node from https://nodejs.org/dist/v22.22.2/node-v22.22.2.pkg
- Confirm:
  - node -v -> v22.22.2
  - npm -v -> 10.9.7

From the project root run:
- npm ci
- npm run qa:release
- npm run build:mac

Expected output:
- dist/Developer Anti Ghosting Keyboard Privacy Shield-<version>-mac.dmg

Please tell me:
- the Mac architecture used for the build
- the macOS version used
- whether the build is unsigned, signed, or notarized
- whether there were any build warnings
```

## Related Docs

- `docs/WINDOWS_AND_MAC_INSTALLER_GUIDE.md`
- `docs/RELEASE_PROCESS.md`
- `docs/INSTALLER_AND_UPGRADE_QA.md`
- `README.md`
