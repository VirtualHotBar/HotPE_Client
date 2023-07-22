import React, { useState } from 'react';
import { roConfig } from '../services/config';
import { Card, Button, Row, Col, Typography } from '@douyinfe/semi-ui';
const { shell, ipcRenderer } = require('electron')

export default function Setting(props: any) {
    const { Text } = Typography;
    return (
        <div style={{ padding: 24 }}>
            <Card title='PE设置' style={{ marginBottom: "20px" }} footerLine={true}
                footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
                footer={<Button type='primary'>保存更改</Button>}>

                PE设置

            </Card>

            <Card title='客户端设置' style={{ width: '100%', marginBottom: "20px" }} footerLine={true}
                footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
                footer={<Button type='primary'>保存更改</Button>}>

                客户端设置

            </Card>

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
                        <p><Text link onClick={() => { props.setNavKey('Docs') }} >HotPE 文档</Text></p>
                        <p><Text link={{ href: 'https://blog.hotpe.top/', target: '_blank' }}>VirtualHotBarの博客</Text></p>

                    </Card>
                </Col>
            </Row>
            <Card style={{ marginBottom: "20px" }} title='工具' >
                <Button onClick={() => { ipcRenderer.send('windows:openDevTools') }}>打开开发工具</Button>
            </Card>

        </div>

    )



};