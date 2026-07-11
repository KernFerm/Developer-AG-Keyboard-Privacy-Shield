# Known Limitations

## Keyboard Detection

- Windows can expose a single physical keyboard through multiple device interfaces.
- Some devices only publish generic names such as `HID Keyboard Device` or `USB Input Device`.
- Gaming keyboards, macro devices, and some laptop vendor hotkey systems may appear differently across machines.

## Windows Metadata

- The app depends on Windows-connected device inventory.
- If Windows does not expose a branded device name, the app may use a best-effort fallback label.

## Accessibility

- Accessibility features are present, but formal QA should continue across screen readers, zoom levels, and keyboard-only workflows.

## Packaging

- Public reputation systems such as SmartScreen require signed releases and release history to build trust.

## Platform Focus

- The app is Windows-focused first.
- macOS and Linux packaging exists, but the device-awareness experience is not yet equivalent to Windows.
