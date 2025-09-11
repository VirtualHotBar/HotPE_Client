// 页面组件通用Props类型定义

export interface BasePageProps {
  onNavigate: (page: string) => void;
  onMenuLockChange: (locked: boolean) => void;
}

export interface HomePageProps extends BasePageProps {}

export interface SettingPageProps extends BasePageProps {}

export interface MakeISOPageProps extends BasePageProps {}

export interface SetupToSysPageProps extends BasePageProps {}

export interface SetupToUDiskPageProps extends BasePageProps {}

// TreeSelect选项类型
export interface TreeSelectOption {
  label: string;
  value: string;
  key: string;
}

// 主题模式类型
export type ThemeMode = 'auto' | 'light' | 'dark';

// 下载线程数类型
export type DownloadThread = '16' | '32' | '64' | '128';