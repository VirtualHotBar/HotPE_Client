import React from 'react'
import {Button} from '@douyinfe/semi-ui';
import './topBar.css'
import { CloseOutlined} from '@ant-design/icons';

export default function TopBar(){
    return(

        <div className="topbar-low" >
            <div style={{ display: "flex",width:"100%"}}>
                <img src="./img/logo.ico" className="top-img" />
                
                <a className='window-title'>HotPE Client</a>
            </div>

            <div className='winbutton'>
                <Button onClick={windows_mini} className='button-exit' type="tertiary">ㅡ</Button>
                <Button onClick={exithub} className='button-exit' type="danger"><CloseOutlined/></Button>

            </div>
        </div>

    )
}

const { shell, ipcRenderer } = window.require('electron')

function exithub() {
    ipcRenderer.send('exithub')
};

function windows_mini() {
    ipcRenderer.send('windows:mini')
}
