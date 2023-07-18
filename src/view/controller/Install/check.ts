import { Notification } from "@douyinfe/semi-ui";
import { isClientReady } from "../init";



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
