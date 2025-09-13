/**
 * IPC 处理器统一入口
 */

import { ipcMain } from 'electron';
import { setupWindowHandlers } from './window-handlers';
import { setupFileHandlers } from './file-handlers';
import { setupCommandHandlers } from './command-handlers';
import { setupPathHandlers } from './path-handlers';
import { setupDialogHandlers } from './dialog-handlers';
import { registerHardwareHandlers } from './hardware-handlers';
import { registerDiskHandlers } from './disk-handlers';
import { registerInstallHandlers } from './install-handlers';
import { registerHPMHandlers } from './hpm-handlers';
import { registerUpdateHandlers } from './update-handlers';
import { registerAria2Handlers } from './aria2-handlers';
import { isDev } from '..';

/**
 * 初始化所有IPC处理器
 */
export function setupIpcHandlers(mainWindow: Electron.BrowserWindow): void {
  // 清理现有的监听器
  ipcMain.removeAllListeners();

  

  // 设置各类处理器
  setupWindowHandlers(mainWindow);
  setupFileHandlers();
  setupCommandHandlers(mainWindow);
  setupPathHandlers();
  setupDialogHandlers();
  registerHardwareHandlers();
  registerDiskHandlers();
  registerInstallHandlers();
  registerHPMHandlers();
  registerUpdateHandlers();
  registerAria2Handlers();
  setupOutherHandlers()
}

function setupOutherHandlers(){
  ipcMain.on('isDev', (event) => {
    event.returnValue = isDev;
  });
}

/**
 * 清理所有IPC处理器
 */
export function cleanupIpcHandlers(): void {
  ipcMain.removeAllListeners();
}