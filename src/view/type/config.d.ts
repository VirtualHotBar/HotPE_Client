//import {Type} from '@douyinfe/semi-foundation/lib/es/banner/index'
import { UpdateLatest } from "./update"

interface Config {
    api: {
        api: string,
        ghapi: string,
        dl: string
    },
    state: {
        install: 'noDown' | 'noSetup' | 'ready',
        resUpdate: 'without' | 'needUpdatePE' | 'needUpdateClient',
        setupToSys:  number| 'without',//number:版本

    },
    environment: {
        HotPEDrive: {
            new: {diskIndex:number, letter: string, isMove: boolean, version: string },
            all: Array
        },
        ware: {
            system:{
                os:string,
                buildNumber:string,
                userName:string,
                architecture:string,//架构：x64
                firmware:string,//固件：UEFI
            },
            disks:Array<disksInfo>,
            partitions:Array<partitionInfo>
        }

    },
    resources: {
        pe: {
            new: string,
            all: Array,
            update: UpdateLatest
        },
        client: {
            new: string,
            all: Array,
            update: UpdateLatest
        }
    }, directory: {

    },
    notice: {
        show: boolean,
        type: Type,
        content: string
    },
     download: {
        thread: number//下载线程数
    },
    setting:{
        pe:{
            bootWaitTime:number//启动选择超时
        }
    }
}

interface disksInfo{
    index:number,//磁盘索引
    name:string,//磁盘名称
    movable:boolean,//是否可移动
    size:string,//总大小
    q:number//一个不知道什么的数组
}

interface partitionInfo{
    diskIndex:number,//磁盘索引
    partitionIndex:number,//分区索引
    letter:string,//盘符
    label:string,//标卷
    size:string,//总大小
    usableSize:string,//可用大小
    fileSystem:string,//文件系统
    type:string,//分区类型
    GPT:boolean,//分区表类型
    active:boolean,//激活
}

export { Config,disksInfo,partitionInfo }