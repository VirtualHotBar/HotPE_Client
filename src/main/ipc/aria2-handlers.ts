/**
 * Aria2下载安全处理器
 * 负责处理Aria2下载任务的创建、管理和监控
 */

import { ipcMain } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { 
  validateFilePath, 
  cleanupTempFile,
  generateSafeTempPath
} from './security-utils';

// Aria2下载状态接口
interface Aria2Status {
  state: 'request' | 'doing' | 'done' | 'error' | 'stopped';
  speed: string;
  percentage: number;
  remainder: string;
  size: string;
  newSize: string;
  message: string;
}

// 下载任务接口
interface DownloadTask {
  id: string;
  process: ChildProcess | null;
  aria2Path: string;
  filePath: string;
  status: Aria2Status;
  callback?: (status: Aria2Status) => void;
}

// 活动的下载任务
const activeTasks = new Map<string, DownloadTask>();

/**
 * 创建临时Aria2可执行文件
 */
async function createTempAria2(sourceAria2Path: string): Promise<string> {
  try {
    const validatedPath = validateFilePath(sourceAria2Path);
    if (!validatedPath) {
      throw new Error('Invalid source aria2 path');
    }

    // 验证源文件存在
    await fs.access(validatedPath);

    // 生成安全的临时文件路径
    const tempAria2Path = generateSafeTempPath('aria2c', '.exe');

    // 复制aria2到临时目录
    await fs.copyFile(validatedPath, tempAria2Path);

    return tempAria2Path;
  } catch (error) {
    console.error('创建临时Aria2文件失败:', error);
    throw error;
  }
}

/**
 * 验证下载URL
 */
function validateDownloadUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // 只允许HTTP和HTTPS协议
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
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
 * 解析Aria2输出状态
 */
function parseAria2Output(output: string): Partial<Aria2Status> {
  const status: Partial<Aria2Status> = {
    message: output
  };

  // 解析下载进度信息
  if (output.includes('DL:') && output.includes('ETA')) {
    // 正在下载状态
    status.state = 'doing';

    // 解析速度
    const speedMatch = output.match(/DL:([^i]+)iB/);
    if (speedMatch && speedMatch[1]) {
      status.speed = `${speedMatch[1].trim()}B/s`;
    }

    // 解析进度百分比
    const percentMatch = output.match(/\((\d+)%\)/);
    if (percentMatch && percentMatch[1]) {
      status.percentage = Number(percentMatch[1]);
    }

    // 解析剩余时间
    const etaMatch = output.match(/ETA:([^\]]+)\]/);
    if (etaMatch && etaMatch[1]) {
      status.remainder = etaMatch[1].trim();
    }

    // 解析文件大小
    const sizeMatch = output.match(/\/([^i]+)iB\(/);
    if (sizeMatch && sizeMatch[1]) {
      status.size = `${sizeMatch[1].trim()}B`;
    }

    // 解析已下载大小
    const newSizeMatch = output.match(/\s([^i]+)iB\//);
    if (newSizeMatch && newSizeMatch[1]) {
      status.newSize = `${newSizeMatch[1].trim()}B`;
    }
  } else if (output.includes('[NOTICE]')) {
    // 请求状态
    status.state = 'request';
  }

  return status;
}

/**
 * 启动Aria2下载任务
 */
async function startDownload(
  taskId: string,
  sourceAria2Path: string,
  url: string,
  saveDir: string,
  saveName: string,
  threads: number = 8
): Promise<boolean> {
  try {
    // 验证输入参数
    if (!validateDownloadUrl(url)) {
      throw new Error('Invalid download URL');
    }

    const validatedSaveDir = validateFilePath(saveDir);
    if (!validatedSaveDir || !validateFileName(saveName)) {
      throw new Error('Invalid save directory or filename');
    }

    if (threads < 1 || threads > 16) {
      threads = 8; // 默认线程数
    }

    // 创建临时Aria2文件
    const aria2Path = await createTempAria2(sourceAria2Path);
    const filePath = path.join(validatedSaveDir, saveName);

    // 确保保存目录存在
    await fs.mkdir(validatedSaveDir, { recursive: true });

    // 构建安全的命令参数
    const args = [
      url,
      `-d${validatedSaveDir}`,
      `-o${saveName}`,
      `-s${threads}`,
      `-x${threads}`,
      '--file-allocation=none',
      '-c', // 断点续传
      '--check-certificate=false',
      '--force-save=false'
    ];

    // 创建下载任务
    const task: DownloadTask = {
      id: taskId,
      process: null,
      aria2Path,
      filePath,
      status: {
        state: 'request',
        speed: '',
        percentage: 0,
        remainder: '',
        size: '',
        newSize: '',
        message: ''
      }
    };

    // 启动Aria2进程
    const process = spawn(aria2Path, args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    task.process = process;
    activeTasks.set(taskId, task);

    // 处理输出
    process.stdout?.on('data', (data) => {
      const output = data.toString();
      const parsedStatus = parseAria2Output(output);
      
      task.status = { ...task.status, ...parsedStatus };
      
      // 通知前端状态更新
      if (task.callback) {
        task.callback(task.status);
      }
    });

    process.stderr?.on('data', (data) => {
      console.error('Aria2 stderr:', data.toString());
    });

    // 处理进程结束
    process.on('close', async (code) => {
      if (code === 0) {
        task.status.state = 'done';
        task.status.percentage = 100;
      } else {
        task.status.state = 'error';
      }

      // 通知前端最终状态
      if (task.callback) {
        task.callback(task.status);
      }

      // 清理临时文件
      await cleanupTempFile(aria2Path);
      activeTasks.delete(taskId);
    });

    return true;
  } catch (error) {
    console.error('启动Aria2下载失败:', error);
    return false;
  }
}

/**
 * 停止下载任务
 */
async function stopDownload(taskId: string): Promise<boolean> {
  try {
    const task = activeTasks.get(taskId);
    if (!task) {
      return false;
    }

    // 终止进程
    if (task.process && !task.process.killed) {
      task.process.kill('SIGTERM');
    }

    // 删除未完成的文件
    try {
      await fs.unlink(task.filePath);
      await fs.unlink(`${task.filePath}.aria2`);
    } catch {
      // 忽略删除失败
    }

    // 清理临时文件
    await cleanupTempFile(task.aria2Path);
    
    // 更新状态
    task.status.state = 'stopped';
    if (task.callback) {
      task.callback(task.status);
    }

    activeTasks.delete(taskId);
    return true;
  } catch (error) {
    console.error('停止下载失败:', error);
    return false;
  }
}

/**
 * 获取下载任务状态
 */
function getDownloadStatus(taskId: string): Aria2Status | null {
  const task = activeTasks.get(taskId);
  return task ? task.status : null;
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
export function registerAria2Handlers() {
  // 启动下载
  ipcMain.handle('aria2:start', async (
    _event, 
    taskId: string,
    sourceAria2Path: string,
    url: string, 
    saveDir: string, 
    saveName: string, 
    threads: number
  ) => {
    return await startDownload(taskId, sourceAria2Path, url, saveDir, saveName, threads);
  });

  // 停止下载
  ipcMain.handle('aria2:stop', async (_event, taskId: string) => {
    return await stopDownload(taskId);
  });

  // 获取下载状态
  ipcMain.handle('aria2:getStatus', async (_event, taskId: string) => {
    return getDownloadStatus(taskId);
  });

  // 获取所有活动任务
  ipcMain.handle('aria2:getActiveTasks', async (_event) => {
    return Array.from(activeTasks.keys());
  });

  // 设置状态回调（用于实时更新）
  ipcMain.handle('aria2:setCallback', async (event, taskId: string) => {
    const task = activeTasks.get(taskId);
    if (task) {
      task.callback = (status: Aria2Status) => {
        event.sender.send('aria2:statusUpdate', taskId, status);
      };
      return true;
    }
    return false;
  });

  // 检查文件是否存在
  ipcMain.handle('aria2:fileExists', async (_event, filePath: string) => {
    return await checkFileExists(filePath);
  });
}