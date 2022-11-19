const child_process = window.require('child_process')
const fs = window.require('fs')
const wincmd = '.\\resources\\tools\\wincmdxp.exe';

//环境变量
//process.env.ComSpec：'C:\\Windows\\system32\\cmd.exe'

//运行命令行，堵塞程序，返回结果
export function RunCmd(cmd: string) {
    console.log("wincmd",cmd)
    return child_process.execSync('.\\resources\\tools\\wincmd.exe '+ cmd ).toString();
}

export function RunCmd_(cmd: string, returnstr: Function, end: Function) {
    console.log("wincmdxp",cmd)
    var result = child_process.spawn(wincmd, [' /c '+cmd]);

    //输出正常情况下的控制台信息
    result.stdout.on("data", function (data: Buffer) { returnstr(data.toString()); }
    );

    //当程序执行完毕后的回调，那个code一般是0
    result.on("exit", function (code: number) {
        end(code);
    })
}

//解析JOSN文件
export function ParseJosnFile(path: string) {
    return (JSON.parse(fs.readFileSync(path, 'utf8')))
}

//写入JOSN文件
export function WriteJosnFile(path: string, jsonData: string) {
    return (fs.writeFileSync(path, JSON.stringify(jsonData), 'utf8'))
}

//取对象成员数
export function ObjectCount(o: object) {
    var n = 0;
    for (var i in o) {
        n++;
    }
    return n;
}
