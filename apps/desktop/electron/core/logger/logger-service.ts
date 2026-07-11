import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Logger } from '../../shared/interfaces/services.js';

export class LoggerService implements Logger {
  constructor(private readonly logDirectory: string) {
    mkdirSync(this.logDirectory, { recursive: true });
  }

  info(message: string, context?: Record<string, unknown>): void { this.write('info', message, context); }
  warn(message: string, context?: Record<string, unknown>): void { this.write('warn', message, context); }
  error(message: string, context?: Record<string, unknown>): void { this.write('error', message, context); }

  private write(level: 'info' | 'warn' | 'error', message: string, context: Record<string, unknown> = {}): void {
    const entry = { timestamp: new Date().toISOString(), level, message, context };
    appendFileSync(path.join(this.logDirectory, 'delta-force-doctor.log'), `${JSON.stringify(entry)}\n`, 'utf8');
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    consoleMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, context);
  }
}
