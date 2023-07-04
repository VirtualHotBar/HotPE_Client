const fs = window.require('fs')

//解析JOSN文件
export function parseJosnFile(path: string) {
    return (JSON.parse(fs.readFileSync(path, 'utf8')))
}

//写入JOSN文件
export function writeJosnFile(path: string, jsonData: object) {
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

// ||逻辑或
//含 空或& 字符串加引号
export function dealStrForCmd(str: string) {
    let returnStr = ''
    if (str.indexOf(' ') != -1 || str.indexOf('&') != -1) {
        returnStr = '\"' + str + '\"'
    } else {
        returnStr = str
    }
    return returnStr
}

//取字符串中间
export function takeMidStr(str:string,leftStr:string,rightStr:string){
    return str.substring(str.indexOf(leftStr) + leftStr.length, str.indexOf(rightStr))
}

//取字符串左边
export function takeLeftStr(str:string,taggedStr:string){
    return str.substring(0, str.indexOf(taggedStr))
}

//取字符串右边
export function takeRightStr(str:string,taggedStr:string){
    return str.substring(str.indexOf(taggedStr) + taggedStr.length, str.length)
}