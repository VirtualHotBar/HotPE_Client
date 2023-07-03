import React, { useState } from 'react';
import { getHardwareInfo } from '../utils/hardwareInfo';
import { SysLetter } from '../utils/sysEnv';
import { Button, Banner } from '@douyinfe/semi-ui';
import {Help} from '@icon-park/react'


export default function Home(props: any) {
    let welcomeStr = '欢迎使用HotPE客户端😊！';
    let noticeStr = '此版为开发预览版，并不代表最终的发布版，遇到Bug或有建议请反馈给开发者';
    let content = <></>;//页内容


    content= <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
    <div ><Help theme="outline" size="90" fill="#4a90e2" /></div>
    <h3>现在并未检测到有HotPE的安装,请插入已安装的U盘或开始安装</h3>
    <Button onClick={()=>{props.setNavKey('SetupToSys')}} type='primary' style={{ marginRight: 8 }}>安装到系统</Button>
    <Button onClick={()=>{props.setNavKey('SetupToUDisk')}} type='primary' style={{ marginRight: 8 }}>安装到U盘</Button>
    <Button onClick={()=>{props.setNavKey('MakeISO')}} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
</div>

    return (
        <>
            <div style={{ width: '100%' }}>
                {welcomeStr === '' ? <></> : <h2>{welcomeStr}</h2>}
                {noticeStr === '' ? <></> : <Banner description={noticeStr} type="info" />}
            </div>

            <div>
             {content}
            </div>

        </>
    )



};


