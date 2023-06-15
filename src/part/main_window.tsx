import React, { useState } from 'react';
import { Layout, Nav, Notification } from '@douyinfe/semi-ui';
import TopBar from './layout/topBar';
import './main-menu.css'
import { RunCmd, RunCmd_ } from './assembly/order';
import { UsbOutlined, HomeOutlined, AppstoreOutlined, SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import HomePage from './modular/Page/homePage'
import BuildISOFilePage from './modular/Page/buildISOFilePage';
import DocsPage from './modular/Page/docsPage';
import HpmDownPage from './modular/Page/hpmDownPage';
import HpmManagePage from './modular/Page/hpmManagePage';
import SettingPage from './modular/Page/settingPage';
import SetupToUDiskPage from './modular/Page/setupToUDiskPage';
import SetupToSysPage from './modular/Page/setupToSysPage';

export default function Main_window() {
    //RunCmd_("dir",function(str:string){console.log(str)},function(str:string){console.log(str)})
    
    const [LockMuen, SetLockMuen] = useState("")
    const [Page, SetPage] = useState(<HomePage SetMenuAndPage={SetMenuAndPage} SetLockMuen={SetLockMuen}/>);//页面
    const [SelectedKey, SetSelectedKey] = useState('Home');//菜单选中key


    const { Header, Sider, Content } = Layout;

    function SetMenuAndPage(page: JSX.Element, menuKey: string) {
        if (LockMuen != "") {
            Notification.info({
                content: '请任务结束后再切换页面',
                duration: 2,
                theme: 'light',
            })

            SetSelectedKey(LockMuen);
            return

        } else {
            SetPage(page);
            SetSelectedKey(menuKey);
        }

    }


    return (

        <>
            <Layout style={{ height: '100%' }}>
                <Header style={{ backgroundColor: 'var(--semi-color-bg-1)', height: '41px' }}>
                    <TopBar />
                </Header>
                <Layout style={{ height: 'calc(100vh - 100px)' }}>
                    <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)', width: '160px' }}>

                        <Nav style={{ height: '100%', width: '160px', outline: 'none' }} defaultOpenKeys={['Setup', 'HPM']} defaultSelectedKeys={[SelectedKey]}>
                            <Nav.Item itemKey={'Home'} text={'首页'} icon={<HomeOutlined />} onClick={() => { SetMenuAndPage(<HomePage SetMenuAndPage={SetMenuAndPage} SetLockMuen={SetLockMuen}/>, 'Home') }} />
                            <Nav.Sub itemKey={'Setup'} text="安装" icon={<UsbOutlined />} >
                                <Nav.Item itemKey={'SetupToSys'} text={'安装到系统'} onClick={() => { SetMenuAndPage(<SetupToSysPage SetLockMuen={SetLockMuen} />, 'SetupToSys') }} />
                                <Nav.Item itemKey={'SetupToUDisk'} text={'安装到U盘'} onClick={() => { SetMenuAndPage(<SetupToUDiskPage />, 'SetupToUDisk') }} />
                                <Nav.Item itemKey={'BuildISOFile'} text={'生成ISO镜像'} onClick={() => { SetMenuAndPage(<BuildISOFilePage />, 'BuildISOFile') }} />
                            </Nav.Sub>
                            <Nav.Sub itemKey={'HPM'} text={'模块'} icon={<AppstoreOutlined />}>
                                <Nav.Item itemKey={'HpmDown'} text={'模块下载'} onClick={() => { SetMenuAndPage(<HpmDownPage />, 'HpmDown') }} />
                                <Nav.Item itemKey={'HpmManage'} text={'模块管理'} onClick={() => { SetMenuAndPage(<HpmManagePage />, 'HpmManage') }} />
                            </Nav.Sub>
                            <Nav.Item itemKey={'Docs'} text={'文档'} icon={<QuestionCircleOutlined />} onClick={() => { SetMenuAndPage(<DocsPage />, 'Docs') }} />
                            <Nav.Item itemKey={'Setting'} text={'设置'} icon={<SettingOutlined />} onClick={() => { SetMenuAndPage(<SettingPage />, 'Setting') }} />
                            <Nav.Footer collapseButton={false} />
                        </Nav>

                    </Sider>

                    <Content style={{ padding: '24px', backgroundColor: 'var(--semi-color-bg-0)' }}>
                        {Page}
                    </Content>
                </Layout>
            </Layout>
        </>
    )

}

