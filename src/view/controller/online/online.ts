//在线的操作，获取API的数据

import { config } from "../../services/config"
import { setHPMListOnline } from "../../services/hpm"
import { HPM, HPMClass } from "../../type/hpm"
import { takeLeftStr } from "../../utils/utils"


//获取公告
export async function getNotices() {
    await fetch(config.api.api + 'API/HotPE/GetNotices/').then(response => response.json())
        .then(data => {
            if (config.notice.content != data.data.client.content) {
                config.notice.show = true
                config.notice.content = data.data.client.content
                config.notice.type = data.data.client.type
            }
        })
        .catch(e => Error(e))
}

//获取HPM列表
export async function getHPMList() {
    await fetch(config.api.api + 'API/HotPE/GetHPMList/').then(response => response.json())
        .then(data => {
            if (data.state == "success") {
                let HPMListOnlineTemp = data.data.map((hpmClassSrc: any) => {
                    let hpmList = hpmClassSrc.list.map((hpmSrc: any) => {
                        let hpmInfo =(hpmSrc.name.substring(0,hpmSrc.name.length-4)).split('_')
                        let HPM:HPM = {
                            fileName: hpmSrc.name,
                            size: hpmSrc.size,
                            name: hpmInfo[0],
                            maker: hpmInfo[1],
                            version: hpmInfo[2],
                            description: hpmInfo[3],
                            time:new Date(hpmSrc.modified),
                            dlLink: hpmSrc.link
                        } 
                        return HPM
                    })

                    let HPMClass:HPMClass = { class: hpmClassSrc.class, list: hpmList }
                    return HPMClass
                })

                setHPMListOnline(HPMListOnlineTemp)
            }
        })
        .catch(e => Error(e))
}