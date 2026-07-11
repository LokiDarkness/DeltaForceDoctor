import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('doctor', {
  listModules: () => ipcRenderer.invoke('modules:list'),
  runScan: (moduleId: string) => ipcRenderer.invoke('scan:run', moduleId),
  runAllScans: () => ipcRenderer.invoke('scan:runAll'),
  listKnowledge: () => ipcRenderer.invoke('knowledge:list'),
  matchOcrText: (text: string) => ipcRenderer.invoke('ocr:matchText', text),
  listRepairs: () => ipcRenderer.invoke('repair:list'),
  runRepair: (repairId: string) => ipcRenderer.invoke('repair:run', repairId),
  exportReport: (format: 'json' | 'html') => ipcRenderer.invoke('report:export', format)
});
