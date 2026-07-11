import { execFile } from 'node:child_process';

export interface PowerShellResult { stdout: string; stderr: string; exitCode: number; }

/** Executes PowerShell with a constrained, non-interactive profile for diagnostics and safe repairs. */
export function runPowerShell(command: string, timeoutMs = 30_000): Promise<PowerShellResult> {
  return new Promise((resolve) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', command], { timeout: timeoutMs, windowsHide: true }, (error, stdout, stderr) => {
      const exitCode = typeof (error as NodeJS.ErrnoException | null)?.code === 'number' ? Number((error as NodeJS.ErrnoException).code) : 0;
      resolve({ stdout: stdout.toString(), stderr: stderr.toString(), exitCode });
    });
  });
}
