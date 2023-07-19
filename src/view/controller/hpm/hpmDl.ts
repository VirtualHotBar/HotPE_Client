//HPM下载处理

import { Notification } from "@douyinfe/semi-ui";
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
if(!isHPMReady()){return}

    
    const HPMDirPath = config.environment.HotPEDrive.new.letter + 'HotPEModule\\'

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
            //刷新模块列表
            await checkHPMFiles()
            //删除HPMDl
            HPMDlList.map((HPMDl_: HPMDl, index: number) => {
                if (HPMDl_.HPMInfo == HPMDlTemp.HPMInfo) {
                    HPMDlList.splice(index, 1)
                }
            })


            Notification.success({
                title: '模块安装成功！',
                content: '请到"模块管理"查看页面。',
                duration: 3,
            })
        }

        //更新界面
        HPMDLRender.map((fn) => { fn(hpmInfo) })
    })

    HPMDlList.push(HPMDlTemp)
}

//取消HPM下载任务
export async function cancelDlTask(hpmDl: HPMDl) {
    return new Promise((resolve, reject) => {
        hpmDl.dlClass.stop((back: boolean) => {
            console.log('取消下载', back)
            if (back) {
                //删除HPMDl
                HPMDlList.map((HPMDl_: HPMDl, index: number) => {
                    if (HPMDl_.HPMInfo == hpmDl.HPMInfo) {
                        HPMDlList.splice(index, 1)
                    }
                })
            }
            resolve(back)
        })
    })
}

//判断模块是否在下载队列
export function HPMisDling(HPMInfo: HPM) {
    let isHave = false
    HPMDlList.map((hpmDl: HPMDl, index) => {
        if (hpmDl.HPMInfo.fileName == HPMInfo.fileName) {
            isHave = true
        }
    })
    return isHave
}

//取模块下载进度
export function getHPMDlPercent(HPMInfo: HPM) {
    let percent = -1
    HPMDlList.map((hpmDl: HPMDl, index) => {
        if (hpmDl.HPMInfo.fileName == HPMInfo.fileName) {
            percent = hpmDl.dlInfo.percentage
        }
    })
    return percent
}