import React, { useState,useEffect,useReducer } from 'react';
import Header_ from './layout/header.tsx'
import Page from './page/page.tsx'

import { Layout, Nav, Button, Notification, Badge } from '@douyinfe/semi-ui';
import { IconAppCenter, IconHelpCircle, IconPaperclip, IconHome, IconSetting } from '@douyinfe/semi-icons';
import { HPMDLRender, HPMDlList } from './services/hpm.ts';

const { Header, Sider, Content } = Layout;

export default function App() {


    const [navKey, setNavKey] = useState('Home');
    const [lockMuen, setLockMuen] = useState(false);

    function upNavKey(navKey_: string) {
        if (lockMuen) {
            Notification.info({
                content: '请任务结束后再切换页面',
                duration: 2,
                theme: 'light',
            })
            //setNavKey(navKey)
        } else {
            setNavKey(navKey_)
        }
        console.log(lockMuen, navKey_);
    }

    return (
        /* Layout 布局 */
        <Layout style={{ border: '1px solid var(--semi-color-border)', height: "100%", width: "100%" }}>
            <Header style={{ backgroundColor: 'var(--semi-color-bg-1)', height: "40px", width: "100%" }}>
                <Header_ upNavKey={upNavKey}></Header_>
            </Header>
            <Layout style={{ width: '100%', height: 'calc(100vh - 41px)' }}>
                <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
                    <Navigation navKey={navKey} upNavKey={upNavKey}></Navigation>

                </Sider>
                <Content style={{ backgroundColor: 'var(--semi-color-bg-0)', height: "100%" }}>
                    <Page navKey={navKey} setNavKey={setNavKey} setLockMuen={setLockMuen}></Page>
                </Content>
            </Layout>

        </Layout>

    )
}

function Navigation(props:any) {
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);//刷新组件

    useEffect(() => {
        HPMDLRender.callRefreshNav = forceUpdate
    })

    const naviItems = [
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
            items: [{ itemKey: 'HPMDl', text: '下载模块' }, { itemKey: 'HPMMgr', text: '模块管理' }, {
                itemKey: 'TaskMgr', text: <>
                    任务管理{HPMDlList.length > 0 ? <Badge count={HPMDlList.length} overflowCount={99} type='primary' /> : <></>}
                </>
            }],
        },
        { itemKey: 'Docs', text: '文档', icon: <IconHelpCircle /> },
        { itemKey: 'Setting', text: '设置', icon: <IconSetting /> }
    ];

    return <Nav
        style={{ maxWidth: 170, height: '100%' }}
        selectedKeys={[props.navKey]}
        defaultSelectedKeys={['Home']}
        defaultOpenKeys={['Setup', 'HPM']}
        items={naviItems}
        onSelect={(e) => { props.upNavKey(e.itemKey.toString()) }}
        footer={{ collapseButton: true, }}
    />

}
