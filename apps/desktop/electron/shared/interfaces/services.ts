import type Database from 'better-sqlite3';
import type { DiagnosticModule, KnowledgeError } from './diagnostics.js';
import type { RepairAction, RepairResult } from './repair.js';

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

export interface PowerShellResult { stdout: string; stderr: string; exitCode: number; }
export interface PowerShellService { run(command: string, timeoutMs?: number): Promise<PowerShellResult>; }

export interface SQLiteService {
  connection(): Database.Database;
  close(): void;
}

export interface ConfigurationManager {
  getPath(name: 'userData' | 'documents' | 'logs' | 'database' | 'schema'): string;
  isDevelopment(): boolean;
}

export interface CoreEngineApi {
  modules(): DiagnosticModule[];
  knowledgeBase(): KnowledgeError[];
  runScan(scannerId: string): Promise<DiagnosticModule>;
  runAll(): Promise<DiagnosticModule[]>;
  matchOcrText(text: string): KnowledgeError[];
  listRepairs(): RepairAction[];
  runRepair(repairId: string): Promise<RepairResult>;
  exportReport(format: 'json' | 'html'): Promise<string>;
}
