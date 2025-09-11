/**
 * 进度管理服务
 * 统一管理各种进度显示
 */

import { eventBus } from './event-bus';
import { NotificationManager } from './notification-manager';

export interface ProgressTask {
  id: string;
  title: string;
  progress: number;
  message?: string;
  status: 'running' | 'completed' | 'error' | 'cancelled';
  startTime: number;
  endTime?: number;
}

export class ProgressManager {
  private static instance: ProgressManager;
  private tasks: Map<string, ProgressTask> = new Map();
  private notificationManager: NotificationManager;

  private constructor() {
    this.notificationManager = NotificationManager.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    eventBus.on('progress:update', ({ taskId, progress, message }) => {
      this.updateProgress(taskId, progress, message);
    });

    eventBus.on('progress:complete', ({ taskId, message }) => {
      this.completeTask(taskId, message);
    });

    eventBus.on('progress:error', ({ taskId, error }) => {
      this.errorTask(taskId, error);
    });
  }

  /**
   * 创建新任务
   */
  public createTask(id: string, title: string): ProgressTask {
    const task: ProgressTask = {
      id,
      title,
      progress: 0,
      status: 'running',
      startTime: Date.now()
    };

    this.tasks.set(id, task);
    
    // 显示开始通知
    this.notificationManager.info({
      title: '任务开始',
      content: title,
      duration: 2000
    });

    return task;
  }

  /**
   * 更新任务进度
   */
  public updateProgress(taskId: string, progress: number, message?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.progress = Math.max(0, Math.min(100, progress));
    if (message) {
      task.message = message;
    }

    // 可以在这里触发 UI 更新事件
    this.notifyProgressUpdate(task);
  }

  /**
   * 完成任务
   */
  public completeTask(taskId: string, message?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.progress = 100;
    task.endTime = Date.now();
    if (message) {
      task.message = message;
    }

    // 显示完成通知
    this.notificationManager.success({
      title: '任务完成',
      content: message || task.title,
      duration: 3000
    });

    // 延迟清理任务
    setTimeout(() => {
      this.tasks.delete(taskId);
    }, 5000);
  }

  /**
   * 任务出错
   */
  public errorTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'error';
    task.endTime = Date.now();
    task.message = error;

    // 显示错误通知
    this.notificationManager.error({
      title: '任务失败',
      content: `${task.title}: ${error}`,
      duration: 5000
    });
  }

  /**
   * 取消任务
   */
  public cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'cancelled';
    task.endTime = Date.now();

    this.notificationManager.warning({
      title: '任务取消',
      content: task.title,
      duration: 2000
    });
  }

  /**
   * 获取任务
   */
  public getTask(taskId: string): ProgressTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有活动任务
   */
  public getActiveTasks(): ProgressTask[] {
    return Array.from(this.tasks.values()).filter(
      task => task.status === 'running'
    );
  }

  /**
   * 获取所有任务
   */
  public getAllTasks(): ProgressTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 清理已完成的任务
   */
  public clearCompletedTasks(): void {
    for (const [id, task] of this.tasks.entries()) {
      if (task.status === 'completed' || task.status === 'error') {
        this.tasks.delete(id);
      }
    }
  }

  /**
   * 通知进度更新
   */
  private notifyProgressUpdate(task: ProgressTask): void {
    // 可以在这里发送事件给 UI 组件
    // 比如更新进度条、状态栏等
    if (process.env['NODE_ENV'] === 'development') {
      console.debug(`Progress [${task.id}]: ${task.progress}% - ${task.message || task.title}`);
    }
  }

  /**
   * 生成任务 ID
   */
  public static generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const progressManager = ProgressManager.getInstance();

// 便捷函数
export const createTask = (title: string) => {
  const id = ProgressManager.generateTaskId();
  return progressManager.createTask(id, title);
};

export const updateProgress = (taskId: string, progress: number, message?: string) =>
  progressManager.updateProgress(taskId, progress, message);

export const completeTask = (taskId: string, message?: string) =>
  progressManager.completeTask(taskId, message);

export const errorTask = (taskId: string, error: string) =>
  progressManager.errorTask(taskId, error);