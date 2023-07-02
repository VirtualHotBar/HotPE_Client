const fs = window.require('fs')

//解析JOSN文件
export function parseJosnFile(path: string) {
    return (JSON.parse(fs.readFileSync(path, 'utf8')))
}

//写入JOSN文件
export function writeJosnFile(path: string, jsonData: string) {
    return (fs.writeFileSync(path, JSON.stringify(jsonData), 'utf8'))
}

//取对象成员数
export function objectCount(o: object) {
    let n = 0;
    for (var i in o) {
        n++;
    }
    return n;
}
