import type { ScannerResult, ScanStatus, Severity } from '../core/types.js';

interface ResultInput {
  id: string;
  name: string;
  status: Exclude<ScanStatus, 'idle' | 'running'>;
  severity: Severity;
  summary: string;
  recommendation: string;
  repairSupported?: boolean;
  details?: Record<string, unknown>;
}

export function scannerResult(input: ResultInput): ScannerResult {
  return {
    id: input.id,
    scannerId: input.id,
    name: input.name,
    status: input.status,
    severity: input.severity,
    summary: input.summary,
    recommendation: input.recommendation,
    repairSupported: input.repairSupported ?? false,
    repairAvailable: input.repairSupported ?? false,
    details: input.details ?? {},
    knowledgeMatches: []
  };
}

export const pass = (id: string, name: string, summary: string, recommendation: string, details?: Record<string, unknown>, repairSupported = false) =>
  scannerResult({ id, name, status: 'passed', severity: 'info', summary, recommendation, details, repairSupported });

export const warn = (id: string, name: string, summary: string, recommendation: string, details?: Record<string, unknown>, repairSupported = false, severity: Severity = 'medium') =>
  scannerResult({ id, name, status: 'warning', severity, summary, recommendation, details, repairSupported });

export const fail = (id: string, name: string, summary: string, recommendation: string, details?: Record<string, unknown>, repairSupported = false, severity: Severity = 'high') =>
  scannerResult({ id, name, status: 'failed', severity, summary, recommendation, details, repairSupported });
