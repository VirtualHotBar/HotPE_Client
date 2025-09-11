/**
 * 命令执行相关IPC处理器
 */

import { ipcMain } from 'electron';
import { spawn, execSync } from 'child_process';
import iconv from 'iconv-lite';
import { randomUUID } from 'crypto';
import type { CommandOutput, CommandResult } from '../../types/command';

/**
 * 获取系统编码
 */
function getSystemEncoding(): string {
  const codePageEncodings: { [key: string]: string } = {
    '65001': 'UTF-8',
    '936': 'GBK',
    '932': 'Shift_JIS',
    '949': 'KS_C_5601-1987',
    '950': 'Big5',
    '1200': 'UTF-16LE',
    '1201': 'UTF-16BE',
    '1250': 'Windows-1250',
    '1251': 'Windows-1251',
    '1252': 'Windows-1252',
  };

  try {
    const output = execSync('chcp').toString();
    const match = output.match(/:s+(d+)/);
    if (match && match[1]) {
      const codePage = match[1];
      return codePageEncodings[codePage] || 'UTF-8';
    }
    return 'UTF-8';
  } catch (e) {
    console.error('获取系统编码失败:', e);
    return 'UTF-8';
  }
}

export function setupCommandHandlers(mainWindow: Electron.BrowserWindow): void {

  // 异步执行命令，支持实时输出
  ipcMain.handle('cmd:spawn', async (_, command: string) => {
    return new Promise<CommandResult>(resolve => {
      const encoding = getSystemEncoding();
      const commandId = randomUUID(); // 生成唯一命令标识符
      const child = spawn('cmd.exe', ['/c', command]);
      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data: Buffer) => {
        const decoded = iconv.decode(data, encoding);
        output += decoded;
        // 发送实时输出到渲染进程，包含命令标识符
        mainWindow.webContents.send('cmd:output', {
          commandId,
          data: decoded,
          type: 'stdout'
        } as CommandOutput);
      });

      child.stderr.on('data', (data: Buffer) => {
        const decoded = iconv.decode(data, encoding);
        errorOutput += decoded;
        // 发送错误输出到渲染进程，包含命令标识符
        mainWindow.webContents.send('cmd:output', {
          commandId,
          data: decoded,
          type: 'stderr'
        } as CommandOutput);
      });

      child.on('exit', (code: number) => {
        // 发送命令完成信号
        mainWindow.webContents.send('cmd:output', {
          commandId,
          data: '',
          type: 'exit',
          code
        } as CommandOutput);
        
        resolve({
          success: code === 0,
          output: output + errorOutput,
          code: code || 0,
          commandId
        });
      });
    });
  });
}
