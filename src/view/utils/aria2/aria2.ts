

const fs = window.require('fs')
const path = window.require('path')
import { runCmd } from "../command"
import { dealStrForCmd, delFiles, takeMidStr, takeRightStr } from '../utils'

import { Aria2Attrib } from "../../type/aria2"
import { roConfig } from "../../services/config"

//接口
interface Aria2 {
    //state: string,//状态
    //speed: string, //速度
    //percentage: number,//百分比

}

const sourceAria2Path = roConfig.path.tools + 'aria2c.exe'

//内部变量
//let aria2Path;



class Aria2 {
    #aria2Path: string = '';
    #FilePath: string = ''

    constructor() {//初始化，new时调用
        //创建aria2文件
        this.#aria2Path = roConfig.environment.temp + '\\aria2c_' + Math.random().toString(36).substring(2,7) + '.exe'//temp目录+aria2c_随机字符.exe

        //复制
        async function copyAria2(toPath: string) {
            await fs.copyFile(sourceAria2Path, toPath, (err: any) => {
                if (err) { Error('aria2:Copying aria2 file failed') } else (console.log('copy')
                )
            })
        }

        copyAria2(this.#aria2Path)
        console.log(this.#aria2Path);
    };

    start(url: string, saveDir: string, saveName: string, thread: number = 8, callback: Function) {//开始下载，回调

        this.#FilePath = saveDir + saveName

        let cmd = dealStrForCmd(this.#aria2Path)
        cmd = cmd + ' ' + dealStrForCmd(url)
        cmd = cmd + ' -d' + dealStrForCmd(saveDir) + ' -o' + dealStrForCmd(saveName)
        cmd = cmd + ' -s' + thread.toString() + ' -x' + thread.toString()
        cmd = cmd + ' --file-allocation=none'//文件预分配方式
        cmd = cmd + ' -c'//断点续传
        cmd = cmd + ' --check-certificate=false'//关闭ssl检查
        cmd = cmd + ' --force-save=false'//不保存下载记录，不创建.aria2文件
        console.log(cmd);



        //返回Aria2属性，初始化
        let tempAria2Attrib: Aria2Attrib = ({
            state: 'request',
            speed: '',//速度
            percentage: 0,//进度百分比
            remainder: '',//剩余时间
            size: '',//总大小
            newSize: '',//已下载大小
            message: '',//当前的Aria2返回

        })

        runCmd(cmd, (print: string) => {
            tempAria2Attrib.message = print

            //标准返回
            console.log(print);
            if (print.indexOf('DL:') != -1  && print.indexOf('ETA') != -1 ) {//正在下载，[#46fea8 210MiB/583MiB(36%) CN:4 DL:10MiB ETA:35s]
                tempAria2Attrib.state = 'doing';

                //速度speed,str.substring(str.indexOf("DL:") + 3, str.indexOf("iB ETA")) + 'B/S'
                tempAria2Attrib.speed = takeMidStr(print, 'DL:', 'iB ETA') + 'B/s'

                //进度百分比,Number(str.substring(str.indexOf("B(") + 2, str.indexOf("%)"))))
                tempAria2Attrib.percentage = Number(takeMidStr(print, 'B(', '%)'))

                //剩余时间 remainder
                tempAria2Attrib.remainder = takeMidStr(print, 'ETA:', ']')

                //总大小,size
                tempAria2Attrib.size = takeMidStr(print, '/', 'iB(') + 'B'

                //已下载大小,newSize
                tempAria2Attrib.newSize = takeRightStr(takeMidStr(print, '[#', 'iB/'), ' ') + 'B'



            } else {
                //正在请求， if (print.indexOf('[NOTICE]') != -1)
                tempAria2Attrib.state = 'request'
            }

            callback(tempAria2Attrib)
        }, (e: number) => {
            //结束返回
            if (e == 0) {//0:成功
                tempAria2Attrib.state = 'done'
                console.log('成功', e);
            } else {
                tempAria2Attrib.state = 'error'
                console.log('失败', e);
            }
            callback(tempAria2Attrib)
        }

        )

    }
    stop(callback: Function) {//停止下载 ,回调函数:返回是否停止成功
        let cmd = 'taskkill /T /F /IM ' + dealStrForCmd(path.basename(this.#aria2Path))

        runCmd(cmd, (print: string) => {
            console.log(print);
        }, async (e: number) => {

            //结束返回
            //删除下载的文件
            await delFiles(this.#FilePath + '.aria2')
            callback(await delFiles(this.#FilePath))



            /* if (e == 0) {//0:成功
                callback(true)
                console.log('成功', e);
            } else {
                callback(false)
                console.log('失败', e);
            } */


        })


    };

}

//let site = new Aria2(".\\ClientTools\\aria2c.exe");
export { Aria2 }