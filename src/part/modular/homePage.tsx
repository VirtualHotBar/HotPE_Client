import React from 'react';
import { Button, Alert } from 'antd';
import 'antd/dist/antd.css';
//import { QuestionCircleOutlined } from '@ant-design/icons';
import { QuestionMarkCircleIcon, CheckCircleIcon, FaceFrownIcon, XCircleIcon } from '@heroicons/react/24/outline'

import SetupToSysPage from './setupToSysPage';
import SetupToUDiskPage from './setupToUDiskPage';
import BuildISOFilePage from './buildISOFilePage';
import HpmDownPage from './hpmDownPage';
import HpmManagePage from './hpmManagePage';

//const { ipcRenderer } = require('electron')
//import ipcRenderer from "electron"
const { shell, ipcRenderer } = window.require('electron')

export default function Home(props: any) {
    let noticeStr = '此版为开发预览版，并不代表最终的发布版，遇到Bug或有建议请反馈给开发者';
    let welcomeStr = '欢迎使用HotPE客户端😊！';
    let content = <></>;//首页内容

    if (props.type == "netSetup") {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            <div ><QuestionMarkCircleIcon style={{ height: "100px", width: "100px", color: "#1393DE" }} /></div>
            <h3>现在并未检测到有HotPE的安装,请插入已安装的U盘或开始安装</h3>
            <Button  onClick={()=>{props.setSelectMenu("SetupToSysMenu");props.stePage(<SetupToSysPage />);}}type="primary">安装到系统</Button>
            <Button style={{ marginLeft: "20px", }} onClick={()=>{props.setSelectMenu("SetupToUDiskMenu");props.stePage(<SetupToUDiskPage />);}} type='primary'>安装到U盘</Button>
            <Button style={{ marginLeft: "20px", }} onClick={()=>{props.setSelectMenu("BuildISOFileMenu");props.stePage(<BuildISOFilePage />);}} type='primary'>生成ISO镜像</Button>
        </div>;
    } else if (props.type == "SetOK") {
        content =
            <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
                <div ><CheckCircleIcon style={{ height: "100px", width: "100px", color: "#1393DE" }} /></div>
                <h3>你的HotPE已准备就绪,你可以进行更改</h3>
                <Button onClick={()=>{props.setSelectMenu("HpmDownMenu");props.stePage(<HpmDownPage />);}} type="primary">模块下载</Button>
                <Button style={{ marginLeft: "20px", }} onClick={()=>{props.setSelectMenu("HpmManageMenu");props.stePage(<HpmManagePage />);}} type='primary'>模块管理</Button>
            </div>;
    } else if (props.type == 'noDown') {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            <div ><FaceFrownIcon style={{ height: "100px", width: "100px", color: "#1393DE" }} /></div>
            <h3>未检测到HotPE的相关文件,需要下载,以便安装</h3>
            <Button type="primary">下载</Button>
        </div>;
    }
    else {
        content = <>
            <div style={{ textAlign: "center", width: "100%", marginTop: "100px" }}><XCircleIcon style={{ height: "100px", width: "100px", color: "#EB3941" }} /><h2>安装检测出错!</h2><h3>未检测出HotPE的安装状态或文件下载状态，请向开发者反馈</h3></div>
        </>;
    }
    
    return (
        <>
            <div style={{ margin: "20px" }}>
                {welcomeStr === ''?<></>:<h2>{welcomeStr}</h2>}
                {noticeStr === ''?<></>:<Alert message={noticeStr} type="info" showIcon /> }
            </div>
            {content}
        </>
        )


}



function exithub() {
    ipcRenderer.send('exithub')
};

function windows_mini() {
    ipcRenderer.send('windows:mini')
}

