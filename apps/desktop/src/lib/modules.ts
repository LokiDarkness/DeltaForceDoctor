import type { DiagnosticModule } from '../types/electron';

export const modules: DiagnosticModule[] = [
  { id: 'cpu', name: 'CPU', description: 'Processor model, architecture, and core availability.', status: 'idle', findings: 0 },
  { id: 'gpu', name: 'GPU', description: 'Display adapters and installed driver versions.', status: 'idle', findings: 0 },
  { id: 'ram', name: 'RAM', description: 'Installed and available memory.', status: 'idle', findings: 0 },
  { id: 'disk', name: 'Disk', description: 'Fixed-volume free space for game and shader-cache health.', status: 'idle', findings: 0 },
  { id: 'bios', name: 'BIOS', description: 'Firmware vendor, version, and release date.', status: 'idle', findings: 0 },
  { id: 'tpm', name: 'TPM', description: 'TPM presence and readiness.', status: 'idle', findings: 0 },
  { id: 'secureboot', name: 'Secure Boot', description: 'UEFI Secure Boot state.', status: 'idle', findings: 0 },
  { id: 'virtualization', name: 'Virtualization', description: 'Virtualization firmware flags exposed to Windows.', status: 'idle', findings: 0 },
  { id: 'windows', name: 'Windows', description: 'Windows edition, build, and installation metadata.', status: 'idle', findings: 0 },
  { id: 'steam', name: 'Steam', description: 'Steam client and common install locations.', status: 'idle', findings: 0 },
  { id: 'driver', name: 'Driver', description: 'Signed Plug and Play drivers relevant to launch stability.', status: 'idle', findings: 0 },
  { id: 'network', name: 'Network', description: 'Active network interfaces needed for online launch.', status: 'idle', findings: 0 },
  { id: 'overlay', name: 'Overlay', description: 'Common overlay processes that can conflict with anti-cheat or rendering.', status: 'idle', findings: 0 },
  { id: 'ace', name: 'ACE Anti-Cheat', description: 'ACE anti-cheat services when present.', status: 'idle', findings: 0 },
  { id: 'deltaforce', name: 'Delta Force', description: 'Delta Force install hints from Steam libraries and common paths.', status: 'idle', findings: 0 },
  { id: 'eventviewer', name: 'Event Viewer', description: 'Recent Application/System errors related to crashes and anti-cheat.', status: 'idle', findings: 0 }
];
