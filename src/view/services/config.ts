import { isJSON, writeJosnFile } from "../utils/utils"
import { Config } from "../type/config"
import { runCmdSync } from "../utils/command"
import { safeFS } from "../utils/safeAPI"

//全局数据库

//只读配置read only=======================================================================================
const roConfig = {
    id: '240201',
    clientVer: 'V0.3.240201',
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
        execDir: '', // 将在初始化时异步设置
        tools: '.\\resources\\tools\\',
        clientTemp: '.\\resources\\temp\\',
        resources: {
            pe: '.\\resources\\files\\pe\\',
            client: '.\\resources\\files\\client\\'
        }
    },
    environment: {
        sysLetter: '', // 将在初始化时异步设置
        temp: '', // 将在初始化时异步设置
        userName: '', // 将在初始化时异步设置
        desktopDir: '', // 将在初始化时异步设置
        /* arch:runCmdSync('echo %PROCESSOR_ARCHITECTURE%').replaceAll('\r\n', ''),//系统架构 */
    }
}

// 异步初始化环境变量
async function initializeEnvironment() {
    try {
        // 获取当前工作目录
        const execDir = await runCmdSync('cd');
        roConfig.path.execDir = execDir.replaceAll('\r\n', '') + '\\';
        
        const sysLetter = await runCmdSync('echo %SystemDrive%');
        roConfig.environment.sysLetter = sysLetter.substring(0, 2);
        
        const temp = await runCmdSync('echo %temp%');
        roConfig.environment.temp = temp.replaceAll('\r\n', '') + '\\';
        
        const userName = await runCmdSync('echo %UserName%');
        roConfig.environment.userName = userName.replaceAll('\r\n', '');
        
        const desktopDir = await runCmdSync('echo %SystemDrive%\\Users\\%UserName%\\Desktop\\');
        roConfig.environment.desktopDir = desktopDir.replaceAll('\r\n', '');
    } catch (error) {
        console.error('初始化环境变量失败:', error);
        // 设置默认值
        roConfig.path.execDir = 'C:\\';
        roConfig.environment.sysLetter = 'C:';
        roConfig.environment.temp = 'C:\\temp\\';
        roConfig.environment.userName = 'User';
        roConfig.environment.desktopDir = 'C:\\Users\\User\\Desktop\\';
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
        },
        client:{
            themeMode:'auto'
        }
    }
}

// 异步初始化配置
async function initializeConfig() {
    try {
        const configExists = await safeFS.existsSync(configPath);
        if (configExists) {
            const configContent = await safeFS.readFileSync(configPath, 'utf8');
            if (isJSON(configContent)) {
                const loadedConfig = JSON.parse(configContent);
                config = Object.assign(config, loadedConfig); // 合并
            } else {
                // 如果配置文件不是有效JSON，使用默认配置并保存
                await saveConfig();
            }
        } else {
            // 如果配置文件不存在，使用默认配置并保存
            await saveConfig();
        }
    } catch (error) {
        console.error('初始化配置失败:', error);
        // 使用默认配置
        await saveConfig();
    }
}

//保存配置
async function saveConfig() {
    await writeJosnFile(configPath, config);
}

// 导出初始化函数
export async function initializeAll() {
    await initializeEnvironment();
    await initializeConfig();
}

export { config, roConfig, saveConfig }