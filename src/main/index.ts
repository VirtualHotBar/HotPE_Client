import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'

// 声明全局变量用于 Vite 开发服务器
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;


//是否为开发模式 
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

app.on('ready', () => {
  //创建一个窗口
  const mainWindow = new BrowserWindow({
    resizable: true,   //允许用户改变窗口大小
    width: 900,        //设置窗口宽高
    minWidth: 800,
    height: 640,
    minHeight: 600,
    frame: false,      //无边框窗口
    icon: path.join(__dirname, '../../logo.ico'),     //应用运行时的标题栏图标
    webPreferences: {
      backgroundThrottling: false,   //设置应用在后台正常运行
      nodeIntegration: false,     //禁用 nodeIntegration 提高安全性
      contextIsolation: true,     //启用上下文隔离
      webSecurity: true,          //启用 web 安全性检查
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
  //窗口加载html文件
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../view/index.html'));
  }

  //去掉菜单栏
  mainWindow.removeMenu()

  //开发工具
  if (isDev == true) {
    mainWindow.webContents.openDevTools({ mode: 'right' })
  }
  ipcMain.on('windows:openDevTools', () => {
    mainWindow.webContents.openDevTools({ mode: 'right' })
  })

  ipcMain.on('exitapp', () => {
    app.exit()//退出 
  })

  ipcMain.on('windows:mini', () => {
    mainWindow.minimize();//最小化
  })

  //拦截首页打开新窗口的链接用浏览器打开  
  mainWindow.webContents.setWindowOpenHandler((details) => {
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

  
})

