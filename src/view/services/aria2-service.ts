/**
 * Aria2下载前端服务
 * 提供安全的下载管理接口
 */

// Aria2下载状态接口
export interface Aria2Status {
  state: 'request' | 'doing' | 'done' | 'error' | 'stopped';
  speed: string;
  percentage: number;
  remainder: string;
  size: string;
  newSize: string;
  message: string;
}

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
  sourceAria2Path: string,
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
      sourceAria2Path,
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

      // 设置状态回调
      if (onStatusUpdate) {
        await window.electronAPI.invoke('aria2:setCallback', taskId);
        
        // 启动状态轮询
        const pollStatus = async () => {
          try {
            const status = await getDownloadStatusSafe(taskId);
            if (status && onStatusUpdate) {
              onStatusUpdate(status);
              
              // 如果下载完成或出错，停止轮询
              if (status.state === 'done' || status.state === 'error' || status.state === 'stopped') {
                activeDownloads.delete(taskId);
                return;
              }
              
              // 继续轮询
              setTimeout(pollStatus, 1000);
            }
          } catch (error) {
            console.error('状态轮询失败:', error);
          }
        };
        
        // 开始轮询
        setTimeout(pollStatus, 1000);
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
  private sourceAria2Path: string;

  constructor(sourceAria2Path: string) {
    this.sourceAria2Path = sourceAria2Path;
  }

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
        this.sourceAria2Path,
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