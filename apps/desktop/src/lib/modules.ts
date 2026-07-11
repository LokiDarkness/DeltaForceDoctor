import type { DiagnosticModule } from '../types/electron';

export const modules: DiagnosticModule[] = [
  { id: 'system', name: 'System Scanner', description: 'CPU, memory, disk, DirectX, services, and thermal health.', status: 'idle', findings: 0 },
  { id: 'driver', name: 'Driver Scanner', description: 'GPU, chipset, audio, network, and anti-cheat driver readiness.', status: 'idle', findings: 0 },
  { id: 'windows', name: 'Windows Scanner', description: 'Windows build, updates, Defender, firewall, and integrity checks.', status: 'idle', findings: 0 },
  { id: 'bios', name: 'BIOS Scanner', description: 'Firmware version, TPM, secure boot, virtualization, and platform flags.', status: 'idle', findings: 0 },
  { id: 'deltaforce', name: 'Delta Force Scanner', description: 'Game install, config, shader cache, logs, and launcher validation.', status: 'idle', findings: 0 },
  { id: 'steam', name: 'Steam Scanner', description: 'Steam libraries, app manifests, overlay, downloads, and file verification.', status: 'idle', findings: 0 },
  { id: 'eventviewer', name: 'Event Viewer Analyzer', description: 'Application, system, WHEA, display, and anti-cheat event correlation.', status: 'idle', findings: 0 },
  { id: 'knowledgebase', name: 'Knowledge Base', description: 'Offline remediation articles mapped to error signatures.', status: 'idle', findings: 0 },
  { id: 'repair', name: 'Repair Engine', description: 'Guided and scripted fixes with restore point prompts and audit logs.', status: 'idle', findings: 0 },
  { id: 'ocr', name: 'OCR Error Detection', description: 'Screenshot text extraction for crash codes and launcher errors.', status: 'idle', findings: 0 },
  { id: 'report', name: 'Report Export', description: 'Privacy-aware HTML and JSON diagnostic report generation.', status: 'idle', findings: 0 }
];
