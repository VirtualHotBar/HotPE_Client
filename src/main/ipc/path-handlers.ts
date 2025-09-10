/**
 * 路径操作相关IPC处理器
 */

import { ipcMain } from 'electron';
import path from 'path';

export function setupPathHandlers(): void {
  // 连接路径
  ipcMain.handle('path:join', async (_, ...paths: string[]) => {
    return path.join(...paths);
  });

  // 获取文件名
  ipcMain.handle('path:basename', async (_, filePath: string) => {
    return path.basename(filePath);
  });

  // 获取目录名
  ipcMain.handle('path:dirname', async (_, filePath: string) => {
    return path.dirname(filePath);
  });

  // 获取文件扩展名
  ipcMain.handle('path:extname', async (_, filePath: string) => {
    return path.extname(filePath);
  });
}
