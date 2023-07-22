interface Setting{
    pe:{
        bootWaitTime:number,//启动项选择等待时间
        wallpaper:string,//pe壁纸
    },
    client:{
        dlThread:number,//下载最大线程
    }
}

export {Setting}