import { config, roConfig } from "../services/config";
import { Aria2Attrib } from "../type/aria2";
import { Aria2 } from "../utils/aria2/aria2";
import { checkPERes } from "./condition";
import { updateState } from "./init";


export function dlPERes(callback: Function) {
    const aria2 = new Aria2()

    aria2.start(config.resources.pe.update.url, roConfig.path.resources.pe, config.resources.pe.update.id + '.7z', config.download.thread,
        async (back: Aria2Attrib) => {
            

            if(back.state=="done"){
                //检查资源
                await checkPERes()
                //更新状态
                await updateState()
            }



            callback(back)
        })

}