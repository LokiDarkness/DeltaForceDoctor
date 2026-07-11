import { execFile } from 'node:child_process';
import type { Logger, PowerShellResult, PowerShellService as PowerShellServiceContract } from '../../shared/interfaces/services.js';

export class PowerShellService implements PowerShellServiceContract {
  constructor(private readonly logger: Logger) {}

  run(command: string, timeoutMs = 30_000): Promise<PowerShellResult> {
    this.logger.info('PowerShell command started', { timeoutMs });
    return new Promise((resolve) => {
      execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command], { timeout: timeoutMs, windowsHide: true }, (error, stdout, stderr) => {
        const exitCode = typeof (error as NodeJS.ErrnoException | null)?.code === 'number' ? Number((error as NodeJS.ErrnoException).code) : 0;
        if (exitCode === 0) this.logger.info('PowerShell command completed');
        else this.logger.warn('PowerShell command completed with non-zero exit', { exitCode, stderr: stderr.toString() });
        resolve({ stdout: stdout.toString(), stderr: stderr.toString(), exitCode });
      });
    });
  }
}
