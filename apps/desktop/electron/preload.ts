import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('doctor', {
  runScan: (moduleId: string) => ipcRenderer.invoke('scan:run', moduleId),
  exportReport: () => ipcRenderer.invoke('report:export')
});
