/**
 * 页面路由组件 - 重构后的页面管理
 */

import React, { Suspense, lazy } from 'react';
import { Spin, Typography } from '@douyinfe/semi-ui';
import { PAGES, type PageType } from '../constants';
import ErrorBoundary from '../components/ErrorBoundary';

const { Text } = Typography;

// 懒加载页面组件
const Home = lazy(() => import('./Home'));
const SetupToSys = lazy(() => import('./setup/setupToSys'));
const SetupToUDisk = lazy(() => import('./setup/setupToUDisk'));
const MakeISO = lazy(() => import('./setup/makeISO'));
const HPMDl = lazy(() => import('./hpm/hpmDl'));
const HPMMgr = lazy(() => import('./hpm/hpmMgr'));
const TaskMgr = lazy(() => import('./hpm/taskMgr'));
const Docs = lazy(() => import('./docs'));
const Setting = lazy(() => import('./setting'));

// 组件属性类型
interface PageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onMenuLockChange: (locked: boolean) => void;
}

// 页面组件通用属性类型
interface BasePageProps {
  onNavigate: (page: string) => void;
  onMenuLockChange: (locked: boolean) => void;
}

// 加载组件
function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        flexDirection: 'column',
      }}
    >
      <Spin size='large' />
      <Text style={{ marginTop: '16px' }}>加载中...</Text>
    </div>
  );
}

// 页面配置映射
const pageComponents: Record<PageType, React.ComponentType<BasePageProps>> = {
  [PAGES.HOME]: Home as React.ComponentType<BasePageProps>,
  [PAGES.SETUP_TO_SYS]: SetupToSys as React.ComponentType<BasePageProps>,
  [PAGES.SETUP_TO_UDISK]: SetupToUDisk as React.ComponentType<BasePageProps>,
  [PAGES.MAKE_ISO]: MakeISO as React.ComponentType<BasePageProps>,
  [PAGES.HPM_DOWNLOAD]: HPMDl as React.ComponentType<BasePageProps>,
  [PAGES.HPM_MANAGER]: HPMMgr as React.ComponentType<BasePageProps>,
  [PAGES.TASK_MANAGER]: TaskMgr as React.ComponentType<BasePageProps>,
  [PAGES.DOCS]: Docs as React.ComponentType<BasePageProps>,
  [PAGES.SETTING]: Setting as React.ComponentType<BasePageProps>,
};

/**
 * 页面路由组件
 */
export default function Page({ currentPage, onNavigate, onMenuLockChange }: PageProps) {
  // 获取对应的页面组件
  const PageComponent = pageComponents[currentPage as PageType];

  // 如果页面不存在，显示404
  if (!PageComponent) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <Text type='danger' style={{ fontSize: '18px', marginBottom: '8px' }}>
          页面未找到
        </Text>
        <Text type='secondary'>请求的页面 "{currentPage}" 不存在</Text>
      </div>
    );
  }

  // 渲染页面组件
  return (
    <ErrorBoundary
      fallback={
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <Text type='danger'>页面加载失败</Text>
        </div>
      }
    >
      <Suspense fallback={<LoadingSpinner />}>
        <PageComponent onNavigate={onNavigate} onMenuLockChange={onMenuLockChange} />
      </Suspense>
    </ErrorBoundary>
  );
}

// 导出页面属性类型供其他组件使用
export type { BasePageProps };
