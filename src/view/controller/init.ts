import { config, roConfig } from "../services/config"
import { getHardwareInfo } from "../utils/hardwareInfo"
import { checkUpdate, GetNotices } from "./update"
import { checkPERes, checkPEDrive } from "./condition"
import { takeRightStr } from "../utils/utils"
import { disksInfo, partitionInfo } from "../type/config"

export async function initClient() {
    //获取需要的环境信息
    await getEnvironment()

    //检查已有的PE资源
    await checkPERes()

    //检查已安装的分区
    await checkPEDrive()

    await GetNotices()

    //检查更新
    await checkUpdate()

    //更新状态
    await updateState()




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
    config.environment.ware.disks=[]
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