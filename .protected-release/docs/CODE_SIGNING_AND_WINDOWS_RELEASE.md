# Code Signing And Windows Release

## Public Windows Release Requirements

- Use a valid code signing certificate for Windows builds
- Sign installer and portable artifacts before distribution
- Verify application name, icon, and publisher details in the signed output
- Validate launch behavior on a clean Windows system
- Plan for Microsoft Defender SmartScreen reputation buildup on new releases

## Manual Release Steps

1. Run `npm run qa:release`
2. Run `npm run build:win`
3. Sign the generated Windows artifacts with your release certificate
4. Re-verify the signed installer and portable outputs
5. Complete hardware QA, accessibility QA, installer QA, and upgrade QA
6. Publish release notes that match the exact tested version

## Notes

- Signing details should stay in your secure release environment, not in the repository
- Do not hardcode private certificate material into this project
- Public release should always map to one exact tested version
