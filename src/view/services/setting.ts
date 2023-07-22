import { Setting } from "../type/setting";
import { config } from "./config";

//这只是传输设置.v,这里在初始化
let setting:Setting={
    pe:{
        bootWaitTime:config.setting.pe.bootWaitTime,
        wallpaper:''
    },
    client:{
        dlThread:config.download.thread
    }
}


export{setting}