import { config } from "../../services/config";
import { HPMListLocal } from "../../services/hpm";
import { HPM } from "../../type/hpm";
import { traverseFiles } from "../../utils/utils";
import { getHPMinfoLocal } from "./hpm";


//获取本地HPM列表
export async function checkHPMFiles() {
    const HPMDirPath = config.environment.HotPEDrive.new.letter + 'HotPEModule\\'

    let HPMsTemp = await traverseFiles(HPMDirPath + '*.HPM')
    HPMListLocal.on = HPMsTemp.map((fileName: string, index: number) => {
        return getHPMinfoLocal(HPMDirPath, fileName)
    })

    HPMsTemp = await traverseFiles(HPMDirPath + '*.HPM.off')
    HPMListLocal.off = HPMsTemp.map((fileName: string, index: number) => {
        return getHPMinfoLocal(HPMDirPath, fileName)
    })

    console.log(HPMListLocal);

}

//HPM文件是否已存在(本地
export function isHPMHaveLocal(HPMInfo: HPM){
    let isHave = false
    HPMListLocal.on.map((hpmInfo:HPM, index) => {

        
        if (hpmInfo.fileName == HPMInfo.fileName) {
            isHave = true
        }
    })

    HPMListLocal.off.map((hpmInfo:HPM, index) => {
        if (hpmInfo.fileName == HPMInfo.fileName) {
            isHave = true
        }
    })
    return isHave
}