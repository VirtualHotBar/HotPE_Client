/**
 * 主应用组件 - 使用新的状态管理和组件结构
 */

import { useEffect, useCallback } from 'react';
import { Layout, Notification } from '@douyinfe/semi-ui';
import { AppProvider, useAppStore } from './store';
import { initializeAll } from './services/config';
import Header from './layout/header';
import Navigation from './layout/Navigation';
import Page from './page/page';
import { HPMListOnline } from './services/hpm';

const { Header: LayoutHeader, Sider, Content } = Layout;

/**
 * 应用内容组件
 */
function AppContent() {
  const { 
    state, 
    setInitialized, 
    setError, 
    setCurrentPage, 
    setMenuLocked 
  } = useAppStore();

  const {
    isInitialized,
    currentPage,
    isMenuLocked,
  } = state;

  // 初始化应用
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAll();
        setInitialized(true);
      } catch (error) {
        console.error('应用初始化失败:', error);
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        setError(errorMessage);
        
        Notification.error({
          title: '初始化失败',
          content: '应用初始化过程中出现错误，某些功能可能无法正常使用。',
          duration: 10,
        });
        
        setInitialized(true); // 即使失败也继续运行
      }
    };

    initialize();
  }, [setInitialized, setError]);

  // 导航切换处理
  const handleNavigation = useCallback((targetPage: string) => {
    // 检查菜单是否被锁定
    if (isMenuLocked) {
      Notification.info({
        content: '请任务结束后再切换页面',
        duration: 2,
        theme: 'light',
      });
      return;
    }

    // 检查HPM模块列表
    if (HPMListOnline.length === 0 && targetPage === 'HPMDl') {
      Notification.warning({
        content: '未获取到模块列表，功能不可用。',
        duration: 2,
        theme: 'light',
      });
      return;
    }

    setCurrentPage(targetPage);
  }, [isMenuLocked, setCurrentPage]);

  // 如果还未初始化完成，返回null让启动页面继续显示
  if (!isInitialized) {
    return null;
  }

  return (
    <Layout 
      style={{ 
        border: '1px solid var(--semi-color-border)', 
        height: '100%', 
        width: '100%' 
      }}
    >
      <LayoutHeader 
        style={{ 
          backgroundColor: 'var(--semi-color-bg-1)', 
          height: '40px', 
          width: '100%' 
        }}
      >
        <Header onNavigate={handleNavigation} />
      </LayoutHeader>
      
      <Layout style={{ width: '100%', height: 'calc(100vh - 41px)' }}>
        <Sider style={{ backgroundColor: 'var(--semi-color-bg-1)' }}>
          <Navigation 
            currentPage={currentPage} 
            onNavigate={handleNavigation} 
          />
        </Sider>
        
        <Content style={{ backgroundColor: 'var(--semi-color-bg-0)', height: '100%' }}>
          <Page 
            currentPage={currentPage} 
            onNavigate={handleNavigation}
            onMenuLockChange={setMenuLocked}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

/**
 * 主应用组件 - 包装了状态管理提供者
 */
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
