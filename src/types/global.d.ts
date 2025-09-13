/**
 * 全局类型定义
 */

import { MkdirOptions, CpOptions } from './fs-types';
import { CommandOutput, CommandResult } from './command';

// Electron API 类型定义
interface ElectronAPI {
  // 通用IPC调用方法
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  
  // 事件监听方法
  on: (channel: string, callback: (...args: any[]) => void) => void;
  removeListener: (channel: string, callback: (...args: any[]) => void) => void;
  removeAllListeners: (channel: string) => void;

  // 窗口控制
  windows: {
    minimize: () => void;
    openDevTools: () => void;
    exit: () => void;
  };

  // 文件系统操作
  fs: {
    readFile: (filePath: string, encoding?: string) => Promise<string>;
    writeFile: (filePath: string, data: string, encoding?: string) => Promise<boolean>;
    exists: (filePath: string) => Promise<boolean>;
    access: (filePath: string) => Promise<boolean>;
    mkdir: (dirPath: string, options?: MkdirOptions) => Promise<boolean>;
    copyFile: (src: string, dest: string) => Promise<boolean>;
    cp: (src: string, dest: string, options?: CpOptions) => Promise<boolean>;
    rename: (oldPath: string, newPath: string) => Promise<boolean>;
    rm: (path: string, options?: { force?: boolean }) => Promise<boolean>;
  };

  // 命令执行
  cmd: {
    spawn: (command: string) => Promise<CommandResult>;
    onOutput: (callback: (output: CommandOutput) => void) => void;
    removeOutputListener: () => void;
  };

  // 路径操作
  path: {
    join: (...paths: string[]) => Promise<string>;
    basename: (filePath: string) => Promise<string>;
    dirname: (filePath: string) => Promise<string>;
    extname: (filePath: string) => Promise<string>;
  };

  // 文件对话框
  dialog: {
    getSavePath: (defaultPath: string) => string | undefined;
    getOpenPath: (defaultPath: string) => string[] | undefined;
  };

  // 硬件信息（新增）
  hardware: {
    getInfo: (parameter: string) => Promise<any>;
  };

  isDev: boolean;
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// 导出空对象以使此文件成为模块
export {ElectronAPI};
