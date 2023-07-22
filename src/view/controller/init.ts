import { config, roConfig } from "../services/config"
import { getHardwareInfo } from "../utils/hardwareInfo"
import { checkUpdate } from "./update"
import { checkPERes, checkPEDrive } from "./condition"
import { takeRightStr } from "../utils/utils"
import { disksInfo, partitionInfo } from "../type/config"
import { Modal } from "@douyinfe/semi-ui"
import { ReactNode } from "react"
import { getHPMList, getNotices } from "./online/online"
import { checkHPMFiles } from "./hpm/checkHpmFiles"
import { errorDialog} from "./log"

let isInitDone = false

export async function initClient(setStartStr:Function) {
    //记录日志
    //await logInit()

    setStartStr('检查环境')
    //环境检查，不达标堵塞
    await checkEnvironment()

    //获取需要的环境信息
    await getEnvironment()

    //检查已有的PE资源
    await checkPERes()

    //检查已安装的分区
    await checkPEDrive()//默认选择最后一个，并获取获取本地HPM列表

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


    console.log(config);
    console.log(roConfig);
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

//环境检查，启动时
async function checkEnvironment() {

    //联网检查
    while (!window.navigator.onLine) {
        await errorDialog('已离线', '请检查网络，点击[确定]重试。')
    }

}





//环境信息
export async function getEnvironment() {

    //system
    let temp = (await getHardwareInfo('--sys') as any).System
    config.environment.ware.system.os = temp['OS']
    config.environment.ware.system.userName = temp['Username']
    config.environment.ware.system.buildNumber = temp['Build Number']
    config.environment.ware.system.firmware = temp['Firmware']
    config.environment.ware.system.architecture = temp['Processor Architecture']

    //disk
    config.environment.ware.disks = []
    temp = (await getHardwareInfo('--disk') as any).Disks as Array<any>

    temp.map(function callback(disk: any, index: number) {

        //分区
        let partitionInfos: Array<partitionInfo> =
            disk['Volumes'].map((partition: any) => {

                //盘符
                let letterTemp = ''
                if (partition['Volume Path Names'].length > 0) {
                    letterTemp = partition['Volume Path Names'][0]['Drive Letter']
                }

                let partitionInfo: partitionInfo = {
                    index: partition['Partition Number'],
                    letter: letterTemp
                }
                return partitionInfo
            })





        let diskInfo: disksInfo = {
            index: Number(takeRightStr(disk['Path'], 'Drive')),
            name: disk['HW Name'],
            type: disk['Type'],
            size: disk['Size'],
            removable: Boolean(disk['Removable']),
            partitions: partitionInfos
        }


        config.environment.ware.disks.push(diskInfo)
    })



    console.log(config.environment.ware.disks);



}



//客户端是否准备就绪（客户端启动完成 and PE包是否下载
export function isClientReady() {
    if (!isInitDone || config.resources.pe.new == '') {
        return false
    }

    return true
}