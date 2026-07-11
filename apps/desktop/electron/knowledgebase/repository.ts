import { readFileSync } from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { KnowledgeError, ScannerResult } from '../core/types.js';

interface KnowledgeSeed { errors: KnowledgeError[]; }

/** Provides in-memory knowledge matching backed by the versioned JSON seed. */
export class KnowledgeRepository {
  private readonly errors: KnowledgeError[];

  constructor() {
    const seedPath = app.isPackaged ? path.join(process.resourcesPath, 'knowledgebase/delta-force-troubleshooting.json') : path.join(process.cwd(), 'knowledgebase/delta-force-troubleshooting.json');
    this.errors = (JSON.parse(readFileSync(seedPath, 'utf8')) as KnowledgeSeed).errors;
  }

  all(): KnowledgeError[] { return this.errors; }

  matchResult(result: ScannerResult): KnowledgeError[] {
    const haystack = `${result.scannerId} ${result.name} ${result.recommendation} ${JSON.stringify(result.details)}`.toLowerCase();
    return this.errors.filter((error) => {
      if (error.detectionRule.scannerIds?.includes(result.scannerId)) return true;
      return error.detectionRule.patterns.some((pattern) => haystack.includes(pattern.toLowerCase()));
    });
  }

  matchText(text: string): KnowledgeError[] {
    const haystack = text.toLowerCase();
    return this.errors.filter((error) => error.detectionRule.patterns.some((pattern) => haystack.includes(pattern.toLowerCase())));
  }
}
