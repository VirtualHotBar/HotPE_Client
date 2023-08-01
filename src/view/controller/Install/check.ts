import { Notification } from "@douyinfe/semi-ui";
import { isClientReady } from "../init";
import { config } from "../../services/config";



export function checkIsReady(){
    let isReady = isClientReady()
    if(!isReady){
        Notification.info({
            title: '未准备就绪！',
            content: '还未下载相关文件，请到首页下载。',
            duration: 5,
        })
    }
    return isReady
}

//获取PE版本
export function getHotPEDriveVer(diskIndex: Number) {
    //console.log(config.environment.HotPEDrive.all);

    for (let i in config.environment.HotPEDrive.all) {
        if (config.environment.HotPEDrive.all[i].diskIndex == diskIndex) {
            return config.environment.HotPEDrive.all[i].version
        }
    }

    return ''
}

//获取PE数据分区盘符
export function getHotPEDriveLetter(diskIndex: Number) {
    //console.log(config.environment.HotPEDrive.all);

    for (let i in config.environment.HotPEDrive.all) {
        if (config.environment.HotPEDrive.all[i].diskIndex == diskIndex) {
            return config.environment.HotPEDrive.all[i].letter
        }
    }

    return ''
}