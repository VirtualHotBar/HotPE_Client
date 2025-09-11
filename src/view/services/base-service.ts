/**
 * 基础服务类
 * 提供统一的错误处理和 IPC 调用封装
 */

import { errorHandler, ErrorContext } from './error-handler';

export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * 安全的 IPC 调用
   */
  protected async safeInvoke<T>(
    channel: string,
    ...args: any[]
  ): Promise<T | null> {
    return errorHandler.handleAsync(
      () => window.electronAPI.invoke(channel, ...args),
      {
        component: this.serviceName,
        action: `IPC:${channel}`,
        showToUser: false // IPC 错误通常不直接显示给用户
      }
    );
  }

  /**
   * 安全的 IPC 调用（显示错误给用户）
   */
  protected async safeInvokeWithUserError<T>(
    channel: string,
    errorMessage: string,
    ...args: any[]
  ): Promise<T | null> {
    return errorHandler.handleAsync(
      () => window.electronAPI.invoke(channel, ...args),
      {
        component: this.serviceName,
        action: `IPC:${channel}`,
        details: errorMessage,
        showToUser: true
      }
    );
  }

  /**
   * 批量 IPC 调用
   */
  protected async batchInvoke<T>(
    calls: Array<{ channel: string; args: any[] }>
  ): Promise<(T | null)[]> {
    const promises = calls.map(({ channel, args }) => 
      this.safeInvoke<T>(channel, ...args)
    );
    
    return Promise.all(promises);
  }

  /**
   * 创建错误上下文
   */
  protected createErrorContext(action: string, showToUser = true): ErrorContext {
    return {
      component: this.serviceName,
      action,
      showToUser
    };
  }

  /**
   * 处理错误
   */
  protected handleError(error: Error | string, context?: Partial<ErrorContext>): void {
    errorHandler.handle(error, {
      component: this.serviceName,
      ...context
    });
  }

  /**
   * 记录信息日志
   */
  protected logInfo(message: string, action?: string): void {
    console.info(`[${this.serviceName}] ${action || 'Info'}: ${message}`);
  }

  /**
   * 记录警告日志
   */
  protected logWarning(message: string, action?: string): void {
    console.warn(`[${this.serviceName}] ${action || 'Warning'}: ${message}`);
  }

  /**
   * 记录错误日志
   */
  protected logError(message: string, action?: string): void {
    console.error(`[${this.serviceName}] ${action || 'Error'}: ${message}`);
  }
}