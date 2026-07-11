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

export async function runPowerShellJson<T>(command: string, fallback: T, timeoutMs = 30_000): Promise<{ value: T; raw: PowerShellResult; parseError?: string }> {
  const raw = await runPowerShell(`${command} | ConvertTo-Json -Depth 6 -Compress`, timeoutMs);
  if (raw.exitCode !== 0 || raw.stdout.trim().length === 0) return { value: fallback, raw };
  try {
    return { value: JSON.parse(raw.stdout) as T, raw };
  } catch (error) {
    return { value: fallback, raw, parseError: error instanceof Error ? error.message : String(error) };
  }
}

export function isWindows(): boolean { return process.platform === 'win32'; }
