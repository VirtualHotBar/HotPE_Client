//import {Type} from '@douyinfe/semi-foundation/lib/es/banner/index'
import { UpdateLatest } from "./update"

interface Config {
    api:{
        api: string,
        ghapi:string,
        dl:string
    },
    state: {
        install: 'noDown' | 'noSetup' | 'ready',
        update: 'without' | 'needUpdatePE' | 'needUpdateClient'
    },
    environment: {
        HotPEDrive: {
            new: { drive: string, isMove: boolean, version: string },
            all: Array
        },
        ware: {
            disks: Array
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
    }, download: {
        thread: number//下载线程数

    }
}

export { Config }