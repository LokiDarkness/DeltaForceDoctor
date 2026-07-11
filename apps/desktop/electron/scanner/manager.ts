import { randomUUID } from 'node:crypto';
import type Database from 'better-sqlite3';
import type { ScanReport, ScannerResult } from '../core/types.js';
import type { KnowledgeRepository } from '../knowledgebase/repository.js';
import type { Scanner } from './types.js';
import { scannerResult } from './result.js';

export class ScannerManager {
  private readonly scannersById: Map<string, Scanner>;

  constructor(private readonly scanners: Scanner[], private readonly knowledge: KnowledgeRepository, private readonly db: Database.Database) {
    this.scannersById = new Map(scanners.map((scanner) => [scanner.id, scanner]));
  }

  list(): Scanner[] { return [...this.scanners]; }

  async run(scannerId: string, runId = randomUUID()): Promise<ScannerResult> {
    const scanner = this.scannersById.get(scannerId);
    if (!scanner) throw new Error(`Unknown scanner: ${scannerId}`);
    const startedAt = new Date();
    let result: ScannerResult;
    try {
      result = await scanner.run({ now: startedAt, platform: process.platform });
    } catch (error) {
      result = scannerResult({ id: scanner.id, name: scanner.name, status: 'failed', severity: 'high', summary: 'Scanner execution failed.', recommendation: 'Review scanner details and retry after resolving the reported error.', details: { error: error instanceof Error ? error.message : String(error) } });
    }
    const matches = this.knowledge.matchResult(result).map((error) => error.errorId);
    const enriched: ScannerResult = { ...result, id: result.id ?? result.scannerId, scannerId: result.scannerId ?? result.id, knowledgeMatches: matches };
    this.persist(runId, enriched, startedAt);
    return enriched;
  }

  async runAll(): Promise<ScanReport> {
    const runId = randomUUID();
    const results = await Promise.all(this.scanners.map((scanner) => this.run(scanner.id, runId)));
    const findings = results.reduce((sum, result) => sum + result.knowledgeMatches.length + (result.status === 'passed' ? 0 : 1), 0);
    const status: ScanReport['status'] = results.some((r) => r.status === 'failed') ? 'failed' : results.some((r) => r.status === 'warning') ? 'warning' : 'passed';
    const report: ScanReport = { runId, generatedAt: new Date().toISOString(), status, totalScanners: results.length, findings, results };
    this.db.prepare('INSERT INTO scan_history (run_id, summary_json, created_at) VALUES (?, ?, ?)').run(runId, JSON.stringify(report), report.generatedAt);
    return report;
  }

  private persist(runId: string, result: ScannerResult, startedAt: Date): void {
    this.db.prepare('INSERT INTO system_scan (run_id, scanner_id, status, severity, recommendation, repair_available, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(runId, result.id, result.status, result.severity, result.recommendation, result.repairSupported ? 1 : 0, JSON.stringify({ summary: result.summary, ...result.details, knowledgeMatches: result.knowledgeMatches }), startedAt.toISOString());
  }
}
