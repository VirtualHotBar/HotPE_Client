import { UpdateLatest } from '../type/update'
import { roConfig, config } from '../services/config'
import { copyDir, dealStrForCmd, takeLeftStr } from '../utils/utils'
import { dlClientRes } from './dlRes'
import { Aria2Attrib } from '../type/aria2'
import { runCmd, runCmdAsync, runCmdSync } from '../utils/command'
import { exitapp } from '../layout/header'
import { Notification } from '@douyinfe/semi-ui'

const path = window.require('path')
const fs = window.require('fs')

//检查更新,pe and client
export async function checkUpdate() {
    await checkPEUpdate()
    await checkCilentUpdate()

    if (takeLeftStr(config.resources.pe.new, '.') < config.resources.pe.update.id) {
        config.state.resUpdate = 'needUpdatePE'
    } else if (roConfig.id < config.resources.client.update.id) {
        config.state.resUpdate = 'needUpdateClient'
    } else {
        config.state.resUpdate = 'without'
    }
}

//检查PE更新
function checkPEUpdate() {
    return new Promise(function (resolve, reject) {
        fetch(config.api.ghapi + roConfig.url.update.PE).then(response => response.json())
            .then(data => {

                let updateData: UpdateLatest = {
                    id: data.tag_name,
                    name: data.name,
                    description: data.body,
                    url: config.api.dl + roConfig.url.package.PE.replaceAll('{id}', data.tag_name),
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
        fetch(config.api.ghapi + roConfig.url.update.client).then(response => response.json())
            .then(data => {

                let updateData: UpdateLatest = {
                    id: data.tag_name,
                    name: data.name,
                    description: data.body,
                    url: config.api.dl + roConfig.url.package.client.replaceAll('{id}', data.tag_name),
                    date: data.published_at
                }

                config.resources.client.update = updateData

                resolve(updateData)//完成返回
            })
            .catch(e => Error(e))


    }
    )
}

//更新客户端
export function updateCilent(setDlPercent: Function, setDlSpeed: Function, callback: Function) {
    let updateStep = '' //dl、fit、restart
    //let isDlOk = false//下载是否完成

    //返回Aria2属性，初始化
    let tempAria2Attrib: Aria2Attrib = ({
        state: 'request',
        speed: '',//速度
        percentage: 0,//进度百分比
        remainder: '',//剩余时间
        size: '',//总大小
        newSize: '',//已下载大小
        message: '',//当前的Aria2返回
    })

    updateStep = 'dl'
    dlClientRes(setDlPercent, setDlSpeed, (back: Aria2Attrib) => {
        tempAria2Attrib = back
        callback(updateStep, tempAria2Attrib)

        if (tempAria2Attrib.state == 'done') {

            //isDlOk = true
            fitClient()
        }
    })

    //设置客户端
    async function fitClient() {
        updateStep = 'fit'
        setDlPercent(100)
        setDlSpeed('正在部署更新，请等待软件重启')
        callback(updateStep, tempAria2Attrib)


        /*         fs.copyDir((err: any) => {
                    if (err) { Error('aria2:Copying aria2 file failed') } else (console.log('copy')
                    )
                }); */
        //await copyDir(roConfig.path.tools + '7z\\', roConfig.path.resources.client + '7z\\')
        //, (err: any) => { if (err) { Error('update:Copying update file failed') } else (console.log('copy')) }

        /* await fs.mkdir(roConfig.path.tools + '7z\\') */
        await fs.copyFile(roConfig.path.tools + '7z\\7z.exe', roConfig.path.resources.client + '7z.exe', () => { })
        await fs.copyFile(roConfig.path.tools + '7z\\7z.dll', roConfig.path.resources.client + '7z.dll', () => { })

        //await fs.copyFile(roConfig.path.tools + 'update\\update.exe', roConfig.path.resources.client + 'update.exe', () => { })

        restartClient()
    }

    //重启客户端
    function restartClient() {
        updateStep = 'restart'
        callback(updateStep, tempAria2Attrib)

        const updateBatSource = fs.readFileSync(roConfig.path.tools + 'update\\update.bat', 'utf8')

        let updateBat = updateBatSource.replaceAll('{pack}', roConfig.path.execDir + roConfig.path.resources.client + config.resources.pe.update.id + '.7z')
        updateBat = updateBat.replaceAll('{clientDir}', roConfig.path.execDir)

        let batPath = roConfig.path.resources.client + 'update.bat'
        fs.writeFileSync(batPath, updateBat, 'utf8')

        runCmdSync('start cmd /c ' + batPath)

        //退出
        exitapp()
    }

}

//更新完成后提示
export function updateDoneTip() {
    if (fs.existsSync(roConfig.path.execDir + 'update.mark')) {//标记文件

        fs.unlinkSync(roConfig.path.execDir + 'update.mark')

        Notification.success({
            title: '更新完成',
            content: '客户端已经成功更新到最新版本！',
            duration: 30,
        })

    }
}
