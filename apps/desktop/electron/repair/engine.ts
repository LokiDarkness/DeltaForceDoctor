import { shell } from 'electron';
import type Database from 'better-sqlite3';
import type { RepairAction } from '../core/types.js';
import { runPowerShell } from '../services/powershell.js';

export const repairActions: RepairAction[] = [
  { id: 'winsock-reset', title: 'Reset Winsock', description: 'Safely resets the Windows network catalog; reboot recommended.', requiresAdmin: true, safe: true, command: 'netsh winsock reset' },
  { id: 'flush-dns', title: 'Flush DNS', description: 'Clears local DNS resolver cache for launcher connectivity issues.', requiresAdmin: false, safe: true, command: 'Clear-DnsClientCache' },
  { id: 'sfc-scan', title: 'Run SFC', description: 'Runs Windows System File Checker for corrupted OS files.', requiresAdmin: true, safe: true, command: 'sfc /scannow' },
  { id: 'dism-health', title: 'Run DISM RestoreHealth', description: 'Repairs Windows component store used by game dependencies.', requiresAdmin: true, safe: true, command: 'DISM /Online /Cleanup-Image /RestoreHealth' },
  { id: 'steam-verify', title: 'Open Steam Verify Integrity', description: 'Opens official Steam support instructions; no game files are modified by the app.', requiresAdmin: false, safe: true, url: 'https://help.steampowered.com/' },
  { id: 'nvidia-driver', title: 'Open NVIDIA Driver Page', description: 'Opens the official NVIDIA driver download page.', requiresAdmin: false, safe: true, url: 'https://www.nvidia.com/Download/index.aspx' },
  { id: 'amd-driver', title: 'Open AMD Driver Page', description: 'Opens the official AMD support page.', requiresAdmin: false, safe: true, url: 'https://www.amd.com/en/support/download/drivers.html' },
  { id: 'intel-driver', title: 'Open Intel Driver Page', description: 'Opens the official Intel driver assistant page.', requiresAdmin: false, safe: true, url: 'https://www.intel.com/content/www/us/en/support/detect.html' }
];

/** Executes only allow-listed safe repairs and records a durable audit trail. */
export class RepairEngine {
  constructor(private readonly db: Database.Database) {}

  list(): RepairAction[] { return repairActions; }

  async run(id: string): Promise<{ status: 'completed' | 'opened' | 'blocked'; output: string }> {
    const action = repairActions.find((item) => item.id === id);
    if (!action || !action.safe) return { status: 'blocked', output: 'Repair is not allow-listed.' };
    let status: 'completed' | 'opened' = 'completed';
    let output = '';
    if (action.url) {
      await shell.openExternal(action.url);
      status = 'opened';
      output = action.url;
    } else if (action.command) {
      const result = await runPowerShell(action.command, 120_000);
      output = `${result.stdout}\n${result.stderr}`.trim();
    }
    this.db.prepare('INSERT INTO repair_history (repair_id, title, status, command, output, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(action.id, action.title, status, action.command ?? action.url ?? null, output, new Date().toISOString());
    return { status, output };
  }
}
