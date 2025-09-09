/**
 * React 18 应用入口文件
 */

import './services/config';
import { useEffect, useState, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './controller/log'; // 导入错误处理
import './index.css';
import App from './app';
import ErrorBoundary from './components/ErrorBoundary';
import { Spin, Typography } from '@douyinfe/semi-ui';
import { initClient } from './controller/init';

const { Text } = Typography;

// 获取根元素
const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Root element not found');
}

// 创建 React 18 根实例
const root = createRoot(rootElement);

/**
 * 启动页面组件
 */
function StartPage() {
  const [startStr, setStartStr] = useState('正在启动...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const startApp = async () => {
      try {
        await initClient(setStartStr);
        
        if (mounted) {
          // 初始化完成，渲染主应用
          root.render(
            <StrictMode>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </StrictMode>
          );
        }
      } catch (err) {
        console.error('应用启动失败:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : '未知错误');
        }
      }
    };

    startApp();

    return () => {
      mounted = false;
    };
  }, []);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div 
        style={{ 
          textAlign: 'center', 
          padding: '40px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Text type="danger" style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
          应用启动失败
        </Text>
        <Text type="secondary">{error}</Text>
      </div>
    );
  }

  // 显示加载界面
  return (
    <div 
      className="loading" 
      style={{ 
        textAlign: 'center', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <Spin size="large" />
      <Text style={{ marginTop: '16px' }}>
        正在启动：{startStr}
      </Text>
    </div>
  );
}

// 渲染启动页面
root.render(
  <StrictMode>
    <ErrorBoundary>
      <StartPage />
    </ErrorBoundary>
  </StrictMode>
);

