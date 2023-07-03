import React, { useState } from 'react';
import Header_ from './layout/header.tsx'
import Page from './page/page.tsx'

import { Layout, Nav, Button } from '@douyinfe/semi-ui';
import { IconAppCenter, IconHelpCircle, IconPaperclip, IconHome, IconSetting } from '@douyinfe/semi-icons';

const { Header, Sider, Content } = Layout;


export default function App() {
    let naviItems = [
        { itemKey: 'Home', text: '首页', icon: <IconHome /> },
        {
            text: '安装',
            icon: <IconPaperclip />,
            itemKey: 'Setup',
            items: [{ itemKey: 'SetupToSys', text: '安装到系统' }, { itemKey: 'SetupToUDisk', text: '安装到U盘' }, { itemKey: 'MakeISO', text: '生成ISO镜像' }],
        },
        {
            text: '模块',
            icon: <IconAppCenter />,
            itemKey: 'HPM',
            items: [{ itemKey: 'HPMDl', text: '下载模块' }, { itemKey: 'HPMMgr', text: '模块管理' }, { itemKey: 'TaskMgr', text: '任务管理' }],
        },
        { itemKey: 'Docs', text: '文档', icon: <IconHelpCircle /> },
        { itemKey: 'Setting', text: '设置', icon: <IconSetting /> }
    ];


    const [navKey, setNavKey] = useState('Home');

    function upNavKey(navKey_:string){
        if (navKey_ != 'Setup' && navKey_ != 'HPM' && navKey_ != navKey) {
            setNavKey(navKey_);
        }
        console.log(navKey_);
    }



    return (
        /* Layout 布局 */
        <React.StrictMode>
            <Layout style={{ border: '1px solid var(--semi-color-border)', height: "100%", width: "100%" }}>
                <Header style={{ backgroundColor: 'var(--semi-color-bg-1)', height: "40px", width: "100%" }}>
                    <Header_></Header_>
                </Header>
                <Layout>
                    <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
                        <Nav
                            style={{ maxWidth: 170, height: '100%' }}
                            defaultSelectedKeys={[navKey]}
                            defaultOpenKeys={['Setup', 'HPM']}
                            items={naviItems}
                            onClick={(e) => {upNavKey(e.itemKey!.toString())}}
                            footer={{
                                collapseButton: true,
                            }}
                        />
                    </Sider>
                    <Content
                        style={{
                            padding: '24px',
                            backgroundColor: 'var(--semi-color-bg-0)',
                            height: "100%"
                        }}
                    >
                        <Page navKey={navKey} setNavKey={setNavKey}></Page>
                    </Content>
                </Layout>

            </Layout>






        </React.StrictMode>
    )
}