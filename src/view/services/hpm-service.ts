/**
 * HPM模块管理前端服务
 * 提供安全的HPM模块操作接口
 */

import { HPM } from '../../types/hpm';

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
 * 安全获取HPM文件信息
 */
export async function getHPMInfoSafe(hpmFilePath: string, hpmFileName: string): Promise<HPMInfo> {
  try {
    const result = await window.electronAPI.invoke('hpm:getInfo', hpmFilePath, hpmFileName);
    return result;
  } catch (error) {
    console.error('获取HPM文件信息失败:', error);
    throw new Error('获取HPM文件信息失败');
  }
}

/**
 * 安全获取HPM文件列表
 */
export async function getHPMFilesList(hpmDirPath: string, extension: string = '.hpm'): Promise<string[]> {
  try {
    const result = await window.electronAPI.invoke('hpm:getFilesList', hpmDirPath, extension);
    return result || [];
  } catch (error) {
    console.error('获取HPM文件列表失败:', error);
    return [];
  }
}

/**
 * 安全删除HPM文件
 */
export async function deleteHPMFileSafe(hpmDirPath: string, fileName: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('hpm:deleteFile', hpmDirPath, fileName);
    return result;
  } catch (error) {
    console.error('删除HPM文件失败:', error);
    return false;
  }
}

/**
 * 安全禁用HPM模块
 */
export async function disableHPMSafe(hpmDirPath: string, fileName: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('hpm:disable', hpmDirPath, fileName);
    return result;
  } catch (error) {
    console.error('禁用HPM模块失败:', error);
    return false;
  }
}

/**
 * 安全启用HPM模块
 */
export async function enableHPMSafe(hpmDirPath: string, fileName: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('hpm:enable', hpmDirPath, fileName);
    return result;
  } catch (error) {
    console.error('启用HPM模块失败:', error);
    return false;
  }
}

/**
 * 检查文件是否存在
 */
export async function checkHPMFileExists(filePath: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('hpm:fileExists', filePath);
    return result;
  } catch (error) {
    console.error('检查文件存在性失败:', error);
    return false;
  }
}

/**
 * 检查HPM目录是否准备就绪
 */
export async function checkHPMReady(hpmDirPath: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('hpm:checkReady', hpmDirPath);
    return result;
  } catch (error) {
    console.error('检查HPM目录失败:', error);
    return false;
  }
}

/**
 * 获取本地HPM列表（兼容原有接口）
 */
export async function checkHPMFilesSafe(hpmDirPath: string): Promise<{ on: HPMInfo[]; off: HPMInfo[] }> {
  try {
    // 获取启用的HPM文件
    const onFiles = await getHPMFilesList(hpmDirPath, '.hpm');
    const onHPMs = await Promise.all(
      onFiles.map(fileName => getHPMInfoSafe(hpmDirPath, fileName))
    );

    // 获取禁用的HPM文件
    const offFiles = await getHPMFilesList(hpmDirPath, '.hpm.off');
    const offHPMs = await Promise.all(
      offFiles.map(fileName => getHPMInfoSafe(hpmDirPath, fileName))
    );

    // 过滤掉正在下载的文件（存在.aria2文件）
    const filteredOnHPMs = [];
    for (const hpm of onHPMs) {
      const aria2Exists = await checkHPMFileExists(`${hpmDirPath}${hpm.fileName}.aria2`);
      if (!aria2Exists) {
        filteredOnHPMs.push(hpm);
      }
    }

    return {
      on: filteredOnHPMs,
      off: offHPMs
    };
  } catch (error) {
    console.error('获取本地HPM列表失败:', error);
    return { on: [], off: [] };
  }
}

/**
 * HPM文件是否已存在本地（兼容原有接口）
 */
export async function isHPMHaveLocalSafe(hpmInfo: HPM, hpmDirPath: string): Promise<boolean> {
  try {
    const localHPMs = await checkHPMFilesSafe(hpmDirPath);
    const allHPMs = [...localHPMs.on, ...localHPMs.off];

    return allHPMs.some(localHPM => {
      const localBaseName = localHPM.fileName.toLowerCase().replace(/\.hpm(\.off)?$/, '');
      const targetBaseName = hpmInfo.fileName.toLowerCase().replace(/\.hpm$/, '');
      return localBaseName === targetBaseName;
    });
  } catch (error) {
    console.error('检查HPM本地存在性失败:', error);
    return false;
  }
}