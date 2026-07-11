import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { CoreEngine } from './core/engine.js';
import { RepairEngine } from './repair/engine.js';
import { ReportExporter } from './reports/exporter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
let db: Database.Database;
let core: CoreEngine;
let repairs: RepairEngine;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 760,
    title: 'DeltaForceDoctor',
    backgroundColor: '#07111f',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false }
  });
  if (isDev) void win.loadURL(process.env.VITE_DEV_SERVER_URL!);
  else void win.loadFile(path.join(__dirname, '../dist/index.html'));
}

function initializeDatabase() {
  const dataDir = path.join(app.getPath('userData'), 'database');
  mkdirSync(dataDir, { recursive: true });
  db = new Database(path.join(dataDir, 'delta-force-doctor.sqlite'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  const schemaPath = isDev ? path.join(process.cwd(), 'database/schema.sql') : path.join(process.resourcesPath, 'database/schema.sql');
  db.exec(readFileSync(schemaPath, 'utf8'));
  core = new CoreEngine(db);
  repairs = new RepairEngine(db);
}

ipcMain.handle('modules:list', () => core.modules());
ipcMain.handle('knowledge:list', () => core.knowledgeBase());
ipcMain.handle('scan:run', (_event, scannerId: string) => core.runScan(scannerId));
ipcMain.handle('scan:runAll', () => core.runAll());
ipcMain.handle('ocr:matchText', (_event, text: string) => core.matchOcrText(text));
ipcMain.handle('repair:list', () => repairs.list());
ipcMain.handle('repair:run', (_event, repairId: string) => repairs.run(repairId));
ipcMain.handle('report:export', async (_event, format: 'json' | 'html' = 'json') => {
  const exporter = new ReportExporter(db, path.join(app.getPath('documents'), 'DeltaForceDoctor', 'reports'));
  const reportPath = format === 'html' ? exporter.exportHtml() : exporter.exportJson();
  await shell.showItemInFolder(reportPath);
  return reportPath;
});

app.whenReady().then(() => { initializeDatabase(); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
