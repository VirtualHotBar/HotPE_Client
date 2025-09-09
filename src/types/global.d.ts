/**
 * 全局类型定义
 */

// Electron API 类型定义
interface ElectronAPI {
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
    mkdir: (dirPath: string, options?: any) => Promise<boolean>;
    copyFile: (src: string, dest: string) => Promise<boolean>;
    cp: (src: string, dest: string, options?: any) => Promise<boolean>;
    rename: (oldPath: string, newPath: string) => Promise<boolean>;
  };

  // 命令执行
  cmd: {
    execSync: (command: string) => Promise<string>;
    spawn: (command: string) => Promise<{
      success: boolean;
      output: string;
      code: number;
    }>;
    onOutput: (callback: (data: string) => void) => void;
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
}

// 扩展 Window 接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// 导出空对象以使此文件成为模块
export {};