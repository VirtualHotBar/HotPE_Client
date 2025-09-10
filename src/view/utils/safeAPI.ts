/**
 * 安全的 API 封装，替换 window.require 的不安全操作
 * 所有操作都通过主进程的 IPC 通信完成
 */

import { MkdirOptions, CpOptions, SpawnResult, ErrorCallback } from '../types/fs-types';

// 文件系统操作
export const safeFS = {
  /**
   * 同步读取文件
   */
  readFileSync: async (filePath: string, encoding?: string): Promise<string> => {
    return await window.electronAPI.fs.readFile(filePath, encoding);
  },

  /**
   * 同步写入文件
   */
  writeFileSync: async (filePath: string, data: string, encoding?: string): Promise<boolean> => {
    return await window.electronAPI.fs.writeFile(filePath, data, encoding);
  },

  /**
   * 检查文件是否存在
   */
  existsSync: async (filePath: string): Promise<boolean> => {
    return await window.electronAPI.fs.exists(filePath);
  },

  /**
   * 异步检查文件访问权限
   */
  access: async (filePath: string): Promise<boolean> => {
    return await window.electronAPI.fs.access(filePath);
  },

  /**
   * 创建目录
   */
  mkdirSync: async (dirPath: string, options?: MkdirOptions): Promise<boolean> => {
    return await window.electronAPI.fs.mkdir(dirPath, options);
  },

  /**
   * 复制文件
   */
  copyFile: async (src: string, dest: string): Promise<boolean> => {
    return await window.electronAPI.fs.copyFile(src, dest);
  },

  /**
   * 复制文件或目录
   */
  cp: async (src: string, dest: string, options?: CpOptions): Promise<boolean> => {
    return await window.electronAPI.fs.cp(src, dest, options);
  },

  /**
   * 重命名文件
   */
  rename: async (oldPath: string, newPath: string): Promise<boolean> => {
    return await window.electronAPI.fs.rename(oldPath, newPath);
  },
};

// 命令执行操作
export const safeChildProcess = {
  /**
   * 同步执行命令
   */
  execSync: async (command: string): Promise<string> => {
    return await window.electronAPI.cmd.execSync(command);
  },

  /**
   * 异步执行命令，支持实时输出
   */
  spawn: async (command: string): Promise<SpawnResult> => {
    return await window.electronAPI.cmd.spawn(command);
  },

  /**
   * 监听命令输出
   */
  onOutput: (callback: (data: string) => void): void => {
    window.electronAPI.cmd.onOutput(callback);
  },

  /**
   * 移除输出监听器
   */
  removeOutputListener: (): void => {
    window.electronAPI.cmd.removeOutputListener();
  },
};

// Path 操作
export const safePath = {
  /**
   * 连接路径
   */
  join: async (...paths: string[]): Promise<string> => {
    return await window.electronAPI.path.join(...paths);
  },

  /**
   * 获取文件名
   */
  basename: async (filePath: string): Promise<string> => {
    return await window.electronAPI.path.basename(filePath);
  },

  /**
   * 获取目录名
   */
  dirname: async (filePath: string): Promise<string> => {
    return await window.electronAPI.path.dirname(filePath);
  },

  /**
   * 获取文件扩展名
   */
  extname: async (filePath: string): Promise<string> => {
    return await window.electronAPI.path.extname(filePath);
  },
};

// 兼容性封装，模拟原有的同步 API
export const compatFS = {
  readFileSync: (filePath: string, encoding?: string): Promise<string> => {
    return safeFS.readFileSync(filePath, encoding);
  },

  writeFileSync: (filePath: string, data: string, encoding?: string): Promise<boolean> => {
    return safeFS.writeFileSync(filePath, data, encoding);
  },

  existsSync: (filePath: string): Promise<boolean> => {
    return safeFS.existsSync(filePath);
  },

  access: (filePath: string, callback: ErrorCallback): void => {
    safeFS.access(filePath).then(
      exists => callback(exists ? null : new Error('File not accessible')),
      error => callback(error)
    );
  },

  mkdirSync: (dirPath: string, options?: MkdirOptions): Promise<boolean> => {
    return safeFS.mkdirSync(dirPath, options);
  },

  copyFile: (src: string, dest: string, callback: ErrorCallback): void => {
    safeFS.copyFile(src, dest).then(
      () => callback(null),
      error => callback(error)
    );
  },

  cp: (src: string, dest: string, options: CpOptions, callback: ErrorCallback): void => {
    safeFS.cp(src, dest, options).then(
      () => callback(null),
      error => callback(error)
    );
  },

  rename: (oldPath: string, newPath: string, callback: ErrorCallback): void => {
    safeFS.rename(oldPath, newPath).then(
      () => callback(null),
      error => callback(error)
    );
  },
};

export const compatChildProcess = {
  execSync: (command: string): Promise<string> => {
    return safeChildProcess.execSync(command);
  },

  spawn: (
    shell: string,
    args: string[]
  ): {
    stdout: { on: (event: string, callback: (data: Buffer) => void) => void };
    stderr: { on: (event: string, callback: (data: Buffer) => void) => void };
    on: (event: string, callback: (code: number) => void) => void;
  } => {
    const command = `${shell} ${args.join(' ')}`;
    let outputCallback: ((data: string) => void) | null = null;
    let exitCallback: ((code: number) => void) | null = null;

    // 启动命令执行
    safeChildProcess.spawn(command).then(result => {
      if (exitCallback) {
        exitCallback(result.code);
      }
    });

    // 设置输出监听
    safeChildProcess.onOutput((data: string) => {
      if (outputCallback) {
        outputCallback(data);
      }
    });

    return {
      stdout: {
        on: (event: string, callback: (data: Buffer) => void) => {
          if (event === 'data') {
            outputCallback = (data: string) => callback(Buffer.from(data));
          }
        },
      },
      stderr: {
        on: (_event: string, _callback: (data: Buffer) => void) => {
          // errorCallback is not used in current implementation
        },
      },
      on: (event: string, callback: (code: number) => void) => {
        if (event === 'exit') {
          exitCallback = callback;
        }
      },
    };
  },
};

export const compatPath = {
  join: (...paths: string[]): Promise<string> => {
    return safePath.join(...paths);
  },

  basename: (filePath: string): Promise<string> => {
    return safePath.basename(filePath);
  },
};
