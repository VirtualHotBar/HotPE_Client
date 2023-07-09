import { UpdateLatest } from '../type/update'
import { roConfig, config } from '../services/config'

//更新公告
export async function GetNotices() {
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

//检查PE更新
export function checkPEUpdate() {
    return new Promise(function (resolve, reject) {
        fetch(roConfig.url.update.PE).then(response => response.json())
            .then(data => {

                let updateData: UpdateLatest = {
                    id: data.tag_name,
                    name: data.name,
                    description: data.body,
                    url: roConfig.url.package.PE.replaceAll('{id}', data.tag_name),
                    date: data.published_at
                }

                config.resources.pe.update = updateData

                resolve(updateData)//完成返回
            })
            .catch(e => Error(e))


    }
    )
}

//检查客户端更新
export function checkCilentUpdate() {
    return new Promise(function (resolve, reject) {
        fetch(roConfig.url.update.client).then(response => response.json())
            .then(data => {

                let updateData: UpdateLatest = {
                    id: data.tag_name,
                    name: data.name,
                    description: data.body,
                    url: roConfig.url.package.client.replaceAll('{id}', data.tag_name),
                    date: data.published_at
                }

                config.resources.client.update = updateData

                resolve(updateData)//完成返回
            })
            .catch(e => Error(e))


    }
    )
}