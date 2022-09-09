import React, { useState } from 'react';
import { Menu } from 'antd';
import 'antd/dist/antd.css';
import { HomeOutlined, AppstoreOutlined, UsbOutlined, SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
//import {stePage_ } from '../mian-window'

import HomePage from './homePage';
import SettingPage from './settingPage'
import DocsPage from './docsPage'
import SetupToSysPage from './setupToSysPage';
import SetupToUDiskPage from './setupToUDiskPage';
import BuildISOFilePage from './buildISOFilePage';
import HpmDownPage from './hpmDownPage';
import HpmManagePage from './hpmManagePage';

export default function Mianmenu(props: any) {
    /*     const items = [
            { label: '首页', icon: <HomeOutlined />, key: 'HomeMenu-item-1', onclick:()=>alert(123) }, // 菜单项务必填写 key
    
            {
                label: '制作', icon: <UsbOutlined />, key: 'make-item-2',
                children: [
                    { label: '安装到系统', key: 'sysSetMenu-item-2',  },
                    { label: '安装到U盘', key: 'UsteMenu-item-2' },
                    { label: '生成ISO镜像', key: 'makeisoMenu-item-2' }
                ],
            },
    
            {
                label: '模块', icon: <AppstoreOutlined />, key: 'hpm-item-3',
                children: [
                    { label: '模块下载', key: 'hpmdownMenu-item-3' },
                    { label: '模块管理', key: 'sethpmMenu-item-3' }
                ],
            },
            { label: '文档', icon: <QuestionCircleOutlined />, key: 'DocsMenu-item-4' },
            { label: '设置', icon: <SettingOutlined />, key: 'SettingMenu-item-5'},
        ]; */

    const [selectMenu, setSelectMenu] = useState('homeMenu')
    const [openKeys, setOpenKeys] = useState('')

    return (
        <>
            {/* <Menu mode="inline" defaultSelectedKeys={["HomeMenu-item-1"]} style={{ width: "145px", height: "100%" }} items={items} /> */}
            {/* openKeys={['SetupMenu','HpmMenu']} */}
            <Menu mode="inline"  selectedKeys={[selectMenu]}  style={{ width: "145px", height: "100%" }}>
                <Menu.Item key="homeMenu" onClick={() => { props.stePage(<HomePage type='netSetup' setSelectMenu={setSelectMenu} stePage={props.stePage} setOpenKeys={setOpenKeys} />); setSelectMenu("homeMenu") }}><HomeOutlined /> 首页</Menu.Item>
                <Menu.SubMenu key='SetupMenu' title={<><UsbOutlined /> 安装</>}>
                    <Menu.Item key='SetupToSysMenu' onClick={() => { props.stePage(<SetupToSysPage />); setSelectMenu("SetupToSysMenu") }}>安装到系统</Menu.Item>
                    <Menu.Item key='SetupToUDiskMenu' onClick={() => { props.stePage(<SetupToUDiskPage />); setSelectMenu("SetupToUDiskMenu") }}>U盘制作</Menu.Item>
                    <Menu.Item key='BuildISOFileMenu' onClick={() => { props.stePage(<BuildISOFilePage />); setSelectMenu("BuildISOFileMenu") }}>ISO生成</Menu.Item>
                </Menu.SubMenu>

                <Menu.SubMenu key ='HpmMenu' title={<><AppstoreOutlined /> 模块</>}>
                    <Menu.Item key='HpmDownMenu' onClick={() => { props.stePage(<HpmDownPage />); setSelectMenu("HpmDownMenu") }}>模块下载</Menu.Item>
                    <Menu.Item key='HpmManageMenu' onClick={() => { props.stePage(<HpmManagePage />); setSelectMenu("HpmManageMenu") }}>模块管理</Menu.Item>
                </Menu.SubMenu>

                <Menu.Item key='DocsMenu' onClick={() => { props.stePage(<DocsPage />); setSelectMenu("DocsMenu") }}><QuestionCircleOutlined /> 文档</Menu.Item>

                <Menu.Item key='SettingMenu' onClick={() => { props.stePage(<SettingPage />); setSelectMenu("SettingMenu") }}><SettingOutlined /> 设置</Menu.Item>
            </Menu>

        </>



    )
};

