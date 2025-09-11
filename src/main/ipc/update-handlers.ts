/**
 * 更新管理安全处理器
 * 负责处理客户端和PE的更新操作
 */

import { ipcMain } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { 
  validateFilePath, 
  safeExecCommand
} from './security-utils';

// 更新信息接口
interface UpdateInfo {
  version: string;
  downloadUrl: string;
  changelog: string;
  size: number;
  hash: string;
}

/**
 * 安全获取更新信息
 */
async function fetchUpdateInfoSafe(apiUrl: string): Promise<UpdateInfo | null> {
  try {
    // 验证API URL格式
    if (!apiUrl || typeof apiUrl !== 'string') {
      throw new Error('API URL无效');
    }

    // 简单的URL验证
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      throw new Error('API URL必须使用HTTP或HTTPS协议');
    }

    // 这里应该使用安全的HTTP客户端
    // 暂时返回模拟数据
    console.log(`获取更新信息: ${apiUrl}`);
    
    return {
      version: '1.0.0',
      downloadUrl: '',
      changelog: '',
      size: 0,
      hash: ''
    };
  } catch (error) {
    console.error('获取更新信息失败:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * 安全复制更新文件
 */
async function copyUpdateFilesSafe(toolsPath: string, clientPath: string): Promise<boolean> {
  try {
    // 验证路径
    const validatedToolsPath = validateFilePath(toolsPath);
    const validatedClientPath = validateFilePath(clientPath);
    
    if (!validatedToolsPath || !validatedClientPath) {
      throw new Error('路径验证失败');
    }

    // 检查源目录是否存在
    const toolsStats = await fs.stat(validatedToolsPath);
    if (!toolsStats.isDirectory()) {
      throw new Error('工具目录不存在');
    }

    // 确保目标目录存在
    await fs.mkdir(validatedClientPath, { recursive: true });

    // 复制文件
    const result = await safeExecCommand('xcopy', [
      `"${validatedToolsPath}"`,
      `"${validatedClientPath}"`,
      '/E', '/Y', '/I'
    ]);

    return result.stdout.includes('copied') || result.stderr === '';
  } catch (error) {
    console.error('复制更新文件失败:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * 安全创建更新批处理文件
 */
async function createUpdateBatchSafe(
  toolsPath: string,
  clientPath: string,
  batPath: string
): Promise<boolean> {
  try {
    // 验证路径
    const validatedToolsPath = validateFilePath(toolsPath);
    const validatedClientPath = validateFilePath(clientPath);
    const validatedBatPath = validateFilePath(batPath);
    
    if (!validatedToolsPath || !validatedClientPath || !validatedBatPath) {
      throw new Error('路径验证失败');
    }

    // 生成批处理内容
    const batchContent = `@echo off
echo 正在更新HotPE客户端...
timeout /t 3 /nobreak >nul
xcopy "${validatedToolsPath}\\*" "${validatedClientPath}\\" /E /Y /I
if %errorlevel% equ 0 (
    echo 更新完成，正在重启客户端...
    start "" "${path.join(validatedClientPath, 'HotPE.exe')}"
) else (
    echo 更新失败，请手动重启客户端
    pause
)
del "%~f0"
`;

    // 写入批处理文件
    await fs.writeFile(validatedBatPath, batchContent, 'utf8');
    
    return true;
  } catch (error) {
    console.error('创建更新批处理失败:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * 安全执行重启更新
 */
async function executeUpdateRestartSafe(batPath: string): Promise<boolean> {
  try {
    // 验证批处理文件路径
    const validatedBatPath = validateFilePath(batPath);
    if (!validatedBatPath) {
      throw new Error('批处理文件路径无效');
    }

    // 检查文件是否存在
    await fs.access(validatedBatPath);

    // 执行批处理文件
    await safeExecCommand('cmd', ['/c', `"${validatedBatPath}"`], {
      timeout: 10000
    });

    return true;
  } catch (error) {
    console.error('执行重启更新失败:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * 检查更新标记文件
 */
async function checkUpdateMarkSafe(markFilePath: string): Promise<boolean> {
  try {
    const validatedPath = validateFilePath(markFilePath);
    if (!validatedPath) {
      return false;
    }

    await fs.access(validatedPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 移除更新标记文件
 */
async function removeUpdateMarkSafe(markFilePath: string): Promise<boolean> {
  try {
    const validatedPath = validateFilePath(markFilePath);
    if (!validatedPath) {
      return false;
    }

    await fs.unlink(validatedPath);
    return true;
  } catch (error) {
    console.error('移除更新标记失败:', error);
    return false;
  }
}

/**
 * 注册更新相关的IPC处理器
 */
export function registerUpdateHandlers(): void {
  // 获取更新信息
  ipcMain.handle('update:fetchInfo', async (_event, apiUrl: string) => {
    try {
      return await fetchUpdateInfoSafe(apiUrl);
    } catch (error) {
      console.error('获取更新信息失败:', error);
      return null;
    }
  });

  // 复制更新文件
  ipcMain.handle('update:copyFiles', async (_event, toolsPath: string, clientPath: string) => {
    try {
      return await copyUpdateFilesSafe(toolsPath, clientPath);
    } catch (error) {
      console.error('复制更新文件失败:', error);
      return false;
    }
  });

  // 创建更新批处理
  ipcMain.handle('update:createBatch', async (
    _event,
    toolsPath: string,
    clientPath: string,
    batPath: string
  ) => {
    try {
      return await createUpdateBatchSafe(toolsPath, clientPath, batPath);
    } catch (error) {
      console.error('创建更新批处理失败:', error);
      return false;
    }
  });

  // 执行重启更新
  ipcMain.handle('update:executeRestart', async (_event, batPath: string) => {
    try {
      return await executeUpdateRestartSafe(batPath);
    } catch (error) {
      console.error('执行重启更新失败:', error);
      return false;
    }
  });

  // 检查更新标记
  ipcMain.handle('update:checkMark', async (_event, markFilePath: string) => {
    try {
      return await checkUpdateMarkSafe(markFilePath);
    } catch (error) {
      console.error('检查更新标记失败:', error);
      return false;
    }
  });

  // 移除更新标记
  ipcMain.handle('update:removeMark', async (_event, markFilePath: string) => {
    try {
      return await removeUpdateMarkSafe(markFilePath);
    } catch (error) {
      console.error('移除更新标记失败:', error);
      return false;
    }
  });

  console.log('更新处理器已注册');
}