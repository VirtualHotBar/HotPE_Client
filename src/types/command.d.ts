/**
 * 命令执行相关类型定义
 */

export interface CommandOutput {
  /** 命令唯一标识符 */
  commandId: string;
  /** 输出数据 */
  data: string;
  /** 输出类型 */
  type: 'stdout' | 'stderr' | 'exit';
  /** 退出码（仅在 type 为 'exit' 时有效） */
  code?: number;
}

export interface CommandResult {
  /** 执行是否成功 */
  success: boolean;
  /** 完整输出内容 */
  output: string;
  /** 退出码 */
  code: number;
  /** 命令唯一标识符 */
  commandId: string;
}