# Developer Anti Ghosting Keyboard Privacy Shield

## Overview

Developer Anti Ghosting Keyboard Privacy Shield is a privacy-first Electron desktop application for Windows and macOS.

It is built for people who code, teach, stream, present, record tutorials, or work in public places and want better control over how much keyboard-related activity is visibly exposed on screen.

The app does not record what you type.
It does not save typed characters.
It does not upload keyboard data.
It does not use analytics or telemetry.

Everything is designed to stay local to the device.

## Why This App Exists

When you are coding on a livestream, teaching in Zoom, screen sharing in a meeting, or working in a coffee shop, the problem is not only what gets typed. The problem is also what becomes visible around typing:

- connected device changes
- active sharing or recording environments
- workspace exposure risk
- privacy mode readiness
- whether the app is showing too much detail at the wrong time

This app is meant to help reduce that visible exposure by giving you a local-only privacy dashboard, trusted keyboard management, protection modes, emergency privacy controls, and workspace awareness features.

## What The App Does

The application helps you monitor and manage:

- connected keyboards
- trusted and untrusted devices
- workspace exposure risk
- privacy readiness
- screen sharing and recording awareness
- accessibility settings
- system and hardware awareness
- encrypted local settings and backups

It also provides:

- a realtime dashboard
- a Device Center for keyboard trust review
- workspace risk and sharing awareness
- emergency privacy controls
- privacy, security, and accessibility centers
- local reports and diagnostics
- tray controls
- optional overlay visibility

## What The App Does Not Do

This application is intentionally not surveillance software.

It does not:

- record keystrokes
- save typed content
- upload keyboard data
- collect analytics
- use telemetry
- inspect source code automatically
- capture your screen
- capture clipboard contents
- record webcam footage
- record microphone audio
- track you across devices or sessions

## Who It Is For

This app is designed for:

- developers
- streamers and content creators
- teachers and presenters
- students
- business users
- accessibility-focused users
- privacy-conscious people working in shared or public environments

## Core Privacy Promise

The app is built around a few non-negotiable rules:

- your keystrokes are not recorded
- your typed content is never saved
- no analytics are used
- no telemetry is used
- no logs containing personal information are collected
- everything stays on your computer

## How It Works

The app uses local operating-system device and environment information to build a privacy-focused view of your setup.

Depending on the platform, it can use supported local system inventory and status utilities to:

- identify likely physical keyboards
- distinguish built-in, USB, and Bluetooth keyboards when metadata is available
- detect when workspace conditions change
- observe sharing or recording-related environment signals
- show health, trust, and readiness information in the UI

It does this without reading the content of what you type.

## Main Features

### Protection Controls

- `Protection On / Protection Off`
  Turns privacy protection behavior on or off.

- `Emergency Privacy Mode`
  Switches the interface into a simpler, reduced-detail state for fast privacy response.

- Close behavior setting
  Lets users choose between `Close exits app` and `Close minimizes to tray`.

### Device Trust

- detects connected keyboards in realtime
- supports built-in, USB, and supported Bluetooth keyboards
- allows trust levels such as `Trusted`, `Verified`, `Known`, `Unknown`, and `Restricted`
- stores trusted device preferences locally in encrypted settings
- keeps a local device connection timeline

### Workspace Awareness

- monitor count awareness
- workspace risk scoring
- sharing and capture environment awareness
- public workspace recommendations
- remote work and meeting environment detection signals

### Privacy and Safety Controls

- one-click sharing presets
- privacy overlay support
- emergency quick-hide behavior
- local-only diagnostics and local report ZIP export for GitHub issue reporting
- encrypted backups and restore points

### Accessibility

- high contrast mode
- large text mode
- reduced motion mode
- dyslexia-friendly font option
- simplified mode
- keyboard-friendly navigation

## Main Sections In The App

### Dashboard

The main privacy mission control view. It gives a fast summary of protection status, readiness, trusted devices, workspace risk, security health, and performance.

### Device Center

Shows connected keyboard entries, trust levels, device timeline history, detection confidence, and device metadata when available.

### Workspace Center

Shows monitor awareness, workspace classification, sharing and recording awareness, workspace exposure score, and privacy recommendations.

### Privacy Center

Explains the app’s privacy posture, what is stored locally, and what is never collected.

### Security Center

Shows configuration integrity, encrypted settings status, IPC and local security guidance, and readiness for release review.

### Accessibility Center

Lets users enable readability and lower-distraction settings without reducing the app’s privacy protections.

### Diagnostics Center

Shows detection source, last refresh time, health status, scan comparison, release health, and local report ZIP generation.

### Backup Center

Lets users create encrypted settings backups, verify them locally, restore them, and manage local restore points.

## Quick Start For Everyday Users

1. Open the app.
2. Leave `Protection On`.
3. Open `Device Center` and review the keyboards your computer says are connected.
4. Mark only the devices you recognize as trusted.
5. Check `Workspace Center` before sharing your screen or streaming.
6. Use `Emergency Privacy Mode` if you want the fastest reduced-detail view.

## Recommended Usage

- Use `Developer Protection Mode` for normal coding sessions.
- Use presentation or classroom modes before demos or teaching.
- Use streaming or creator modes before OBS, Discord, Zoom, Teams, or similar tools.
- Review the keyboard list whenever you plug in or remove a keyboard.
- If a device name looks generic, compare the vendor ID and product ID before trusting it.

## Platform Support

### Windows

Windows is the most fully developed environment in the current codebase.

Current support includes:

- local keyboard inventory detection
- workspace monitoring
- system and hardware awareness
- Windows-aware local settings alignment
- tray behavior and diagnostics

## Keyboard Detection Notes

The app tries to show likely real physical keyboards instead of every low-level side-interface the operating system exposes.

That matters because some systems represent a single keyboard as multiple underlying device entries.

The app attempts to:

- collapse duplicate-looking entries
- prefer stronger keyboard signals
- keep branded names when the operating system exposes them
- show confidence information when naming is partial or generic

Even with that logic, device naming can still vary across hardware, docks, hubs, Bluetooth stacks, and operating-system versions.

## Security Design

The app uses Electron security-focused defaults, including:

- context isolation
- sandboxed renderer processes
- no Node integration in the renderer
- allowlisted IPC channels
- sanitized settings and input payloads
- encrypted local settings and backups
- strict local-only behavior for core data flows

## Accessibility

Accessibility support includes:

- High Contrast Mode
- Large Text Mode
- Reduced Motion Mode
- Dyslexia-Friendly Font Option
- Simplified Mode
- keyboard-friendly controls

Accessibility settings are stored locally and designed to remain usable alongside privacy features.

## Reports And Diagnostics

The app can generate local-only reports and diagnostics for:

- privacy readiness
- workspace readiness
- accessibility readiness
- device security
- protection coverage
- local audit summaries

Diagnostics and local report ZIP files are intended to help with troubleshooting without including typed content. When generated from the app, the ZIP is saved to the end user's `Documents` folder.

If you need to report a bug, create a local report ZIP from the app, find it in `Documents`, and attach it to a GitHub issue in the project repository.



## License

GNU General Public License v3.0
