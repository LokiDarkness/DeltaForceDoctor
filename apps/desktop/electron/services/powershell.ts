import { LoggerService } from '../core/logger/logger-service.js';
import { PowerShellService } from './powershell/powershell-service.js';

export type { PowerShellResult } from '../shared/interfaces/services.js';

const fallbackLogger = new LoggerService(process.env.DELTA_FORCE_DOCTOR_LOG_DIR ?? 'logs');
const fallbackPowerShell = new PowerShellService(fallbackLogger);

/** Backward-compatible facade. Prefer injecting PowerShellService through CoreEngine dependencies. */
export function runPowerShell(command: string, timeoutMs = 30_000) {
  return fallbackPowerShell.run(command, timeoutMs);
}
