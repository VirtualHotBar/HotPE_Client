/**
 * 字符串处理核心工具函数
 * 整合了原有的字符串相关功能
 */

/**
 * 检查字符串是否为有效JSON
 */
export function isJSON(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  try {
    const obj = JSON.parse(str);
    return typeof obj === 'object' && obj !== null;
  } catch {
    return false;
  }
}

/**
 * 安全解析JSON
 */
export function safeParseJSON<T = unknown>(str: string): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * 安全字符串化JSON
 */
export function safeStringifyJSON(obj: unknown, space?: number): string | null {
  try {
    return JSON.stringify(obj, null, space);
  } catch {
    return null;
  }
}

/**
 * 提取字符串左侧部分
 */
export function takeLeftStr(str: string, delimiter: string): string {
  const index = str.indexOf(delimiter);
  return index !== -1 ? str.substring(0, index) : str;
}

/**
 * 提取字符串右侧部分
 */
export function takeRightStr(str: string, delimiter: string): string {
  const index = str.lastIndexOf(delimiter);
  return index !== -1 ? str.substring(index + delimiter.length) : str;
}

/**
 * 提取字符串中间部分
 */
export function takeMidStr(str: string, startDelimiter: string, endDelimiter: string): string {
  const startIndex = str.indexOf(startDelimiter);
  if (startIndex === -1) return '';
  
  const start = startIndex + startDelimiter.length;
  const endIndex = str.indexOf(endDelimiter, start);
  
  return endIndex !== -1 ? str.substring(start, endIndex) : str.substring(start);
}

/**
 * 处理命令行字符串
 */
export function dealStrForCmd(str: string): string {
  return str
    .replace(/\r\n/g, '')
    .replace(/\n/g, '')
    .trim();
}

/**
 * 过滤数组中的空值
 */
export function filterArrayNull<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => item != null);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
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
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 驼峰转下划线
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 下划线转驼峰
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 截断字符串
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}