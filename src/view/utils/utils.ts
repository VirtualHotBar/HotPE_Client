/**
 * 优化后的工具函数集合
 * 移除重复代码，统一接口风格
 */

import { createLogger } from '../services/logger';
import { safeFS } from './safeAPI';
import { runCmd } from './command';
import { dealStrForCmd } from './core/string';

const logger = createLogger('Utils');

/**
 * 文件压缩解压工具
 */
export class ArchiveUtils {
  // 在渲染进程中，我们不能直接使用 process.cwd()
  // 这个路径应该通过 IPC 从主进程获取，或者使用相对路径
  private static readonly SEVEN_ZIP_PATH = `resources\\tools\\7z\\7z.exe`;

  /**
   * 解压文件
   */
  static async unzip(filePath: string, toPath: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const cmd = `${ArchiveUtils.SEVEN_ZIP_PATH} x -y ${dealStrForCmd(filePath)} -o${dealStrForCmd(toPath)}`;
        
        const t = await runCmd(
          cmd,
          (data: string) => {
            logger.debug('解压进度', 'unzip', data);
          },
          (code: number) => {
            logger.info('解压完成', 'unzip', { filePath, toPath, code});
            resolve(code === 0);
          }
        );

        console.log(t);
        
      } catch (error) {
        logger.error('解压失败', 'unzip', { error, filePath, toPath });
        resolve(false);
      }
    });
  }

  /**
   * 压缩文件
   */
  static async zip(sourcePath: string, targetPath: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const cmd = `${ArchiveUtils.SEVEN_ZIP_PATH} a -y "${dealStrForCmd(targetPath)}" "${dealStrForCmd(sourcePath)}"`;
        
        runCmd(
          cmd,
          (data: string) => {
            logger.debug('压缩进度', 'zip', data);
          },
          () => {
            logger.info('压缩完成', 'zip', { sourcePath, targetPath });
            resolve(true);
          }
        );
      } catch (error) {
        logger.error('压缩失败', 'zip', { error, sourcePath, targetPath });
        resolve(false);
      }
    });
  }
}

/**
 * 文件操作工具
 */
export class FileUtils {
  /**
   * 复制文件
   */
  static async copyFile(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      await safeFS.copyFile(sourcePath, targetPath);
      logger.info('文件复制成功', 'copyFile', { sourcePath, targetPath });
      return true;
    } catch (error) {
      logger.error('文件复制失败', 'copyFile', { error, sourcePath, targetPath });
      return false;
    }
  }

  /**
   * 复制目录
   */
  static async copyDirectory(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      await safeFS.cp(sourcePath, targetPath, { recursive: true });
      logger.info('目录复制成功', 'copyDirectory', { sourcePath, targetPath });
      return true;
    } catch (error) {
      logger.error('目录复制失败', 'copyDirectory', { error, sourcePath, targetPath });
      return false;
    }
  }

  /**
   * 删除文件或目录
   */
  static async remove(path: string): Promise<boolean> {
    try {
      await safeFS.rm(path, {  force: true });
      logger.info('删除成功', 'remove', { path });
      return true;
    } catch (error) {
      logger.error('删除失败', 'remove', { error, path });
      return false;
    }
  }

  /**
   * 移动/重命名文件
   */
  static async move(sourcePath: string, targetPath: string): Promise<boolean> {
    try {
      await safeFS.rename(sourcePath, targetPath);
      logger.info('移动成功', 'move', { sourcePath, targetPath });
      return true;
    } catch (error) {
      logger.error('移动失败', 'move', { error, sourcePath, targetPath });
      return false;
    }
  }

  /**
   * 检查文件是否存在
   */
  static async exists(path: string): Promise<boolean> {
    try {
      await safeFS.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 创建目录
   */
  static async createDirectory(path: string): Promise<boolean> {
    try {
      await safeFS.mkdir(path, { recursive: true });
      logger.info('目录创建成功', 'createDirectory', { path });
      return true;
    } catch (error) {
      logger.error('目录创建失败', 'createDirectory', { error, path });
      return false;
    }
  }
}

export const isDev=()=>{
  return window.electronAPI.isDev
}

/**
 * 向后兼容的函数映射
 * 保持原有API不变，内部使用优化后的实现
 */
export const unzip7z = ArchiveUtils.unzip;

export const unZipFile = unzip7z;

export const copyFile = (path: string, toPath: string) => {
  FileUtils.copyFile(path, toPath);
};

export const copyDir = FileUtils.copyDirectory;

export const delDir = async (dirPath: string) => {
  return await FileUtils.remove(dirPath);
};
