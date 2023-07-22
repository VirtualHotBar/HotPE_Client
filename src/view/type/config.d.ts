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
            disks:Array<disksInfo>
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
    index:number,
    name:string,
    type:string,
    removable:boolean,
    size:number,
    partitions:Array<partitionInfo>
}

interface partitionInfo{
    index:number,
    letter:string
}

export { Config,disksInfo,partitionInfo }