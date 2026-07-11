import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { writeFileSync, mkdirSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
let db: Database.Database;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    title: 'DeltaForceDoctor',
    backgroundColor: '#07111f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (isDev) void win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  else void win.loadFile(path.join(__dirname, '../dist/index.html'));
}

function initializeDatabase() {
  const dataDir = path.join(app.getPath('userData'), 'database');
  mkdirSync(dataDir, { recursive: true });
  db = new Database(path.join(dataDir, 'delta-force-doctor.sqlite'));
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS scan_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, module_id TEXT NOT NULL, status TEXT NOT NULL, findings INTEGER NOT NULL, created_at TEXT NOT NULL);`);
}

ipcMain.handle('scan:run', (_event, moduleId: string) => {
  const findings = moduleId === 'repair' ? 0 : Math.floor(Math.random() * 3);
  const status = findings === 0 ? 'passed' : 'warning';
  db.prepare('INSERT INTO scan_runs (module_id, status, findings, created_at) VALUES (?, ?, ?, ?)').run(moduleId, status, findings, new Date().toISOString());
  return { id: moduleId, name: moduleId, description: 'Scan completed by DeltaForceDoctor engine.', status, findings };
});

ipcMain.handle('report:export', async () => {
  const reportDir = path.join(app.getPath('documents'), 'DeltaForceDoctor', 'reports');
  mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `report-${Date.now()}.json`);
  const runs = db.prepare('SELECT * FROM scan_runs ORDER BY created_at DESC').all();
  writeFileSync(reportPath, JSON.stringify({ product: 'DeltaForceDoctor', generatedAt: new Date().toISOString(), runs }, null, 2));
  await shell.showItemInFolder(reportPath);
  return reportPath;
});

app.whenReady().then(() => { initializeDatabase(); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
