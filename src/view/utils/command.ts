import { safeChildProcess } from './safeAPI';

// 同步执行命令行
export async function runCmdSync(cmd: string): Promise<string> {
  try {
    return await safeChildProcess.execSync(cmd);
  } catch (error) {
    console.error('命令执行失败:', error);
    throw error;
  }
}

// 异步执行命令行，并通过回调返回结果
export function runCmd(
  cmd: string,
  returnstr: (data: string) => void,
  end: (code: number) => void
) {
  let outputBuffer = '';

  // 设置输出监听
  safeChildProcess.onOutput((data: string) => {
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
