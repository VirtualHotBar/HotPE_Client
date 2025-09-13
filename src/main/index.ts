import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { setupIpcHandlers, cleanupIpcHandlers } from './ipc';

// 声明全局变量用于 Vite 开发服务器
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// 是否为开发模式
const isDev = process.env['NODE_ENV'] === 'development' || !app.isPackaged;

// 主窗口实例
let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 */
function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    resizable: true,
    width: 900,
    minWidth: 800,
    height: 640,
    minHeight: 600,
    frame: false,
    icon: path.join(__dirname, '../../logo.ico'),
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // 加载页面
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, '../view/index.html'));
  }

  // 移除菜单栏
  window.removeMenu();

  // 开发模式下打开开发者工具
  if (isDev) {
    window.webContents.openDevTools({ mode: 'right' });
  }

  // 拦截新窗口打开，使用系统浏览器
  window.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  return window;
}

/**
 * 应用准备就绪
 */
app.on('ready', () => {
  mainWindow = createMainWindow();
  setupIpcHandlers(mainWindow);
});

/**
 * 所有窗口关闭时
 */
app.on('window-all-closed', () => {
  cleanupIpcHandlers();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * 应用激活时
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
    setupIpcHandlers(mainWindow);
  }
});

/**
 * 应用退出前
 */
app.on('before-quit', () => {
  cleanupIpcHandlers();
});


export {isDev}