//import RunCmd from './function/runCmd'
//import { app, BrowserWindow, ipcMain, shell } from 'electron'

const { app, BrowserWindow, ipcMain, shell } = require('electron')
//var path = require('path');
import path from 'path'


//是否为开发模式
//const isDev = require('electron-is-dev');
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
      contextIsolation: false,
      preload: path.join(__dirname, './preload.js')
    }
  })

  //去掉菜单栏
  mainWindow.removeMenu()




  //开发工具
  if (isDev == true) {
    mainWindow.webContents.openDevTools({ mode: 'right' })
  }

  

  //mainWindow.webContents.openDevTools({ mode: 'right' })

  //窗口加载html文件
  //mainWindow.loadFile('./src/main.html')
  //mainWindow.loadURL('http://localhost:3000/');
  //mainWindow.loadURL('http://127.0.0.1/');
  mainWindow.loadURL(isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../view/index.html')}`);

  ipcMain.on('exitapp', () => {
    app.exit()//退出 
  })


  ipcMain.on('windows:mini', () => {
    mainWindow.minimize();//最小化
  })
  //console.log(RunCmd("dir"))



  //拦截首页打开新窗口的链接用浏览器打开  



})

