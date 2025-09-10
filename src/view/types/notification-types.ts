// 通知相关类型定义

export interface NotificationConfig {
  title: string;
  content: string;
  duration: number;
  position: 'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight';
  showClose: boolean;
  theme: 'light' | 'normal';
  onClick?: () => void;
  onClose?: () => void;
}

export interface ToastConfig {
  content: string;
  duration: number;
  position: 'top' | 'bottom';
  showClose: boolean;
  onClick?: () => void;
  onClose?: () => void;
}