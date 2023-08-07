import "./services/config"
import React, { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import './controller/log'//导入错误处理
import './index.css'
import App from './app.tsx';
import { Spin } from '@douyinfe/semi-ui';
import { initClient } from './controller/init.ts';


//const {BrowserWindow}=require('@electron/remote')

//const root = ReactDOM.createRoot(document.querySelector('#app') as HTMLElement);
const root = document.getElementById('app')

//加载页面.n
function StartPage() {
  const [startStr, setStartStr] = useState('正在启动...')

  useEffect(() => {
    appStart(setStartStr)
  })

  return <>
    <div className='loading' style={{ textAlign: "center", display: 'block', height: '100%' }}>
      <div style={{ height: 'calc(50% - 50px)' }}></div>
      <Spin size="large" />
      <p>正在启动：{startStr}</p>
    </div>
  </>
}

ReactDom.render(
  <StartPage></StartPage>
  , root
)

//使用异步函数避免程序卡死
let appStarting =false
async function appStart(setStartStr: Function) {
  if(appStarting){return}//避免重新执行
  appStarting=true
  await initClient(setStartStr)//初始化功能

  ReactDom.render(<React.StrictMode><App></App></React.StrictMode>, root)//React.StrictMode:严格模式检查组件副作用
}

//使用setTimeout使加载界面mod渲染完
/* setTimeout(() => {
  appStart()
}, 0); */

