import { ipcMain } from 'electron';
import { validateFilePath, safeExecCommand, validateDiskIndex, validateDriveLetter } from './security-utils';

/**
 * 磁盘操作安全处理器
 * 负责处理磁盘信息获取、分区操作等功能
 */

/**
 * 安全获取磁盘信息
 */
async function getDiskInfoSafe(): Promise<any[]> {
  try {
    // 使用 PowerShell 的 Get-CimInstance 替代已弃用的 wmic
    const result = await safeExecCommand('powershell', [
      '-Command',
      'Get-CimInstance -ClassName Win32_DiskDrive | Select-Object Index, Model, Size | ConvertTo-Json'
    ]);
    
    const jsonOutput = result.stdout.trim();
    if (!jsonOutput) {
      return [];
    }

    let diskData;
    try {
      diskData = JSON.parse(jsonOutput);
    } catch (parseError) {
      console.error('解析磁盘信息JSON失败:', parseError);
      return [];
    }

    // 确保返回数组格式
    const disks = Array.isArray(diskData) ? diskData : [diskData];
    
    return disks.map(disk => ({
      index: parseInt(disk.Index || '0') || 0,
      model: disk.Model || 'Unknown',
      size: parseInt(disk.Size || '0') || 0
    }));
  } catch (error) {
    console.error('获取磁盘信息失败:', error instanceof Error ? error.message : String(error));
    throw new Error(`获取磁盘信息失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 安全获取分区信息
 */
async function getPartitionInfoSafe(): Promise<any[]> {
  try {
    // 使用 PowerShell 的 Get-CimInstance 替代已弃用的 wmic
    const result = await safeExecCommand('powershell', [
      '-Command',
      'Get-CimInstance -ClassName Win32_LogicalDisk | Select-Object DeviceID, Size, FreeSpace | ConvertTo-Json'
    ]);
    
    const jsonOutput = result.stdout.trim();
    if (!jsonOutput) {
      return [];
    }

    let partitionData;
    try {
      partitionData = JSON.parse(jsonOutput);
    } catch (parseError) {
      console.error('解析分区信息JSON失败:', parseError);
      return [];
    }

    // 确保返回数组格式
    const partitions = Array.isArray(partitionData) ? partitionData : [partitionData];
    
    return partitions.map(partition => ({
      caption: partition.DeviceID || '',
      freeSpace: parseInt(partition.FreeSpace || '0') || 0,
      size: parseInt(partition.Size || '0') || 0
    }));
  } catch (error) {
    console.error('获取分区信息失败:', error instanceof Error ? error.message : String(error));
    throw new Error(`获取分区信息失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 安全获取盘符信息
 */
async function getAllLetterInfoSafe(): Promise<string[]> {
  try {
    // 使用 PowerShell 的 Get-CimInstance 替代已弃用的 wmic
    const result = await safeExecCommand('powershell', [
      '-Command',
      'Get-CimInstance -ClassName Win32_LogicalDisk | Select-Object DeviceID | ConvertTo-Json'
    ]);
    
    const jsonOutput = result.stdout.trim();
    if (!jsonOutput) {
      return [];
    }

    let letterData;
    try {
      letterData = JSON.parse(jsonOutput);
    } catch (parseError) {
      console.error('解析盘符信息JSON失败:', parseError);
      return [];
    }

    // 确保返回数组格式
    const letters = Array.isArray(letterData) ? letterData : [letterData];
    
    return letters
      .map(letter => letter.DeviceID)
      .filter(deviceId => deviceId && typeof deviceId === 'string')
      .map(deviceId => deviceId.trim());
  } catch (error) {
    console.error('获取盘符信息失败:', error instanceof Error ? error.message : String(error));
    throw new Error(`获取盘符信息失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 检查盘符是否存在
 */
async function letterIsExistSafe(letter: string, allLetters?: string[]): Promise<boolean> {
  try {
    const validatedLetter = validateDriveLetter(letter);
    if (!validatedLetter) {
      return false;
    }

    if (allLetters) {
      return allLetters.includes(validatedLetter);
    }

    const letters = await getAllLetterInfoSafe();
    return letters.includes(validatedLetter);
  } catch (error) {
    console.error('检查盘符存在性失败:', error);
    return false;
  }
}

/**
 * 安全执行PACMD命令
 */
async function executePACMDSafe(
  pacmdPath: string,
  diskIndex: number,
  operation: string,
  additionalArgs: string[] = []
): Promise<{ success: boolean; output: string }> {
  try {
    // 验证PACMD路径
    const validatedPath = validateFilePath(pacmdPath);
    if (!validatedPath) {
      throw new Error('PACMD路径无效');
    }

    // 验证磁盘索引
    const validatedIndex = validateDiskIndex(diskIndex);
    if (validatedIndex === null) {
      throw new Error('磁盘索引无效');
    }

    // 构建安全的命令参数
    const args = [
      operation,
      validatedIndex.toString(),
      ...additionalArgs
    ];

    const result = await safeExecCommand(validatedPath, args, {
      timeout: 60000 // 60秒超时
    });

    return {
      success: true,
      output: result.stdout
    };
  } catch (error) {
    console.error('PACMD命令执行失败:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      output: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 注册磁盘相关的IPC处理器
 */
export function registerDiskHandlers(): void {
  // 获取磁盘信息
  ipcMain.handle('disk:getInfo', async () => {
    try {
      return await getDiskInfoSafe();
    } catch (error) {
      console.error('获取磁盘信息失败:', error);
      return [];
    }
  });

  // 获取分区信息
  ipcMain.handle('disk:getPartitions', async () => {
    try {
      return await getPartitionInfoSafe();
    } catch (error) {
      console.error('获取分区信息失败:', error);
      return [];
    }
  });

  // 获取所有盘符
  ipcMain.handle('disk:getAllLetters', async () => {
    try {
      return await getAllLetterInfoSafe();
    } catch (error) {
      console.error('获取盘符信息失败:', error);
      return [];
    }
  });

  // 获取可用盘符
  ipcMain.handle('disk:getUsableLetter', async () => {
    try {
      const letters: Array<string> = 'FGHIJKLMNOPQRSTUVWXYZABCDE'.split('');
      
      // 获取所有盘符信息
      const allLetters = await getAllLetterInfoSafe();
      
      for (const letter of letters) {
        const letterWithColon = `${letter}:`;
        const exists = await letterIsExistSafe(letterWithColon, allLetters);
        if (!exists) {
          return letterWithColon;
        }
      }
      
      return '';
    } catch (error) {
      console.error('获取可用盘符失败:', error);
      return '';
    }
  });

  // 检查盘符是否存在
  ipcMain.handle('disk:letterExists', async (_event, letter: string) => {
    try {
      return await letterIsExistSafe(letter);
    } catch (error) {
      console.error('检查盘符存在性失败:', error);
      return false;
    }
  });

  // 执行PACMD命令
  ipcMain.handle('disk:executePACMD', async (_event, pacmdPath: string, diskIndex: number, operation: string, additionalArgs: string[] = []) => {
    try {
      return await executePACMDSafe(pacmdPath, diskIndex, operation, additionalArgs);
    } catch (error) {
      console.error('PACMD命令执行失败:', error);
      return {
        success: false,
        output: error instanceof Error ? error.message : String(error)
      };
    }
  });

  console.log('磁盘处理器已注册');
}