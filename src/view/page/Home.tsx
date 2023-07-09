import React, { useState } from 'react';
import { getHardwareInfo } from '../utils/hardwareInfo';
import { SysLetter } from '../utils/sysEnv';
import { Button, Banner, Progress } from '@douyinfe/semi-ui';
import { Help, DownloadOne, EmotionUnhappy } from '@icon-park/react'
import { config } from '../services/config';

export default function Home(props: any) {
    const [dlPercent, setHotPEDownPercent] = useState(-1)//下载百分百
    const [dlSpeed, setHotPEDownSpeed] = useState("OKB/S")//下载速度

    let welcomeStr = '欢迎使用HotPE客户端😊！';
    let content = <></>;//页内容

    if (config.state == "noDown") {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            {dlPercent === -1 ? <>
                <div ><EmotionUnhappy theme="outline" size="90" fill="#4a90e2" /></div>
                <h3>未检测到HotPE的相关文件,需要下载,以便安装</h3>
                <Button type='primary' style={{ marginRight: 8 }} onClick={() => { }}>开始下载</Button></>
                : <><div ><DownloadOne theme="outline" size="90" fill="#4a90e2" /></div>
                    <h3>{dlSpeed}</h3>
                    <Progress style={{ margin: "0px 100px 0px 100px" }} percent={dlPercent} showInfo aria-label="disk usage" size="small" />
                </>
            }
        </div>
    } else if (config.state == 'noSetup') {

        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            <div ><Help theme="outline" size="90" fill="#4a90e2" /></div>
            <h3>现在并未检测到有HotPE的安装,请插入已安装的U盘或开始安装</h3>
            <Button onClick={() => { props.setNavKey('SetupToSys') }} type='primary' style={{ marginRight: 8 }}>安装到系统</Button>
            <Button onClick={() => { props.setNavKey('SetupToUDisk') }} type='primary' style={{ marginRight: 8 }}>安装到U盘</Button>
            <Button onClick={() => { props.setNavKey('MakeISO') }} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
        </div>
    }


    return (
        <>
            <div style={{ width: '100%' }}>
                {welcomeStr != '' ? <h2>{welcomeStr}</h2> : <></>}
                {config.notice.show ? <Banner description={config.notice.content} type={config.notice.type} onClose={() => { config.notice.show = false }} /> : <></>}
            </div>

            <div>
                {content}
            </div>

        </>
    )



};


