export type ScanStatus = 'idle' | 'running' | 'passed' | 'warning' | 'failed';
export interface DiagnosticModule { id: string; name: string; description: string; status: ScanStatus; findings: number; }
export interface DoctorApi { runScan(moduleId: string): Promise<DiagnosticModule>; exportReport(): Promise<string>; }
declare global { interface Window { doctor: DoctorApi; } }
