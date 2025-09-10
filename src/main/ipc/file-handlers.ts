/**
 * 文件系统相关IPC处理器
 */

import { ipcMain } from 'electron';
import fs from 'fs';

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

export function setupFileHandlers(): void {
  // 读取文件
  ipcMain.handle('fs:readFile', async (_, filePath: string, encoding?: BufferEncoding) => {
    try {
      return fs.readFileSync(filePath, encoding || 'utf8');
    } catch (error) {
      throw new Error(`读取文件失败: ${error}`);
    }
  });

  // 写入文件
  ipcMain.handle('fs:writeFile', async (_, filePath: string, data: string, encoding?: BufferEncoding) => {
    try {
      fs.writeFileSync(filePath, data, { encoding: encoding || 'utf8' });
      return true;
    } catch (error) {
      throw new Error(`写入文件失败: ${error}`);
    }
  });

  // 检查文件是否存在
  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    return fs.existsSync(filePath);
  });

  // 检查文件访问权限
  ipcMain.handle('fs:access', async (_, filePath: string) => {
    return new Promise<boolean>((resolve) => {
      fs.access(filePath, (err) => {
        resolve(!err);
      });
    });
  });

  // 创建目录
  ipcMain.handle('fs:mkdir', async (_, dirPath: string, options?: MkdirOptions) => {
    try {
      fs.mkdirSync(dirPath, options || { recursive: true });
      return true;
    } catch (error) {
      throw new Error(`创建目录失败: ${error}`);
    }
  });

  // 复制文件
  ipcMain.handle('fs:copyFile', async (_, src: string, dest: string) => {
    return new Promise<boolean>((resolve, reject) => {
      fs.copyFile(src, dest, (err) => {
        if (err) {
          reject(new Error(`复制文件失败: ${err}`));
        } else {
          resolve(true);
        }
      });
    });
  });

  // 复制文件或目录
  ipcMain.handle('fs:cp', async (_, src: string, dest: string, options?: CpOptions) => {
    return new Promise<boolean>((resolve, reject) => {
      fs.cp(src, dest, options || {}, (err) => {
        if (err) {
          reject(new Error(`复制失败: ${err}`));
        } else {
          resolve(true);
        }
      });
    });
  });

  // 重命名文件
  ipcMain.handle('fs:rename', async (_, oldPath: string, newPath: string) => {
    return new Promise<boolean>((resolve, reject) => {
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          reject(new Error(`重命名失败: ${err}`));
        } else {
          resolve(true);
        }
      });
    });
  });
}