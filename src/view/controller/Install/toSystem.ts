import { config, roConfig } from "../../services/config";
import { runCmdAsync } from "../../utils/command";
import { copyFiles, delDir, delFiles, isFileExisted, readHotPEConfig, takeLeftStr, unZipFile, writeHotPEConfig } from "../../utils/utils";
import { Notification } from "@douyinfe/semi-ui";
import ini from 'ini'
import { checkPEDrive } from "../condition";
//import fs from "fs";

const fs = window.require('fs')

const GUID1 = '{4a00d3c0-3a86-2d40-b468-8bb065afa321}'
const GUID2 = '{3a5d9b25-3e56-7c1a-0162-d1bfe6b14acc}'

const bcdeditPath = roConfig.path.tools + 'bcdedit.exe'

const tempPath = roConfig.path.clientTemp + 'install\\peFiles\\'

//更新标记
let isUpdate =false

export async function installToSystem(setCurrentStep: Function, setStepStr: Function) {

    console.log('installToSystem');
    setCurrentStep(0)
    setStepStr('正在解压HotPE源')



    //创建临时目录
    //if (await isFileExisted(tempPath) == false) {
    //    fs.mkdir(tempPath, (back: any) => { console.log(back) })
    //}

    //解压
    await unZipFile(roConfig.path.resources.pe + config.resources.pe.new, tempPath)



    setCurrentStep(1)
    setStepStr('正在复制HotPE文件')

    //创建目录
    await fs.mkdir(roConfig.environment.sysLetter + 'HotPE\\', (back: any) => { console.log(back) })
    //await fs.mkdir(roConfig.environment.sysLetter + 'HotPE\\Data\\', (back: any) => { console.log(back) })
    //await fs.mkdir(roConfig.environment.sysLetter + 'HotPEModule\\', (back: any) => { console.log(back) })

    //复制文件
    await copyFiles(tempPath + 'EFI\\HotPE\\kernel.wim', roConfig.environment.sysLetter + 'HotPE\\kernel.wim')
    await copyFiles(tempPath + 'Data\\HotPE\\confi.ini', roConfig.environment.sysLetter + 'HotPE\\confi.ini')
    await copyFiles(tempPath + 'EFI\\HotPE\\HotPE.ini', roConfig.environment.sysLetter + 'HotPE\\HotPE.ini')
    await copyFiles(tempPath + 'EFI\\HotPE\\Data\\', roConfig.environment.sysLetter + 'HotPE\\Data\\')
    await copyFiles(tempPath + 'Data\\HotPEModule\\', roConfig.environment.sysLetter + 'HotPEModule\\')

    //pe配置文件
    let HotPEConfig = readHotPEConfig(roConfig.environment.sysLetter)
    HotPEConfig.information.Installation_Method = 'System'
    HotPEConfig.information.ReleaseVersion = takeLeftStr(config.resources.pe.new, '.')
    writeHotPEConfig(roConfig.environment.sysLetter, HotPEConfig)

    //添加引导
    setCurrentStep(2)
    setStepStr('正在添加HotPE引导')


    let installLetter = roConfig.environment.sysLetter.substring(0, 2)
    

    await runCmdAsync(bcdeditPath + ' /create ' + GUID1 + ' /d HotPE工具箱 /application osloader')
    await runCmdAsync(bcdeditPath + ' /create ' + GUID2 + ' /d HotPE工具箱 /device')

    await runCmdAsync(bcdeditPath + ' /set ' + GUID2 + ' ramdisksdidevice partition=' + installLetter)
    await runCmdAsync(bcdeditPath + ' /set ' + GUID2 + ' ramdisksdipath  \\HotPE\\Kernel.SDI')

    await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' device ramdisk=[' + installLetter + ']\\HotPE\\Kernel.WIM,' + GUID2)

    if (config.environment.ware.system.firmware = 'UEFI') {
        await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' path \\windows\\system32\\boot\\winload.efi')
    } else {
        await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' path \\windows\\system32\\boot\\winload.exe')
    }

    await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' description HotPE工具箱')
    await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' osdevice ramdisk=[' + installLetter + ']\\HotPE\\Kernel.WIM,' + GUID2)
    await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' systemroot \\windows')
    await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' detecthal Yes')
    await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' winpe Yes')
    await runCmdAsync(bcdeditPath + ' /displayorder ' + GUID1 + ' /addlast')

    await runCmdAsync(bcdeditPath + ' /timeout 3')

    //下面两项跟开机动画实现有关
    //await runCmdAsync(bcdeditPath + ' /set {bootmgr} nointegritychecks yes')//禁用数字签名检查
    //await runCmdAsync(bcdeditPath + ' /set ' + GUID1 + ' BootMenuPolicy Standard')//启用Metro启动界面


    await runCmdAsync('attrib ' + roConfig.environment.sysLetter + 'HotPE +S +H /S /D')
    await runCmdAsync('attrib ' + roConfig.environment.sysLetter + 'HotPE\\* +S +H /S /D')

    //清理
    await delDir(tempPath)

    //更新PE安装状态
    await checkPEDrive()
    setCurrentStep(-1)
    console.log('安装完成！');

    if(!isUpdate){
        Notification.success({
            title: '安装到系统完成！',
            content: '每次重启都有3S的等待时间。',
            duration: 5,
        })

    }
    


}





export async function uninstallToSystem(setIsUninstalling: Function) {
    setIsUninstalling(true)

    await runCmdAsync(bcdeditPath + ' /delete '+GUID2+' /f')
    await runCmdAsync(bcdeditPath + ' /delete '+GUID1+' /f')

    await delDir(roConfig.environment.sysLetter + 'HotPE\\')
    await delDir(roConfig.environment.sysLetter + 'HotPEModule\\')

    //更新PE安装状态
    await checkPEDrive()

    if(!isUpdate){
        Notification.success({
            title: 'HotPE卸载完成！',
            content: '感谢你的使用！我会改进不足，等待你的回归。',
            duration: 5,
        })
    }
    

    setIsUninstalling(false)
}

export async function updatePEForSys(setIsUninstalling: Function,setCurrentStep: Function, setStepStr: Function){

    isUpdate = true

    await uninstallToSystem(setIsUninstalling)

    await installToSystem(setCurrentStep, setStepStr)


    isUpdate = false


    //更新PE安装状态
    await checkPEDrive()

    Notification.success({
        title: 'HotPE更新完成！',
        content: '使用最新版本的HotPE以获得最好的体验。',
        duration: 5,
    })

}