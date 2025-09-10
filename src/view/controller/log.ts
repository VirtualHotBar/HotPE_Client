//日志处理(错误处理)
// 使用安全的 electronAPI 替代直接 require('electron')

import { Modal } from '@douyinfe/semi-ui';
import { ReactNode } from 'react';
window.onerror = async function (msg, url, lineNo, columnNo, error) {
  const message = [
    `Message: ${  msg}`,
    `URL: ${  url}`,
    `Line: ${  lineNo}`,
    `Column: ${  columnNo}`,
    `Error object: ${  JSON.stringify(error)}`,
  ].join(' - ');

  /* if(message.includes('Message: ResizeObserver loop limit exceeded')){
    return
} */

  await errorThrowToUser(message);
  return false;
};

window.addEventListener('unhandledrejection', async (event) => {
  await errorThrowToUser(event.reason);
});

window.addEventListener(
  'error',
  async event => {
    await errorThrowToUser(event.message);
  },
  true
);

async function errorThrowToUser(message: string) {
  //排除这个错误
  if (message.toString().includes('ResizeObserver loop limit exceeded')) {
    return;
  }

  // 排除 ReactDOM.render 警告
  if (message.toString().includes('ReactDOM.render is no longer supported')) {
    return;
  }

  // 排除 react-window 相关的已知错误
  if (
    message.toString().includes('Cannot convert undefined or null to object') &&
    message.toString().includes('react-window')
  ) {
    console.warn('React-window data issue detected, but handled gracefully');
    return;
  }

  const content = `请尝试重启程序，并记录控制台错误信息向开发者反馈，` + `错误信息：${  message}`;

  window.electronAPI?.windows?.openDevTools?.();
  //提示错误
  await errorDialog('发生错误！', content);
}

//错误对话框
export function errorDialog(title: string, content: ReactNode) {
  return new Promise(resolve => {
    // 使用 confirm 替代 error 来避免 ReactDOM.render 警告
    Modal.confirm({
      title: title,
      content: content,
      onOk: () => {
        resolve(true);
      },
      onCancel: () => {
        resolve(false);
      },
      centered: true,
      hasCancel: false,
      maskClosable: false,
      closable: false,
      type: 'error',
    });
  });
}
