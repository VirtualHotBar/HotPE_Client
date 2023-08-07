//HPM下载处理

import { Notification, Toast } from "@douyinfe/semi-ui";
import { config } from "../../services/config";
import { HPMDLRender, HPMDlList } from "../../services/hpm";
import { Aria2Attrib } from "../../type/aria2";
import { HPM, HPMDl } from "../../type/hpm";
import { Aria2 } from "../../utils/aria2/aria2";
import { checkHPMFiles } from "./checkHpmFiles";
import { isHPMReady } from "./hpm";

//创建HPM下载任务（开始下载
export function newHPMDl(hpmInfo: HPM) {
    //检查是否准备就绪，检查HotPE盘是否存在
    if (!isHPMReady()) { return }

    //判断是否在下载队列，在则是重新下载(不提示
    let isReDl = isHPMinDlList(hpmInfo)
    if (isReDl) {
        //从现在队列中移除旧的下载
        delHPMDlFromList(hpmInfo)
    }

    const HPMDirPath = config.environment.HotPEDrive.new.letter + '\\HotPEModule\\'
    

    let HPMDlTemp: HPMDl = {
        HPMInfo: hpmInfo,
        dlClass: new Aria2(),
        dlInfo: {
            state: 'request',
            speed: '',
            percentage: 0,
            remainder: '',
            size: '',
            newSize: '',
            message: '',
        }
    }

    HPMDlTemp.dlClass.start(hpmInfo.dlLink!, HPMDirPath, hpmInfo.fileName, config.download.thread, async (back: Aria2Attrib) => {
        HPMDlTemp.dlInfo = back
        if (back.state == 'done') {
            //删除HPMDl（下载任务
            for (let i in HPMDlList) {
                if (HPMDlList[i].HPMInfo == HPMDlTemp.HPMInfo) {
                    HPMDlList.splice(Number(i), 1)
                    break//跳出当前循环体
                }
            }

            //刷新模块列表
            await checkHPMFiles()

            /* Notification.success({
                title: '模块安装成功！',
                content: '请到"模块管理"查看页面。',
                duration: 3,
            }) */

            setTimeout(refreshRenderResult, 100)
            Toast.success('模块安装成功：' + HPMDlTemp.HPMInfo.name)
        } else if (back.state == 'error') {
            HPMDlTemp.dlInfo.percentage = -1
            //Toast.info('下载错误：'+HPMDlTemp.HPMInfo.name)
            setTimeout(refreshRenderResult, 100)

            //确保不是取消下载
            setTimeout(() => {
                if (isHPMinDlList(HPMDlTemp.HPMInfo)) {
                    Notification.error({
                        title: '下载错误！',
                        content: '请到"模块管理"查看页面。',
                        duration: 5,
                    })
                }
            }, 300)
        }
        setTimeout(refreshRender, 10)
    })

    HPMDlList.push(HPMDlTemp)
    setTimeout(refreshRenderResult, 10)

    if (!isReDl) { Toast.info('加入下载队列：' + HPMDlTemp.HPMInfo.name) }

}

//取消HPM下载任务
export async function cancelDlTask(hpmDl: HPMDl) {
    return new Promise((resolve, reject) => {
        hpmDl.dlClass.stop((back: boolean) => {
            delHPMDlFromList(hpmDl.HPMInfo)
            setTimeout(refreshRenderResult, 100)
            resolve(back)
        })
    })
}

//判断模块是否在下载队列
export function isHPMinDlList(HPMInfo: HPM) {
    for (let i in HPMDlList) {
        if (HPMDlList[i].HPMInfo.fileName == HPMInfo.fileName) {            
            return true//结束函数体返回值
        }
    }
    return false
}

//取模块下载进度
export function getHPMDlPercent(HPMInfo: HPM) {
    for (let i in HPMDlList) {
        if (HPMDlList[i].HPMInfo.fileName == HPMInfo.fileName) {
            return HPMDlList[i].dlInfo.percentage
        }
    }
    return -1
}

//删除下载任务(从下载队列中删除
function delHPMDlFromList(HPMInfo: HPM) {
    //删除HPMDl,下载任务
    for (let i in HPMDlList) {
        if (HPMDlList[i].HPMInfo.fileName == HPMInfo.fileName) {
            HPMDlList.splice(Number(i), 1)
            break
        }
    }
    return
}


//更新界面实时
function refreshRender() {
    HPMDLRender.callRefreshPage()//页
    HPMDLRender.callRefreshDlTab.map((fn) => { fn() })//标签
}

//更新界面,结果
function refreshRenderResult() {
    HPMDLRender.callRefreshNav()//导航
    HPMDLRender.callRefreshResult()
    refreshRender()
}