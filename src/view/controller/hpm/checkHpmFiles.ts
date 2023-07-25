import { config } from "../../services/config";
import { HPMListLocal } from "../../services/hpm";
import { HPM } from "../../type/hpm";
import { isFileExisted, takeLeftStr, traverseFiles } from "../../utils/utils";
import { getHPMinfoLocal } from "./hpm";

//正在获取本地HPM列表
let isCheckingHPMFiles = false

//获取本地HPM列表
export async function checkHPMFiles() {
    if (isCheckingHPMFiles || config.environment.HotPEDrive.new.letter == '') { return }//如果正在获取或没有HotPE安装，就取消
    isCheckingHPMFiles = true

    const HPMDirPath = config.environment.HotPEDrive.new.letter + 'HotPEModule\\'

    let HPMsTemp = await traverseFiles(HPMDirPath + '*.HPM')
    let onHPMTemp = HPMsTemp.map((fileName: string, index: number) => {
        return getHPMinfoLocal(HPMDirPath, fileName)
    })

    //排除没有下载完成的
    for (let i in HPMListLocal.on) {
        if (await isFileExisted(HPMDirPath + HPMListLocal.on[i].fileName + '.aria2')) {
            //alert(HPMListLocal.on[1].fileName)
            HPMListLocal.on.splice(Number(i), 1)
        }
    }

    HPMsTemp = await traverseFiles(HPMDirPath + '*.HPM.off')
    let offHPMTemp = HPMsTemp.map((fileName: string, index: number) => {
        return getHPMinfoLocal(HPMDirPath, fileName)
    })


    HPMListLocal.on = onHPMTemp
    HPMListLocal.off = offHPMTemp
    console.log(HPMListLocal);

    isCheckingHPMFiles = false
}

//HPM文件是否已存在(本地
export function isHPMHaveLocal(HPMInfo: HPM) {
    let HPMListLocalAll = HPMListLocal.on.concat(HPMListLocal.off)//合并

    for (let i in HPMListLocalAll) {
        if (takeLeftStr(HPMListLocalAll[i].fileName.toLowerCase(), '.hpm') == takeLeftStr(HPMInfo.fileName.toLowerCase(), '.hpm')) {
            return true
        }
    }

    return false
}