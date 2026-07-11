import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CoreEngine } from './core/engine.js';
import { IpcManager } from './core/ipc/ipc-manager.js';
import { LoggerService } from './core/logger/logger-service.js';
import { ElectronConfigurationManager } from './core/rules/configuration-manager.js';
import { SQLiteService } from './services/sqlite/sqlite-service.js';
import { PowerShellService } from './services/powershell/powershell-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
let sqlite: SQLiteService;

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

function initializeApplication() {
  const config = new ElectronConfigurationManager(isDev);
  const logger = new LoggerService(config.getPath('logs'));
  sqlite = new SQLiteService(config, logger);
  const powerShell = new PowerShellService(logger);
  const core = new CoreEngine({ db: sqlite.connection(), powerShell, logger, config });
  new IpcManager(core, logger).register();
}

app.whenReady().then(() => { initializeApplication(); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => sqlite?.close());
