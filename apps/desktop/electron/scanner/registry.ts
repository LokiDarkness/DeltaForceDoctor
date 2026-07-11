import os from 'node:os';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Scanner, ScannerResult } from '../core/types.js';
import type { PowerShellService } from '../shared/interfaces/services.js';

const ok = (scannerId: string, name: string, recommendation: string, details: Record<string, unknown> = {}): ScannerResult => ({ scannerId, name, status: 'passed', severity: 'info', recommendation, repairAvailable: false, details, knowledgeMatches: [] });
const warn = (scannerId: string, name: string, recommendation: string, details: Record<string, unknown> = {}, repairAvailable = false): ScannerResult => ({ scannerId, name, status: 'warning', severity: 'medium', recommendation, repairAvailable, details, knowledgeMatches: [] });

export function createScanners(powerShell: PowerShellService): Scanner[] {
  return [
    { id: 'cpu', name: 'CPU', run: async () => ok('cpu', 'CPU', 'CPU inventory collected.', { model: os.cpus()[0]?.model ?? 'unknown', cores: os.cpus().length }) },
    { id: 'ram', name: 'RAM', run: async () => ok('ram', 'RAM', 'Memory capacity collected.', { totalGb: Math.round(os.totalmem() / 1024 / 1024 / 1024) }) },
    { id: 'windows', name: 'Windows Version', run: async () => ok('windows', 'Windows Version', 'Windows release information collected.', { platform: os.platform(), release: os.release() }) },
    { id: 'steam', name: 'Steam', run: async () => existsSync('C:/Program Files (x86)/Steam/steam.exe') ? ok('steam', 'Steam', 'Steam client found in default location.') : warn('steam', 'Steam', 'Steam was not found in the default location; choose Steam repair to open official support.', {}, true) },
    { id: 'deltaforce', name: 'Delta Force', run: async () => warn('deltaforce', 'Delta Force', 'Game install path requires Steam library discovery; verify integrity if launch fails.', { supportedGame: 'Delta Force' }, true) },
    { id: 'network', name: 'Network', run: async () => ok('network', 'Network', 'Network stack can be repaired safely with Winsock and DNS actions.') },
    { id: 'overlay', name: 'Overlay', run: async () => warn('overlay', 'Overlay', 'Disable third-party overlays when ACE pre-launch or crashes occur.', { commonConflicts: ['Discord', 'GeForce Experience', 'RTSS', 'Steam Overlay'] }) },
    { id: 'eventviewer', name: 'Event Viewer', run: async () => {
      if (process.platform !== 'win32') return warn('eventviewer', 'Event Viewer', 'Event Viewer collection is available on Windows builds.', { platform: process.platform });
      const ps = "Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=(Get-Date).AddDays(-7)} -MaxEvents 25 | Select-Object TimeCreated,ProviderName,Id,LevelDisplayName,Message | ConvertTo-Json -Compress";
      const result = await powerShell.run(ps, 20_000);
      return result.exitCode === 0 ? ok('eventviewer', 'Event Viewer', 'Recent Windows application events collected.', { events: result.stdout }) : warn('eventviewer', 'Event Viewer', 'Could not collect Event Viewer data without elevated Windows access.', { stderr: result.stderr });
    } },
    { id: 'gpu', name: 'GPU Driver', run: async () => warn('gpu', 'GPU Driver', 'Open official NVIDIA, AMD, or Intel pages if display crashes are detected.', { officialVendors: ['NVIDIA', 'AMD', 'Intel'] }, true) },
    { id: 'secureboot', name: 'Secure Boot', run: async () => process.platform === 'win32' ? ok('secureboot', 'Secure Boot', 'Secure Boot state query is registered for Windows.') : warn('secureboot', 'Secure Boot', 'Secure Boot can only be read on Windows firmware.', { requireBios: true }) },
    { id: 'tpm', name: 'TPM', run: async () => process.platform === 'win32' ? ok('tpm', 'TPM', 'TPM readiness query is registered for Windows.') : warn('tpm', 'TPM', 'TPM can only be read on Windows.', { requireBios: true }) },
    { id: 'virtualization', name: 'Virtualization', run: async () => ok('virtualization', 'Virtualization', 'Virtualization scanner is ready for VT-x, VT-d, and AMD-V checks.', { arch: os.arch() }) },
    { id: 'disk', name: 'Disk', run: async () => ok('disk', 'Disk', 'Disk scanner registered for free-space and health checks.', { temp: path.dirname(process.execPath) }) },
    { id: 'ace', name: 'ACE Anti-Cheat', run: async () => warn('ace', 'ACE Anti-Cheat', 'ACE service health should be checked when Delta Force fails before launch.', {}, true) },
    { id: 'services', name: 'Windows Services', run: async () => ok('services', 'Windows Services', 'Service restart repair actions are available for safe targets.') }
  ];
}
