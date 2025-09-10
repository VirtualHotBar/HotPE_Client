// 文件系统操作相关类型定义

export interface MkdirOptions {
  recursive?: boolean;
  mode?: string | number;
}

export interface CpOptions {
  recursive?: boolean;
  force?: boolean;
  preserveTimestamps?: boolean;
}

export interface SpawnResult {
  success: boolean;
  output: string;
  code: number;
}

export interface ProcessOutput {
  stdout: { on: (event: string, callback: (data: Buffer) => void) => void };
  stderr: { on: (event: string, callback: (data: Buffer) => void) => void };
  on: (event: string, callback: (code: number) => void) => void;
}

export type ErrorCallback = (err: Error | null) => void;