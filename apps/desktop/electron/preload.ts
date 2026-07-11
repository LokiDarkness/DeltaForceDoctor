import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from './shared/constants/ipc.js';

contextBridge.exposeInMainWorld('doctor', {
  listModules: () => ipcRenderer.invoke(IpcChannels.modulesList),
  runScan: (moduleId: string) => ipcRenderer.invoke(IpcChannels.scanRun, moduleId),
  runAllScans: () => ipcRenderer.invoke(IpcChannels.scanRunAll),
  listKnowledge: () => ipcRenderer.invoke(IpcChannels.knowledgeList),
  matchOcrText: (text: string) => ipcRenderer.invoke(IpcChannels.ocrMatchText, text),
  listRepairs: () => ipcRenderer.invoke(IpcChannels.repairList),
  runRepair: (repairId: string) => ipcRenderer.invoke(IpcChannels.repairRun, repairId),
  exportReport: (format: 'json' | 'html') => ipcRenderer.invoke(IpcChannels.reportExport, format)
});
