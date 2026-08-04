# Release Process

## Versioning

- Keep `package.json` and `CHANGE-LOG.md` aligned.
- Keep `package-lock.json` aligned with the same release version.
- Use one tested version per release.
- Do not publish a release candidate without updating docs and checks first.

## Pre-Release Checklist

1. Run `npm run lint`
2. Run `npm run test`
3. Run `npm run security-check`
4. Run `npm run release:version-check`
5. Run `npm run build`
6. Verify keyboard detection on at least one laptop and one external USB keyboard
7. Verify backup and restore
8. Verify installer or portable behavior
9. Update changelog
10. Update support and limitation docs if behavior changed

## Public Windows Release Checklist

1. Build the signed release
2. Verify installer and portable outputs
3. Check launch, update, and uninstall behavior
4. Confirm tray, Device Center, Workspace Center, and Emergency Privacy Mode
5. Archive release notes with the exact version number

## Recommended Release Scripts

- `npm run qa:release`
- `npm run release:version-check`
- `npm run build:win`
