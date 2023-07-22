//日志处理(错误处理)
const { shell, ipcRenderer } = require('electron')

import { Modal } from "@douyinfe/semi-ui";
import { ReactNode } from "react";

window.onerror = async function (msg, url, lineNo, columnNo, error) {
    let string = msg.toString().toLowerCase();
    let substring = "script error";
    if (string.indexOf(substring) > -1) {
        alert('Script Error: See Browser Console for Detail');
    } else {
        let message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        //排除这个错误
        if (message.includes('ResizeObserver loop limit exceeded')) { return }

        let content: ReactNode = +'请尝试重启程序，并记录控制台错误信息向开发者反馈，' + '错误信息：' + message

        ipcRenderer.send('windows:openDevTools')
        //提示错误
        await errorDialog('发生错误！', content)
    }
    return false;
};





//错误对话框
export function errorDialog(title: string, content: ReactNode) {
    return new Promise((resolve, reject) => {
        Modal.error(
            {
                title: title,
                content: content,
                onOk: (e: any) => { resolve(true) },
                onCancel: (e: any) => { resolve(false) },
                centered: true,
                hasCancel: false,
                maskClosable: false,
                closable: false
            }
        )
    })
}