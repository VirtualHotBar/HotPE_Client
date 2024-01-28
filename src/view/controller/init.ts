import { config, roConfig } from "../services/config"
import { getHardwareInfo } from "../utils/hardwareInfo"
import { checkUpdate } from "./update"
import { checkPERes, checkPEDrive } from "./condition"
import { makeDir } from "../utils/utils"
import { getHPMList, getNotices } from "./online/online"
import { errorDialog } from "./log"
import { exitapp } from "../layout/header"
import { HotPEDriveChoose } from "../page/setting"
import { runCmdAsync } from "../utils/command"
import { getUsableLetter } from "../utils/disk/diskInfo"

let isInitDone = false

export async function initClient(setStartStr: Function) {
    //结束傲梅
    //await runCmdAsync('taskkill /IM PartAssist.exe /F')


    await initDir()

    //记录日志
    //await logInit()
    //系统信息
    await getSystemInfo()

    setStartStr('检查环境')
    //环境检查，不达标堵塞
    await checkEnvironment()

    //获取需要的环境信息
    //await getDisksInfo()
    //await getPartitionsInfo()
    //await getAllLetterInfo()

    //检查已安装的分区
    await checkPEDrive()//默认选择最后一个，并获取获取本地HPM列表,have getDisksInfo and getPartitionsInfo

    //检查已有的PE资源
    await checkPERes()// 

    setStartStr('检查更新')
    //获取公告
    await getNotices()

    //检查更新
    await checkUpdate()

    //更新状态
    await updateState()

    //获取HPM分类和列表
    await getHPMList()

    //获取本地HPM列表
    //await checkHPMFiles()


    isInitDone = true

    //检测到有多个HotPE安装的时候，选择
    if (config.environment.HotPEDrive.all.length > 1) {
        HotPEDriveChoose(() => { })
    }

    console.log(config);
    console.log(roConfig);


    //console.log(await getUsableLetter());


}


//更新状态
export async function updateState() {
    if (config.resources.pe.new == '') {
        config.state.install = 'noDown'
    } else if (config.environment.HotPEDrive.all.length == 0) {
        config.state.install = 'noSetup'
    } else {
        config.state.install = 'ready'
    }
}


//创建目录，运行所需的
async function initDir() {
    await makeDir(roConfig.path.clientTemp)
    await makeDir(roConfig.path.resources.client)
    await makeDir(roConfig.path.resources.pe)
}


//环境检查，启动时
async function checkEnvironment() {
    //架构
/*     if (config.environment.ware.system.architecture != 'x64') {
        await errorDialog('错误', '请在64位系统下运行！')
        exitapp()
    } */

    //联网检查
    while (!window.navigator.onLine) {
        await errorDialog('已离线', '请检查网络，点击[确定]重试。')
    }

    //路径检查
    if (roConfig.path.execDir.includes(' ')) {
        await errorDialog('错误', '请在无空格路径下运行！')
        exitapp()
    }

}

//系统信息
export async function getSystemInfo() {
    /*     //system
        let temp = (await getHardwareInfo('--sys') as any).System
        config.environment.ware.system.os = temp['OS']
        config.environment.ware.system.userName = temp['Username']
        config.environment.ware.system.buildNumber = temp['Build Number']
        config.environment.ware.system.firmware = temp['Firmware']
        config.environment.ware.system.architecture = temp['Processor Architecture'] */

    let temp = await runCmdAsync(roConfig.path.tools + 'BootMode.exe')
    if (temp.includes('UEFI')) {
        config.environment.ware.system.firmware = "UEFI"
    } else {
        config.environment.ware.system.firmware = "Legacy"
    }

/*     temp = await runCmdAsync('echo %PROCESSOR_ARCHITECTURE%')
    if (temp.includes('64')) {
        config.environment.ware.system.architecture = process.arch
    } else {
        config.environment.ware.system.architecture = "32"
    } */

    //config.environment.ware.system.architecture = process.arch

}





//客户端是否准备就绪（客户端启动完成 and PE包是否下载
export function isClientReady() {
    if (!isInitDone || config.resources.pe.new == '') {
        return false
    }

    return true
}