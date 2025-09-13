/**
 * Preload 脚本 - 提供安全的 IPC 通信接口
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { CommandOutput, CommandResult } from '../types/command';
import type { ElectronAPI } from '../types/global';

// 文件系统操作类型
interface MkdirOptions {
  recursive?: boolean;
  mode?: string | number;
}

interface CpOptions {
  recursive?: boolean;
  force?: boolean;
  preserveTimestamps?: boolean;
}



// 实现 API
const electronAPI: ElectronAPI = {
  // 通用IPC调用方法
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  
  // 事件监听方法
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, callback);
  },
  
  // 移除事件监听器
  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // 移除所有监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // 窗口控制
  windows: {
    minimize: () => ipcRenderer.send('windows:mini'),
    openDevTools: () => ipcRenderer.send('windows:openDevTools'),
    exit: () => ipcRenderer.send('exitapp'),
  },

  // 文件系统操作
  fs: {
    readFile: (filePath: string, encoding?: string) =>
      ipcRenderer.invoke('fs:readFile', filePath, encoding),
    writeFile: (filePath: string, data: string, encoding?: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, data, encoding),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    access: (filePath: string) => ipcRenderer.invoke('fs:access', filePath),
    mkdir: (dirPath: string, options?: MkdirOptions) =>
      ipcRenderer.invoke('fs:mkdir', dirPath, options),
    copyFile: (src: string, dest: string) => ipcRenderer.invoke('fs:copyFile', src, dest),
    cp: (src: string, dest: string, options?: CpOptions) =>
      ipcRenderer.invoke('fs:cp', src, dest, options),
    rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
  rm: (path: string, options?: { force?: boolean }) => ipcRenderer.invoke('fs:rm', path, options),
  },

  // 命令执行
  cmd: {
    spawn: (command: string) => ipcRenderer.invoke('cmd:spawn', command),
    onOutput: (callback: (output: CommandOutput) => void) => {
      ipcRenderer.on('cmd:output', (_, output: CommandOutput) => callback(output));
    },
    removeOutputListener: () => {
      ipcRenderer.removeAllListeners('cmd:output');
    },
  },

  // 路径操作
  path: {
    join: (...paths: string[]) => ipcRenderer.invoke('path:join', ...paths),
    basename: (filePath: string) => ipcRenderer.invoke('path:basename', filePath),
    dirname: (filePath: string) => ipcRenderer.invoke('path:dirname', filePath),
    extname: (filePath: string) => ipcRenderer.invoke('path:extname', filePath),
  },

  // 对话框
  dialog: {
    getSavePath: (defaultPath: string) => ipcRenderer.sendSync('file:getSavePath', defaultPath),
    getOpenPath: (defaultPath: string) => ipcRenderer.sendSync('file:getOpenPath', defaultPath),
  },

  // 硬件信息
  hardware: {
    getInfo: (parameter: string) => ipcRenderer.invoke('hardware:getInfo', parameter),
  },

  isDev: ipcRenderer.sendSync('isDev') as boolean,
};

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
