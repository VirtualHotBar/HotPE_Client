import { roConfig, config } from '../services/config'
import { takeLeftStr } from '../utils/utils'
import { dlClientRes } from './dlRes'
import { Aria2Attrib } from '../type/aria2'
import { runCmdSync } from '../utils/command'
import { exitapp } from '../layout/header'
import { Notification } from '@douyinfe/semi-ui'
import { safeFS } from '../utils/safeAPI'

//检查更新,pe and client
export async function checkUpdate() {

    fetch(config.api.api + roConfig.url.update).then(response => response.json())
    .then(data => {
        config.resources.pe.update = data.data.pe
        config.resources.client.update = data.data.client
    })
    .catch(e => console.log(Error(e)))

    //await checkPEUpdate()
    //await checkClientUpdate()

    if (takeLeftStr(config.resources.pe.new, '.') < config.resources.pe.update.id) {
        config.state.resUpdate = 'needUpdatePE'
    } else if (roConfig.id < config.resources.client.update.id) {
        config.state.resUpdate = 'needUpdateClient'
    } else {
        config.state.resUpdate = 'without'
    }
}

//更新客户端
export function updateClient(setDlPercent: Function, setDlSpeed: Function, callback: Function) {
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
        setDlPercent(100)
        setDlSpeed('正在部署更新，请等待软件重启')

        try {
            // 复制必要的文件
            await safeFS.copyFile(roConfig.path.tools + '7z\\7z.exe', roConfig.path.resources.client + '7z.exe');
            await safeFS.copyFile(roConfig.path.tools + '7z\\7z.dll', roConfig.path.resources.client + '7z.dll');
            
            restartClient()
        } catch (error) {
            console.error('复制更新文件失败:', error);
        }
    }

    //重启客户端
    async function restartClient() {
        updateStep = 'restart'
        //callback(updateStep, tempAria2Attrib)

        try {
            const updateBatSource = await safeFS.readFileSync(roConfig.path.tools + 'update\\update.bat', 'utf8');

            let updateBat = updateBatSource.replaceAll('{pack}', roConfig.path.execDir + roConfig.path.resources.client + config.resources.pe.update.fileName)
            updateBat = updateBat.replaceAll('{clientDir}', roConfig.path.execDir)

            let batPath = roConfig.path.resources.client + 'update.bat'
            await safeFS.writeFileSync(batPath, updateBat, 'utf8');

            await runCmdSync('start cmd /c ' + batPath);

            //退出
            exitapp()
        } catch (error) {
            console.error('重启客户端失败:', error);
        }
    }
}

//更新完成后提示
export async function updateDoneTip() {
    const markFile = roConfig.path.execDir + 'update.mark';
    
    if (await safeFS.existsSync(markFile)) {//标记文件
        try {
            // 删除标记文件 - 这里需要通过命令行删除，因为我们没有实现 unlink API
            await runCmdSync(`del "${markFile}"`);

            Notification.success({
                title: '更新完成',
                content: '客户端已经成功更新到最新版本！',
                duration: 30,
            })
        } catch (error) {
            console.error('删除更新标记文件失败:', error);
        }
    }
}