import { ipcMain } from 'electron';
import { IpcChannels } from '../../shared/constants/ipc.js';
import type { CoreEngineApi, Logger } from '../../shared/interfaces/services.js';

export class IpcManager {
  constructor(private readonly core: CoreEngineApi, private readonly logger: Logger) {}

  register(): void {
    ipcMain.handle(IpcChannels.modulesList, () => this.core.modules());
    ipcMain.handle(IpcChannels.knowledgeList, () => this.core.knowledgeBase());
    ipcMain.handle(IpcChannels.scanRun, (_event, scannerId: string) => this.core.runScan(scannerId));
    ipcMain.handle(IpcChannels.scanRunAll, () => this.core.runAll());
    ipcMain.handle(IpcChannels.ocrMatchText, (_event, text: string) => this.core.matchOcrText(text));
    ipcMain.handle(IpcChannels.repairList, () => this.core.listRepairs());
    ipcMain.handle(IpcChannels.repairRun, (_event, repairId: string) => this.core.runRepair(repairId));
    ipcMain.handle(IpcChannels.reportExport, (_event, format: 'json' | 'html' = 'json') => this.core.exportReport(format));
    this.logger.info('IPC handlers registered');
  }
}
