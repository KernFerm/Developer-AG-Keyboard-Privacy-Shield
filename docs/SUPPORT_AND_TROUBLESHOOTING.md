# Support and Troubleshooting

## Common Issues

### No keyboards appear

- Fully restart the app.
- Use `Refresh local status`.
- Reconnect the USB keyboard.
- Check whether Windows itself sees the device in Device Manager.

### A keyboard name looks generic

- Some Windows keyboard-class devices expose only generic labels.
- The app tries to prefer branded names from related Windows inventory when available.
- If Windows does not expose a better name, the app may fall back to a generic name.

### Too many keyboards appear

- Some hardware exposes multiple keyboard-like interfaces.
- The app filters and collapses these entries, but rare devices may still need additional tuning.

### A backup cannot be restored

- Verify the backup first in the app.
- If the payload is corrupted, the app should reject it and keep current settings intact.

### The UI looks clipped or crowded

- Try toggling `Compact Mode` off.
- Try a different dashboard layout.
- Use larger window sizes for the full device and report views.

## Recommended Support Workflow

1. Confirm the app version.
2. Confirm whether the issue happens after a full restart.
3. Check `Security Center` and `Device Center`.
4. Export a local report if the user wants to review system-facing status.
5. Compare results on another Windows machine if the issue looks hardware-specific.
6. Create a local report ZIP from `Diagnostics Center`, then open the project's GitHub issue page and attach the ZIP for release-user issues that need follow-up.

## Helpful Local Diagnostics

- Create a local report ZIP from `Diagnostics Center` for a minimal issue attachment. The ZIP is saved to the user's `Documents` folder.
- Run `npm run diagnose:keyboards` for a local-only Windows keyboard detection snapshot.
- Generate a local report from `Reports Center`.
- Record the keyboard vendor ID and product ID shown in `Device Center`.
