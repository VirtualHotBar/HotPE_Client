/**
 * 增强工具函数库 - 提供类型安全和错误处理
 */

import { safeFS } from './safeAPI';

/**
 * 结果类型 - 用于错误处理
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * 创建成功结果
 */
export function createSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * 创建失败结果
 */
export function createError<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * 安全执行异步函数
 */
export async function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await fn();
    return createSuccess(data);
  } catch (error) {
    return createError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 安全执行同步函数
 */
export function safeSync<T>(fn: () => T): Result<T> {
  try {
    const data = fn();
    return createSuccess(data);
  } catch (error) {
    return createError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 检查字符串是否为有效JSON
 */
export function isValidJSON(str: string): boolean {
  if (typeof str !== 'string') {return false;}

  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全解析JSON
 */
export function safeParseJSON<T = unknown>(str: string): Result<T> {
  try {
    const data = JSON.parse(str);
    return createSuccess(data);
  } catch (error) {
    return createError(new Error(`JSON解析失败: ${error}`));
  }
}

/**
 * 安全字符串化JSON
 */
export function safeStringifyJSON(obj: unknown, space?: number): Result<string> {
  try {
    const str = JSON.stringify(obj, null, space);
    return createSuccess(str);
  } catch (error) {
    return createError(new Error(`JSON字符串化失败: ${error}`));
  }
}

/**
 * 创建目录（安全版本）
 */
export async function createDirectory(dirPath: string): Promise<Result<boolean>> {
  return safeAsync(async () => {
    return await safeFS.mkdirSync(dirPath, { recursive: true });
  });
}

/**
 * 读取JSON文件
 */
export async function readJSONFile<T = unknown>(filePath: string): Promise<Result<T>> {
  const fileResult = await safeAsync(() => safeFS.readFileSync(filePath, 'utf8'));

  if (!fileResult.success) {
    return createError(new Error(`读取文件失败: ${fileResult.error.message}`));
  }

  const parseResult = safeParseJSON<T>(fileResult.data);
  if (!parseResult.success) {
    return createError(new Error(`解析JSON失败: ${parseResult.error.message}`));
  }

  return createSuccess(parseResult.data);
}

/**
 * 写入JSON文件
 */
export async function writeJSONFile(
  filePath: string,
  data: unknown,
  space = 2
): Promise<Result<boolean>> {
  const stringifyResult = safeStringifyJSON(data, space);

  if (!stringifyResult.success) {
    return createError(new Error(`JSON序列化失败: ${stringifyResult.error.message}`));
  }

  return safeAsync(async () => {
    return await safeFS.writeFileSync(filePath, stringifyResult.data, 'utf8');
  });
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<Result<boolean>> {
  return safeAsync(() => safeFS.existsSync(filePath));
}

/**
 * 复制文件
 */
export async function copyFile(src: string, dest: string): Promise<Result<boolean>> {
  return safeAsync(() => safeFS.copyFile(src, dest));
}

/**
 * 重命名文件
 */
export async function renameFile(oldPath: string, newPath: string): Promise<Result<boolean>> {
  return safeAsync(() => safeFS.rename(oldPath, newPath));
}

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
): Promise<Result<T>> {
  let lastError: Error = new Error('未知错误');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await safeAsync(fn);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    if (attempt < maxAttempts) {
      await delay(delayMs * attempt); // 指数退避
    }
  }

  return createError(new Error(`重试${maxAttempts}次后仍然失败: ${lastError.message}`));
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {return '0 B';}

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化时间
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '无效时间';
  }

  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * 生成UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
  if (obj == null) {return true;}
  if (typeof obj === 'string' || Array.isArray(obj)) {return obj.length === 0;}
  if (typeof obj === 'object') {return Object.keys(obj).length === 0;}
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
 * 类型守卫 - 检查是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 类型守卫 - 检查是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 类型守卫 - 检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 类型守卫 - 检查是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 类型守卫 - 检查是否为数组
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}
