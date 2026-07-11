export const ScanStatuses = ['idle', 'running', 'passed', 'warning', 'failed'] as const;
export const Severities = ['info', 'low', 'medium', 'high', 'critical'] as const;

export type ScanStatus = typeof ScanStatuses[number];
export type Severity = typeof Severities[number];
