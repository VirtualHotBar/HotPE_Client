import { config ,roConfig} from "../services/config"
import { getHardwareInfo } from "../utils/hardwareInfo"
import { checkUpdate, GetNotices } from "./update"
import { checkPERes, checkPEDrive } from "./condition"

export async function initClient() {

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
    }else{
        config.state.install = 'ready'
    }
}