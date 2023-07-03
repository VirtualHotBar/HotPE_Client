import React, { useState } from 'react';
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './app.tsx';
import { Spin } from '@douyinfe/semi-ui';
import { getHardwareInfo } from './utils/hardwareInfo.ts';


//const {BrowserWindow}=require('@electron/remote')

const root = ReactDOM.createRoot(document.querySelector('#app') as HTMLElement);


//加载页面.n
root.render(
  <>
    <div className='loading' style={{ textAlign: "center", display: 'block', height: '100%' }}>
      <div style={{ height: 'calc(50% - 50px)' }}></div>
      <Spin size="large" />
      <p>正在启动...</p>
    </div>
  </>
  ,
)

//使用异步函数避免程序卡死
async function appStart() {
  //const disk = await getHardwareInfo('--disk')
  //console.log(disk);
  root.render(<App></App>,)
}



//使用setTimeout使加载界面mod渲染完
setTimeout(() => {
  appStart()
}, 0);

