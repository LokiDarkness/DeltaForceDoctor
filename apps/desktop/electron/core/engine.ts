import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { shell } from 'electron';
import type { DiagnosticModule, Scanner, ScannerResult } from './types.js';
import { createScanners } from '../scanner/registry.js';
import { KnowledgeRepository } from '../knowledgebase/repository.js';
import { RepairEngine } from '../repair/engine.js';
import { ReportExporter } from '../reports/exporter.js';
import type { ConfigurationManager, CoreEngineApi, Logger, PowerShellService } from '../shared/interfaces/services.js';

export interface CoreEngineDependencies {
  db: Database.Database;
  powerShell: PowerShellService;
  logger: Logger;
  config: ConfigurationManager;
  scanners?: Scanner[];
  knowledge?: KnowledgeRepository;
  repairs?: RepairEngine;
}

/** Core Engine is the single communication layer for scanners, OCR, repairs, reports, and persistence. */
export class CoreEngine implements CoreEngineApi {
  private readonly scanners: Scanner[];
  private readonly knowledge: KnowledgeRepository;
  private readonly repairs: RepairEngine;

  constructor(private readonly dependencies: CoreEngineDependencies) {
    this.scanners = dependencies.scanners ?? createScanners(dependencies.powerShell);
    this.knowledge = dependencies.knowledge ?? new KnowledgeRepository();
    this.repairs = dependencies.repairs ?? new RepairEngine(dependencies.db, dependencies.powerShell, dependencies.logger);
  }

  modules(): DiagnosticModule[] {
    return this.scanners.map((scanner) => ({ id: scanner.id, name: scanner.name, description: `${scanner.name} readiness scanner for Delta Force launch diagnostics.`, status: 'idle', findings: 0 }));
  }

  knowledgeBase() { return this.knowledge.all(); }

  async runScan(scannerId: string): Promise<DiagnosticModule> {
    const scanner = this.scanners.find((item) => item.id === scannerId);
    if (!scanner) throw new Error(`Unknown scanner: ${scannerId}`);
    this.dependencies.logger.info('Scanner started', { scannerId });
    const result = await scanner.run();
    const matches = this.knowledge.matchResult(result).map((error) => error.errorId);
    const enriched: ScannerResult = { ...result, knowledgeMatches: matches };
    const runId = randomUUID();
    this.dependencies.db.prepare('INSERT INTO system_scan (run_id, scanner_id, status, severity, recommendation, repair_available, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(runId, enriched.scannerId, enriched.status, enriched.severity, enriched.recommendation, enriched.repairAvailable ? 1 : 0, JSON.stringify({ ...enriched.details, knowledgeMatches: matches }), new Date().toISOString());
    this.dependencies.db.prepare('INSERT INTO scan_history (run_id, summary_json, created_at) VALUES (?, ?, ?)')
      .run(runId, JSON.stringify(enriched), new Date().toISOString());
    this.dependencies.logger.info('Scanner finished', { scannerId, status: enriched.status, matches: matches.length });
    return { id: scanner.id, name: scanner.name, description: enriched.recommendation, status: enriched.status, findings: matches.length + (enriched.status === 'passed' ? 0 : 1), severity: enriched.severity, recommendation: enriched.recommendation };
  }

  async runAll(): Promise<DiagnosticModule[]> {
    const results: DiagnosticModule[] = [];
    for (const scanner of this.scanners) results.push(await this.runScan(scanner.id));
    return results;
  }

  matchOcrText(text: string) { return this.knowledge.matchText(text); }

  listRepairs() { return this.repairs.list(); }

  runRepair(repairId: string) { return this.repairs.run(repairId); }

  async exportReport(format: 'json' | 'html' = 'json') {
    const exporter = new ReportExporter(this.dependencies.db, path.join(this.dependencies.config.getPath('documents'), 'DeltaForceDoctor', 'reports'));
    const reportPath = format === 'html' ? exporter.exportHtml() : exporter.exportJson();
    await shell.showItemInFolder(reportPath);
    this.dependencies.logger.info('Report exported', { format, reportPath });
    return reportPath;
  }
}
