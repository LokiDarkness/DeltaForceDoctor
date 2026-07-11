# DeltaForceDoctor Architecture

DeltaForceDoctor is an Electron, React, TypeScript, Vite, TailwindCSS, SQLite, better-sqlite3, PowerShell, Windows API, and Electron Builder desktop application dedicated to Delta Force diagnostics.

## Clean Architecture rule

All feature modules communicate through the Core Engine. UI IPC calls enter Electron main, Electron main delegates to `CoreEngine`, and the engine coordinates scanners plus knowledge matching. Repair execution is isolated behind `RepairEngine` and only runs allow-listed safe actions.

```text
UI -> Core Engine -> Scanner Engine -> Knowledge Engine -> Repair Engine -> SQLite -> PowerShell -> Windows API
```

## Implemented production foundations

- `apps/desktop/electron/core`: typed engine contracts and orchestration.
- `apps/desktop/electron/scanner`: reusable Scanner Engine with `ScannerManager`, shared result factories, independent scanners for CPU, GPU, RAM, disk, BIOS, TPM, Secure Boot, virtualization, Windows, Steam, driver, network, overlay, ACE, Delta Force, and Event Viewer, plus shared PowerShell helpers to avoid duplicated command plumbing.
- `apps/desktop/electron/knowledgebase`: versioned JSON knowledge seed loader with keyword, event, and scanner matching.
- `apps/desktop/electron/repair`: safe allow-listed repair actions for Winsock, DNS, SFC, DISM, Steam support, and official driver pages.
- `apps/desktop/electron/reports`: JSON and HTML report exporter using persisted scanner and repair history.
- `database/schema.sql`: normalized SQLite schema for errors, solutions, images, drivers, scans, event logs, repairs, updates, and settings.

## Safety policy

DeltaForceDoctor never bypasses anti-cheat, never patches or illegally modifies game files, and never downloads drivers automatically. Driver actions open official vendor websites only.

## Scanner Engine

`ScannerManager` owns scanner discovery, asynchronous `Promise.all` execution, knowledge-base enrichment, SQLite persistence, and scan report generation. Each scanner is an isolated module with a small `Scanner` contract, making scanners unit-test-ready by invoking `run(context)` with deterministic context and mocking shared services where needed. The React dashboard consumes generated scan reports through the Electron IPC bridge and renders the latest report summary without breaking the legacy module list API.
