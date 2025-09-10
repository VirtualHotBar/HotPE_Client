/**
 * 导航组件 - 重构后的侧边栏导航
 */

import React, { useEffect, useReducer, useMemo } from 'react';
import { Nav, Badge } from '@douyinfe/semi-ui';
import type { OnSelectedData } from '@douyinfe/semi-ui/lib/es/navigation';
import {
  IconAppCenter,
  IconHelpCircle,
  IconPaperclip,
  IconHome,
  IconSetting,
} from '@douyinfe/semi-icons';
import { HPMDLRender, HPMDlList } from '../services/hpm';

// 导航项类型定义
interface NavigationItem {
  itemKey: string;
  text: React.ReactNode;
  icon?: React.ReactNode;
  items?: NavigationItem[];
}

// 组件属性类型
interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

/**
 * 导航组件
 */
export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  // 强制更新组件的reducer
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // 设置HPM渲染器的刷新回调
  useEffect(() => {
    HPMDLRender.callRefreshNav = forceUpdate;

    // 清理函数
    return () => {
      HPMDLRender.callRefreshNav = () => {};
    };
  }, []);

  // 构建导航项配置
  const navigationItems: NavigationItem[] = useMemo(
    () => [
      {
        itemKey: 'Home',
        text: '首页',
        icon: <IconHome />,
      },
      {
        text: '安装',
        icon: <IconPaperclip />,
        itemKey: 'Setup',
        items: [
          { itemKey: 'SetupToSys', text: '安装到系统' },
          { itemKey: 'SetupToUDisk', text: '安装到U盘' },
          { itemKey: 'MakeISO', text: '生成ISO镜像' },
        ],
      },
      {
        text: '模块',
        icon: <IconAppCenter />,
        itemKey: 'HPM',
        items: [
          { itemKey: 'HPMDl', text: '下载模块' },
          { itemKey: 'HPMMgr', text: '模块管理' },
          {
            itemKey: 'TaskMgr',
            text: (
              <>
                任务管理
                {HPMDlList.length > 0 && (
                  <Badge count={HPMDlList.length} overflowCount={99} type='primary' />
                )}
              </>
            ),
          },
        ],
      },
      {
        itemKey: 'Docs',
        text: '文档',
        icon: <IconHelpCircle />,
      },
      {
        itemKey: 'Setting',
        text: '设置',
        icon: <IconSetting />,
      },
    ],
    [HPMDlList.length]
  );

  // 处理导航选择
  const handleSelect = (data: OnSelectedData) => {
    onNavigate(data.itemKey as string);
  };

  return (
    <Nav
      style={{ maxWidth: 170, height: '100%' }}
      selectedKeys={[currentPage]}
      defaultSelectedKeys={['Home']}
      defaultOpenKeys={['Setup', 'HPM']}
      items={navigationItems}
      onSelect={handleSelect}
      footer={{ collapseButton: true }}
    />
  );
}
