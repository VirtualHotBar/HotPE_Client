/**
 * Console 替换工具
 * 用于批量替换项目中的 console 调用为统一的日志系统
 */

import { createLogger } from '../services/logger';

const logger = createLogger('ConsoleReplacer');

/**
 * 创建 console 替换器
 * 可以逐步替换现有的 console 调用
 */
export class ConsoleReplacer {
  private componentName: string;
  private logger: ReturnType<typeof createLogger>;

  constructor(componentName: string) {
    this.componentName = componentName;
    this.logger = createLogger(componentName);
  }

  /**
   * 替换 console.log
   */
  log(message: string, ...args: any[]) {
    this.logger.info(message, 'log', args.length > 0 ? args : undefined);
  }

  /**
   * 替换 console.info
   */
  info(message: string, ...args: any[]) {
    this.logger.info(message, 'info', args.length > 0 ? args : undefined);
  }

  /**
   * 替换 console.warn
   */
  warn(message: string, ...args: any[]) {
    this.logger.warn(message, 'warn', args.length > 0 ? args : undefined);
  }

  /**
   * 替换 console.error
   */
  error(message: string, ...args: any[]) {
    this.logger.error(message, 'error', args.length > 0 ? args : undefined);
  }

  /**
   * 替换 console.debug
   */
  debug(message: string, ...args: any[]) {
    this.logger.debug(message, 'debug', args.length > 0 ? args : undefined);
  }
}

/**
 * 创建组件专用的 console 替换器
 */
export function createConsoleReplacer(componentName: string): ConsoleReplacer {
  return new ConsoleReplacer(componentName);
}

/**
 * 全局 console 替换器（用于快速迁移）
 */
export const globalConsole = createConsoleReplacer('Global');

/**
 * 便捷的替换函数
 */
export const replaceConsole = {
  log: (message: string, component?: string, ...args: any[]) => {
    const replacer = component ? createConsoleReplacer(component) : globalConsole;
    replacer.log(message, ...args);
  },
  info: (message: string, component?: string, ...args: any[]) => {
    const replacer = component ? createConsoleReplacer(component) : globalConsole;
    replacer.info(message, ...args);
  },
  warn: (message: string, component?: string, ...args: any[]) => {
    const replacer = component ? createConsoleReplacer(component) : globalConsole;
    replacer.warn(message, ...args);
  },
  error: (message: string, component?: string, ...args: any[]) => {
    const replacer = component ? createConsoleReplacer(component) : globalConsole;
    replacer.error(message, ...args);
  },
  debug: (message: string, component?: string, ...args: any[]) => {
    const replacer = component ? createConsoleReplacer(component) : globalConsole;
    replacer.debug(message, ...args);
  }
};