
//运行命令行，堵塞程序，返回结果
export function runCmd(cmd: string) {
    const child_process = window.require('child_process')
    return child_process.execSync(cmd).toString();
}


export function getHardwareInfo() {
    var exec = require('child_process').exec;
    let cmd = 'cmd /c .\\ClientTools\\nwinfo\\nwinfo_x64.exe  --disk  --format=json'

    return JSON.parse(runCmd(cmd));
}

