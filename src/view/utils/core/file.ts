/**
 * 文件操作核心工具函数
 * 整合了原有的文件相关功能
 */

import { runCmd } from '../command';
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
    return await safeFS.rm(filePath);
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
  try {
    // 如果路径包含通配符，提取基础目录路径
    let baseDir = dirPath;
    let targetExtension = extension;
    
    // 检查是否包含 *.ext 模式
    const wildcardMatch = dirPath.match(/^(.+)\*\.(.+)$/);
    if (wildcardMatch && wildcardMatch[1] && wildcardMatch[2]) {
      baseDir = wildcardMatch[1];
      targetExtension = '.' + wildcardMatch[2];
    }
    
    // 读取目录内容
    const returnStr = await safeFS.readdir(baseDir);
    const files = returnStr.filter(file => file.trim() !== '');
    
    console.log('读取到的文件:', files);
    
    // 根据扩展名过滤
    if (targetExtension) {
      return files.filter((file: string) => file.endsWith(targetExtension));
    }
    return files;
  } catch (error) {
    console.error('遍历文件失败:', error);
    return [];
  }
}

// 兼容性导出 - 保持原有函数名
export const parseJosnFile = readJSONFile;
export const writeJosnFile = writeJSONFile;
export const readHotPESetting = readHotPEConfig;
export const isFileExisted = fileExists;
export const delFiles = deleteFile;
export const reNameFile = renameFile;
export const makeDir = createDirectory;
