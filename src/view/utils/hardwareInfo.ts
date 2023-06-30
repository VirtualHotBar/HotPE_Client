function getHardwareInfo() {
    var exec = require('child_process').exec;


    let cmd = 'cmd /c .\\ClientTools\\nwinfo\\nwinfo_x64.exe  --disk  --format=json'
    let returnData = {}
    let runOk = false

    exec(cmd, function (error: string, stdout: string, stderr: string) {
        // 获取命令执行的输出
        if (!error) {
            returnData = JSON.parse(stdout)
            runOk = true
            console.log(returnData);    
        } else{
            console.log(error);   
        }        
    });


    console.log(returnData);
}
export {getHardwareInfo};