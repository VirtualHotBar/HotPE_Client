const child_process = window.require('child_process')

//运行命令行，堵塞程序，返回结果
export function runCmd(cmd: string) {
    return child_process.execSync(cmd).toString();
}

//运行命令行，即时返回
export function RunCmd_(cmd: string, returnstr: Function, end: Function) {
    let result = child_process.spawn('cmd.exe',['/s','/c',cmd]);

    //输出正常情况下的控制台信息
    result.stdout.on("data", function (data: Buffer) { returnstr(data.toString()); }
    );

    //当程序执行完毕后的回调，那个code一般是0
    result.on("exit", function (code: number) {
        end(code);
    })
}