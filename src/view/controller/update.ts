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
        callback(updateStep, tempAria2Attrib)


        /*         fs.copyDir((err: any) => {
                    if (err) { Error('aria2:Copying aria2 file failed') } else (console.log('copy')
                    )
                }); */
        await copyDir(roConfig.path.tools + '7z\\', roConfig.path.resources.client + '7z\\')
        //, (err: any) => { if (err) { Error('update:Copying update file failed') } else (console.log('copy')) }

        /* await fs.mkdir(roConfig.path.tools + '7z\\')
        await fs.copyFile(roConfig.path.tools + '7z\\7z.exe', roConfig.path.resources.client + '7z\\7z.exe')
        await fs.copyFile(roConfig.path.tools + '7z\\7z.dll', roConfig.path.resources.client + '7z\\7z.dll') */

        await fs.copyFile(roConfig.path.tools + 'update\\update.bat', roConfig.path.resources.client + 'update.bat', () => { })

        restartClient()
    }

    //重启客户端
    function restartClient() {
        updateStep = 'restart'
        callback(updateStep, tempAria2Attrib)

        let batPath = roConfig.path.resources.client + 'toUpdate.bat'
        let cmd = '@echo off\r\n%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~s0 ::","","runas",1)(window.close)&&exit\r\n'
            //+ 'TIMEOUT /T 3 /NOBREAK\r\n'
            + 'chcp 65001\r\nmode con cols=60 lines=20\r\ncolor 03\r\ntitle HotPE客户端更新\r\n'
            + ''
            + 'TIMEOUT /T 3\r\n'
            + dealStrForCmd(path.normalize(roConfig.path.execDir + roConfig.path.resources.client + 'update.bat')) + ' '
            + dealStrForCmd(path.normalize(roConfig.path.execDir + roConfig.path.resources.client + config.resources.pe.update.id + '.7z')) + ' '
            + dealStrForCmd(path.normalize(roConfig.path.execDir)) + '\r\ndel %0 && exit'

        fs.writeFileSync(batPath, cmd, 'utf8')

        runCmdSync(batPath)

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
