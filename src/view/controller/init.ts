import { config } from "../services/config"
import { getHardwareInfo } from "../utils/hardwareInfo"
import { checkPEUpdate ,checkCilentUpdate} from "./update"

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

//更新公告
async function GetNotices() {
    await fetch('https://api.hotpe.top/API/HotPE/GetNotices/').then(response => response.json())
    .then(data => {
        if (config.notice.content != data.data.client.content) {
            config.notice.show = true
            config.notice.content = data.data.client.content
            config.notice.type = data.data.client.type
        }
    })
    .catch(e => Error(e))
}