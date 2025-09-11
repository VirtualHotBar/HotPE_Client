/**
 * 工具函数相关类型定义
 */

export interface Result<T> {
  success: boolean;
  data: T;
  error: Error;
}

export async function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const data = await fn();
    return {
      success: true,
      data,
      error: null as any
    };
  } catch (error) {
    return {
      success: false,
      data: null as any,
      error: error as Error
    };
  }
}