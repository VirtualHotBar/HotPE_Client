import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { dialog } from 'electron';
import path from 'path'

//是否为开发模式
import isDev from 'electron-is-dev'

app.on('ready', () => {
  //创建一个窗口
  const mainWindow = new BrowserWindow({
    resizable: true,   //允许用户改变窗口大小
    width: 900,        //设置窗口宽高
    minWidth: 800,
    height: 640,
    minHeight: 600,
    frame: false,      //无边框窗口
    icon: path.join(__dirname, '../dist/view/img/logo.ico'),     //应用运行时的标题栏图标
    webPreferences: {
      backgroundThrottling: false,   //设置应用在后台正常运行
      nodeIntegration: true,     //设置能在页面使用nodejs的API
      //sandbox: false,//禁用沙箱
      contextIsolation: false,
      webSecurity: false,//关闭浏览器安全性检查
      preload: path.join(__dirname, './preload.js')
    }
  })

  
  //窗口加载html文件
  //mainWindow.loadFile('./src/main.html')
  mainWindow.loadURL(isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../view/index.html')}`);

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

