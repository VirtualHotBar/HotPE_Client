import React from 'react';
import { Layout, Nav, Button, Breadcrumb, Skeleton, Avatar } from '@douyinfe/semi-ui';
import { IconSemiLogo, IconBell, IconHelpCircle, IconBytedanceLogo, IconHome, IconHistogram, IconLive, IconSetting,IconClose,IconMinus } from '@douyinfe/semi-icons';
import "./header.css"
import { saveConfig } from '../services/config';

const { shell, ipcRenderer } = require('electron')
//import {shell, ipcRenderer} from 'electron';

export function exitapp() {
    saveConfig()
    ipcRenderer.send('exitapp')
};

function windows_mini() {
    ipcRenderer.send('windows:mini')
}

export default function Header_() {

    return (
    <>
                <div className='topbarLeft' style={{height:"100%",width:"100%"}}>
                    <Nav mode="horizontal" defaultSelectedKeys={['Home']} style={{height:"100%",width:"100%"}}>
                        <Nav.Header style={{marginLeft:"-15px"}}>
                            <img src="./img/logo256.png" height={30} />

                            <span style={{  color: 'var(--semi-color-text-0)',margin: '0px 10px 0 10px'}}>HotPE Client</span>

                        </Nav.Header>
{/*                         <span
                            style={{
                                color: 'var(--semi-color-text-2)',
                            }}
                        >
                            <span
                                style={{
                                    marginRight: '24px',
                                    color: 'var(--semi-color-text-0)',
                                    fontWeight: '600',
                                }}
                            >
                                模版推荐
                            </span>
                            <span style={{ marginRight: '24px' }}>所有模版</span>
                            <span>我的模版</span>
                        </span> */}
                        <Nav.Footer >
                        <Button onClick={windows_mini} theme='borderless' type='tertiary'  style={{ margin: '-8px 0px 0px 0px' }}><IconMinus /></Button>
                        <Button onClick={exitapp} theme='borderless' type='danger' style={{ margin: '-8px -25px 0px 0px' }}><IconClose /></Button>
                        </Nav.Footer>
                    </Nav>
                </div>
    </>
    )
}