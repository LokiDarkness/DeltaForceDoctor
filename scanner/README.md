# Scanner Modules

DeltaForceDoctor uses a reusable Scanner Engine in `apps/desktop/electron/scanner`.

## Scanner contract

Every independent scanner returns the production contract below:

- `id`
- `name`
- `status`
- `severity`
- `summary`
- `recommendation`
- `repairSupported`
- `details`

`scannerId` and `repairAvailable` are retained as backward-compatible aliases for existing persistence, knowledge matching, and UI integrations.

## Implemented scanners

The registry wires independent scanners for CPU, GPU, RAM, disk, BIOS, TPM, Secure Boot, virtualization, Windows, Steam, driver, network, overlay, ACE Anti-Cheat, Delta Force, and Event Viewer.

`ScannerManager` executes all scanners asynchronously, enriches results with knowledge-base matches, persists scan rows to SQLite, and produces a reusable scan report. Shared PowerShell execution and JSON parsing live in `apps/desktop/electron/services/powershell.ts` so scanner code does not duplicate PowerShell boilerplate.
