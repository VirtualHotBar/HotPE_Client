import { parseJosnFile, writeJosnFile } from "../utils/utils"
const fs = window.require('fs')

//全局数据库

//只读配置read only=======================================================================================
const roConfig = {
    clientVer: '0.2.0_preview',
    url: {
        home: 'https://www.hotpe.top/',
        github: 'https://github.com/VirtualHotBar/HotPE_Client',
        docs: 'https://docs.hotpe.top/',
        blog: 'https://blog.hotpe.top/',
        donate: 'https://www.hotpe.top/donation/'
    },
    environment: {
        SysLetter: process.env.SystemDrive,
    }
}

//动态配置================================================================================================
const configPath = './resources/config.json'
let config: object = {}


if (fs.existsSync(configPath)) {
    //如果配置文件存在，则读取配置
    config = parseJosnFile(configPath)
} else {
    //如果配置文件不存在，则使用默认配置
    //默认配置
    config = {
        api: 'https://api.hotpe.top/',
        environment: {
            HotPEDrive: {
                new: { isMove: false, drive: '' },
                all: []
            }

        },
        resources: {
            pe: {
                new: '',
                all: []
            },
            client: {
                new: '',
                all: []
            }
        }, directory: {

        }
    }
    saveConfig()
}

//保存配置
function saveConfig() {
    writeJosnFile(configPath, config)
}

export { config, roConfig, saveConfig }