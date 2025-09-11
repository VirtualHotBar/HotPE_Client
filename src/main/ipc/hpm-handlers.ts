/**
 * HPM模块管理安全处理器
 * 负责处理HPM模块的安装、删除、启用、禁用等操作
 */

import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  validateFilePath
} from './security-utils';

// HPM信息接口
interface HPMInfo {
  fileName: string;
  size: number;
  name: string;
  maker: string;
  version: string;
  description: string;
  time: Date;
}

/**
 * 输入清理函数
 */
function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // 移除危险字符
  return input
    .replace(/[<>:"|?*\x00-\x1f]/g, '')
    .replace(/\.\.\//g, '')
    .replace(/\.\.\\/g, '')
    .trim();
}

/**
 * 验证文件名安全性
 */
function validateFileName(fileName: string): boolean {
  if (!fileName || typeof fileName !== 'string') {
    return false;
  }
  
  // 检查危险字符
  const dangerousChars = /[<>:"|?*\x00-\x1f]/;
  if (dangerousChars.test(fileName)) {
    return false;
  }
  
  // 检查保留名称
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  if (reservedNames.test(fileName.replace(/\.[^.]*$/, ''))) {
    return false;
  }
  
  return true;
}

/**
 * 安全获取HPM文件信息
 */
async function getHPMInfoLocal(hpmFilePath: string, hpmFileName: string): Promise<HPMInfo> {
  try {
    // 验证路径和文件名
    const validatedPath = validateFilePath(hpmFilePath);
    if (!validatedPath || !validateFileName(hpmFileName)) {
      throw new Error('Invalid path or filename');
    }

    const fullPath = path.join(validatedPath, hpmFileName);
    
    // 使用fs.stat获取文件信息（更安全）
    const stats = await fs.stat(fullPath);
    
    // 解析HPM文件名信息
    const hpmInfo = hpmFileName.split('_');
    let hpmData: HPMInfo;

    if (hpmInfo.length === 4) {
      hpmData = {
        fileName: hpmFileName,
        size: stats.size,
        name: sanitizeInput(hpmInfo[0] || ''),
        maker: sanitizeInput(hpmInfo[1] || ''),
        version: sanitizeInput(hpmInfo[2] || ''),
        description: sanitizeInput(hpmInfo[3]?.replace(/\.[^/.]+$/, '') || ''),
        time: stats.mtime,
      };
    } else {
      // 格式不规范的处理
      hpmData = {
        fileName: hpmFileName,
        size: stats.size,
        name: sanitizeInput(hpmInfo[0] || '未知'),
        maker: '获取失败',
        version: '获取失败',
        description: '获取失败',
        time: stats.mtime,
      };
    }

    return hpmData;
  } catch (error) {
    console.error('获取HPM文件信息失败:', error);
    
    // 返回安全的默认信息
    const hpmInfo = hpmFileName.split('_');
    return {
      fileName: hpmFileName,
      size: 0,
      name: sanitizeInput(hpmInfo[0] || '未知'),
      maker: '获取失败',
      version: '获取失败',
      description: '获取失败',
      time: new Date(),
    };
  }
}

/**
 * 安全获取HPM文件列表
 */
async function getHPMFilesList(hpmDirPath: string, extension: string): Promise<string[]> {
  try {
    const validatedPath = validateFilePath(hpmDirPath);
    if (!validatedPath) {
      throw new Error('Invalid HPM directory path');
    }

    // 确保目录存在
    await fs.access(validatedPath);
    
    const files = await fs.readdir(validatedPath);
    return files.filter(file => file.toLowerCase().endsWith(extension.toLowerCase()));
  } catch (error) {
    console.error('获取HPM文件列表失败:', error);
    return [];
  }
}

/**
 * 安全删除HPM文件
 */
async function deleteHPMFile(hpmDirPath: string, fileName: string): Promise<boolean> {
  try {
    const validatedPath = validateFilePath(hpmDirPath);
    if (!validatedPath || !validateFileName(fileName)) {
      throw new Error('Invalid path or filename');
    }

    const fullPath = path.join(validatedPath, fileName);
    
    // 验证文件确实在HPM目录中
    const resolvedPath = path.resolve(fullPath);
    const resolvedDir = path.resolve(validatedPath);
    
    if (!resolvedPath.startsWith(resolvedDir)) {
      throw new Error('Path traversal attempt detected');
    }

    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('删除HPM文件失败:', error);
    return false;
  }
}

/**
 * 安全重命名HPM文件（用于启用/禁用）
 */
async function renameHPMFile(hpmDirPath: string, oldName: string, newName: string): Promise<boolean> {
  try {
    const validatedPath = validateFilePath(hpmDirPath);
    if (!validatedPath || !validateFileName(oldName) || !validateFileName(newName)) {
      throw new Error('Invalid path or filename');
    }

    const oldPath = path.join(validatedPath, oldName);
    const newPath = path.join(validatedPath, newName);
    
    // 验证路径安全性
    const resolvedOldPath = path.resolve(oldPath);
    const resolvedNewPath = path.resolve(newPath);
    const resolvedDir = path.resolve(validatedPath);
    
    if (!resolvedOldPath.startsWith(resolvedDir) || !resolvedNewPath.startsWith(resolvedDir)) {
      throw new Error('Path traversal attempt detected');
    }

    await fs.rename(oldPath, newPath);
    return true;
  } catch (error) {
    console.error('重命名HPM文件失败:', error);
    return false;
  }
}

/**
 * 检查文件是否存在
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    const validatedPath = validateFilePath(filePath);
    if (!validatedPath) {
      return false;
    }
    
    await fs.access(validatedPath);
    return true;
  } catch {
    return false;
  }
}

// 注册IPC处理器
export function registerHPMHandlers() {
  // 获取HPM文件信息
  ipcMain.handle('hpm:getInfo', async (_event, hpmFilePath: string, hpmFileName: string) => {
    return await getHPMInfoLocal(hpmFilePath, hpmFileName);
  });

  // 获取本地HPM文件列表
  ipcMain.handle('hpm:getFilesList', async (_event, hpmDirPath: string, extension: string = '.hpm') => {
    return await getHPMFilesList(hpmDirPath, extension);
  });

  // 删除HPM文件
  ipcMain.handle('hpm:deleteFile', async (_event, hpmDirPath: string, fileName: string) => {
    return await deleteHPMFile(hpmDirPath, fileName);
  });

  // 禁用HPM模块（重命名为.off）
  ipcMain.handle('hpm:disable', async (_event, hpmDirPath: string, fileName: string) => {
    if (fileName.toLowerCase().endsWith('.off')) {
      return true; // 已经禁用
    }
    return await renameHPMFile(hpmDirPath, fileName, `${fileName}.off`);
  });

  // 启用HPM模块（移除.off后缀）
  ipcMain.handle('hpm:enable', async (_event, hpmDirPath: string, fileName: string) => {
    if (!fileName.toLowerCase().endsWith('.off')) {
      return true; // 已经启用
    }
    const newName = fileName.substring(0, fileName.length - 4);
    return await renameHPMFile(hpmDirPath, fileName, newName);
  });

  // 检查文件是否存在
  ipcMain.handle('hpm:fileExists', async (_event, filePath: string) => {
    return await checkFileExists(filePath);
  });

  // 检查HPM目录是否准备就绪
  ipcMain.handle('hpm:checkReady', async (_event, hpmDirPath: string) => {
    try {
      const validatedPath = validateFilePath(hpmDirPath);
      if (!validatedPath) {
        return false;
      }
      
      await fs.access(validatedPath);
      return true;
    } catch {
      return false;
    }
  });
}