import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('doctor', {
  listModules: () => ipcRenderer.invoke('modules:list'),
  runScan: (moduleId: string) => ipcRenderer.invoke('scan:run', moduleId),
  runAllScans: () => ipcRenderer.invoke('scan:runAll'),
  runScanReport: () => ipcRenderer.invoke('scan:report'),
  listKnowledge: () => ipcRenderer.invoke('knowledge:list'),
  matchOcrText: (text: string) => ipcRenderer.invoke('ocr:matchText', text),
  listRepairs: () => ipcRenderer.invoke('repair:list'),
  runRepair: (repairId: string) => ipcRenderer.invoke('repair:run', repairId),
  exportReport: (format: 'json' | 'html') => ipcRenderer.invoke('report:export', format)
});
