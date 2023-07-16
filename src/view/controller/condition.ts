//状态：PE的 安装状态、下载状态
const fs = window.require('fs')

import { config, roConfig } from "../services/config";
import { runCmdAsync } from "../utils/command";
import { isHotPEDrive, traverseFiles,readHotPEConfig } from "../utils/utils"
import { getHardwareInfo } from "../utils/hardwareInfo"

//检查PE资源
export async function checkPERes() {
    //更新本地已有资源列表
    config.resources.pe.all = await traverseFiles(roConfig.path.resources.pe + '*.7z')

    //选择最新的资源
    if (config.resources.pe.all.length > 0) {
        config.resources.pe.new = config.resources.pe.all[0]
    } else {
        config.resources.pe.new = ''
    }
}

//检查本地的PE
export async function checkPEDrive() {
    //清空
    config.environment.HotPEDrive.all = []

    //系统安装的PE
    let SysLetter = roConfig.environment.sysLetter
    if (isHotPEDrive(SysLetter)) {
        config.state.setupToSys = Number(readHotPEConfig(SysLetter).information.ReleaseVersion)
        
        config.environment.HotPEDrive.all.push({ drive: SysLetter, isMove: false ,version:readHotPEConfig(SysLetter).information.ReleaseVersion})
    }else{
        config.state.setupToSys ='without'
    }

    //可移动的磁盘
    config.environment.ware.disks = (await getHardwareInfo('--disk') as any).Disks
    //console.log(config.environment.ware.disks);

    for (let i in config.environment.ware.disks) {
        let disk = config.environment.ware.disks[i]
        if (disk['Type'] == 'USB') {//可移动
            for (let iV in disk['Volumes']) {
                let volumes = disk['Volumes'][iV]
                for (let iL in volumes['Volume Path Names']) {
                    let name = volumes['Volume Path Names'][iL]['Drive Letter']
                    if (isHotPEDrive(name )) {
                        config.environment.HotPEDrive.all.push({ drive: name, isMove: true ,version:readHotPEConfig(name).information.ReleaseVersion})
                    }
                }
            }
        }
    }

    /*     //只有一个PE盘符时，选择此盘符
        if (config.environment.HotPEDrive.all.length == 1) {
            config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[0]
        } */

    //选择最后一个PE盘符
    if (config.environment.HotPEDrive.all.length > 0) {
        config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[config.environment.HotPEDrive.all.length - 1]
    }

    console.log('HotPEDrive:', config.environment.HotPEDrive);
}