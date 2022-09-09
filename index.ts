//引入两个模块：app 和 BrowserWindow

//app 模块，控制整个应用程序的事件生命周期。
//BrowserWindow 模块，它创建和管理程序的窗口。
const { app, BrowserWindow, ipcMain } = require('electron')
var path = require('path');
//const iconPath =    //应用运行时的标题栏图标
//在 Electron 中，只有在 app 模块的 ready 事件被激发后才能创建浏览器窗口

const isDev = require('electron-is-dev');


app.on('ready', () => {

  //创建一个窗口
  const mainWindow = new BrowserWindow({
    resizable: true,   //允许用户改变窗口大小
    width: 900,        //设置窗口宽高
    height: 600,
    frame: false,      //无边框窗口
    icon: path.join(__dirname, './public/img/logo.ico'),     //应用运行时的标题栏图标
    webPreferences: {
      backgroundThrottling: false,   //设置应用在后台正常运行
      nodeIntegration: true,     //设置能在页面使用nodejs的API
      contextIsolation: false,
      preload: path.join(__dirname, './preload.ts')
    }
  })

  //去掉菜单栏
  mainWindow.removeMenu()



  //开发工具
  if (isDev == true) {
    mainWindow.webContents.openDevTools({ mode: 'right' })
  }

  //窗口加载html文件
  //mainWindow.loadFile('./src/main.html')
  //mainWindow.loadURL('http://localhost:3000/');
  //mainWindow.loadURL('http://127.0.0.1/');
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

  ipcMain.on('exithub', () => {
    app.exit()//退出
  })

  ipcMain.on('windows:max', () => {
    mainWindow.maximize();//最大化
  })

  ipcMain.on('windows:mini', () => {
    mainWindow.minimize();//最小化
  })






})


