/**
 * Preload 脚本 - 提供安全的 IPC 通信接口
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { CommandOutput, CommandResult } from '../types/command';

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

// 定义 API 接口类型
interface ElectronAPI {
  windows: {
    minimize: () => void;
    openDevTools: () => void;
    exit: () => void;
  };
  fs: {
    readFile: (filePath: string, encoding?: string) => Promise<string>;
    writeFile: (filePath: string, data: string, encoding?: string) => Promise<boolean>;
    exists: (filePath: string) => Promise<boolean>;
    access: (filePath: string) => Promise<boolean>;
    mkdir: (dirPath: string, options?: MkdirOptions) => Promise<boolean>;
    copyFile: (src: string, dest: string) => Promise<boolean>;
    cp: (src: string, dest: string, options?: CpOptions) => Promise<boolean>;
    rename: (oldPath: string, newPath: string) => Promise<boolean>;
  };
  cmd: {
    spawn: (command: string) => Promise<CommandResult>;
    onOutput: (callback: (output: CommandOutput) => void) => void;
    removeOutputListener: () => void;
  };
  path: {
    join: (...paths: string[]) => Promise<string>;
    basename: (filePath: string) => Promise<string>;
    dirname: (filePath: string) => Promise<string>;
    extname: (filePath: string) => Promise<string>;
  };
  dialog: {
    getSavePath: (defaultPath: string) => string | undefined;
    getOpenPath: (defaultPath: string) => string[] | undefined;
  };
}

// 实现 API
const electronAPI: ElectronAPI = {
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
};

// 暴露 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
