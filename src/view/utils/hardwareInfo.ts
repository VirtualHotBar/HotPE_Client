import { runCmd } from "./command";



export function getHardwareInfo(parameter: string) {
    return new Promise(function (resolve, reject) {

        let cmd = 'cmd /c .\\ClientTools\\nwinfo\\nwinfo_x64.exe  ' + parameter + ' --format=json'

        let result = ''

        runCmd(cmd, (str: string) => { result = result + str }, (e: number) => {
            resolve(JSON.parse(result))//完成返回
        })

    }
    )
}

