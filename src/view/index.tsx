import React from 'react';
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './app.tsx';
import { Spin } from '@douyinfe/semi-ui';

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

setTimeout(() => {
  root.render(<App></App>,)
}, 2000);
