/**
 * Aria2下载前端服务
 * 提供安全的下载管理接口
 */

import { Aria2Status } from "../../types/aria2";


// Aria2下载状态接口


// 下载任务管理
const activeDownloads = new Map<string, {
  taskId: string;
  callback?: (status: Aria2Status) => void;
}>();

/**
 * 生成唯一任务ID
 */
function generateTaskId(): string {
  return `aria2_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 安全启动下载任务
 */
export async function startDownloadSafe(
  url: string,
  saveDir: string,
  saveName: string,
  threads: number = 8,
  onStatusUpdate?: (status: Aria2Status) => void
): Promise<string | null> {
  try {
    const taskId = generateTaskId();
    
    // 启动下载
    const result = await window.electronAPI.invoke(
      'aria2:start',
      taskId,
      url,
      saveDir,
      saveName,
      threads
    );

    if (result) {
      // 注册任务
      if (onStatusUpdate) {
        activeDownloads.set(taskId, {
          taskId,
          callback: onStatusUpdate
        });
      } else {
        activeDownloads.set(taskId, {
          taskId
        });
      }

      // 设置状态回调 - 使用事件驱动而非轮询
      if (onStatusUpdate) {
        await window.electronAPI.invoke('aria2:setCallback', taskId);
        
        // 监听主进程发送的状态更新事件
        const handleStatusUpdate = (_event: any, receivedTaskId: string, status: Aria2Status) => {
          if (receivedTaskId === taskId) {
            console.log(`[${taskId}] 收到状态更新:`, status);
            onStatusUpdate(status);
            
            // 如果下载完成或出错，清理监听器和任务记录
            if (status.state === 'done' || status.state === 'error' || status.state === 'stopped') {
              window.electronAPI.removeListener('aria2:statusUpdate', handleStatusUpdate);
              activeDownloads.delete(taskId);
            }
          }
        };
        
        // 注册事件监听器
        window.electronAPI.on('aria2:statusUpdate', handleStatusUpdate);
        
        console.log(`[${taskId}] 已设置事件监听器，等待状态更新`);
      }

      return taskId;
    }

    return null;
  } catch (error) {
    console.error('启动下载失败:', error);
    return null;
  }
}

/**
 * 安全停止下载任务
 */
export async function stopDownloadSafe(taskId: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('aria2:stop', taskId);
    
    if (result) {
      activeDownloads.delete(taskId);
    }
    
    return result;
  } catch (error) {
    console.error('停止下载失败:', error);
    return false;
  }
}

/**
 * 获取下载状态
 */
export async function getDownloadStatusSafe(taskId: string): Promise<Aria2Status | null> {
  try {
    const result = await window.electronAPI.invoke('aria2:getStatus', taskId);
    return result;
  } catch (error) {
    console.error('获取下载状态失败:', error);
    return null;
  }
}

/**
 * 获取所有活动任务
 */
export async function getActiveTasksSafe(): Promise<string[]> {
  try {
    const result = await window.electronAPI.invoke('aria2:getActiveTasks');
    return result || [];
  } catch (error) {
    console.error('获取活动任务失败:', error);
    return [];
  }
}

/**
 * 检查文件是否存在
 */
export async function checkFileExistsSafe(filePath: string): Promise<boolean> {
  try {
    const result = await window.electronAPI.invoke('aria2:fileExists', filePath);
    return result;
  } catch (error) {
    console.error('检查文件存在性失败:', error);
    return false;
  }
}

/**
 * Aria2类的安全替代实现
 */
export class SafeAria2 {
  private taskId: string | null = null;

  /**
   * 开始下载
   */
  async start(
    url: string,
    saveDir: string,
    saveName: string,
    thread: number = 8,
    callback: (status: Aria2Status) => void
  ): Promise<void> {
    try {
      this.taskId = await startDownloadSafe(
        url,
        saveDir,
        saveName,
        thread,
        callback
      );
    } catch (error) {
      console.error('Aria2启动失败:', error);
      callback({
        state: 'error',
        speed: '',
        percentage: 0,
        remainder: '',
        size: '',
        newSize: '',
        message: '启动下载失败'
      });
    }
  }

  /**
   * 停止下载
   */
  async stop(callback: (success: boolean) => void): Promise<void> {
    try {
      if (this.taskId) {
        const success = await stopDownloadSafe(this.taskId);
        callback(success);
        this.taskId = null;
      } else {
        callback(false);
      }
    } catch (error) {
      console.error('Aria2停止失败:', error);
      callback(false);
    }
  }

  /**
   * 获取当前状态
   */
  async getStatus(): Promise<Aria2Status | null> {
    if (this.taskId) {
      return await getDownloadStatusSafe(this.taskId);
    }
    return null;
  }
}