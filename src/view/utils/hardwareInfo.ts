import { roConfig } from "../services/config";
import { runCmd } from "./command";



export function getHardwareInfo(parameter: string) {
    return new Promise(function (resolve, reject) {

        let cmd = 'cmd /c '+roConfig.path.tools+'nwinfo\\nwinfo.exe  ' + parameter + ' --format=json'

        let result = ''

        runCmd(cmd, (str: string) => { result = result + str }, (e: number) => {
            console.log(e);
            if(e == 0){
                resolve(JSON.parse(result))//完成返回
            }else{
                Error(e+' getHardwareInfo error')
            }
            
            
        })

    }
    )
}

