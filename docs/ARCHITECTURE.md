# DeltaForceDoctor Architecture

DeltaForceDoctor is an Electron, React, TypeScript, Vite, TailwindCSS, SQLite, and Electron Builder Windows desktop application.

- `apps/desktop`: Electron shell, preload bridge, and React renderer.
- `scanner`: diagnostic modules.
- `repair`: repair orchestration.
- `eventviewer`: Windows event log analyzers.
- `ocr`: OCR error detection.
- `database`: SQLite schema and migrations.
- `knowledgebase`: offline troubleshooting content.
- `powershell`: Windows collection and repair scripts.
- `reports`: exported reports.
