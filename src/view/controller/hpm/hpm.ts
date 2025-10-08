import { Notification } from "@douyinfe/semi-ui"
import { config } from "../../services/config"
import { HPM } from "../../type/hpm"
import { copyFile, delDir, delFiles, moveFiles, takeLeftStr, takeRightStr } from "../../utils/utils"
import { runCmdAsync } from "../../utils/command"
//import fs from 'fs'
const fs = window.require('fs')

//通过文件名，和路径获取HPMInfo
export function getHPMinfoLocal(HPMFilePath: string, HPMFileName: string) {

    let hpmFileInfo = fs.statSync(HPMFilePath + HPMFileName)

    let hpmInfo = HPMFileName.split('_')

    let HPM: HPM


    if (hpmInfo.length == 4) {
        HPM = {
            fileName: HPMFileName,
            size: hpmFileInfo.size,
            name: hpmInfo[0],
            maker: hpmInfo[1],
            version: hpmInfo[2],
            description: takeLeftStr(hpmInfo[3], '.'),
            time: hpmFileInfo.ctime
        }
    } else {
        //格式不规范
        HPM = {
            fileName: HPMFileName,
            size: hpmFileInfo.size,
            name: hpmInfo[0],
            maker:'获取失败',
            version: '获取失败',
            description: '获取失败',
            time: hpmFileInfo.ctime
        }
    }


    return HPM
}

//检查是否有模块文件夹，可进行模块操作
export function isHPMReady() {
    if (config.environment.HotPEDrive.new.letter != '') {
        return true
    }
    Notification.info({
        title: '未准备就绪！',
        content: '还未安装HotPE或插入HotPEU盘。',
        duration: 5,
    })
    return false
}


export async function migrateHPM(dataLetter:string) {
        // 迁移模块目录HotPEModule到HotProgMods，并删除旧的HotPEModule和基础模块
        await runCmdAsync('xcopy '+dataLetter+'\\HotPEModule\\* '+dataLetter+'\\HotProgMods\\');
        await moveFiles(dataLetter + '\\HotPEModule\\*', dataLetter + '\\HotProgMods\\')
        await copyFile(dataLetter + '\\HotPEModule\\*', dataLetter + '\\HotProgMods\\')
        await delDir(dataLetter + '\\HotPEModule')
        await delFiles(dataLetter + '\\HotProgMods\\HotPE基础包_*.HPM')
}