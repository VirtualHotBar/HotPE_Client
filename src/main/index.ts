import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { spawn, execSync } from 'child_process'
import iconv from 'iconv-lite'

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

  // 文件系统操作 API
  ipcMain.handle('fs:readFile', async (event, filePath: string, encoding?: BufferEncoding) => {
    try {
      return fs.readFileSync(filePath, encoding || 'utf8')
    } catch (error) {
      throw new Error(`读取文件失败: ${error}`)
    }
  })

  ipcMain.handle('fs:writeFile', async (event, filePath: string, data: string, encoding?: BufferEncoding) => {
    try {
      fs.writeFileSync(filePath, data, { encoding: encoding || 'utf8' })
      return true
    } catch (error) {
      throw new Error(`写入文件失败: ${error}`)
    }
  })

  ipcMain.handle('fs:exists', async (event, filePath: string) => {
    return fs.existsSync(filePath)
  })

  ipcMain.handle('fs:access', async (event, filePath: string) => {
    return new Promise<boolean>((resolve) => {
      fs.access(filePath, (err) => {
        resolve(!err)
      })
    })
  })

  ipcMain.handle('fs:mkdir', async (event, dirPath: string, options?: any) => {
    try {
      fs.mkdirSync(dirPath, options || { recursive: true })
      return true
    } catch (error) {
      throw new Error(`创建目录失败: ${error}`)
    }
  })

  ipcMain.handle('fs:copyFile', async (event, src: string, dest: string) => {
    return new Promise<boolean>((resolve, reject) => {
      fs.copyFile(src, dest, (err) => {
        if (err) {
          reject(new Error(`复制文件失败: ${err}`))
        } else {
          resolve(true)
        }
      })
    })
  })

  ipcMain.handle('fs:cp', async (event, src: string, dest: string, options?: any) => {
    return new Promise<boolean>((resolve, reject) => {
      fs.cp(src, dest, options || {}, (err) => {
        if (err) {
          reject(new Error(`复制失败: ${err}`))
        } else {
          resolve(true)
        }
      })
    })
  })

  ipcMain.handle('fs:rename', async (event, oldPath: string, newPath: string) => {
    return new Promise<boolean>((resolve, reject) => {
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          reject(new Error(`重命名失败: ${err}`))
        } else {
          resolve(true)
        }
      })
    })
  })

  // 命令执行 API
  function getSystemEncoding(): string {
    const codePageEncodings: { [key: string]: string } = {
      '65001': 'UTF-8',
      '936': 'GBK',
      '932': 'Shift_JIS',
      '949': 'KS_C_5601-1987',
      '950': 'Big5',
      '1200': 'UTF-16LE',
      '1201': 'UTF-16BE',
      '1250': 'Windows-1250',
      '1251': 'Windows-1251',
      '1252': 'Windows-1252',
    }

    try {
      const output = execSync('chcp').toString()
      const match = output.match(/:s+(d+)/)
      if (match && match[1]) {
        const codePage = match[1]
        return codePageEncodings[codePage] || 'UTF-8'
      }
      return 'UTF-8'
    } catch (e) {
      console.error('获取系统编码失败:', e)
      return 'UTF-8'
    }
  }

  ipcMain.handle('cmd:execSync', async (event, command: string) => {
    try {
      const encoding = getSystemEncoding()
      const result = execSync(command)
      return iconv.decode(result, encoding)
    } catch (error) {
      throw new Error(`命令执行失败: ${error}`)
    }
  })

  ipcMain.handle('cmd:spawn', async (event, command: string) => {
    return new Promise<{ success: boolean, output: string, code: number }>((resolve) => {
      const encoding = getSystemEncoding()
      const child = spawn('cmd.exe', ['/c', command])
      let output = ''
      let errorOutput = ''

      child.stdout.on('data', (data: Buffer) => {
        const decoded = iconv.decode(data, encoding)
        output += decoded
        // 发送实时输出到渲染进程
        mainWindow.webContents.send('cmd:output', decoded)
      })

      child.stderr.on('data', (data: Buffer) => {
        const decoded = iconv.decode(data, encoding)
        errorOutput += decoded
        console.error(decoded)
      })

      child.on('exit', (code: number) => {
        resolve({
          success: code === 0,
          output: output + errorOutput,
          code: code || 0
        })
      })
    })
  })

  // Path 操作 API
  ipcMain.handle('path:join', async (event, ...paths: string[]) => {
    return path.join(...paths)
  })

  ipcMain.handle('path:basename', async (event, filePath: string) => {
    return path.basename(filePath)
  })

  ipcMain.handle('path:dirname', async (event, filePath: string) => {
    return path.dirname(filePath)
  })

  ipcMain.handle('path:extname', async (event, filePath: string) => {
    return path.extname(filePath)
  })

  
})

