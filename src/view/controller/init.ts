import { config } from "../services/config"
import { getHardwareInfo } from "../utils/hardwareInfo"
import { checkPEUpdate, checkCilentUpdate, GetNotices } from "./update"

export async function initClient() {


    /* const disk = await getHardwareInfo('--disk')
    console.log(disk); */

    await GetNotices()

    //检查PE更新
    await checkPEUpdate()

    //检查客户端更新
    await checkCilentUpdate()






    console.log(config);




}

