# Installer And Upgrade QA

Use this checklist before public Windows distribution.

## Fresh Install

- Install NSIS build on a clean Windows machine
- Confirm the app launches normally
- Confirm tray controls work
- Confirm first-launch onboarding appears
- Confirm local settings file is created

## Upgrade

- Install an older signed test build
- Upgrade to the new build
- Confirm settings survive upgrade
- Confirm trusted devices survive upgrade
- Confirm backups and restore points remain readable
- Confirm tray state and startup behavior remain stable

## Portable Build

- Run the portable build from removable storage
- Confirm external-drive restrictions behave as intended
- Confirm reports, backups, and settings stay local to the portable environment

## Uninstall

- Uninstall the NSIS build
- Confirm uninstall cleanup behavior matches release expectations
- Confirm no hidden persistence remains
- Confirm tray process does not continue running

## Release Blocking Issues

- Broken upgrade path
- Corrupted settings after upgrade
- Unreadable backups created by the prior release
- Missing tray controls
- External drive mode blocking valid portable workflows
