/**
 * 工具函数 - 重构后的版本
 * 大部分功能已迁移到 core 模块，此文件保持向后兼容
 */

// 重新导出所有工具函数，保持向后兼容
export * from './index';

// 保持原有的导入方式兼容性
import { 
  readJSONFile,
  writeJSONFile,
  readHotPEConfig as readHotPEConfigCore,
  writeHotPEConfig as writeHotPEConfigCore,
  fileExists,
  deleteFile,
  renameFile,
  createDirectory,
  traverseFiles as traverseFilesCore,
} from './core/file';

import {
  isJSON as isJSONCore,
  takeLeftStr,
  takeRightStr,
  takeMidStr,
  dealStrForCmd,
  filterArrayNull,
  formatFileSize,
  formatTime,
  generateUUID,
} from './core/string';

import {
  delay,
  debounce,
  throttle,
  retry,
  deepClone,
  isEmpty,
  safeGet,
  typeGuards,
  isHotPEDrive as isHotPEDriveCore
} from './core/system';

import { safeFS } from './safeAPI';
import { runCmd } from './command';

// 兼容性函数 - 保持原有的函数签名
export async function parseJosnFile(path: string) {
  const result = await readJSONFile(path);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

export async function writeJosnFile(path: string, jsonData: object) {
  const result = await writeJSONFile(path, jsonData);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

export function isJSON(str: string) {
  return isJSONCore(str);
}

export async function readHotPEConfig(drive: string) {
  const result = await readHotPEConfigCore(drive);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

export async function writeHotPEConfig(drive: string, obj: object) {
  const result = await writeHotPEConfigCore(drive, obj);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

export async function readHotPESetting(drive: string) {
  return await readHotPEConfig(drive);
}

export async function isFileExisted(filePath: string) {
  return await fileExists(filePath);
}

export async function delFiles(filePath: string) {
  const result = await deleteFile(filePath);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

export async function reNameFile(oldPath: string, newPath: string) {
  const result = await renameFile(oldPath, newPath);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

export async function makeDir(dirPath: string) {
  const result = await createDirectory(dirPath);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

export async function isHotPEDrive(drive: string) {
  return await isHotPEDriveCore(drive);
}

export async function traverseFiles(path: string) {
  const result = await traverseFilesCore(path);
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message);
}

// 重新导出其他函数
export {
  takeLeftStr,
  takeRightStr,
  takeMidStr,
  dealStrForCmd,
  filterArrayNull,
  formatFileSize,
  formatTime,
  generateUUID,
  delay,
  debounce,
  throttle,
  retry,
  deepClone,
  isEmpty,
  safeGet,
  typeGuards
};

// 保留一些原有的实现以避免循环依赖
export function unzip7z(filePath: string, toPath: string, callback: Function) {
  try {
    const cmd = `"${process.cwd()}\\resources\\tools\\7z\\7z.exe" x -y "${dealStrForCmd(
      filePath
    )}" -o"${dealStrForCmd(toPath)}"`;

    runCmd(
      cmd,
      (data: string) => {
        callback(data);
      },
      () => {
        callback('解压完成');
      }
    );
  } catch (error) {
    console.error('解压失败:', error);
    callback('解压失败');
  }
}

export function copyFile(path: string, toPath: string) {
  try {
    safeFS.cp(path, toPath).then(
      () => {},
      error => {
        console.error('复制文件失败:', error);
      }
    );
  } catch (error) {
    console.error('复制文件失败:', error);
  }
}

export async function copyDir(path: string, toPath: string): Promise<boolean> {
  try {
    await safeFS.cp(path, toPath, { recursive: true });
    return true;
  } catch (error) {
    console.error('复制目录失败:', error);
    return false;
  }
}

// 添加缺失的函数
export function delDir(dirPath: string) {
  try {
    safeFS.cp(dirPath, '', { recursive: true }).then(
      () => {},
      error => {
        console.error('删除目录失败:', error);
      }
    );
  } catch (error) {
    console.error('删除目录失败:', error);
  }
}

export function unZipFile(filePath: string, toPath: string, callback?: Function) {
  return unzip7z(filePath, toPath, callback || (() => {}));
}

export { formatFileSize as formatSize };