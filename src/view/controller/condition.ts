//状态：PE的 安装状态、下载状态
const fs = window.require('fs')

import { config, roConfig } from "../services/config";
import { runCmdAsync } from "../utils/command";
import { isHotPEDrive, traverseFiles, readHotPEConfig, delFiles } from "../utils/utils"
import { getHardwareInfo } from "../utils/hardwareInfo"
import { getEnvironment, updateState } from "./init";
import { checkHPMFiles } from "./hpm/checkHpmFiles";
import { checkPESetting } from "./setting/setting";

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


    //删除旧的PE资源
    for (let i in config.resources.pe.all) {
        if (config.resources.pe.all[i] != config.resources.pe.new) {
            await delFiles(roConfig.path.resources.pe + config.resources.pe.all[i])
            config.resources.pe.all.splice(i, 0)
        }
    }

}

//检查本地的PE
export async function checkPEDrive() {

    //刷新一下DiskList
    await getEnvironment()

    config.state.setupToSys = 'without'

    //清空
    config.environment.HotPEDrive.all = []
    config.environment.HotPEDrive.new = { diskIndex: -1, letter: '', isMove: false, version: '' }

    //系统安装的PE
    /* let SysLetter = roConfig.environment.sysLetter
    if (isHotPEDrive(SysLetter)) {
        
        
        config.environment.HotPEDrive.all.push({diskIndex:, letter: SysLetter, isMove: false ,version:readHotPEConfig(SysLetter).information.ReleaseVersion})
    }else{
        config.state.setupToSys ='without'
    }
    console.log('config.state.setupToSys',config.state.setupToSys); */



    //可移动的磁盘

    //console.log(config.environment.ware.disks);

    for (let i in config.environment.ware.disks) {
        let disk = config.environment.ware.disks[i]
        //if (disk.type == 'USB') {//可移动
        for (let iP in disk.partitions) {
            let partition = disk.partitions[iP]
            if (partition.letter != '') {
                if (isHotPEDrive(partition.letter)) {
                    let HotPEDriveInfoTemp = { diskIndex: disk.index, letter: partition.letter, isMove: disk.type == 'USB', version: readHotPEConfig(partition.letter).information.ReleaseVersion }
                    if (!config.environment.HotPEDrive.all.includes(HotPEDriveInfoTemp)) {
                        config.environment.HotPEDrive.all.push(HotPEDriveInfoTemp)
                    }


                    //判断是否为系统安装的PE
                    if (partition.letter == roConfig.environment.sysLetter) {
                        config.state.setupToSys = Number(readHotPEConfig(partition.letter).information.ReleaseVersion)
                    }
                }
            }

        }
        //}
    }

    /*     //只有一个PE盘符时，选择此盘符
        if (config.environment.HotPEDrive.all.length == 1) {
            config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[0]
        } */
    console.log('HotPEDrive:', config.environment.HotPEDrive);
    config.environment.HotPEDrive.all = Array.from(new Set(config.environment.HotPEDrive.all))//去重
    console.log('HotPEDrive:', config.environment.HotPEDrive);

    //选择最后一个PE盘符
    if (config.environment.HotPEDrive.all.length > 0) {
        config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[config.environment.HotPEDrive.all.length - 1]

        //更新HPM列表本地
        await checkHPMFiles()

        //获取设置
        await checkPESetting()
    }

    //更新安装状态(首页
    await updateState()
}


