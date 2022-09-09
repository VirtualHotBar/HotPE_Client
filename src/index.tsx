import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Mian_window from './part/mian-window'
import { LoadingOutlined } from '@ant-design/icons';
import './index.css'

let mianPage = <>
  <div className='loading' >
    <img className='logoimg' src="./img/logo.ico" />
    <br />
    <LoadingOutlined style={{ fontSize: 35, color: "#1393DE", marginTop: "80px" }} />
  </div>
</>;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Mian_window />
);



