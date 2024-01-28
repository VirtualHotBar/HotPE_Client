import { config, roConfig } from "../services/config";
import { Aria2Attrib } from "../type/aria2";
import { Aria2 } from "../utils/aria2/aria2";
import { checkPERes } from "./condition";
import { updateState } from "./init";
import { checkUpdate } from "./update";


export function dlPERes(setDlPercent: Function, setDlSpeed: Function, callback: Function) {
    const aria2 = new Aria2()

    aria2.start(config.resources.pe.update.download_url, roConfig.path.resources.pe, config.resources.pe.update.id + '.7z', config.download.thread,
        async (back: Aria2Attrib) => {
            
            if (back.state != 'error' && back.state != "done") {
                setDlPercent(back.percentage)
                if(back.state=='doing'){
                    setDlSpeed(`${back.speed}(${back.newSize}\\${back.size},${back.remainder})`)
                }else{
                    setDlSpeed('请求中...')
                }
                
            } else if (back.state == "done") {
                //检查资源
                await checkPERes()
                //检查更新
                await checkUpdate()
                //更新状态
                await updateState()

                setDlPercent(-1)
            }else{
                setDlPercent(-1)
            }

            callback(back)
        })

}

export function dlClientRes(setDlPercent: Function, setDlSpeed: Function, callback: Function) {
    const aria2 = new Aria2()

    aria2.start(config.resources.client.update.download_url, roConfig.path.resources.client, config.resources.pe.update.fileName, config.download.thread,
        async (back: Aria2Attrib) => {
            if (back.state != 'error' && back.state != "done") {
                setDlPercent(back.percentage)
                if(back.state=='doing'){
                    setDlSpeed(`${back.speed}(${back.newSize}\\${back.size},${back.remainder})`)
                }else{
                    setDlSpeed('请求中...')
                }
            } else if (back.state == "done") {
                //setDlPercent(-1)
                //检查资源
                //await checkPERes()
                //检查更新
                await checkUpdate()
                //更新状态
                await updateState()
            }else{
                setDlPercent(-1)
            }

            callback(back)
        })

}