export type ScanStatus = 'idle' | 'running' | 'passed' | 'warning' | 'failed';
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export interface DiagnosticModule { id: string; name: string; description: string; status: ScanStatus; findings: number; severity?: Severity; recommendation?: string; }
export interface ScannerResult { id: string; scannerId: string; name: string; status: Exclude<ScanStatus, 'idle' | 'running'>; severity: Severity; summary: string; recommendation: string; repairSupported: boolean; repairAvailable: boolean; details: Record<string, unknown>; knowledgeMatches: string[]; }
export interface ScanReport { runId: string; generatedAt: string; status: Exclude<ScanStatus, 'idle' | 'running'>; totalScanners: number; findings: number; results: ScannerResult[]; }
export interface KnowledgeError { errorId: string; name: string; category: string; severity: Severity; description: string; symptoms: string[]; repairSteps: string[]; automaticRepairSupported: boolean; requireAdmin: boolean; requireBios: boolean; tags: string[]; officialLinks: string[]; }
export interface RepairAction { id: string; title: string; description: string; requiresAdmin: boolean; safe: boolean; command?: string; url?: string; }
export interface DoctorApi {
  listModules(): Promise<DiagnosticModule[]>;
  runScan(moduleId: string): Promise<DiagnosticModule>;
  runAllScans(): Promise<DiagnosticModule[]>;
  runScanReport(): Promise<ScanReport>;
  listKnowledge(): Promise<KnowledgeError[]>;
  matchOcrText(text: string): Promise<KnowledgeError[]>;
  listRepairs(): Promise<RepairAction[]>;
  runRepair(repairId: string): Promise<{ status: 'completed' | 'opened' | 'blocked'; output: string }>;
  exportReport(format: 'json' | 'html'): Promise<string>;
}
declare global { interface Window { doctor?: DoctorApi; } }
