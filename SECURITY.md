# Security Policy

## Supported Versions

The project is currently in active early public development.

Only the current public release version is supported for security fixes.

| Version | Supported |
| --- | --- |
| 0.2.5 | Yes |
| 0.2.4 and earlier | No |
| Unreleased local builds | No |
| Modified forks | No |

## Reporting a Vulnerability

If you believe you found a security issue in Developer Anti Ghosting Keyboard Privacy Shield:

1. Go to the GitHub issues page:  
   `https://github.com/KernFerm/Developer-AG-Keyboard-Privacy-Shield/issues`
2. Create a new issue.
3. Clearly label it as a security report.
4. Include only the minimum information needed to reproduce or understand the issue.
5. Do not include passwords, keystrokes, typed content, personal documents, private tokens, clipboard contents, or sensitive personal information.

## What To Include

Helpful information:

- app version
- operating system and version
- whether the issue affects Windows or macOS
- steps to reproduce
- expected behavior
- actual behavior
- whether the issue is related to device detection, backup/restore, IPC, local file handling, tray behavior, or renderer content

## Safe Diagnostics

If needed, generate a local report ZIP from the application and attach it to the GitHub issue.

That ZIP is intended to contain only minimal local diagnostic metadata needed to debug the application.

It should not include:

- keystrokes
- typed content
- passwords
- clipboard contents
- screenshots
- personal documents
- personal file paths

## Response Expectations

Security reports will be reviewed as quickly as possible, but response times may vary depending on project activity and issue severity.

## Security Scope

This policy is intended for issues involving:

- Electron security boundaries
- IPC exposure
- preload bridge behavior
- local file handling
- backup and restore safety
- diagnostics export safety
- settings integrity
- renderer injection or unsafe content handling

General bugs, UI issues, hardware compatibility issues, and feature requests should also use the GitHub issue tracker, but they do not need to be labeled as security reports unless they create a real security risk.
