export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type ScanStatus = 'idle' | 'running' | 'passed' | 'warning' | 'failed';

export interface ScannerResult {
  scannerId: string;
  name: string;
  status: Exclude<ScanStatus, 'idle' | 'running'>;
  severity: Severity;
  recommendation: string;
  repairAvailable: boolean;
  details: Record<string, unknown>;
  knowledgeMatches: string[];
}

export interface DiagnosticModule {
  id: string;
  name: string;
  description: string;
  status: ScanStatus;
  findings: number;
  severity?: Severity;
  recommendation?: string;
}

export interface KnowledgeError {
  errorId: string;
  name: string;
  category: string;
  severity: Severity;
  description: string;
  symptoms: string[];
  detectionRule: { type: 'keyword' | 'event' | 'scanner'; patterns: string[]; scannerIds?: string[] };
  possibleCauses: string[];
  repairSteps: string[];
  automaticRepairSupported: boolean;
  requireAdmin: boolean;
  requireBios: boolean;
  officialLinks: string[];
  images: string[];
  tags: string[];
  relatedErrors: string[];
}

export interface RepairAction {
  id: string;
  title: string;
  description: string;
  requiresAdmin: boolean;
  safe: boolean;
  command?: string;
  url?: string;
}
