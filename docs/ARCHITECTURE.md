# DeltaForceDoctor Architecture

DeltaForceDoctor is an Electron, React, TypeScript, Vite, TailwindCSS, SQLite, better-sqlite3, PowerShell, Windows API, and Electron Builder desktop application dedicated to Delta Force diagnostics.

## Clean Architecture rule

All feature modules communicate through the Core Engine. UI IPC calls enter Electron main through `IpcManager`, and every scanner, OCR match, repair, and report request is delegated to `CoreEngine`. Scanner, Repair, OCR, and Event Viewer code do **not** call each other directly.

```text
Renderer UI -> Preload API -> IPC Manager -> Core Engine -> Injected services/modules
                                             ├─ Scanner Registry
                                             ├─ Knowledge Repository / OCR matching
                                             ├─ Repair Engine
                                             ├─ Report Exporter
                                             ├─ SQLite Service
                                             └─ PowerShell Service
```

## Production module layout

- `apps/desktop/electron/core/engine`: core orchestration contracts and dependency wiring for the single communication layer.
- `apps/desktop/electron/core/ipc`: Electron IPC registration, keeping channel binding outside feature modules.
- `apps/desktop/electron/core/rules`: application configuration rules, including environment-aware resource paths.
- `apps/desktop/electron/core/logger`: durable JSONL logger service.
- `apps/desktop/electron/shared/constants`: cross-process constants such as IPC channel names.
- `apps/desktop/electron/shared/enums`: reusable status and severity domains.
- `apps/desktop/electron/shared/interfaces`: reusable contracts for diagnostics, repairs, and injectable services.
- `apps/desktop/electron/shared/models`, `types`, and `utils`: shared extension points for future production models, type helpers, and utilities.
- `apps/desktop/electron/services/sqlite`: SQLite lifecycle and schema initialization.
- `apps/desktop/electron/services/powershell`: injectable PowerShell execution service plus a backward-compatible facade.
- `apps/desktop/electron/services/steam`, `windows`, and `driver`: reserved service boundaries for production integrations.
- `logs`: repository log placeholder; runtime logs are written under Electron `userData/logs`.

## Dependency injection

`main.ts` is the composition root. It creates the configuration manager, logger, SQLite service, PowerShell service, Core Engine, and IPC Manager in that order. The Core Engine receives all collaborators through `CoreEngineDependencies`, which keeps feature modules testable and prevents hidden singleton coupling.

## Core Engine responsibilities

`CoreEngine` is the only application communication layer. It:

1. Lists diagnostic modules from injected scanners.
2. Runs individual or full scans.
3. Enriches scanner output with knowledge-base matches.
4. Persists scan history through the injected SQLite connection.
5. Runs safe repairs through the injected Repair Engine.
6. Exports reports through the shared report exporter.
7. Performs OCR text matching through the knowledge repository.

## Implemented production foundations

- `apps/desktop/electron/core`: typed engine contracts and orchestration.
- `apps/desktop/electron/scanner`: independent scanner registry for CPU, RAM, disk, Windows, GPU, Steam, ACE, Delta Force, network, overlay, Event Viewer, Secure Boot, TPM, virtualization, and services.
- `apps/desktop/electron/knowledgebase`: versioned JSON knowledge seed loader with keyword, event, and scanner matching.
- `apps/desktop/electron/repair`: safe allow-listed repair actions for Winsock, DNS, SFC, DISM, Steam support, and official driver pages.
- `apps/desktop/electron/reports`: JSON and HTML report exporter using persisted scanner and repair history.
- `database/schema.sql`: normalized SQLite schema for errors, solutions, images, drivers, scans, event logs, repairs, updates, and settings.

## Safety policy

DeltaForceDoctor never bypasses anti-cheat, never patches or illegally modifies game files, and never downloads drivers automatically. Driver actions open official vendor websites only.
