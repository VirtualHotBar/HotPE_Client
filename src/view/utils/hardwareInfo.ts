import { roConfig } from "../services/config";
import { runCmd, runCmdAsync } from "./command";

export function getHardwareInfo(parameter: string) {
    return new Promise(async function (resolve, reject) {
        let cmd = 'cmd /c '+roConfig.path.tools+'nwinfo\\nwinfo.exe  ' + parameter + ' --format=json'
        resolve(JSON.parse(await runCmdAsync(cmd) as string))//完成返回
/*         let result = ''

        runCmd(cmd, (str: string) => { result = result + str }, (e: number) => {
            
            if(e == 0){
                console.log(result)
                
                resolve(JSON.parse(result))//完成返回
            }else{
                console.log(Error(e+' getHardwareInfo error'));
                reject(e)

            }
            
            
        }) */

    }
    )
}

