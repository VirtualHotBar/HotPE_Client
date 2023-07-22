const child_process = window.require('child_process')

//运行命令行，堵塞程序，返回结果,同步。用于执行非常快的命令，不然会导致程序卡顿
export function runCmdSync(cmd: string) {
    return new TextDecoder('gbk').decode(child_process.execSync(cmd));
}

//运行命令行，即时返回
export function runCmd(cmd: string, returnstr: Function, end: Function) {
    const result = child_process.spawn('cmd.exe', ['/c', cmd]);
    //输出正常情况下的控制台信息
    result.stdout.on("data", function (data: Buffer) { returnstr(new TextDecoder('gbk').decode(data)); });
    //当程序执行完毕后的回调，那个code一般是0
    result.on("exit", function (code: number) {
        console.info(code + ' Command:' + cmd)
        /* if (code != 0) {
            console.info(code + ' Command:' + cmd)
        } */
        end(code);
    })
}

//运行命令行，完成返回,异步
export function runCmdAsync(cmd: string) {
    return new Promise(function (resolve, reject) {
        let returnStr: string = ''
        runCmd(cmd, (back: string) => {
            returnStr = returnStr + back
        }, (code: number) => {
            resolve(returnStr)//完成返回
        })
    })
}