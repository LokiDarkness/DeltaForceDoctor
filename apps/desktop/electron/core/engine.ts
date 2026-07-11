import type Database from 'better-sqlite3';
import type { DiagnosticModule, ScanReport, ScannerResult } from './types.js';
import { createScanners } from '../scanner/registry.js';
import { ScannerManager } from '../scanner/manager.js';
import { KnowledgeRepository } from '../knowledgebase/repository.js';

/** Core Engine coordinates scanners and knowledge matching; modules never call each other directly. */
export class CoreEngine {
  private readonly knowledge = new KnowledgeRepository();
  private readonly scannerManager: ScannerManager;

  constructor(db: Database.Database) {
    this.scannerManager = new ScannerManager(createScanners(), this.knowledge, db);
  }

  modules(): DiagnosticModule[] {
    return this.scannerManager.list().map((scanner) => ({ id: scanner.id, name: scanner.name, description: scanner.description, status: 'idle', findings: 0 }));
  }

  knowledgeBase() { return this.knowledge.all(); }

  async runScan(scannerId: string): Promise<DiagnosticModule> {
    return this.toModule(await this.scannerManager.run(scannerId));
  }

  async runAll(): Promise<DiagnosticModule[]> {
    return (await this.runScanReport()).results.map((result) => this.toModule(result));
  }

  async runScanReport(): Promise<ScanReport> { return this.scannerManager.runAll(); }

  matchOcrText(text: string) { return this.knowledge.matchText(text); }

  private toModule(result: ScannerResult): DiagnosticModule {
    return { id: result.id, name: result.name, description: result.summary, status: result.status, findings: result.knowledgeMatches.length + (result.status === 'passed' ? 0 : 1), severity: result.severity, recommendation: result.recommendation };
  }
}
