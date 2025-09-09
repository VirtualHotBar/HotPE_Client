import { contextBridge, ipcRenderer } from 'electron';

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 窗口控制
  exitApp: () => ipcRenderer.send('exitapp'),
  minimizeWindow: () => ipcRenderer.send('windows:mini'),
  openDevTools: () => ipcRenderer.send('windows:openDevTools'),
  
  // 文件对话框
  getSavePath: (defaultPath: string) => ipcRenderer.sendSync('file:getSavePath', defaultPath),
  getOpenPath: (defaultPath: string) => ipcRenderer.sendSync('file:getOpenPath', defaultPath),
});

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      exitApp: () => void;
      minimizeWindow: () => void;
      openDevTools: () => void;
      getSavePath: (defaultPath: string) => string | undefined;
      getOpenPath: (defaultPath: string) => string[] | undefined;
    };
  }
}