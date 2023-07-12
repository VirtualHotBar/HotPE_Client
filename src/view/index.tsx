import React, { useState } from 'react';
import ReactDom from 'react-dom';
import './index.css'
import App from './app.tsx';
import { Spin } from '@douyinfe/semi-ui';
import { getHardwareInfo } from './utils/hardwareInfo.ts';
import { initClient } from './controller/init.ts';


//const {BrowserWindow}=require('@electron/remote')

//const root = ReactDOM.createRoot(document.querySelector('#app') as HTMLElement);
const root = document.getElementById('app')




//加载页面.n
ReactDom.render(
  <>
    <div className='loading' style={{ textAlign: "center", display: 'block', height: '100%' }}>
      <div style={{ height: 'calc(50% - 50px)' }}></div>
      <Spin size="large" />
      <p>正在启动...</p>
    </div>
  </>
  ,root
)

//使用异步函数避免程序卡死
async function appStart() {
  await initClient()

  ReactDom.render(<App></App>,root)
}



//使用setTimeout使加载界面mod渲染完
setTimeout(() => {
  appStart()
}, 0);

