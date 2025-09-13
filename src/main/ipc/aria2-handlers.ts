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


import { Aria2Status } from "../../types/aria2";


// 下载任务接口
interface DownloadTask {
  id: string;
  process: ChildProcess | null;
  aria2Path: string;
  filePath: string;
  status: Aria2Status;
  callback?: (status: Aria2Status) => void;
  finalStatusSent?: boolean; // 标记是否已发送最终状态
}

// 活动的下载任务
const activeTasks = new Map<string, DownloadTask>();

/**
 * 创建临时Aria2可执行文件
 */
async function createTempAria2(sourceAria2Path: string = 'resources/tools/aria2c.exe'): Promise<string> {
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
  const status: Partial<Aria2Status> = {};

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
  } else if (output.includes('[NOTICE]') || output.includes('Download complete')) {
    // 请求状态或完成状态
    if (output.includes('Download complete')) {
      status.state = 'done';
      status.percentage = 100;
    } else {
      status.state = 'request';
    }
  } else if (output.includes('[ERROR]') || output.includes('error')) {
    // 错误状态
    status.state = 'error';
    status.message = output.trim();
  }

  // 如果有状态更新，记录消息
  if (Object.keys(status).length > 0) {
    status.message = output.trim();
  }

  return status;
}

/**
 * 启动Aria2下载任务
 */
async function startDownload(
  taskId: string,
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
    const aria2Path = await createTempAria2();
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
      console.log(`[${taskId}] Aria2 stdout:`, output);
      
      const parsedStatus = parseAria2Output(output);
      if (Object.keys(parsedStatus).length > 1) { // 有实际状态更新
        task.status = { ...task.status, ...parsedStatus };
        console.log(`[${taskId}] 状态更新:`, task.status);
        
        // 主动向前端发送状态更新
        if (task.callback && !task.finalStatusSent) {
          // 如果是最终状态（done/error），标记已发送
          if (task.status.state === 'done' || task.status.state === 'error') {
            task.finalStatusSent = true;
          }
          task.callback(task.status);
        }
      }
    });

    process.stderr?.on('data', (data) => {
      const errorOutput = data.toString();
      console.error(`[${taskId}] Aria2 stderr:`, errorOutput);
      
      // 更新错误状态
      task.status.state = 'error';
      task.status.message = errorOutput;
      
      // 主动向前端发送错误状态
      if (task.callback && !task.finalStatusSent) {
        task.finalStatusSent = true; // 标记已发送最终状态
        task.callback(task.status);
      }
    });

    // 处理进程结束
    process.on('close', async (code) => {
      console.log(`[${taskId}] Aria2进程结束，退出码:`, code);
      
      // 只有在还没发送最终状态时才更新和发送
      if (!task.finalStatusSent) {
        if (code === 0) {
          task.status.state = 'done';
          task.status.percentage = 100;
          task.status.message = '下载完成';
        } else {
          task.status.state = 'error';
          task.status.message = `下载失败，退出码: ${code}`;
        }

        console.log(`[${taskId}] 最终状态:`, task.status);

        // 通知前端最终状态（在删除任务之前）
        if (task.callback) {
          task.finalStatusSent = true;
          task.callback(task.status);
        }
      } else {
        console.log(`[${taskId}] 最终状态已发送，跳过重复通知`);
      }

      // 清理临时文件
      await cleanupTempFile(aria2Path);
      
      // 延迟删除任务，给渲染进程一些时间处理最终状态
      setTimeout(() => {
        activeTasks.delete(taskId);
        console.log(`[${taskId}] 任务已从活动列表中移除`);
      }, 2000);
    });

    // 处理进程错误
    process.on('error', async (error) => {
      console.error(`[${taskId}] Aria2进程错误:`, error);
      
      // 只有在还没发送最终状态时才发送
      if (!task.finalStatusSent) {
        task.status.state = 'error';
        task.status.message = `进程错误: ${error.message}`;
        
        // 通知前端错误状态
        if (task.callback) {
          task.finalStatusSent = true;
          task.callback(task.status);
        }
      }
      
      // 清理临时文件
      await cleanupTempFile(aria2Path);
      
      // 延迟删除任务
      setTimeout(() => {
        activeTasks.delete(taskId);
        console.log(`[${taskId}] 错误任务已从活动列表中移除`);
      }, 2000);
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
    url: string,
    saveDir: string,
    saveName: string,
    threads: number
  ) => {
    return await startDownload(taskId, url, saveDir, saveName, threads);
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