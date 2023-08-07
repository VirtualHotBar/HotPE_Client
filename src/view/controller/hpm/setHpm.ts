//HPM的删除，禁用，启用
//完成后自动刷新HPMListLocal

import { config } from "../../services/config";
import { delFiles, reNameFile } from "../../utils/utils";
import { checkHPMFiles } from "./checkHpmFiles";



//删除队列(避免重复执行
let delHPMList: Array<string> = []

//删除
export async function delHPM(fileName: string) {
    if (delHPMList.includes(fileName)) { return }//在队列直接返回

    //加入队列
    delHPMList.push(fileName)
    delHPMList = Array.from(new Set(delHPMList))//去重
    
    let isSucceed = true
    const HPMDirPath = config.environment.HotPEDrive.new.letter + '\\HotPEModule\\'
    isSucceed = isSucceed && await delFiles(HPMDirPath + fileName)

    //刷新
    await checkHPMFiles()

    //队列删除执行完成的
    delHPMList.splice(delHPMList.indexOf(fileName), 1);

    return isSucceed
}



//禁用
export async function disableHPM(fileName: string) {


    //是否已禁用
    if (fileName.substring(fileName.length - 3, fileName.length).toLowerCase() == 'off') { return true }


    let isSucceed = true

    const HPMDirPath = config.environment.HotPEDrive.new.letter + '\\HotPEModule\\'
    isSucceed = isSucceed && await reNameFile(HPMDirPath + fileName, HPMDirPath + fileName + '.off')

    //刷新
    await checkHPMFiles()

    return isSucceed
}

//启用
export async function enableHPM(fileName: string) {
    //是否已启用
    if (fileName.substring(fileName.length - 3, fileName.length).toLowerCase() != 'off') { return true }

    let isSucceed = true

    const HPMDirPath = config.environment.HotPEDrive.new.letter + '\\HotPEModule\\'
    isSucceed = isSucceed && await reNameFile(HPMDirPath + fileName, HPMDirPath + fileName.substring(0, fileName.length - 4))

    //刷新
    await checkHPMFiles()

    return isSucceed
}