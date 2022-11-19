import React from 'react';
import { List, Descriptions, Rating, Button, ButtonGroup } from '@douyinfe/semi-ui';

export default function HpmManagePage() {
    const data = [
        {
            title: 'WPS精简版',
            author: 'VirtualHotBar',
            version: '10.1.0.6135',
            size: '100MB',
            fileName: '迅雷_LuRee_1.0_上msdn网站下载系统的软件.HPM',
        },
        {
            title: '天翼云盘',
            author: 'VirtualHotBar',
            version: '6.3.9.1',
            size: '110MB',
            fileName: '迅雷_LuRee_1.0_上msdn网站下载系统的软件.HPM',
        },
    ];

    const style = {

        border: '1px solid var(--semi-color-border)',
        backgroundColor: 'var(--semi-color-bg-2)',
        borderRadius: '3px',
        paddingLeft: '20px',
        margin: '8px 2px',
    };

    return (
        <div>
            <List

                dataSource={data}
                renderItem={item => (
                    <List.Item style={style}>
                        <div style={{ display: 'flex', width: "100%" }}>
                            <div style={{ width: "100%" }}>
                                <a style={{ color: 'var(--semi-color-text-0)', fontWeight: 600 }}>{item.title}</a>
                                <br />
                                <a style={{ color: 'var(--semi-color-text-1)' }}>{item.version} | {item.author} | {item.size}</a>
                            </div>

                            <div style={{ display: 'flex', textAlign: 'right', justifyContent: 'flex-end', width: "100%" }}>
                                <Button style={{ marginRight: 8 }}>禁用</Button>
                                <Button style={{ marginRight: 8 }} type="danger">删除</Button>

                            </div>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
}