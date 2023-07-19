import React, { useState, useReducer, useEffect } from 'react';
import { getHardwareInfo } from '../utils/hardwareInfo';
import { Button, Banner, Progress, Notification, Modal, TreeSelect, Descriptions } from '@douyinfe/semi-ui';
import { Help, DownloadOne, EmotionUnhappy, EmotionHappy, Refresh, UpdateRotation } from '@icon-park/react'
import { config } from '../services/config';
import { dlPERes } from '../controller/dlRes';
import { Aria2Attrib } from '../type/aria2';
import { updateState } from '../controller/init';
import ReactMarkdown from 'react-markdown'
import { UpdateLatest } from '../type/update';
import { updateCilent, updateDoneTip } from '../controller/update';

let HotPEDriveChooseOk = false
let updatePromptOk = false//更新提示

let dlPercent = -1//下载百分百
let dlSpeed = 'OKB/S'//下载速度

//多个pe安装时选择
function HotPEDriveChoose() {
    if (config.environment.HotPEDrive.all.length > 1 && HotPEDriveChooseOk == false) {
        HotPEDriveChooseOk = true

        let driveData = config.environment.HotPEDrive.all.map(function callback(currentValue: any, index: number) {
            return { label: currentValue.letter, value: currentValue.letter, key: index.toString() }
        })

        let modalContent = <>
            <p>请选择要操作的HotPE安装：</p>

            <TreeSelect
                defaultValue={config.environment.HotPEDrive.new.letter}//选择默认的
                style={{ width: '100%' }}
                dropdownStyle={{ overflow: 'auto' }}
                treeData={driveData}
                onSelect={(value: string) => {
                    config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[value]

                    console.log(value, config.environment.HotPEDrive.all[value]);

                }} />
        </>

        Modal.confirm({ title: '检测到安装了多个HotPE', content: modalContent, maskClosable: false, closable: false, hasCancel: false, onOk: () => { updateState(); }, centered: true });
    }
}



export default function Home(props: any) {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新页面

    let welcomeStr = '欢迎使用HotPE客户端！';
    let content = <></>;//页内容

    function setDlPercent(percent: number) {
        dlPercent = percent
        forceUpdate()
    }
    function setDlSpeed(speed: string) {
        dlSpeed = speed
        forceUpdate()
    }


    //下载PE资源，更新\noDown
    function toDlPERes() {
        //锁定菜单
        props.setLockMuen(true)

        dlPERes(setDlPercent, setDlSpeed, (back: Aria2Attrib) => {

            if (back.state == 'done' || back.state == 'error') {

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
    }


    //处理副作用
    useEffect(() => {

        //更新完成后提示
        updateDoneTip()



        //更新处理
        if (updatePromptOk == false && config.state.resUpdate != 'without' && config.state.install != "noDown") {
            updatePromptOk = true

            let updateModalTitle = ''
            let updateData: UpdateLatest = {
                id: '',
                name: '',
                description: '',
                url: '',
                date: ''
            }

            if (config.state.resUpdate == 'needUpdatePE') {
                updateModalTitle = '🎉PE资源有新版本发布，是否更新？'
                updateData = config.resources.pe.update
            } else if (config.state.resUpdate == 'needUpdateClient') {
                updateModalTitle = '🎉客户端有新版本发布，是否更新？'
                updateData = config.resources.client.update
            }

            const updateModalContent = <>
                <Descriptions>
                    <Descriptions.Item itemKey="更新版本">{updateData.name} (id{updateData.id})</Descriptions.Item>
                    <Descriptions.Item itemKey="更新日志"><ReactMarkdown>{updateData.description}</ReactMarkdown></Descriptions.Item>
                    <Descriptions.Item itemKey="发布日期">{updateData.date}</Descriptions.Item>
                </Descriptions>

            </>

            Modal.confirm({
                title: updateModalTitle, content: updateModalContent, centered: true, async onOk() {

                    if (config.state.resUpdate == 'needUpdatePE') {
                        toDlPERes()
                    } else if (config.state.resUpdate == 'needUpdateClient') {
                        //锁定菜单
                        props.setLockMuen(true)
                        updateCilent(setDlPercent, setDlSpeed, (aria2Back: Aria2Attrib, updateStep: string) => {
                            console.log(updateStep);
                            if (aria2Back.state == 'error') {//下载错误

                                setDlPercent(-1)

                                //解锁菜单
                                props.setLockMuen(false)

                                Notification.error({
                                    title: '下载失败',
                                    content: '文件下载失败，请检查网络。',
                                    duration: 3,
                                })

                            }
                        })
                    }


                },
            });
        }


        //多个pe安装时选择
        HotPEDriveChoose()


    })


    //处理状态
    if (config.state.install == "noDown") {
        content = <>
            <div ><span style={{ fontSize: '80px' }}>😶</span>{/* <EmotionUnhappy theme="outline" size="90" fill="#4a90e2" /> */}</div>
            <h3>未检测到HotPE的相关文件,需要下载,以便安装</h3>
            <Button type='primary' style={{ marginRight: 8 }} onClick={toDlPERes}>开始下载</Button>
        </>
    } else if (config.state.install == 'noSetup') {
        content = <>
            <div ><span style={{ fontSize: '80px' }}>🤔</span>{/* <Help theme="outline" size="90" fill="#4a90e2" /> */}</div>
            <h3>现在并未检测到有HotPE的安装,请插入已安装的U盘或开始安装</h3>
            <Button onClick={() => { props.setNavKey('SetupToSys') }} type='primary' style={{ marginRight: 8 }}>安装到系统</Button>
            <Button onClick={() => { props.setNavKey('SetupToUDisk') }} type='primary' style={{ marginRight: 8 }}>安装到U盘</Button>
            <Button onClick={() => { props.setNavKey('MakeISO') }} type='primary' style={{ marginRight: 8 }}>生成ISO镜像</Button>
        </>
    } else if (config.state.install == 'ready') {
        content = <>
            <div ><span style={{ fontSize: '80px' }}>😊</span>{/* <EmotionHappy theme="outline" size="90" fill="#4a90e2" /> */}</div>
            <h3>你的HotPE已准备就绪,你可以进行更改</h3>
            <Button onClick={() => { props.setNavKey('HPMDl') }} type='primary' style={{ marginRight: 8 }}>模块下载</Button>
            <Button onClick={() => { props.setNavKey('HPMMgr') }} type='primary' style={{ marginRight: 8 }}>模块管理</Button>
            <Button onClick={() => { props.setNavKey('Setting') }} type='primary' style={{ marginRight: 8 }}>PE设置</Button>
        </>
    }


    return (
        <div style={{padding: '24px'}}>

            <div style={{ width: '100%' }}>
                {welcomeStr != '' ? <h2>{welcomeStr}</h2> : <></>}
                {config.notice.show ? <Banner description={config.notice.content} type={config.notice.type} onClose={() => { config.notice.show = false }} /> : <></>}
            </div>

            <div style={{ textAlign: "center", marginTop: "100px", display: 'block' }}>
                {dlPercent == -1 ? content : <>
                    <div ><DownloadOne theme="outline" size="90" fill="#4a90e2" /></div>
                    <h3>{dlSpeed}</h3>
                    <Progress style={{ margin: "0px 100px 0px 100px" }} percent={dlPercent} showInfo aria-label="disk usage" size="small" />
                </>}
            </div>

        </div>
    )

};


