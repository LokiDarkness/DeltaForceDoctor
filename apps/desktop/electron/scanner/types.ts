import type { ScannerResult } from '../core/types.js';

export interface ScannerContext {
  now: Date;
  platform: NodeJS.Platform;
}

export interface Scanner {
  id: string;
  name: string;
  description: string;
  run(context: ScannerContext): Promise<ScannerResult>;
}
