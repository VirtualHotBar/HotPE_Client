import { safeChildProcess } from './safeAPI';
import type { CommandOutput } from '../../types/command';

// 异步执行命令行，并通过回调返回结果
export function runCmd(
  cmd: string,
  returnstr: (data: string) => void,
  end: (code: number) => void
) {
  let outputBuffer = '';
  let commandId: string | undefined;

  // 设置输出监听（使用新格式）
  safeChildProcess.onOutput((output: CommandOutput) => {
    // 如果是第一次接收到输出，记录命令ID
    if (!commandId) {
      commandId = output.commandId;
    }
    
    // 只处理属于当前命令的输出
    if (output.commandId === commandId) {
      if (output.type === 'stdout' || output.type === 'stderr') {
        if (output.data.trim()) {
          outputBuffer += output.data;
          returnstr(output.data);
        }
      } else if (output.type === 'exit') {
        console.info(`${output.code} Command: ${cmd}`);
        end(output.code || 0);
        // 清理监听器
        safeChildProcess.removeOutputListener();
      }
    }
  });

  // 执行命令
  safeChildProcess
    .spawn(cmd)
    .then(result => {
      // 如果没有通过输出监听器处理退出事件，则在这里处理
      if (!commandId) {
        console.info(`${result.code} Command: ${cmd}`);
        end(result.code);
        safeChildProcess.removeOutputListener();
      }
    })
    .catch(error => {
      console.error('命令执行失败:', error);
      end(1);
      safeChildProcess.removeOutputListener();
    });
}

// 异步执行命令行，并通过回调返回结果（兼容旧版本）
export function runCmdLegacy(
  cmd: string,
  returnstr: (data: string) => void,
  end: (code: number) => void
) {
  let outputBuffer = '';

  // 使用兼容性方法
  safeChildProcess.onOutputLegacy((data: string) => {
    outputBuffer += data;
    returnstr(data);
  });

  // 执行命令
  safeChildProcess
    .spawn(cmd)
    .then(result => {
      console.info(`${result.code} Command: ${cmd}`);
      end(result.code);
      // 清理监听器
      safeChildProcess.removeOutputListener();
    })
    .catch(error => {
      console.error('命令执行失败:', error);
      end(1);
      safeChildProcess.removeOutputListener();
    });
}

// 异步执行命令行，并通过 Promise 返回结果
export async function runCmdAsync(cmd: string): Promise<string> {
  try {
    const result = await safeChildProcess.spawn(cmd);
    if (result.success) {
      return result.output;
    } else {
      // 即使失败也返回输出，保持原有行为
      return result.output;
    }
  } catch (error) {
    console.error('命令执行失败:', error);
    throw new Error(`命令执行失败：${cmd},错误: ${error}`);
  }
}
