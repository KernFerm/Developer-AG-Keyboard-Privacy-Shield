# Security Review

## Runtime Defaults

- `contextIsolation: true`
- `sandbox: true`
- `nodeIntegration: false`
- allowlisted preload bridge
- Content Security Policy in both headers and renderer HTML

## Items Reviewed

- Main window creation defaults
- IPC channel allowlist
- Preload surface area
- Backup and restore flows
- Local file handling
- Renderer code for unsafe dynamic execution

## Remaining Release Tasks

- Code signing for public Windows releases
- SmartScreen reputation planning
- Manual install and upgrade verification
- Manual review of any future import or extension capabilities

## Security Expectations

- No analytics
- No telemetry
- No remote data upload
- No hidden background behavior
- No bypass of operating system security
