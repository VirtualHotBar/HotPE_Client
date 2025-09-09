/**
 * 对话框相关IPC处理器
 */

import { ipcMain, dialog } from 'electron';

export function setupDialogHandlers(): void {
  // 选择文件保存位置
  ipcMain.on('file:getSavePath', (event, message) => {
    event.returnValue = dialog.showSaveDialogSync({
      title: '请选择文件保存位置',
      buttonLabel: '保存',
      defaultPath: message.toString(),
      filters: [
        { name: '镜像文件', extensions: ['iso'] },
      ],
    });
  });

  // 选择文件打开位置
  ipcMain.on('file:getOpenPath', (event, message) => {
    event.returnValue = dialog.showOpenDialogSync({
      title: '请选择壁纸文件',
      buttonLabel: '打开',
      defaultPath: message.toString(),
      filters: [
        { name: 'jpg图片文件', extensions: ['jpg', 'jpeg'] },
      ],
    });
  });
}