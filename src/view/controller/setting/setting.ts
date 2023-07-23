import { Notification, Toast } from "@douyinfe/semi-ui";
import { config, roConfig } from "../../services/config";
import { setting } from "../../services/setting";
import { runCmdAsync } from "../../utils/command";
import { copyFile, isFileExisted } from "../../utils/utils";

const bcdeditPath = roConfig.path.tools + 'bcdedit.exe'


export async function checkPESetting(){

    if (config.environment.HotPEDrive.new.letter == '') {return }

    
if(await isFileExisted(config.environment.HotPEDrive.new.letter+'HotPE\\wallpaper.jpg')){
    setting.pe.wallpaper=config.environment.HotPEDrive.new.letter+'HotPE\\wallpaper.jpg'
}
}


export async function savePESetting(){
    //检查是否已有可设置的HotPE安装
    if(!isSettingReady()){return}

    if(config.environment.HotPEDrive.new.isMove == false){
        config.setting.pe.bootWaitTime = setting.pe.bootWaitTime
        await runCmdAsync(bcdeditPath + ' /timeout ' + config.setting.pe.bootWaitTime)
    }


    await copyFile(setting.pe.wallpaper,config.environment.HotPEDrive.new.letter+'HotPE\\wallpaper.jpg')

    Toast.success('设置保存成功!' )

}

export async function saveClientSetting(){
    //if(!isSettingReady()){return}

    config.download.thread=setting.client.dlThread

    Toast.success('设置保存成功!' )
}




//检查是否有HotPE安装，可进行设置
export function isSettingReady() {
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