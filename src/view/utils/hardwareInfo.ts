import { runCmd } from "./Command";

export function getHardwareInfo(parameter:string) {
    let cmd = 'cmd /c .\\ClientTools\\nwinfo\\nwinfo_x64.exe  ' + parameter + ' --format=json'
    return JSON.parse(runCmd(cmd));
}

