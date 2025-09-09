/**
 * 窗口相关IPC处理器
 */

import { ipcMain, app } from 'electron';

export function setupWindowHandlers(mainWindow: Electron.BrowserWindow): void {
  // 退出应用
  ipcMain.on('exitapp', () => {
    app.exit();
  });

  // 最小化窗口
  ipcMain.on('windows:mini', () => {
    mainWindow.minimize();
  });

  // 打开开发者工具
  ipcMain.on('windows:openDevTools', () => {
    mainWindow.webContents.openDevTools({ mode: 'right' });
  });
}