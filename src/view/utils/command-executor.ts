/**
 * 命令执行器 - 重构后的命令执行工具
 */

import { safeAsync, Result, retry } from './enhanced-utils';

// 命令执行结果类型
export interface CommandResult {
  success: boolean;
  output: string;
  code: number;
  duration: number;
}

// 命令执行选项
export interface CommandOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  encoding?: string;
  onOutput?: (data: string) => void;
}

/**
 * 命令执行器类
 */
export class CommandExecutor {
  private static instance: CommandExecutor;
  private outputListeners: Set<(data: string) => void> = new Set();

  private constructor() {
    // 设置全局输出监听器
    window.electronAPI.cmd.onOutput((data: string) => {
      this.outputListeners.forEach(listener => listener(data));
    });
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CommandExecutor {
    if (!CommandExecutor.instance) {
      CommandExecutor.instance = new CommandExecutor();
    }
    return CommandExecutor.instance;
  }

  /**
   * 同步执行命令
   */
  public async execSync(
    command: string,
    options: Omit<CommandOptions, 'onOutput'> = {}
  ): Promise<Result<string>> {
    const { timeout = 30000, retries = 1, retryDelay = 1000 } = options;

    const executeCommand = async (): Promise<string> => {
      const startTime = Date.now();

      // 创建超时Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`命令执行超时 (${timeout}ms): ${command}`));
        }, timeout);
      });

      // 执行命令
      const commandPromise = window.electronAPI.cmd.execSync(command);

      try {
        const result = await Promise.race([commandPromise, timeoutPromise]);
        const duration = Date.now() - startTime;

        console.log(`命令执行完成 (${duration}ms): ${command}`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`命令执行失败 (${duration}ms): ${command}`, error);
        throw error;
      }
    };

    if (retries > 1) {
      return retry(executeCommand, retries, retryDelay);
    } else {
      return safeAsync(executeCommand);
    }
  }

  /**
   * 异步执行命令（支持实时输出）
   */
  public async spawn(
    command: string,
    options: CommandOptions = {}
  ): Promise<Result<CommandResult>> {
    const { timeout = 60000, retries = 1, retryDelay = 1000, onOutput } = options;

    const executeCommand = async (): Promise<CommandResult> => {
      const startTime = Date.now();

      // 添加输出监听器
      if (onOutput) {
        this.addOutputListener(onOutput);
      }

      try {
        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`命令执行超时 (${timeout}ms): ${command}`));
          }, timeout);
        });

        // 执行命令
        const commandPromise = window.electronAPI.cmd.spawn(command);
        const result = await Promise.race([commandPromise, timeoutPromise]);

        const duration = Date.now() - startTime;

        console.log(`异步命令执行完成 (${duration}ms): ${command}`, result);

        return {
          ...result,
          duration,
        };
      } finally {
        // 移除输出监听器
        if (onOutput) {
          this.removeOutputListener(onOutput);
        }
      }
    };

    if (retries > 1) {
      return retry(executeCommand, retries, retryDelay);
    } else {
      return safeAsync(executeCommand);
    }
  }

  /**
   * 批量执行命令
   */
  public async execBatch(
    commands: string[],
    options: CommandOptions = {}
  ): Promise<Result<CommandResult[]>> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      const result = await this.spawn(command, options);

      if (!result.success) {
        return result as Result<CommandResult[]>;
      }

      results.push(result.data);

      // 如果命令失败，停止执行后续命令
      if (!result.data.success) {
        break;
      }
    }

    return { success: true, data: results };
  }

  /**
   * 执行PowerShell命令
   */
  public async execPowerShell(
    script: string,
    options: CommandOptions = {}
  ): Promise<Result<CommandResult>> {
    const command = `powershell.exe -Command "${script.replace(/"/g, '\\"')}"`;
    return this.spawn(command, options);
  }

  /**
   * 执行批处理文件
   */
  public async execBatchFile(
    filePath: string,
    args: string[] = [],
    options: CommandOptions = {}
  ): Promise<Result<CommandResult>> {
    const command = `"${filePath}" ${args.join(' ')}`;
    return this.spawn(command, options);
  }

  /**
   * 检查命令是否存在
   */
  public async commandExists(command: string): Promise<Result<boolean>> {
    const result = await this.execSync(`where ${command}`);
    return {
      success: true,
      data: result.success,
    };
  }

  /**
   * 获取系统信息
   */
  public async getSystemInfo(): Promise<Result<Record<string, string>>> {
    const commands = [
      'echo %OS%',
      'echo %PROCESSOR_ARCHITECTURE%',
      'echo %USERNAME%',
      'echo %COMPUTERNAME%',
      'echo %SystemDrive%',
    ];

    const info: Record<string, string> = {};

    for (const command of commands) {
      const result = await this.execSync(command);
      if (result.success) {
        const key = command.replace('echo %', '').replace('%', '');
        info[key] = result.data.trim();
      }
    }

    return { success: true, data: info };
  }

  /**
   * 添加输出监听器
   */
  public addOutputListener(listener: (data: string) => void): void {
    this.outputListeners.add(listener);
  }

  /**
   * 移除输出监听器
   */
  public removeOutputListener(listener: (data: string) => void): void {
    this.outputListeners.delete(listener);
  }

  /**
   * 清除所有输出监听器
   */
  public clearOutputListeners(): void {
    this.outputListeners.clear();
  }

  /**
   * 停止所有正在执行的命令（如果支持）
   */
  public stopAllCommands(): void {
    // 这里可以添加停止命令的逻辑
    // 目前主要是清理监听器
    this.clearOutputListeners();
  }
}

// 导出单例实例
export const commandExecutor = CommandExecutor.getInstance();

// 便捷函数导出
export const execSync = (command: string, options?: Omit<CommandOptions, 'onOutput'>) =>
  commandExecutor.execSync(command, options);

export const spawn = (command: string, options?: CommandOptions) =>
  commandExecutor.spawn(command, options);

export const execBatch = (commands: string[], options?: CommandOptions) =>
  commandExecutor.execBatch(commands, options);

export const execPowerShell = (script: string, options?: CommandOptions) =>
  commandExecutor.execPowerShell(script, options);

export const execBatchFile = (filePath: string, args?: string[], options?: CommandOptions) =>
  commandExecutor.execBatchFile(filePath, args, options);

export const commandExists = (command: string) => commandExecutor.commandExists(command);

export const getSystemInfo = () => commandExecutor.getSystemInfo();
