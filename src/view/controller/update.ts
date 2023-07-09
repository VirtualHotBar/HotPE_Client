import { UpdateLatest } from '../type/update'
import { roConfig, config } from '../services/config'

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