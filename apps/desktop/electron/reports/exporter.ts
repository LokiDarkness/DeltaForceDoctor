import type Database from 'better-sqlite3';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/** Creates privacy-aware JSON and HTML reports from persisted scanner and repair history. */
export class ReportExporter {
  constructor(private readonly db: Database.Database, private readonly baseDir: string) {}

  exportJson(): string {
    mkdirSync(this.baseDir, { recursive: true });
    const reportPath = path.join(this.baseDir, `delta-force-doctor-${Date.now()}.json`);
    const payload = this.payload();
    writeFileSync(reportPath, JSON.stringify(payload, null, 2));
    return reportPath;
  }

  exportHtml(): string {
    mkdirSync(this.baseDir, { recursive: true });
    const reportPath = path.join(this.baseDir, `delta-force-doctor-${Date.now()}.html`);
    const payload = this.payload();
    writeFileSync(reportPath, `<!doctype html><html><head><meta charset="utf-8"><title>DeltaForceDoctor Report</title><style>body{font-family:Segoe UI;background:#07111f;color:#e2e8f0;padding:32px}pre{background:#0f172a;padding:16px;border-radius:12px;overflow:auto}</style></head><body><h1>DeltaForceDoctor Report</h1><p>Generated ${payload.generatedAt}</p><pre>${escapeHtml(JSON.stringify(payload, null, 2))}</pre></body></html>`);
    return reportPath;
  }

  private payload() {
    return {
      product: 'DeltaForceDoctor',
      generatedAt: new Date().toISOString(),
      scanHistory: this.db.prepare('SELECT * FROM scan_history ORDER BY created_at DESC LIMIT 20').all(),
      scannerResults: this.db.prepare('SELECT * FROM system_scan ORDER BY created_at DESC LIMIT 200').all(),
      eventLogs: this.db.prepare('SELECT * FROM event_logs ORDER BY time_created DESC LIMIT 100').all(),
      repairHistory: this.db.prepare('SELECT * FROM repair_history ORDER BY created_at DESC LIMIT 100').all()
    };
  }
}
function escapeHtml(value: string): string { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]!)); }
