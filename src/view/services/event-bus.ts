/**
 * 事件总线服务
 * 用于组件间通信，替代直接的 UI 调用
 */

export type EventCallback<T = any> = (data: T) => void;

export interface EventMap {
  // 通知事件
  'notification:success': { message: string; title?: string };
  'notification:error': { message: string; title?: string };
  'notification:warning': { message: string; title?: string };
  'notification:info': { message: string; title?: string };
  
  // 进度事件
  'progress:update': { taskId: string; progress: number; message?: string };
  'progress:complete': { taskId: string; message?: string };
  'progress:error': { taskId: string; error: string };
  
  // 状态更新事件
  'state:update': { key: string; value: any };
  'config:update': { path: string[]; value: any };
  
  // 下载事件
  'download:start': { taskId: string; url: string };
  'download:progress': { taskId: string; progress: number; speed: string };
  'download:complete': { taskId: string; filePath: string };
  'download:error': { taskId: string; error: string };
  
  // 安装事件
  'install:start': { type: 'iso' | 'udisk' | 'system' };
  'install:progress': { type: string; progress: number; message: string };
  'install:complete': { type: string; result: any };
  'install:error': { type: string; error: string };
  
  // HPM 事件
  'hpm:refresh': void;
  'hpm:install': { packageId: string };
  'hpm:uninstall': { packageId: string };
  
  // 主题事件
  'theme:change': { theme: 'light' | 'dark' | 'auto' };
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<keyof EventMap, Set<EventCallback>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 订阅事件
   */
  public on<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const callbacks = this.listeners.get(event)!;
    callbacks.add(callback);

    // 返回取消订阅函数
    return () => {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  /**
   * 订阅事件（只触发一次）
   */
  public once<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    const unsubscribe = this.on(event, (data) => {
      callback(data);
      unsubscribe();
    });

    return unsubscribe;
  }

  /**
   * 发布事件
   */
  public emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件回调执行失败 [${String(event)}]:`, error);
        }
      });
    }
  }

  /**
   * 取消所有订阅
   */
  public off<K extends keyof EventMap>(event: K): void {
    this.listeners.delete(event);
  }

  /**
   * 清空所有事件监听器
   */
  public clear(): void {
    this.listeners.clear();
  }

  /**
   * 获取事件监听器数量
   */
  public getListenerCount<K extends keyof EventMap>(event: K): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * 获取所有事件名称
   */
  public getEventNames(): (keyof EventMap)[] {
    return Array.from(this.listeners.keys());
  }
}

// 导出单例实例
export const eventBus = EventBus.getInstance();

// 便捷函数
export const on = <K extends keyof EventMap>(
  event: K,
  callback: EventCallback<EventMap[K]>
) => eventBus.on(event, callback);

export const once = <K extends keyof EventMap>(
  event: K,
  callback: EventCallback<EventMap[K]>
) => eventBus.once(event, callback);

export const emit = <K extends keyof EventMap>(event: K, data: EventMap[K]) => 
  eventBus.emit(event, data);

export const off = <K extends keyof EventMap>(event: K) => eventBus.off(event);