import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import type { DiagnosticModule, ScannerResult } from './types.js';
import { createScanners } from '../scanner/registry.js';
import { KnowledgeRepository } from '../knowledgebase/repository.js';

/** Core Engine coordinates scanners and knowledge matching; modules never call each other directly. */
export class CoreEngine {
  private readonly scanners = createScanners();
  private readonly knowledge = new KnowledgeRepository();

  constructor(private readonly db: Database.Database) {}

  modules(): DiagnosticModule[] {
    return this.scanners.map((scanner) => ({ id: scanner.id, name: scanner.name, description: `${scanner.name} readiness scanner for Delta Force launch diagnostics.`, status: 'idle', findings: 0 }));
  }

  knowledgeBase() { return this.knowledge.all(); }

  async runScan(scannerId: string): Promise<DiagnosticModule> {
    const scanner = this.scanners.find((item) => item.id === scannerId);
    if (!scanner) throw new Error(`Unknown scanner: ${scannerId}`);
    const result = await scanner.run();
    const matches = this.knowledge.matchResult(result).map((error) => error.errorId);
    const enriched: ScannerResult = { ...result, knowledgeMatches: matches };
    const runId = randomUUID();
    this.db.prepare('INSERT INTO system_scan (run_id, scanner_id, status, severity, recommendation, repair_available, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(runId, enriched.scannerId, enriched.status, enriched.severity, enriched.recommendation, enriched.repairAvailable ? 1 : 0, JSON.stringify({ ...enriched.details, knowledgeMatches: matches }), new Date().toISOString());
    this.db.prepare('INSERT INTO scan_history (run_id, summary_json, created_at) VALUES (?, ?, ?)')
      .run(runId, JSON.stringify(enriched), new Date().toISOString());
    return { id: scanner.id, name: scanner.name, description: enriched.recommendation, status: enriched.status, findings: matches.length + (enriched.status === 'passed' ? 0 : 1), severity: enriched.severity, recommendation: enriched.recommendation };
  }

  async runAll(): Promise<DiagnosticModule[]> {
    const results: DiagnosticModule[] = [];
    for (const scanner of this.scanners) results.push(await this.runScan(scanner.id));
    return results;
  }

  matchOcrText(text: string) { return this.knowledge.matchText(text); }
}
