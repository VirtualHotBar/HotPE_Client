import { config, roConfig } from "../../services/config"
import { disksInfo, partitionInfo } from "../../type/config"
import { runCmdAsync } from "../command"
import { filterArrayNull } from "../utils"


//获取磁盘信息（更新
export async function getDisksInfo() {
    //disk
    let disksTemp = filterArrayNull((await runCmdAsync(roConfig.path.tools + 'hdd.exe  -mohong')).replaceAll('	', '|').split('\r\n'))
    config.environment.ware.disks = disksTemp.map((disk: string, index: number) => {
        const temp = disk.split('|')

        let isMovable = false
        if (temp[4].includes('USB')) {
            isMovable = true
        }

        const diskRrturn: disksInfo = {
            index: Number(temp[0]) - 1,//磁盘索引
            size: temp[1],//总大小
            name: temp[2],//磁盘名称
            movable: isMovable,//是否可移动
            q: Number(temp[3])//一个不知道什么的数组
        }
        return diskRrturn
    })
    config.environment.ware.disks = config.environment.ware.disks.reverse()//翻转
}

//获取分区信息（更新
export async function getPartitionsInfo() {
    //partition
    let partitionsTemp = filterArrayNull((await runCmdAsync(roConfig.path.tools + 'CxDir.exe  -mohong')).replaceAll('	', '|').split('\r\n'))
    config.environment.ware.partitions = partitionsTemp.map((partition: string, index: number) => {
        const temp = partition.split('|')
        const partitionRrturn: partitionInfo = {
            diskIndex: Number(temp[0].split(':')[0]) - 1,//磁盘索引
            partitionIndex: Number(temp[0].split(':')[1]) - 1,//分区索引
            letter: temp[1].replaceAll('  ', ''),//盘符
            size: temp[2],//总大小
            usableSize: temp[3],//可用大小
            type: temp[4],//分区类型
            fileSystem: temp[5],//文件系统
            label: temp[6],
            GPT: (temp[7] == 'GPT'),//分区表类型
            active: (temp[8] == '1'),//激活
        }
        return partitionRrturn
    })
    config.environment.ware.partitions = config.environment.ware.partitions.reverse()//翻转
}









//判断磁盘是否是移动设备
export function isMoveForDisk(diskIndex: number) {
    for (let i in config.environment.ware.disks) {
        const disk = config.environment.ware.disks[i]
        if (diskIndex == disk.index) {
            return disk.movable
        }
    }
    return false
}

//取所有盘符
export async function getAllLetter() {
    let allLetter: Array<string> = []

    for (let i in config.environment.ware.partitions) {
        const partition = config.environment.ware.partitions[i]
        if (partition.letter != '') {
            allLetter.push(partition.letter)
        }
    }

    return allLetter
}

//盘符是否存在
export async function letterIsExist(letter: string) {
    let allLetter: Array<string> = await getAllLetter()
    for (let i in allLetter) {
        if (allLetter[i].substring(0, 1) == letter.substring(0, 1)) {
            return true
        }
    }
    return false
}


//取可用盘符
export async function getUsableLetter() {
    let letters: Array<string> = 'DEFGHIJKLMNOPQRSTUVWXYZABC'.split('')

    await getPartitionsInfo()//更新一下分区信息
    
    for (let i in letters) {
        if (!await letterIsExist(letters[i]+':' )) {
            return letters[i] +':'
        }
    }

    return ''
}