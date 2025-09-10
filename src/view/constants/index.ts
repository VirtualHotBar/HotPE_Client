/**
 * 应用常量定义
 */

// 应用信息
export const APP_INFO = {
  NAME: 'HotPE Client',
  VERSION: 'V0.3.240201',
  ID: '240201',
  LOGO_PATH: 'img/logo256.png',
} as const;

// API 端点
export const API_ENDPOINTS = {
  BASE: 'https://api.hotpe.top/',
  GITHUB_API: 'http://ghapi.hotpe.top/',
  DOWNLOAD: 'http://p0.hotpe.top/',
  UPDATE: 'API/HotPE/GetUpdate/',
} as const;

// 外部链接
export const EXTERNAL_LINKS = {
  HOME: 'https://www.hotpe.top/',
  GITHUB: 'https://github.com/VirtualHotBar/HotPE_Client',
  DOCS: 'https://docs.hotpe.top/',
  BLOG: 'https://blog.hotpe.top/',
  DONATE: 'https://www.hotpe.top/donation/',
} as const;

// 文件路径
export const FILE_PATHS = {
  TOOLS: '.\\resources\\tools\\',
  CLIENT_TEMP: '.\\resources\\temp\\',
  PE_RESOURCES: '.\\resources\\files\\pe\\',
  CLIENT_RESOURCES: '.\\resources\\files\\client\\',
  CONFIG: './resources/config.json',
} as const;

// 页面路由
export const PAGES = {
  HOME: 'Home',
  SETUP_TO_SYS: 'SetupToSys',
  SETUP_TO_UDISK: 'SetupToUDisk',
  MAKE_ISO: 'MakeISO',
  HPM_DOWNLOAD: 'HPMDl',
  HPM_MANAGER: 'HPMMgr',
  TASK_MANAGER: 'TaskMgr',
  DOCS: 'Docs',
  SETTING: 'Setting',
} as const;

// 主题模式
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// 安装状态
export const INSTALL_STATES = {
  NO_DOWNLOAD: 'noDown',
  NO_SETUP: 'noSetup',
  READY: 'ready',
} as const;

// 更新状态
export const UPDATE_STATES = {
  WITHOUT: 'without',
  AVAILABLE: 'available',
  DOWNLOADING: 'downloading',
  COMPLETED: 'completed',
} as const;

// 通知类型
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// 文件扩展名
export const FILE_EXTENSIONS = {
  ISO: 'iso',
  JPG: 'jpg',
  JPEG: 'jpeg',
  JSON: 'json',
  ZIP: 'zip',
  SEVEN_Z: '7z',
} as const;

// 文件过滤器
export const FILE_FILTERS = {
  ISO: [{ name: '镜像文件', extensions: ['iso'] }],
  IMAGE: [{ name: 'jpg图片文件', extensions: ['jpg', 'jpeg'] }],
  JSON: [{ name: 'JSON文件', extensions: ['json'] }],
  ALL: [{ name: '所有文件', extensions: ['*'] }],
} as const;

// 系统架构
export const SYSTEM_ARCH = {
  X64: 'x64',
  X86: 'x86',
  ARM64: 'arm64',
} as const;

// 固件类型
export const FIRMWARE_TYPES = {
  UEFI: 'UEFI',
  LEGACY: 'Legacy',
} as const;

// 编码类型
export const ENCODINGS = {
  UTF8: 'UTF-8',
  GBK: 'GBK',
  SHIFT_JIS: 'Shift_JIS',
  BIG5: 'Big5',
  UTF16LE: 'UTF-16LE',
  UTF16BE: 'UTF-16BE',
} as const;

// 代码页映射
export const CODE_PAGE_ENCODINGS = {
  '65001': ENCODINGS.UTF8,
  '936': ENCODINGS.GBK,
  '932': ENCODINGS.SHIFT_JIS,
  '949': 'KS_C_5601-1987',
  '950': ENCODINGS.BIG5,
  '1200': ENCODINGS.UTF16LE,
  '1201': ENCODINGS.UTF16BE,
  '1250': 'Windows-1250',
  '1251': 'Windows-1251',
  '1252': 'Windows-1252',
} as const;

// 默认配置值
export const DEFAULT_VALUES = {
  DOWNLOAD_THREADS: 16,
  BOOT_WAIT_TIME: 3,
  NOTIFICATION_DURATION: 2000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// UI 尺寸
export const UI_SIZES = {
  HEADER_HEIGHT: 40,
  SIDEBAR_WIDTH: 170,
  MIN_WINDOW_WIDTH: 800,
  MIN_WINDOW_HEIGHT: 600,
  DEFAULT_WINDOW_WIDTH: 900,
  DEFAULT_WINDOW_HEIGHT: 640,
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  INIT_FAILED: '应用初始化失败',
  CONFIG_LOAD_FAILED: '配置加载失败',
  CONFIG_SAVE_FAILED: '配置保存失败',
  FILE_READ_FAILED: '文件读取失败',
  FILE_WRITE_FAILED: '文件写入失败',
  COMMAND_EXEC_FAILED: '命令执行失败',
  NETWORK_ERROR: '网络连接错误',
  INVALID_PATH: '路径包含空格，请在无空格路径下运行',
  OFFLINE: '未连接互联网，功能将受限',
  TASK_IN_PROGRESS: '请任务结束后再切换页面',
  MODULE_LIST_EMPTY: '未获取到模块列表，功能不可用',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  CONFIG_SAVED: '配置保存成功',
  FILE_COPIED: '文件复制成功',
  TASK_COMPLETED: '任务完成',
  INSTALLATION_SUCCESS: '安装成功',
} as const;

// 正则表达式
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  VERSION: /^\d+\.\d+\.\d+$/,
  CODE_PAGE: /:s+(d+)/,
} as const;

// 键盘快捷键
export const KEYBOARD_SHORTCUTS = {
  CTRL_S: 'Ctrl+S',
  CTRL_O: 'Ctrl+O',
  CTRL_N: 'Ctrl+N',
  F5: 'F5',
  F12: 'F12',
  ESC: 'Escape',
} as const;

// 动画持续时间
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-Index 层级
export const Z_INDEX = {
  MODAL: 1000,
  DROPDOWN: 100,
  TOOLTIP: 50,
  HEADER: 10,
} as const;

// 颜色主题
export const COLORS = {
  PRIMARY: '#007bff',
  SUCCESS: '#28a745',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
} as const;

// 断点
export const BREAKPOINTS = {
  XS: 576,
  SM: 768,
  MD: 992,
  LG: 1200,
  XL: 1400,
} as const;

// 存储键名
export const STORAGE_KEYS = {
  THEME: 'hotpe_theme',
  LANGUAGE: 'hotpe_language',
  SIDEBAR_COLLAPSED: 'hotpe_sidebar_collapsed',
  LAST_PAGE: 'hotpe_last_page',
} as const;

// 事件名称
export const EVENTS = {
  CONFIG_UPDATED: 'config:updated',
  THEME_CHANGED: 'theme:changed',
  PAGE_CHANGED: 'page:changed',
  TASK_STARTED: 'task:started',
  TASK_COMPLETED: 'task:completed',
  ERROR_OCCURRED: 'error:occurred',
} as const;

// 类型导出
export type PageType = (typeof PAGES)[keyof typeof PAGES];
export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];
export type InstallState = (typeof INSTALL_STATES)[keyof typeof INSTALL_STATES];
export type UpdateState = (typeof UPDATE_STATES)[keyof typeof UPDATE_STATES];
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
export type SystemArch = (typeof SYSTEM_ARCH)[keyof typeof SYSTEM_ARCH];
export type FirmwareType = (typeof FIRMWARE_TYPES)[keyof typeof FIRMWARE_TYPES];
