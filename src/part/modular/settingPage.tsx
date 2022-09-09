import React from 'react';
import { Card, Col, Row,Button } from 'antd';

import 'antd/dist/antd.css';

export default function SettingPage() {
    return (
        <>
            <div style={{ width: '100%', height: '100%', overflow: "auto" }}>
                <div style={{ margin: "25px" }}>


                    <Card title="PE设置" extra={<><Button type='primary'>保存</Button></>} style={{ width: '100%' }}>
                        <p>还没有</p>

                    </Card>
                    <br />
                    <Card title="客户端设置" extra={<><Button type='primary'>保存</Button></>} style={{ width: '100%' }}>
                        <p>还没有</p>

                    </Card>
                    <br />

                    <div className="site-card-wrapper">
                        <Row gutter={16}>
                            <Col >
                                <Card title="关于 HotPE Client" >
                                    <p>由独立开发者 VirtualHotBar 开发并发布</p>
                                    <p>版本 0.1.20220904</p>
                                    <p>技术栈：Electron,React,TypeScript,Ant Design</p>
                                    <p>Released under the MIT License.</p>
                                    <p>Copyright © 2019-Present VirtualHotBar</p>
                                </Card>
                            </Col>
                            <Col >
                                <Card title="相关链接" >
                                    <p><a target="_blank" href="https://www.hotpe.top/">HotPE工具箱</a></p>
                                    <p><a target="_blank" href="https://docs.hotpe.top/overview/contract.html">用户协议</a></p>
                                    <p><a target="_blank" href="https://docs.hotpe.top/overview/privacy-policy.html">隐私政策</a></p>
                                    <p><a target="_blank" href="https://docs.hotpe.top/">HotPE 文档</a></p>
                                    <p><a target="_blank" href="https://blog.hotpe.top/">VirtualHotBarの博客</a></p>

                                </Card>
                            </Col>

                        </Row>
                    </div>

                </div>
            </div>
        </>
    )
}