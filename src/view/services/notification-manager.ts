/**
 * 通知管理器 - 统一的通知处理系统
 */

import { Notification, Toast } from '@douyinfe/semi-ui';
import { 
  NOTIFICATION_TYPES, 
  DEFAULT_VALUES, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  type NotificationType 
} from '../constants';

// 通知选项类型
export interface NotificationOptions {
  title?: string;
  content: string;
  duration?: number;
  position?: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
  showClose?: boolean;
  theme?: 'light' | 'normal';
  onClick?: () => void;
  onClose?: () => void;
}

// Toast选项类型
export interface ToastOptions {
  content: string;
  duration?: number;
  position?: 'top' | 'bottom';
  showClose?: boolean;
  onClick?: () => void;
  onClose?: () => void;
}

// 通知历史记录类型
export interface NotificationRecord {
  id: string;
  type: NotificationType;
  title?: string | undefined;
  content: string;
  timestamp: Date;
  read: boolean;
}

/**
 * 通知管理器类
 */
export class NotificationManager {
  private static instance: NotificationManager;
  private history: NotificationRecord[] = [];
  private maxHistorySize = 100;
  private defaultDuration = DEFAULT_VALUES.NOTIFICATION_DURATION;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * 生成通知ID
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(
    type: NotificationType,
    title: string | undefined,
    content: string
  ): void {
    const record: NotificationRecord = {
      id: this.generateId(),
      type,
      title: title,
      content,
      timestamp: new Date(),
      read: false,
    };

    this.history.unshift(record);

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * 显示成功通知
   */
  public success(options: NotificationOptions): void {
    const config: any = {
      title: options.title || '成功',
      content: options.content,
      duration: options.duration || this.defaultDuration,
      position: options.position || 'topRight' as const,
      showClose: options.showClose ?? true,
      theme: options.theme || 'light' as const,
    };

    if (options.onClick) {
      config.onClick = options.onClick;
    }
    if (options.onClose) {
      config.onClose = options.onClose;
    }

    Notification.success(config);
    this.addToHistory(NOTIFICATION_TYPES.SUCCESS, config.title, config.content);
  }

  /**
   * 显示错误通知
   */
  public error(options: NotificationOptions): void {
    const config: any = {
      title: options.title || '错误',
      content: options.content,
      duration: options.duration || this.defaultDuration * 2, // 错误通知显示更久
      position: options.position || 'topRight' as const,
      showClose: options.showClose ?? true,
      theme: options.theme || 'light' as const,
    };

    if (options.onClick) {
      config.onClick = options.onClick;
    }
    if (options.onClose) {
      config.onClose = options.onClose;
    }

    Notification.error(config);
    this.addToHistory(NOTIFICATION_TYPES.ERROR, config.title, config.content);
  }

  /**
   * 显示警告通知
   */
  public warning(options: NotificationOptions): void {
    const config: any = {
      title: options.title || '警告',
      content: options.content,
      duration: options.duration || this.defaultDuration,
      position: options.position || 'topRight' as const,
      showClose: options.showClose ?? true,
      theme: options.theme || 'light' as const,
    };

    if (options.onClick) {
      config.onClick = options.onClick;
    }
    if (options.onClose) {
      config.onClose = options.onClose;
    }

    Notification.warning(config);
    this.addToHistory(NOTIFICATION_TYPES.WARNING, config.title, config.content);
  }

  /**
   * 显示信息通知
   */
  public info(options: NotificationOptions): void {
    const config: any = {
      title: options.title || '信息',
      content: options.content,
      duration: options.duration || this.defaultDuration,
      position: options.position || 'topRight' as const,
      showClose: options.showClose ?? true,
      theme: options.theme || 'light' as const,
    };

    if (options.onClick) {
      config.onClick = options.onClick;
    }
    if (options.onClose) {
      config.onClose = options.onClose;
    }

    Notification.info(config);
    this.addToHistory(NOTIFICATION_TYPES.INFO, config.title, config.content);
  }

  /**
   * 显示Toast消息
   */
  public toast(type: NotificationType, options: ToastOptions): void {
    const config: any = {
      content: options.content,
      duration: options.duration || this.defaultDuration / 2, // Toast显示时间更短
      position: options.position || 'top' as const,
      showClose: options.showClose ?? false,
    };

    if (options.onClick) {
      config.onClick = options.onClick;
    }
    if (options.onClose) {
      config.onClose = options.onClose;
    }

    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        Toast.success(config);
        break;
      case NOTIFICATION_TYPES.ERROR:
        Toast.error(config);
        break;
      case NOTIFICATION_TYPES.WARNING:
        Toast.warning(config);
        break;
      case NOTIFICATION_TYPES.INFO:
      default:
        Toast.info(config);
        break;
    }

    this.addToHistory(type, undefined, config.content);
  }

  /**
   * 快捷方法 - 成功Toast
   */
  public successToast(content: string, options?: Omit<ToastOptions, 'content'>): void {
    this.toast(NOTIFICATION_TYPES.SUCCESS, { content, ...options });
  }

  /**
   * 快捷方法 - 错误Toast
   */
  public errorToast(content: string, options?: Omit<ToastOptions, 'content'>): void {
    this.toast(NOTIFICATION_TYPES.ERROR, { content, ...options });
  }

  /**
   * 快捷方法 - 警告Toast
   */
  public warningToast(content: string, options?: Omit<ToastOptions, 'content'>): void {
    this.toast(NOTIFICATION_TYPES.WARNING, { content, ...options });
  }

  /**
   * 快捷方法 - 信息Toast
   */
  public infoToast(content: string, options?: Omit<ToastOptions, 'content'>): void {
    this.toast(NOTIFICATION_TYPES.INFO, { content, ...options });
  }

  /**
   * 预定义错误消息通知
   */
  public showError(errorKey: keyof typeof ERROR_MESSAGES, details?: string): void {
    const message = ERROR_MESSAGES[errorKey];
    const content = details ? `${message}: ${details}` : message;
    
    this.error({
      content,
      duration: 5000, // 错误消息显示更久
    });
  }

  /**
   * 预定义成功消息通知
   */
  public showSuccess(successKey: keyof typeof SUCCESS_MESSAGES, details?: string): void {
    const message = SUCCESS_MESSAGES[successKey];
    const content = details ? `${message}: ${details}` : message;
    
    this.success({
      content,
    });
  }

  /**
   * 显示加载通知
   */
  public showLoading(content: string, duration = 0): void {
    this.info({
      title: '加载中',
      content,
      duration, // 0表示不自动关闭
      showClose: false,
    });
  }

  /**
   * 显示进度通知
   */
  public showProgress(content: string, progress: number): void {
    const progressText = `${content} (${Math.round(progress)}%)`;
    this.info({
      title: '进度',
      content: progressText,
      duration: 0,
      showClose: false,
    });
  }

  /**
   * 关闭所有通知
   */
  public closeAll(): void {
    Notification.destroyAll();
    Toast.destroyAll();
  }

  /**
   * 获取通知历史
   */
  public getHistory(): NotificationRecord[] {
    return [...this.history];
  }

  /**
   * 获取未读通知数量
   */
  public getUnreadCount(): number {
    return this.history.filter(record => !record.read).length;
  }

  /**
   * 标记通知为已读
   */
  public markAsRead(id: string): void {
    const record = this.history.find(r => r.id === id);
    if (record) {
      record.read = true;
    }
  }

  /**
   * 标记所有通知为已读
   */
  public markAllAsRead(): void {
    this.history.forEach(record => {
      record.read = true;
    });
  }

  /**
   * 清除历史记录
   */
  public clearHistory(): void {
    this.history = [];
  }

  /**
   * 设置默认持续时间
   */
  public setDefaultDuration(duration: number): void {
    this.defaultDuration = duration as 2000;
  }

  /**
   * 设置最大历史记录大小
   */
  public setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    if (this.history.length > size) {
      this.history = this.history.slice(0, size);
    }
  }
}

// 导出单例实例
export const notificationManager = NotificationManager.getInstance();

// 便捷函数导出
export const showSuccess = (options: NotificationOptions) => 
  notificationManager.success(options);

export const showError = (options: NotificationOptions) => 
  notificationManager.error(options);

export const showWarning = (options: NotificationOptions) => 
  notificationManager.warning(options);

export const showInfo = (options: NotificationOptions) => 
  notificationManager.info(options);

export const successToast = (content: string, options?: Omit<ToastOptions, 'content'>) => 
  notificationManager.successToast(content, options);

export const errorToast = (content: string, options?: Omit<ToastOptions, 'content'>) => 
  notificationManager.errorToast(content, options);

export const warningToast = (content: string, options?: Omit<ToastOptions, 'content'>) => 
  notificationManager.warningToast(content, options);

export const infoToast = (content: string, options?: Omit<ToastOptions, 'content'>) => 
  notificationManager.infoToast(content, options);

export const showPredefinedError = (errorKey: keyof typeof ERROR_MESSAGES, details?: string) => 
  notificationManager.showError(errorKey, details);

export const showPredefinedSuccess = (successKey: keyof typeof SUCCESS_MESSAGES, details?: string) => 
  notificationManager.showSuccess(successKey, details);

export const showLoading = (content: string, duration?: number) => 
  notificationManager.showLoading(content, duration);

export const showProgress = (content: string, progress: number) => 
  notificationManager.showProgress(content, progress);

export const closeAllNotifications = () => 
  notificationManager.closeAll();