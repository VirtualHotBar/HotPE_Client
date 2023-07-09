//import {Type} from '@douyinfe/semi-foundation/lib/es/banner/index'

interface Config{
    api: string,
    state:'noDown'|'noSetup'|'ready'|'needUpdate',
    environment: {
        HotPEDrive: {
            new: { isMove: boolean, drive: string },
            all: Array
        }

    },
    resources: {
        pe: {
            new: string,
            all: Array,
            update:UpdateLatest
        },
        client: {
            new: string,
            all: Array,
            update:UpdateLatest
        }
    }, directory: {

    },
    notice:{
        show:boolean,
        type:Type,
        content:string
    }
}

export{Config}