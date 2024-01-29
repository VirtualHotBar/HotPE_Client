import { Modal, Notification } from "@douyinfe/semi-ui"
import { config, roConfig } from "../../services/config"
import { runCmdAsync } from "../../utils/command"
import { copyDir, copyFile, delDir, delFiles, isHotPEDrive, moveFiles, readHotPEConfig, takeLeftStr, takeMidStr, unZipFile, writeHotPEConfig } from "../../utils/utils"
import { checkPEDrive } from "../condition"
import { checkIsReady, getHotPEDriveLetter } from "./check"
import { ReactNode } from "react"
import { getUsableLetter } from "../../utils/disk/diskInfo"
const fs = window.require('fs')

const tempPath = roConfig.path.clientTemp + 'install\\peFiles\\'
const tempEFIPath = roConfig.path.clientTemp + 'install\\peFiles\\EFI\\'
const tempDataPath = roConfig.path.clientTemp + 'install\\peFiles\\Data\\'

const pacmdPath = roConfig.path.tools + 'PACMDforUSB\\PartAssist.exe'
const booticePath = roConfig.path.tools + 'BOOTICE.exe'
const pecmdPath = roConfig.path.tools + 'PECMD.exe'
const fbplusPath = roConfig.path.tools + 'fbplus.exe'

export async function installToUDisk(diskIndex: string, setStep: Function, setStepStr: Function, setLockMuen: Function) {
    console.log('diskIndex' + diskIndex);

    if (!checkIsReady()) { return };// 检查是否准备就绪 

    //确认对话框
    if (!await confirmDialog('请确认',
        '由于制作启动U盘会格式化U盘，请备份好数据后再操作!建议暂时关闭杀软。\r\n'
        + '继续写入请点[确定]，点[取消]取消写入。\r\n')) { return };

    //创建目录
    //await fs.mkdir(tempEFIPath, (back: any) => { console.log(back) })
    //await fs.mkdir(tempDataPath, (back: any) => { console.log(back) })


    setLockMuen(true)
    setStep(0)

    //当前操作是否成功
    let isSucceed = true


    //解压
    setStepStr('正在解压文件')
    await unZipFile(roConfig.path.resources.pe + config.resources.pe.new, tempPath)

    setStep(1)
    setStepStr('正在解除占用')
    //解除占用(数据分区强制分配盘符)
    await runPacmd(' /hd:' + diskIndex + ' /setletter:0 /letter:*')
    await runPacmd(' /hd:' + diskIndex + ' /setletter:0 /letter:auto')

    setStepStr('正在删除U盘所有分区')
    await runCmdAsync(fbplusPath + ' (hd' + diskIndex + ') format --force --raw --fat32  --align')//还原磁盘为普通模式（删除fbinst引导记录）
    //删除磁盘所有分区
    await runPacmd(' /hd:' + diskIndex + '  /del:all')



    setStepStr('正在初始化U盘')
    //初始化
    await runPacmd(' /init:' + diskIndex)
    await runPacmd(' /rebuildmbr:' + diskIndex + ' /mbrtype:2')

    setStepStr('正在创建EFI分区')
    //创建EFI分区，激活，写引导
    isSucceed = isSucceed && await runPacmd(' /hd:' + diskIndex + ' /cre /size:1024 /pri /end /act /hide /align /fs:fat32 /label:EFI')
    await runCmdAsync(booticePath + ' /DEVICE=' + diskIndex + ' /mbr /type=usbhdd+ /install /quiet')
    await runCmdAsync(booticePath + ' /DEVICE=' + diskIndex + ':0 /pbr /type=bootmgr /install /quiet')

    setStepStr('正在写入文件')
    //写EFI分区文件
    isSucceed = isSucceed && await runPacmd(' /hd:' + diskIndex + ' /whide:0 /src:' + roConfig.path.execDir + tempEFIPath.substring(2, tempEFIPath.length - 1))//去路径末'\'

    setStepStr('正在创建数据分区')
    //创建数据分区，EXFAT
    //let dataLetter = (await getUsableLetter()).substring(0, 2)
    let dataLetter = ''

    //isSucceed = isSucceed && await runPacmd(' /hd:' + diskIndex + ' /cre /size:auto /pri /align /fs:NTFS /letter:' + dataLetter)
    isSucceed = isSucceed && await runPacmd(' /hd:' + diskIndex + ' /cre /size:auto /pri /align /fs:NTFS /letter:auto', (back: string) => {
        dataLetter = takeMidStr(back, '盘符:', '文件系统:').replaceAll('	', '').replaceAll('\r\n', '').replaceAll(' ', '');
    });

    //获取数据分区盘符失败后重新获取
    if (!'F:G:H:I:J:K:L:M:N:O:P:Q:R:S:T:U:V:W:X:Y:Z:A:B:C:D:E:'.includes(dataLetter)) {
        await runPacmd(' /hd:' + diskIndex + ' /setletter:0 /letter:*')//卸载盘符
        dataLetter = await getUsableLetter()//取个没被占用(可用)的盘符
        isSucceed = isSucceed && await runPacmd(' /hd:' + diskIndex + ' /setletter:0 /letter:' + dataLetter)//重新分配盘符
    }

    await runCmdAsync(pecmdPath + ' DFMT ' + dataLetter + ',exFAT,HotPE工具箱')

    //复制数据区文件
    await copyDir(tempDataPath, dataLetter + '\\')

    //pe配置文件
    let HotPEConfig = readHotPEConfig(dataLetter + '\\')
    HotPEConfig.information.Installation_Method = 'UDisk'
    HotPEConfig.information.ReleaseVersion = takeLeftStr(config.resources.pe.new, '.')
    writeHotPEConfig(dataLetter + '\\', HotPEConfig)

    await runCmdAsync('attrib ' + dataLetter + '\\HotPE +S +H /S /D')
    await runCmdAsync('attrib ' + dataLetter + '\\HotPE\\* +S +H /S /D')
    await runCmdAsync('attrib ' + dataLetter + '\\AUTORUN.INF +S +H /S /D')
    await runCmdAsync('attrib ' + dataLetter + '\\HotPE.ico +S +H /S /D')

    //强制设置分区ID
    await runCmdAsync(pecmdPath + ' PART -admin ' + diskIndex + '#1 0x7')
    await runCmdAsync(pecmdPath + ' PART -admin ' + diskIndex + '#2 0xEF')

    await runCmdAsync(booticePath + ' /DEVICE=' + diskIndex + ':0 /partitions /delete_letter /quiet')
    await runCmdAsync(booticePath + ' /DEVICE=' + diskIndex + ':0 /partitions  /assign_letter  /quiet')

    //解除占用(数据分区强制分配盘符)
    //await runPacmd(' /hd:' + diskIndex + ' /setletter:0 /letter:*')
    //await runPacmd(' /hd:' + diskIndex + ' /setletter:0 /letter:auto')

    setStep(2)
    setStepStr('正在清理退出')
    //清理
    await delDir(tempPath)


    //更新PE安装状态
    await checkPEDrive()

    setStep(-1)
    setLockMuen(false)

    if (isSucceed) {
        Notification.success({
            title: '安装到U盘成功！',
            content: '重启并从U盘启动以开始使用。',
            duration: 10,
        })
    } else {
        Notification.error({
            title: '安装到U盘失败！',
            content: '请更换U盘或插拔后重试。',
            duration: 10,
        })
    }

}

//还原U盘
export async function UnInstallToUDisk(diskIndex: string, setStep: Function, setStepStr: Function, setLockMuen: Function) {
    //确认对话框
    if (!await confirmDialog('请确认',
        '还原U盘将进行格式化，请备份好数据后再操作!建议暂时关闭杀软。\n\r'
        + '继续还原请点[确定]，点[取消]取消还原。\n\r')) { return };

    setStep(-2)
    setLockMuen(true)

    //当前操作是否成功
    let isSucceed = true

    setStepStr('正在解除占用')
    //解除占用(数据分区强制分配盘符)
    //await runPacmd( ' /hd:' + diskIndex + ' /setletter:0 /letter:*')
    //await runPacmd( ' /hd:' + diskIndex + ' /setletter:0 /letter:auto')

    setStepStr('正在删除U盘所有分区')
    //删除磁盘所有分区
    await runCmdAsync(fbplusPath + ' (hd' + diskIndex + ') format --force --raw --fat32  --align')//还原磁盘为普通模式（删除fbinst引导记录）
    await runPacmd(' /hd:' + diskIndex + ' /del:all')

    setStepStr('正在初始化U盘')
    //初始化
    await runPacmd(' /init:' + diskIndex)
    await runPacmd(' /rebuildmbr:' + diskIndex + ' /mbrtype:2')

    setStepStr('正在创建分区')
    //创建数据分区，EXFAT
    let dataLetter = (await getUsableLetter()).substring(0, 2)

    isSucceed = isSucceed && await runPacmd(' /hd:' + diskIndex + ' /cre /size:auto /pri /align /fs:NTFS /letter:' + dataLetter)
    await runCmdAsync(pecmdPath + ' DFMT ' + dataLetter + ',exFAT,')


    //setStepStr('正在解除占用')
    //解除占用(数据分区强制分配盘符)
    //await runPacmd( ' /hd:' + diskIndex + ' /setletter:0 /letter:*')
    //await runPacmd( ' /hd:' + diskIndex + ' /setletter:0 /letter:auto')

    //更新PE安装状态
    await checkPEDrive()

    setStep(-1)
    setLockMuen(false)

    if (isSucceed) {
        Notification.success({
            title: 'U盘还原成功！',
            content: 'qaq，期待你的回归。',
            duration: 10,
        })
    } else {
        Notification.error({
            title: 'U盘还原失败！',
            content: '请手动还原或插拔后重试。',
            duration: 10,
        })
    }

}

//更新PE，免格
export async function updatePEForUDisk(diskIndex: string, setStep: Function, setStepStr: Function, setLockMuen: Function) {

    if (!checkIsReady()) { return };// 检查是否准备就绪 

    setLockMuen(true)
    setStep(0)

    //当前操作是否成功
    let isSucceed = true

    //解压
    setStepStr('正在解压文件')
    await unZipFile(roConfig.path.resources.pe + config.resources.pe.new, tempPath)

    setStep(1)

    //清理EFI分区
    setStepStr('正在清理EFI分区')

    //格式化EFI分区
    await runPacmd(' /hd:' + diskIndex + ' /fmt:1 /fs:fat32 /label:EFI')

    //写EFI分区文件
    setStepStr('正在更新EFI分区')
    isSucceed = isSucceed && await runPacmd(' /hd:' + diskIndex + ' /whide:1 /src:' + roConfig.path.execDir + tempEFIPath.substring(2, tempEFIPath.length - 1))//去路径末'\'

    setStepStr('正在更新数据分区')
    let dataLetter = getHotPEDriveLetter(Number(diskIndex))

    //let dataLetter = (await getUsableLetter() as string).substring(0, 2)
    //await runPacmd(' /hd:' + diskIndex + ' /setletter:0 /letter:' + dataLetter)
    if (dataLetter != '') {
        //if (await letterIsExist(dataLetter)) {
        //复制数据区文件
        await copyDir(tempDataPath, dataLetter + '\\')

        //pe配置文件
        let HotPEConfig = readHotPEConfig(dataLetter + '\\')
        HotPEConfig.information.Installation_Method = 'UDisk'
        HotPEConfig.information.ReleaseVersion = takeLeftStr(config.resources.pe.new, '.')
        writeHotPEConfig(dataLetter + '\\', HotPEConfig)

        await runCmdAsync('attrib ' + dataLetter + '\\HotPE +S +H /S /D')
        await runCmdAsync('attrib ' + dataLetter + '\\HotPE\\* +S +H /S /D')
        await runCmdAsync('attrib ' + dataLetter + '\\AUTORUN.INF +S +H /S /D')
        await runCmdAsync('attrib ' + dataLetter + '\\HotPE.ico +S +H /S /D')
        //}
    } else {
        isSucceed = isSucceed && false
    }



    setStep(2)
    setStepStr('正在清理退出')
    //清理
    await delDir(tempPath)

    //更新PE安装状态
    await checkPEDrive()

    if (isSucceed) {
        Notification.success({
            title: '更新成功！',
            content: '使用最新版本的HotPE以获得最好的体验。',
            duration: 10,
        })
    } else {
        Notification.error({
            title: '更新失败！',
            content: '请手动更新或插拔后重试。',
            duration: 10,
        })
    }


    setStep(-1)
    setLockMuen(false)
}

//运行傲梅
async function runPacmd(cmd: string, callBack: Function = () => { }) {
    let logPath = roConfig.path.clientTemp + 'pacmd_' + Date.now() + ".log"

    await runCmdAsync(pacmdPath + ' ' + cmd + ' /out:' + logPath)
    let result = new TextDecoder('gbk').decode(fs.readFileSync(logPath))
    //await delFiles(logPath)
    callBack(result)
    if (result.indexOf('完成') != -1) {
        return true
    }
    return false
}

//确认对话框
function confirmDialog(title: string, content: ReactNode) {
    return new Promise((resolve, reject) => {
        Modal.warning(
            {
                title: title,
                content: content,
                onOk: (e: any) => { resolve(true) },
                onCancel: (e: any) => { resolve(false) },
                centered: true
            }
        )
    })
}