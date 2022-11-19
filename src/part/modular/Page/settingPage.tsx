import React from 'react';
import { Card, Button,Row,Col } from '@douyinfe/semi-ui';

export default function SettingPage() {
    return (

        <>
            <div style={{ width: '100%', height: '100%' }}>
                <Card title='PE设置' style={{ width: '100%', marginBottom: "20px" }} footerLine={true}
                    footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
                    footer={<Button theme='solid' type='primary'>保存更改</Button>}>

                    PE设置

                </Card>

                <Card title='客户端设置' style={{ width: '100%', marginBottom: "20px" }} footerLine={true}
                    footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
                    footer={<Button theme='solid' type='primary'>保存更改</Button>}>

                    客户端设置

                </Card>

                <Row gutter={16}>
                <Col span={13}>
                <Card style={{ maxWidth: 340 }} title='关于 HotPE Client' >
                    <p>由独立开发者 VirtualHotBar 开发并发布</p>
                    <p>版本:0.1.202209</p>
                    <p>技术栈:Electron,React,TypeScript,Semi Design</p>
                    <p>Released under the MIT License.</p>
                    <p>Copyright © 2019-Present VirtualHotBar</p>
                </Card>
                </Col>
                <Col span={11}>
                <Card style={{ maxWidth: 340 }} title='相关链接' >
                    <p><a target="_blank" href="https://www.hotpe.top/">HotPE工具箱</a></p>
                    <p><a target="_blank" href="https://docs.hotpe.top/overview/contract.html">用户协议</a></p>
                    <p><a target="_blank" href="https://docs.hotpe.top/overview/privacy-policy.html">隐私政策</a></p>
                    <p><a target="_blank" href="https://docs.hotpe.top/">HotPE 文档</a></p>
                    <p><a target="_blank" href="https://blog.hotpe.top/">VirtualHotBarの博客</a></p>
                </Card>
                </Col>
                </Row>
            </div>
        </>

    )
}