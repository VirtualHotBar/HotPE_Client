import { Notification } from "@douyinfe/semi-ui"
import { config } from "../../services/config"
import { HPM } from "../../type/hpm"
import { takeLeftStr } from "../../utils/utils"
import { runCmdSync } from "../../utils/command"

//通过文件名，和路径获取HPMInfo
export async function getHPMinfoLocal(HPMFilePath: string, HPMFileName: string) {
    try {
        // 使用 dir 命令获取文件信息
        const dirOutput = await runCmdSync(`dir "${HPMFilePath}${HPMFileName}" /Q`);
        
        // 解析文件大小和时间信息
        const lines = dirOutput.split('\n');
        let fileSize = 0;
        let fileTime = new Date();
        
        for (const line of lines) {
            if (line.includes(HPMFileName)) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 4) {
                    // 尝试解析文件大小（通常在第3或第4个位置）
                    for (let i = 0; i < parts.length; i++) {
                        const sizeStr = parts[i]?.replace(/,/g, '') || '';
                        if (!isNaN(Number(sizeStr)) && Number(sizeStr) > 0) {
                            fileSize = Number(sizeStr);
                            break;
                        }
                    }
                    
                    // 尝试解析日期时间
                    if (parts.length >= 2) {
                        try {
                            const dateStr = parts[0] + ' ' + parts[1];
                            fileTime = new Date(dateStr);
                        } catch (e) {
                            fileTime = new Date();
                        }
                    }
                }
                break;
            }
        }

        let hpmInfo = HPMFileName.split('_');
        let HPM: HPM;

        if (hpmInfo.length == 4) {
            HPM = {
                fileName: HPMFileName,
                size: fileSize,
                name: hpmInfo[0] || '',
                maker: hpmInfo[1] || '',
                version: hpmInfo[2] || '',
                description: takeLeftStr(hpmInfo[3] || '', '.'),
                time: fileTime
            }
        } else {
            //格式不规范
            HPM = {
                fileName: HPMFileName,
                size: fileSize,
                name: hpmInfo[0] || '获取失败',
                maker:'获取失败',
                version: '获取失败',
                description: '获取失败',
                time: fileTime
            }
        }

        return HPM;
    } catch (error) {
        console.error('获取HPM文件信息失败:', error);
        // 返回默认信息
        let hpmInfo = HPMFileName.split('_');
        return {
            fileName: HPMFileName,
            size: 0,
            name: hpmInfo[0] || '未知',
            maker: '获取失败',
            version: '获取失败',
            description: '获取失败',
            time: new Date()
        };
    }
}

//检查是否有模块文件夹，可进行模块操作
export function isHPMReady() {
    if (config.environment.HotPEDrive.new.letter != '') {
        return true
    }
    Notification.info({
        title: '未准备就绪！',
        content: '还未安装HotPE或插入HotPEU盘。',
        duration: 5,
    })
    return false
}