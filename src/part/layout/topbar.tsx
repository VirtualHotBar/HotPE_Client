import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from 'antd';
import "../layout/topbar.css";
import 'antd/dist/antd.css';
import { CloseOutlined,MinusOutlined} from '@ant-design/icons';
//const { ipcRenderer } = require('electron')
//import ipcRenderer from "electron"
const { shell, ipcRenderer } = window.require('electron')

function Topbar() {
    return (
        <div className="topbar-low" >
            <div style={{ display: "flex",width:"100%"}}>
                <img src="./img/logo.ico" className="top-img" />
                
                <a className='window-title'>HotPE Client</a>
            </div>

            <div className='winbutton'>
                <Button onClick={windows_mini} className='button-exit' type="text">ㅡ</Button>
                <Button onClick={exithub} className='button-exit' type="text"  danger><CloseOutlined /></Button>

            </div>
        </div>
    );
}

export default Topbar;

function exithub() {
    ipcRenderer.send('exithub')
};

function windows_mini() {
    ipcRenderer.send('windows:mini')
}

