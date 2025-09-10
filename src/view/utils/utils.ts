import { safeFS } from "./safeAPI";
import ini from 'ini'
import { roConfig } from "../services/config";
import { runCmd, runCmdAsync } from "./command";

//解析JOSN文件
export async function parseJosnFile(path: string) {
    const content = await safeFS.readFileSync(path, 'utf8');
    return JSON.parse(content);
}

//写入JOSN文件
export async function writeJosnFile(path: string, jsonData: object) {
    return await safeFS.writeFileSync(path, JSON.stringify(jsonData), 'utf8');
}

//string是否为json格式
export function isJSON(str: string) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }

        } catch (e) {
            console.log('error：' + str + '!!!' + e);
            return false;
        }
    }
    return false;
}

//读取Hotpe配置
export async function readHotPEConfig(drive: string) {
    const content = await safeFS.readFileSync(drive.substring(0,1)  + ":\\HotPE\\confi.ini");
    return ini.parse(content);
}

//保存Hotpe配置
export async function writeHotPEConfig(drive: string, obj: object) {
    return await safeFS.writeFileSync(drive.substring(0,1)  + ":\\HotPE\\confi.ini", ini.encode(obj));
}

//读取Hotpe设置
export async function readHotPESetting(drive: string) {
    const content = await safeFS.readFileSync(drive.substring(0,1)  + ":\\HotPE\\confi.ini");
    return ini.parse(content);
}

//读取Hotpe设置
export async function writeHotPESetting(drive: string, obj: object) {
    return await safeFS.writeFileSync(drive.substring(0,1)  + ":\\HotPE\\confi.ini", ini.encode(obj));
}

//解压文件7Z
export function unZipFile(filePath: string, outDir: string) {
    return new Promise<boolean>((resolve, _reject) => {
        let cmd = roConfig.path.tools + '.\\7z\\7z.exe x -y ' + dealStrForCmd('-o' + outDir) + ' ' + dealStrForCmd(filePath)

        runCmd(cmd, (back: string) => {
            console.log(back);
        }, (end: number) => {
            if (end == 0) {
                resolve(true);
            } else {
                console.error(Error('Command execution failed:' + cmd))
                resolve(false);
                //reject(false)
            }
        })
    })
}

//判断是否为HotPE盘
export async function isHotPEDrive(drive: string) {
    const configExists = await safeFS.existsSync(drive.substring(0,1) + ':\\HotPE\\confi.ini');
    const moduleExists = await safeFS.existsSync(drive.substring(0,1) + ':\\HotPEModule\\');
    return configExists && moduleExists;
}

//判断文件是否存在
export async function isFileExisted(path_way: string) {
    return await safeFS.access(path_way);
};

//取对象成员数
export function objectCount(o: object) {
    let n = 0;
    for (let _i in o) {
        n++;
    }
    return n;
}

// ||逻辑或，&&逻辑且
//处理命令行参数：含 空或&或, 字符串加引号
export function dealStrForCmd(str: string) {
    let returnStr = ''
    if (str.includes(' ') || str.includes('&') || str.includes(',')) {
        returnStr = '\"' + str + '\"'
    } else {
        returnStr = str
    }
    return returnStr
}

//取字符串中间
export function takeMidStr(str: string, leftStr: string, rightStr: string) {
    return str.substring(str.indexOf(leftStr) + leftStr.length, str.indexOf(rightStr))
}

//取字符串左边
export function takeLeftStr(str: string, taggedStr: string) {
    return str.substring(0, str.indexOf(taggedStr))
}

//取字符串右边
export function takeRightStr(str: string, taggedStr: string) {
    return str.substring(str.indexOf(taggedStr) + taggedStr.length, str.length)
}

//删除数组中的空值
export function filterArrayNull(arr: Array<string>) {
    return arr.filter((s) => { return s && s.trim() }).reverse()
}

//遍历文件,通过dir命令行
export async function traverseFiles(path: string) {
    //if (!await isFileExisted(path)) {return [] }
    let returnStr = await runCmdAsync('dir ' + dealStrForCmd(path) + ' /b') as string
    return filterArrayNull(returnStr.split("\r\n"))
}

//复制文件
export async function copyFile(path: string, toPath: string) {
    return new Promise<boolean>((resolve, _reject) => {
        if (path != toPath) {
            safeFS.cp(path, toPath).then(
                () => resolve(true),
                (error) => {
                    console.error(error);
                    resolve(false);
                }
            );
        } else {
            resolve(true)
        }
    })
}

//复制目录
export async function copyDir(path: string, toPath: string) {
    return new Promise<boolean>((resolve, _reject) => {
        // 复制目录
        safeFS.cp(path, toPath, { recursive: true }).then(
            () => resolve(true),
            (error) => {
                console.error(error);
                resolve(false);
            }
        );
    })
}

export async function delFiles(path: string) {
    return new Promise<boolean>((resolve, _reject) => {
        let cmd = 'del ' + dealStrForCmd(path) + ' /F /S /Q'

        runCmd(cmd, (back: string) => {
            console.log(back);
        }, (end: number) => {
            if (end == 0) {
                resolve(true);
            } else {
                console.error(Error('Command execution failed:' + cmd));
                resolve(false);
                //reject(false)
            }
        })
    })
}

export async function delDir(path: string) {
    return new Promise<boolean>((resolve, _reject) => {
        let cmd = 'rd ' + dealStrForCmd(path) + ' /S /Q'

        runCmd(cmd, (back: string) => {
            console.log(back);
        }, (end: number) => {
            if (end == 0) {
                resolve(true);
            } else {
                console.error(Error('Command execution failed:' + cmd))
                resolve(false);
                //reject(false)
            }
        })
    })
}

export async function moveFiles(path: string, toPath: string) {
    return new Promise<boolean>((resolve, _reject) => {
        let cmd = 'move /Y ' + dealStrForCmd(path) + ' ' + dealStrForCmd(toPath)
        runCmd(cmd, (back: string) => {
            console.log(back);
        }, (end: number) => {
            if (end == 0) {
                resolve(true);
            } else {
                console.error(Error('Command execution failed:' + cmd))
                resolve(false);
                //reject(false)
            }
        })
    })
}

export async function makeDir(path: string) {
    return new Promise<boolean>((resolve, _reject) => {
        safeFS.existsSync(path).then(exists => {
            if (exists) {
                resolve(true);
            } else {
                safeFS.mkdirSync(path, { recursive: true }).then(
                    () => resolve(true),
                    (error) => {
                        console.error(error);
                        resolve(false);
                    }
                );
            }
        });
    })
}

//文件重命名
export async function reNameFile(filePath: string, newFilePath: string) {
    try {
        await safeFS.rename(filePath, newFilePath);
        return true;
    } catch (error) {
        console.error('重命名失败:', error);
        return false;
    }
}

//  格式化文件大小
export function formatSize(v: number) {
    let UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'ZB'];
    let prev = 0, i = 0;
    while (Math.floor(v) > 0 && i < UNITS.length) {
        prev = v;
        v /= 1024;
        i += 1;
    }

    if (i > 0 && i < UNITS.length) {
        v = prev;
        i -= 1;
    }
    return Math.round(v * 100) / 100 + ' ' + UNITS[i];
}