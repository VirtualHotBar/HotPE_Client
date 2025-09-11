/**
 * 统一错误处理服务
 * 替代 Controller 中直接调用 UI 组件的方式
 */

import { NotificationManager } from './notification-manager';

export interface ErrorContext {
  component?: string;
  action?: string;
  details?: string;
  showToUser?: boolean;
  logLevel?: 'error' | 'warn' | 'info';
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private notificationManager: NotificationManager;

  private constructor() {
    this.notificationManager = NotificationManager.getInstance();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理错误
   */
  public handle(error: Error | string, context?: ErrorContext): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    // 记录错误日志
    this.logError(errorMessage, errorStack, context);

    // 如果需要显示给用户
    if (context?.showToUser !== false) {
      this.showErrorToUser(errorMessage, context);
    }
  }

  /**
   * 处理异步操作错误
   */
  public async handleAsync<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  /**
   * 处理同步操作错误
   */
  public handleSync<T>(
    operation: () => T,
    context?: ErrorContext
  ): T | null {
    try {
      return operation();
    } catch (error) {
      this.handle(error as Error, context);
      return null;
    }
  }

  /**
   * 记录错误日志
   */
  private logError(message: string, stack?: string, context?: ErrorContext): void {
    const logLevel = context?.logLevel || 'error';
    const logMessage = `[${context?.component || 'Unknown'}] ${context?.action || 'Operation'}: ${message}`;

    switch (logLevel) {
      case 'error':
        console.error(logMessage, stack);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
    }

    // 可以在这里添加日志上报逻辑
    this.reportError(message, stack, context);
  }

  /**
   * 显示错误给用户
   */
  private showErrorToUser(message: string, context?: ErrorContext): void {
    const title = context?.component ? `${context.component} 错误` : '操作失败';
    const content = context?.details ? `${message}\n详情: ${context.details}` : message;

    this.notificationManager.error({
      title,
      content,
      duration: 5000
    });
  }

  /**
   * 上报错误（可扩展）
   */
  private reportError(message: string, stack?: string, context?: ErrorContext): void {
    // 这里可以添加错误上报逻辑，比如发送到服务器
    // 目前只是占位符
    if (process.env['NODE_ENV'] === 'development') {
      console.debug('Error reported:', { message, stack, context });
    }
  }

  /**
   * 创建带错误处理的包装函数
   */
  public wrap<T extends (...args: any[]) => any>(
    fn: T,
    context?: ErrorContext
  ): (...args: Parameters<T>) => ReturnType<T> | null {
    return (...args: Parameters<T>) => {
      return this.handleSync(() => fn(...args), context);
    };
  }

  /**
   * 创建带错误处理的异步包装函数
   */
  public wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: ErrorContext
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | null> {
    return async (...args: Parameters<T>) => {
      return this.handleAsync(() => fn(...args), context);
    };
  }
}

// 导出单例实例
export const errorHandler = ErrorHandler.getInstance();

// 便捷函数
export const handleError = (error: Error | string, context?: ErrorContext) => 
  errorHandler.handle(error, context);

export const handleAsync = <T>(operation: () => Promise<T>, context?: ErrorContext) => 
  errorHandler.handleAsync(operation, context);

export const handleSync = <T>(operation: () => T, context?: ErrorContext) => 
  errorHandler.handleSync(operation, context);