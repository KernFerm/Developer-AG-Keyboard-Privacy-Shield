# Windows Hardware QA

This checklist is for real-device validation before public release.

## Goal

Confirm that the app shows only real physical keyboards with stable naming and without duplicate HID side-devices.

## Test Matrix

- Built-in laptop keyboard only
- Built-in + one USB keyboard
- Built-in + one Bluetooth keyboard
- Desktop with one wired keyboard
- Docked laptop with external hub
- Laptop connected through USB-C dock
- Laptop with hot-plug and hot-unplug testing

## Validate

- Device Center shows the built-in keyboard when present
- Device Center shows the external physical keyboard when connected
- Duplicate side interfaces are not shown as extra keyboards
- Mouse-side Logitech or vendor utility interfaces are not shown as keyboards
- Vendor ID and product ID stay stable across reconnects
- Trust level persists after reconnect
- Timeline records connection events only
- No typed content appears anywhere in the UI

## Local Diagnostic

Run:

```powershell
npm run diagnose:keyboards
```

This generates a local-only diagnostic file under `diagnostics/` using Windows device inventory commands. It does not collect keystrokes or typed content.
