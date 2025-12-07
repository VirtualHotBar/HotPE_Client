import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { dialog } from 'electron';
import path from 'path'
    
// 是否为开发模式
const isDev = process.env['NODE_ENV'] === 'development' || !app.isPackaged;

// 标记是否已经禁用硬件加速并重启过
let hasRetried = false;

// 检查是否之前因为GPU问题重启过
const gpuCrashRestart = app.commandLine.hasSwitch('gpu-crash-restart');
if (gpuCrashRestart && !hasRetried) {
  console.log('Disabling hardware acceleration due to previous GPU crash');
  app.disableHardwareAcceleration();
  hasRetried = true;
}

// 声明全局变量用于 Vite 开发服务器
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// GPU错误重启处理函数
const handleGpuCrashAndRestart = (reason: string) => {
  console.log(`${reason}, disabling hardware acceleration and restarting...`);
  app.commandLine.appendSwitch('gpu-crash-restart');
  app.relaunch();
  app.exit(0);
};

app.on('ready', () => {
  // 创建一个窗口
  const window = new BrowserWindow({
    resizable: true,   //允许用户改变窗口大小
    width: 900,        //设置窗口宽高
    minWidth: 800,
    height: 640,
    minHeight: 600,
    frame: false,      //无边框窗口
    icon: path.join(__dirname, '../../logo.ico'),     //应用运行时的标题栏图标
    webPreferences: {
      backgroundThrottling: false,   //设置应用在后台正常运行
      nodeIntegration: true,     //设置能在页面使用nodejs的API
      //sandbox: false,//禁用沙箱
      contextIsolation: false,
      webSecurity: false,//关闭浏览器安全性检查 
      preload: path.join(__dirname, './preload.js')
    }
  })
  
  // 加载页面
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.join(__dirname, '../view/index.html'));
  }

  //去掉菜单栏
  window.removeMenu()

  //开发工具
  if (isDev == true) {
    window.webContents.openDevTools({ mode: 'right' })
  }
  ipcMain.on('windows:openDevTools', () => {
    window.webContents.openDevTools({ mode: 'right' })
  })

  ipcMain.on('exitapp', () => {
    app.exit()//退出 
  })

  ipcMain.on('windows:mini', () => {
    window.minimize();//最小化
  })

  //拦截首页打开新窗口的链接用浏览器打开  
  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }//取消创建新窗口
  })

  //选择文件保存位置
  ipcMain.on('file:getSavePath', (event, message) => {
    event.returnValue = dialog.showSaveDialogSync({
      title: "请选择文件保存位置",
      buttonLabel: "保存",
      defaultPath: message.toString(),
      filters: [
        { name: '镜像文件', extensions: ['iso'] },
      ]
    })
  })

  ipcMain.on('file:getOpenPath', (event, message) => {
    event.returnValue = dialog.showOpenDialogSync({
      title: "请选择壁纸文件",
      buttonLabel: "打开",
      defaultPath: message.toString(),
      filters: [
        { name: 'jpg图片文件', extensions: ['jpg','jpeg'] },
      ]
    })
  })

  // 监听渲染进程错误，在出错时禁用硬件加速并重启
  if (!hasRetried) {
    window.webContents.on('render-process-gone', (event, details) => {
      handleGpuCrashAndRestart(`Renderer process gone (reason: ${details.reason}, exitCode: ${details.exitCode})`);
    });

    // 监听子进程崩溃事件（包括GPU进程）
    app.on('child-process-gone', (event, details) => {
      if (details.type === 'GPU') {
        handleGpuCrashAndRestart(`GPU process gone (reason: ${details.reason}, exitCode: ${details.exitCode})`);
      }
    });
  }
})