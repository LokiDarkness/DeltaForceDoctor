export interface RepairAction {
  id: string;
  title: string;
  description: string;
  requiresAdmin: boolean;
  safe: boolean;
  command?: string;
  url?: string;
}

export interface RepairResult {
  status: 'completed' | 'opened' | 'blocked';
  output: string;
}
