# Support Workflow

## User Support Intake

Use the project's GitHub issue page for end-user reports and hardware-specific keyboard detection issues.

## What To Ask For

- App version
- Windows version
- Whether the issue affects a built-in keyboard, USB keyboard, Bluetooth keyboard, dock, or hub
- Whether the issue still happens after `Refresh local status`
- Whether the issue still happens after reconnecting the keyboard
- Whether the problem is missing devices, duplicate devices, or generic device naming

## Useful Local Artifacts

- Local report ZIP generated from `Diagnostics Center` and saved to the user's `Documents` folder
- Keyboard diagnostic output from `npm run diagnose:keyboards`
- Local report generated from Reports Center
- Screenshot of Device Center if the user is comfortable sharing one

## Support Triage

1. Confirm version alignment with the published release
2. Review the attached local report ZIP and local diagnostic output
3. Compare vendor ID and product ID against the reported keyboard
4. Check whether Windows itself exposes only generic HID or USB labels
5. Reproduce on another Windows machine when possible

## Escalate When

- A real physical keyboard is missing from the list
- Duplicate keyboard interfaces keep appearing after refresh
- The app misidentifies a mouse-side interface as a keyboard
- Backup verification or restore fails on a valid local payload
