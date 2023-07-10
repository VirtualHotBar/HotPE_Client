import React, { useState, useReducer } from 'react';
import { getHardwareInfo } from '../utils/hardwareInfo';
import { Button, Banner, Progress, Notification, Modal, TreeSelect } from '@douyinfe/semi-ui';
import { Help, DownloadOne, EmotionUnhappy, EmotionHappy } from '@icon-park/react'
import { config } from '../services/config';
import { dlPERes } from '../controller/dlRes';
import { Aria2Attrib } from '../type/aria2';
import { updateState } from '../controller/init';




let HotPEDriveChooseOk = false



export default function Home(props: any) {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新页面

    const [dlPercent, setHotPEDownPercent] = useState(-1)//下载百分百
    const [dlSpeed, setHotPEDownSpeed] = useState("OKB/S")//下载速度

    let welcomeStr = '欢迎使用HotPE客户端😊！';
    let content = <></>;//页内容








    //多个pe安装时选择
    if (config.environment.HotPEDrive.all.length > 1 && HotPEDriveChooseOk == false ) {
        HotPEDriveChooseOk = true

        let driveData = config.environment.HotPEDrive.all.map(function callback(currentValue: any, index: number) {
            return { label: currentValue.drive, value: currentValue.drive, key: index }
        })

        let modalContent = <>
            <p>请选择要操作的HotPE安装：</p>

            <TreeSelect
                defaultValue={config.environment.HotPEDrive.new.drive}//选择默认的
                style={{ width: '100%' }}
                dropdownStyle={{ overflow: 'auto' }}
                treeData={driveData}
                onSelect={(value: string) => {
                    config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[value]

                    console.log(value, config.environment.HotPEDrive.all[value]);

                }} />
        </>

        Modal.confirm({ title: '检测到安装了多个HotPE', content: modalContent, maskClosable: false, closable: false, hasCancel: false, onOk: () => { updateState(); } });
    }




    if (config.state.install == "noDown") {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            {dlPercent === -1 ? <>
                <div ><EmotionUnhappy theme="outline" size="90" fill="#4a90e2" /></div>
                <h3>未检测到HotPE的相关文件,需要下载,以便安装</h3>
                <Button type='primary' style={{ marginRight: 8 }} onClick={() => {
                    //锁定菜单
                    props.setLockMuen(true)

                    dlPERes((back: Aria2Attrib) => {
                        setHotPEDownPercent(back.percentage)
                        setHotPEDownSpeed(back.speed)
                        if (back.state == 'done' || back.state == 'error') {
                            setHotPEDownPercent(-1)
                            forceUpdate()//刷新页面

                            if (back.state == 'done') {
                                Notification.success({
                                    title: '下载完成',
                                    content: '文件下载完成可以继续操作。',
                                    duration: 3,
                                })
                            } else if (back.state == 'error') {
                                Notification.error({
                                    title: '下载失败',
                                    content: '文件下载失败，请检查网络。',
                                    duration: 3,
                                })
                            }

                            //解锁菜单
                            props.setLockMuen(false)
                        }

                    })
                }}>开始下载</Button></>
                : <><div ><DownloadOne theme="outline" size="90" fill="#4a90e2" /></div>
                    <h3>{dlSpeed}</h3>
                    <Progress style={{ margin: "0px 100px 0px 100px" }} percent={dlPercent} showInfo aria-label="disk usage" size="small" />
                </>
            }
        </div>
    } else if (config.state.install == 'noSetup') {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            <div ><Help theme="outline" size="90" fill="#4a90e2" /></div>
            <h3>现在并未检测到有HotPE的安装,请插入已安装的U盘或开始安装</h3>
            <Button onClick={() => { props.setNavKey('SetupToSys') }} type='primary' style={{ marginRight: 8 }}>安装到系统</Button>
            <Button onClick={() => { props.setNavKey('SetupToUDisk') }} type='primary' style={{ marginRight: 8 }}>安装到U盘</Button>
            <Button onClick={() => { props.setNavKey('MakeISO') }} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
        </div>
    } else if (config.state.install == 'ready') {
        content = <div style={{ textAlign: "center", width: "100%", marginTop: "100px", display: 'block' }}>
            <div ><EmotionHappy theme="outline" size="90" fill="#4a90e2" /></div>
            <h3>你的HotPE已准备就绪,你可以进行更改</h3>
            <Button onClick={() => { props.setNavKey('HPMDl') }} type='primary' style={{ marginRight: 8 }}>模块下载</Button>
            <Button onClick={() => { props.setNavKey('HPMMgr') }} type='primary' style={{ marginRight: 8 }}>模块管理</Button>
            <Button onClick={() => { props.setNavKey('Setting') }} type='primary' style={{ marginRight: 8 }}>PE设置</Button>
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


