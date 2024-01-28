import React, { useReducer, useState } from 'react';
import { config, roConfig } from '../services/config';
import { Card, Button, Row, Col, Typography, TreeSelect, InputNumber, Input, Space, Divider, Image, CardGroup, Collapse, Modal, Checkbox, Switch } from '@douyinfe/semi-ui';
import { checkPESetting, saveClientSetting, savePESetting } from '../controller/setting/setting';
import { setting } from '../services/setting';
import { checkHPMFiles } from '../controller/hpm/checkHpmFiles';
import { updateState } from '../controller/init';
import { AppTest } from '../controller/test';
const { shell, ipcRenderer } = require('electron')

const { Text, Paragraph, Title } = Typography;









export default function Setting(props: any) {

    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新页面

    const [wallpaper, setWallpaper] = useState(setting.pe.wallpaper)

    console.log(setting.pe.wallpaper);


    const cardStyle = {

        border: '1px solid var(--semi-color-border)',
        backgroundColor: 'var(--semi-color-bg-0)',
        borderRadius: '3px',
        paddingLeft: '20px',
        margin: '8px 2px',
        padding: '8px'

    };

    return (
        <div style={{ padding: 0 }}>

            <Collapse defaultActiveKey={['pe', 'client', 'about']}>
                <Collapse.Panel header="PE设置" itemKey="pe">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>

                            <div style={cardStyle}>
                                <div style={{ width: '100%', textAlign: 'center', height: '30px' }}>
                                    <Text style={{ fontWeight: 'bold' }}>壁纸</Text>
                                </div>
                                <div style={{ height: '140px', textAlign: 'center', overflow: 'hidden' }}>
                                    {wallpaper == '' ? <Text>未自定义，请选择</Text> : <Image height={'100%'} src={"file://" + wallpaper}/>}
                                </div>
                                <div style={{ textAlign: 'right', width: '100%' }}>
                                    <Button style={{ marginTop: '10px' }} onClick={() => {
                                        const wallTemp: Array<string> = ipcRenderer.sendSync('file:getOpenPath', '')
                                        if (wallTemp != null && wallTemp != undefined) {
                                            if (wallTemp.length > 0) {
                                                setting.pe.wallpaper = wallTemp[0]
                                                setWallpaper(setting.pe.wallpaper)
                                            }
                                        }
                                    }}>选择</Button>
                                </div>
                            </div>

                        </Col>
                        <Col span={12}>
                            <div style={cardStyle} >
                                <div style={{ height: '212px' }}>
                                    <div style={{ width: '100%', textAlign: 'center', height: '30px' }}>
                                        <Text style={{ fontWeight: 'bold' }}>其他</Text>
                                    </div>
                                    {config.environment.HotPEDrive.new.isMove == false ? <>启动选择等待时间(秒)：<InputNumber onChange={(a) => { setting.pe.bootWaitTime = Number(a) }} min={3} max={600} defaultValue={config.setting.pe.bootWaitTime} style={{ width: 100 }} /></> : <></>}
                                    <br /><br />
                                </div>


                            </div>
                        </Col>
                    </Row>

                    <br />
                    <div style={{ textAlign: 'right', width: '100%' }}>
                        <Button type='primary' onClick={() => { savePESetting() }}>保存更改</Button>
                        <br /><br />
                    </div>

                </Collapse.Panel>


                <Collapse.Panel header="客户端设置" itemKey="client">
                    下载最大线程数：<TreeSelect defaultValue={config.download.thread} onSelect={(value) => { setting.client.dlThread = Number(value) }} style={{ width: 100 }} treeData={[{ label: '16', value: '16', key: '16', }, { label: '32', value: '32', key: '32', }, { label: '64', value: '64', key: '64', }, { label: '128', value: '128', key: '128', }]} />

                    <br /><br />
                    当前操作的HotPE安装{config.environment.HotPEDrive.all.length > 1 ? <Text onClick={()=>{HotPEDriveChoose(()=>{forceUpdate()})}} link>(选择)</Text> : <></>}：{config.environment.HotPEDrive.new.letter}

                    <div style={{ textAlign: 'right', width: '100%' }}>
                        <Button type='primary' onClick={() => { saveClientSetting() }}>保存更改</Button>
                        <br /><br />
                    </div>
                </Collapse.Panel>


                <Collapse.Panel header="关于" itemKey="about">
                    <Row gutter={16} style={{ width: '100%', marginBottom: "20px" }}>
                        <Col span={13}>
                            <Card title='关于 HotPE Client' >
                                <p>由独立开发者 VirtualHotBar 开发并发布</p>
                                <p>技术栈:Electron,TypeScript,Vite,React,Semi Design</p>
                                <p>客户端版本:{roConfig.clientVer} (id{roConfig.id})</p>
                                <p>Copyright © 2019-Present VirtualHotBar</p>
                            </Card>
                        </Col>
                        <Col span={11}>
                            <Card title='相关链接' >


                                <p><Text link={{ href: 'https://www.hotpe.top/', target: '_blank' }}>HotPE工具箱</Text></p>
                                <p><Text link={{ href: 'https://docs.hotpe.top/overview/contract.html', target: '_blank' }}>用户协议</Text></p>
                                <p><Text link onClick={() => { props.upNavKey('Docs') }} >HotPE 文档</Text></p>
                                <p><Text link={{ href: 'https://blog.hotpe.top/', target: '_blank' }}>VirtualHotBarの博客</Text></p>

                            </Card>
                        </Col>
                    </Row>
                    <Card style={{ marginBottom: "20px" }} title='工具' >
                        <Button onClick={() => { ipcRenderer.send('windows:openDevTools') }}>打开开发工具</Button>
                        <Button style={{marginLeft:'8px'}} onClick={() => {  AppTest() }}>测试</Button>
                    </Card>
                </Collapse.Panel>
            </Collapse>
        </div>
    )
};




















//let HotPEDriveChooseOk = false

//多个pe安装时选择
export function HotPEDriveChoose(callback:Function) {
    //config.environment.HotPEDrive.all = Array.from(new Set(config.environment.HotPEDrive.all))//去重
    //console.log(config.environment.HotPEDrive.all);

    if (config.environment.HotPEDrive.all.length > 1/*  && HotPEDriveChooseOk == false */) {
        /* HotPEDriveChooseOk = true */

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
                onSelect={async (value: string) => {
                    config.environment.HotPEDrive.new = config.environment.HotPEDrive.all[value]

                    //获取本地HPM列表,刷新一下
                    await checkHPMFiles()

                    //获取设置
                    await checkPESetting()

                    console.log(value, config.environment.HotPEDrive.all[value]);

                }} />
        </>

        Modal.confirm({ title: '检测到安装了多个HotPE', content: modalContent, maskClosable: false, closable: false, hasCancel: false, onOk: () => { updateState(); callback()}, centered: true });
    }
}