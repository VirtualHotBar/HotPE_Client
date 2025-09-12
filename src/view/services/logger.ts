/**
 * 统一日志管理系统
 * 替代项目中所有的 console 调用
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  component?: string;
  action?: string;
  timestamp: Date;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    // 在开发环境下启用调试日志
    // 使用 import.meta.env 替代 process.env
    if (import.meta.env.DEV) {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 设置日志级别
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 记录调试日志
   */
  public debug(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, component, action, data);
  }

  /**
   * 记录信息日志
   */
  public info(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.INFO, message, component, action, data);
  }

  /**
   * 记录警告日志
   */
  public warn(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.WARN, message, component, action, data);
  }

  /**
   * 记录错误日志
   */
  public error(message: string, component?: string, action?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, component, action, data);
  }

  /**
   * 核心日志记录方法
   */
  private log(level: LogLevel, message: string, component?: string, action?: string, data?: any): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      ...(component !== undefined && { component }),
      ...(action !== undefined && { action }),
      ...(data !== undefined && { data })
    };

    // 添加到内存日志
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 输出到控制台
    this.outputToConsole(entry);
  }

  /**
   * 输出到控制台
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = entry.component 
      ? `[${entry.component}${entry.action ? `:${entry.action}` : ''}]`
      : '';
    
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data);
        break;
    }
  }

  /**
   * 获取日志历史
   */
  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * 创建组件日志器
   */
  public createComponentLogger(component: string) {
    return {
      debug: (message: string, action?: string, data?: any) => 
        this.debug(message, component, action, data),
      info: (message: string, action?: string, data?: any) => 
        this.info(message, component, action, data),
      warn: (message: string, action?: string, data?: any) => 
        this.warn(message, component, action, data),
      error: (message: string, action?: string, data?: any) => 
        this.error(message, component, action, data)
    };
  }
}

// 导出单例实例
export const logger = Logger.getInstance();

// 便捷函数
export const log = {
  debug: (message: string, component?: string, action?: string, data?: any) => 
    logger.debug(message, component, action, data),
  info: (message: string, component?: string, action?: string, data?: any) => 
    logger.info(message, component, action, data),
  warn: (message: string, component?: string, action?: string, data?: any) => 
    logger.warn(message, component, action, data),
  error: (message: string, component?: string, action?: string, data?: any) => 
    logger.error(message, component, action, data)
};

// 创建组件日志器的便捷函数
export const createLogger = (component: string) => logger.createComponentLogger(component);