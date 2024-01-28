import { delFiles, isJSON, parseJosnFile, writeJosnFile } from "../utils/utils"
import { Config } from "../type/config"
import { runCmdSync } from "../utils/command"

const fs = window.require('fs')


//全局数据库

//只读配置read only=======================================================================================
const roConfig = {
    id: '231026',
    clientVer: 'V0.2.231027_final',
    url: {
        home: 'https://www.hotpe.top/',
        github: 'https://github.com/VirtualHotBar/HotPE_Client',
        docs: 'https://docs.hotpe.top/',
        blog: 'https://blog.hotpe.top/',
        donate: 'https://www.hotpe.top/donation/',//config.api.api
        update: 'API/HotPE/GetUpdate/',
        package: {//config.api.dl
            //PE: 'Package/PE/{id}.7z',
            //client: 'Package/Client/{id}.7z'
        }
    },
    path: {
        execDir: process.cwd() + '\\',
        tools: '.\\resources\\tools\\',
        clientTemp: '.\\resources\\temp\\',
        resources: {
            pe: '.\\resources\\files\\pe\\',
            client: '.\\resources\\files\\client\\'
        }
    },
    environment: {
        sysLetter: runCmdSync('echo %SystemDrive%').substring(0, 2),
        temp: runCmdSync('echo %temp%').replaceAll('\r\n', '')+'\\',
        userName: runCmdSync('echo %UserName%').replaceAll('\r\n', ''),
        desktopDir: runCmdSync('echo %SystemDrive%\\Users\\%UserName%\\Desktop\\').replaceAll('\r\n', ''),
        /* arch:runCmdSync('echo %PROCESSOR_ARCHITECTURE%').replaceAll('\r\n', ''),//系统架构 */
    }
}

//动态配置================================================================================================
const configPath = './resources/config.json'


//默认配置
let config: Config = {
    api: {
        api: 'https://api.hotpe.top/',
        ghapi: 'http://ghapi.hotpe.top/',
        dl: 'http://p0.hotpe.top/'
    },

    state: {
        install: 'noDown',
        resUpdate: 'without',
        setupToSys: 'without',

    },
    environment: {
        HotPEDrive: {
            new: { diskIndex: -1, letter: '', isMove: false, version: '' },
            all: []
        },
        ware: {
            system: {
                os: '',
                buildNumber: '',
                userName: '',
                architecture: '',
                firmware: '',
            },
            disks: [],
            partitions:[],
            allLetter:[]
        }

    },
    resources: {
        pe: {
            new: '',
            all: [],
            update: {
                id: '',
                name: '',
                pushTime: '',
                body: '',
                size: 0,
                download_url: '',
                download_url_github: '',
                fileName: ""
            }
        },
        client: {
            new: '',
            all: [],
            update: {
                id: '',
                name: '',
                pushTime: '',
                body: '',
                size: 0,
                download_url: '',
                download_url_github: '',
                fileName: ""
            }
        }
    }, directory: {

    },
    notice: {
        show: false,
        type: 'info',
        content: ''
    },
     download: {
        thread: 16
    },
    setting:{
        pe:{
            bootWaitTime:3
        }
    }
}

if (fs.existsSync(configPath) && isJSON(fs.readFileSync(configPath, 'utf8'))) {
    //如果配置文件存在且为json，则读取配置

    config =  Object.assign(config,parseJosnFile(configPath))//合并

} else {
    //如果配置文件不存在，则使用默认配置
    //默认配置

    saveConfig()
}

//保存配置
function saveConfig() {
    writeJosnFile(configPath, config)
}

export { config, roConfig, saveConfig }