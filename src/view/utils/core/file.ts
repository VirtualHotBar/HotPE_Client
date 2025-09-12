/**
 * 文件操作核心工具函数
 * 整合了原有的文件相关功能
 */

import { safeFS } from '../safeAPI';
import ini from 'ini';

/**
 * 读取 JSON 文件
 */
export async function readJSONFile<T = any>(filePath: string): Promise<T> {
  const content = await safeFS.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * 写入 JSON 文件
 */
export async function writeJSONFile(filePath: string, data: any): Promise<boolean> {
  const content = JSON.stringify(data, null, 2);
  return await safeFS.writeFile(filePath, content, 'utf8');
}

/**
 * 读取 HotPE 配置文件
 */
export async function readHotPEConfig(drive: string): Promise<any> {
  const configPath = `${drive}:\\HotPE\\HotPE.ini`;
  const content = await safeFS.readFile(configPath, 'utf8');
  return ini.parse(content);
}

/**
 * 写入 HotPE 配置文件
 */
export async function writeHotPEConfig(drive: string, config: any): Promise<boolean> {
  const configPath = `${drive}:\\HotPE\\HotPE.ini`;
  const content = ini.stringify(config);
  return await safeFS.writeFile(configPath, content, 'utf8');
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return await safeFS.exists(filePath);
  } catch {
    return false;
  }
}

/**
 * 删除文件
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  const exists = await safeFS.exists(filePath);
  if (exists) {
    // 使用现有的 IPC 方法删除文件
    return await window.electronAPI.invoke('fs:deleteFile', filePath);
  }
  return false;
}

/**
 * 重命名文件
 */
export async function renameFile(oldPath: string, newPath: string): Promise<boolean> {
  return await safeFS.rename(oldPath, newPath);
}

/**
 * 创建目录
 */
export async function createDirectory(dirPath: string): Promise<boolean> {
  return await safeFS.mkdir(dirPath, { recursive: true });
}

/**
 * 遍历目录文件
 */
export async function traverseFiles(dirPath: string, extension?: string): Promise<string[]> {
  // 使用现有的命令行方式读取目录
  const { runCmdAsync } = await import('../command');
  const returnStr = await runCmdAsync(`dir "${dirPath}" /b`);
  const files = returnStr.split('\n').filter(file => file.trim() !== '');
  
  if (extension) {
    return files.filter((file: string) => file.endsWith(extension));
  }
  return files;
}

// 兼容性导出 - 保持原有函数名
export const parseJosnFile = readJSONFile;
export const writeJosnFile = writeJSONFile;
export const readHotPESetting = readHotPEConfig;
export const isFileExisted = fileExists;
export const delFiles = deleteFile;
export const reNameFile = renameFile;
export const makeDir = createDirectory;