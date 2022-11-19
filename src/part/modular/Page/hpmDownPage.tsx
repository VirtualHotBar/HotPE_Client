import React from 'react';
import { List, Descriptions, Nav, Button, ButtonGroup } from '@douyinfe/semi-ui';

export default function HpmDownPage() {
    const data = [
        {
            title: 'WPS精简版',
            author: 'VirtualHotBar',
            version: '10.1.0.6135',
            size: '100MB',
            describe: '简化的WPS办公软件',
            downLink: 'https://down.hotpe.top/HotPE模块/推荐/迅雷_LuRee_1.0_上msdn网站下载系统的软件.HPM',
        },
        {
            title: '天翼云盘',
            author: 'VirtualHotBar',
            version: '6.3.9.1',
            size: '110MB',
            describe: '提供安全、稳定、可靠的文件同步、备份及分享等服务的网络云存储平台',
            downLink: 'https://down.hotpe.top/HotPE模块/推荐/迅雷_LuRee_1.0_上msdn网站下载系统的软件.HPM',
        },
    ];


    return (





        <div style={{ height: "100%", width: "100%",  display: 'flex' }}>


            <div style={{ height: "100%", width: "130px",margin:"0px 0px 0px 0px"}}>


                <Nav style={{ height: "100%", width: "130px" }}>
                    <Nav.Item itemKey={'union'} text={'???'} />
                    <Nav.Item itemKey={'uni1on'} text={'???'} />
                    <Nav.Item itemKey={'unio1n'} text={'???'} />
                    <Nav.Item itemKey={'u1nion'} text={'???'} />


                </Nav>




            </div>





            <div style={{width: "100%",marginLeft:"10px"}}>
                <List

                    dataSource={data}
                    renderItem={item => (
                        <List.Item style={{
                            border: '1px solid var(--semi-color-border)',
                            backgroundColor: 'var(--semi-color-bg-2)',
                            borderRadius: '3px',
                            paddingLeft: '10px',
                            margin: '8px 0px',
                        }}>
                            <div style={{ display: 'flex', width: "100%" }}>
                                <div style={{ width: "100%" }}>
                                    <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 600 }}>{item.title}</a>
                                    <a style={{ color: 'var(--semi-color-text-1)', marginLeft: "10px" }}>{item.version} | {item.author} | {item.size}</a>
                                    <br />
                                    <a style={{ color: 'var(--semi-color-text-0)' }}>{item.describe}</a>
                                    <br />

                                </div>

                                <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'flex-end', width: "55px" }}>
                                    <Button style={{ marginLeft: "10px" }}>下载</Button>

                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>

        </div>



    );

}