/**
 * 安全的磁盘操作服务
 * 替代原有的不安全磁盘操作，通过IPC调用主进程
 */

import { config } from './config';
import { disksInfo, partitionInfo } from '../../types/config';
import { createLogger } from './logger';

const logger = createLogger('DiskService');

/**
 * 安全的磁盘信息获取函数
 * 已迁移到主进程，防止命令注入风险
 */
export async function getDisksInfo(): Promise<void> {
  try {
    const disks: disksInfo[] = await window.electronAPI.invoke('disk:getDisksInfo');
    config.environment.ware.disks = disks;
  } catch (error) {
    logger.error('获取磁盘信息失败', 'getDisksInfo', error);
    config.environment.ware.disks = [];
  }
}

/**
 * 安全的分区信息获取函数
 * 已迁移到主进程，防止命令注入风险
 */
export async function getPartitionsInfo(): Promise<void> {
  try {
    const partitions: partitionInfo[] = await window.electronAPI.invoke('disk:getPartitionsInfo');
    config.environment.ware.partitions = partitions;
  } catch (error) {
    logger.error('获取分区信息失败', 'getPartitionsInfo', error);
    config.environment.ware.partitions = [];
  }
}

/**
 * 安全的盘符信息获取函数
 * 已迁移到主进程，防止命令注入风险
 */
export async function getAllLetterInfo(): Promise<void> {
  try {
    const allLetter: string[] = await window.electronAPI.invoke('disk:getAllLetterInfo');
    config.environment.ware.allLetter = allLetter;
  } catch (error) {
    logger.error('获取盘符信息失败', 'getAllLetterInfo', error);
    config.environment.ware.allLetter = [];
  }
}

/**
 * 判断磁盘是否是移动设备
 * 使用本地数据，无需IPC调用
 */
export function isMoveForDisk(diskIndex: number): boolean {
  try {
    for (const disk of config.environment.ware?.disks || []) {
      if (disk && diskIndex === disk.index) {
        return disk.movable;
      }
    }
    return false;
  } catch (error) {
    logger.error('检查磁盘类型失败', 'isMoveForDisk', { error, diskIndex });
    return false;
  }
}

/**
 * 检查盘符是否存在
 * 使用安全的IPC调用
 */
export async function letterIsExist(letter: string): Promise<boolean> {
  try {
    const allLetters = config.environment.ware?.allLetter || [];
    return await window.electronAPI.invoke('disk:letterIsExist', letter, allLetters);
  } catch (error) {
    logger.error('检查盘符失败', 'letterIsExist', { error, letter });
    return false;
  }
}

/**
 * 获取可用盘符
 * 使用安全的IPC调用
 */
export async function getUsableLetter(): Promise<string> {
  try {
    return await window.electronAPI.invoke('disk:getUsableLetter');
  } catch (error) {
    logger.error('获取可用盘符失败', 'getUsableLetter', error);
    return '';
  }
}

/**
 * 安全的PACMD命令执行
 * 已迁移到主进程，防止命令注入风险
 */
export async function runPacmd(cmd: string, diskIndex?: number): Promise<{ success: boolean; output: string }> {
  try {
    return await window.electronAPI.invoke('disk:runPacmd', cmd, diskIndex);
  } catch (error) {
    logger.error('PACMD命令执行失败', 'runPacmd', { error, cmd, diskIndex });
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 兼容性函数 - 逐步迁移现有代码
 * 这些函数保持与原有API相同的接口，但内部使用安全的实现
 */

// 兼容原有的getDisksInfo调用
export { getDisksInfo as safeGetDisksInfo };

// 兼容原有的getPartitionsInfo调用  
export { getPartitionsInfo as safeGetPartitionsInfo };

// 兼容原有的getAllLetterInfo调用
export { getAllLetterInfo as safeGetAllLetterInfo };

// 兼容原有的isMoveForDisk调用
export { isMoveForDisk as safeIsMoveForDisk };

// 兼容原有的letterIsExist调用
export { letterIsExist as safeLetterIsExist };

// 兼容原有的getUsableLetter调用
export { getUsableLetter as safeGetUsableLetter };