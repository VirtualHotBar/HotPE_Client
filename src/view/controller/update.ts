import { UpdateLatest } from '../type/update'
import { roConfig, config } from '../services/config'
import { takeLeftStr } from '../utils/utils'

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

//检查更新,pe and client
export async function checkUpdate() {
    await checkPEUpdate()
    await checkCilentUpdate()

    if (takeLeftStr(config.resources.pe.new, '.') < config.resources.pe.update.id) {
        config.state.update = 'needUpdatePE'
    } else if (roConfig.id < config.resources.client.update.id) {
        config.state.update = 'needUpdateClient'
    } else {
        config.state.update = 'without'
    }
}

//检查PE更新
function checkPEUpdate() {
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
function checkCilentUpdate() {
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