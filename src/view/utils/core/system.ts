/**
 * 系统相关核心工具函数
 * 整合了原有的系统操作相关功能
 */

import { runCmd } from '../command';

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error = new Error('未知错误');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        await delay(delayMs * attempt); // 指数退避
      }
    }
  }

  throw new Error(`重试${maxAttempts}次后仍然失败: ${lastError.message}`);
}

/**
 * 获取系统环境信息
 */
export async function getSystemEnvironment() {
  try {
    const [execDir, sysLetter, temp, userName, desktopDir] = await Promise.all([
      runCmd('cd'),
      runCmd('echo %SystemDrive%'),
      runCmd('echo %temp%'),
      runCmd('echo %UserName%'),
      runCmd('echo %SystemDrive%\\Users\\%UserName%\\Desktop\\')
    ]);

    return {
      execDir: `${execDir.replaceAll('\r\n', '')}\\`,
      sysLetter: sysLetter.substring(0, 2),
      temp: `${temp.replaceAll('\r\n', '')}\\`,
      userName: userName.replaceAll('\r\n', ''),
      desktopDir: desktopDir.replaceAll('\r\n', '')
    };
  } catch (error) {
    console.error('获取系统环境信息失败:', error);
    // 返回默认值
    return {
      execDir: 'C:\\',
      sysLetter: 'C:',
      temp: 'C:\\temp\\',
      userName: 'User',
      desktopDir: 'C:\\Users\\User\\Desktop\\'
    };
  }
}

/**
 * 检查是否为HotPE驱动器
 */
export async function isHotPEDrive(drive: string): Promise<boolean> {
  try {
    const configPath = `${drive.substring(0, 1)}:\\HotPE\\confi.ini`;
    const { fileExists } = await import('./file');
    return await fileExists(configPath);
  } catch {
    return false;
  }
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * 检查对象是否为空
 */
export function isEmpty(obj: unknown): boolean {
  if (obj == null) {
    return true;
  }
  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length === 0;
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  return false;
}

/**
 * 安全获取对象属性
 */
export function safeGet<T>(obj: unknown, path: string | string[], defaultValue?: T): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current !== undefined ? (current as T) : defaultValue;
}

/**
 * 类型守卫函数
 */
export const typeGuards = {
  isString: (value: unknown): value is string => typeof value === 'string',
  isNumber: (value: unknown): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  isObject: (value: unknown): value is Record<string, unknown> => 
    value !== null && typeof value === 'object' && !Array.isArray(value),
  isArray: <T>(value: unknown): value is T[] => Array.isArray(value),
  isFunction: (value: unknown): value is Function => typeof value === 'function'
};