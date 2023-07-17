import { Notification } from "@douyinfe/semi-ui"
import { config, roConfig } from "../../services/config"
import { runCmdAsync } from "../../utils/command"
import { copyFiles, delDir, getUsableLetter, isHotPEDrive, moveFiles, readHotPEConfig, takeLeftStr, unZipFile, writeHotPEConfig } from "../../utils/utils"
import { checkPEDrive } from "../condition"
const fs = window.require('fs')

const tempPath = roConfig.path.clientTemp + 'install\\peFiles\\'


const pacmdPath = roConfig.path.tools + 'PACMDforUSB\\PartAssist.exe'
const booticePath = roConfig.path.tools + 'BOOTICE.exe'
const pecmdPath = roConfig.path.tools + 'PECMD.exe'
const fbplusPath = roConfig.path.tools + 'fbplus.exe'

export async function installToUDisk(diskIndex: string, setStep: Function, setStepStr: Function, setLockMuen: Function) {
    const tempEFIPath = roConfig.path.clientTemp + 'install\\peFiles\\EFI\\'
    const tempDataPath = roConfig.path.clientTemp + 'install\\peFiles\\Data\\'

    //创建目录
    //await fs.mkdir(tempEFIPath, (back: any) => { console.log(back) })
    //await fs.mkdir(tempDataPath, (back: any) => { console.log(back) })


    setLockMuen(true)
    setStep(0)
    setStepStr('正在解压文件')

    //解压
    await unZipFile(roConfig.path.resources.pe + config.resources.pe.new, tempPath)

    setStep(1)
    setStepStr('正在解除占用')
    //解除占用(数据分区强制分配盘符)
    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + ' /setletter:0 /letter:*')
    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + ' /setletter:0 /letter:auto')

    setStepStr('正在删除U盘所有分区')
    //删除磁盘所有分区
    await runCmdAsync(fbplusPath + ' (hd' + diskIndex + ') format --force --raw --fat32  --align')//还原磁盘为普通模式（删除fbinst引导记录）
    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + '  /del:all')

    setStepStr('正在初始化U盘')
    //初始化
    await runCmdAsync(pacmdPath + ' /init:' + diskIndex)
    await runCmdAsync(pacmdPath + ' /rebuildmbr:' + diskIndex + ' /mbrtype:2')

    setStepStr('正在创建EFI分区')
    //创建EFI分区，激活，写引导
    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + ' /cre /size:1024 /pri /end /act /hide /align /fs:fat32 /label:EFI')
    await runCmdAsync(booticePath + ' /DEVICE=' + diskIndex + ' /mbr /type=usbhdd+ /install /quiet')
    await runCmdAsync(booticePath + ' /DEVICE=' + diskIndex + ':0 /pbr /type=bootmgr /install /quiet')

    setStepStr('正在写入文件')
    //写EFI分区文件
    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + ' /whide:0 /src:' + roConfig.path.execDir + tempEFIPath.substring(2, tempEFIPath.length - 1))//去路径末'\'

    setStepStr('正在创建数据分区')
    //创建数据分区，EXFAT
    let dataLetter = (await getUsableLetter() as string).substring(0, 2)
    console.log(dataLetter);

    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + ' /cre /size:auto /pri /align /fs:NTFS /letter:' + dataLetter)
    await runCmdAsync(pecmdPath + ' DFMT ' + dataLetter + ',exFAT,HotPE工具箱')

    //复制数据区文件
    await copyFiles(tempDataPath, dataLetter + '\\')

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

    //解除占用(数据分区强制分配盘符)
    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + ' /setletter:0 /letter:*')
    dataLetter = (await getUsableLetter() as string).substring(0, 2)
    await runCmdAsync(pacmdPath + ' /hd:' + diskIndex + ' /setletter:0 /letter:' + dataLetter)

    setStep(2)
    setStepStr('正在清理退出')
    //清理
    await delDir(tempPath)


    //更新PE安装状态
    await checkPEDrive()

    setStep(-1)
    setLockMuen(false)

    if (isHotPEDrive(dataLetter + '\\')) {
        Notification.success({
            title: '安装到U盘成功！',
            content: '每次重启都有3S的等待时间。',
            duration: 5,
        })
    } else {
        Notification.error({
            title: '安装到U盘失败！',
            content: '请更换U盘或插拔后重试。',
            duration: 5,
        })
    }

}