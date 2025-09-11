/**
 * 工具函数统一入口
 * 提供所有工具函数的导出
 */

// 核心工具函数
export * from './core/file';
export * from './core/string';
export * from './core/system';

// API 相关
export * from './safeAPI';
export * from './command';

// 专用工具
export * from './disk/diskInfo';
export * from './aria2/aria2';

// 其他工具
export * from './hardwareInfo';
export * from './performance-monitor';

// 重新导出常用函数，保持向后兼容
export {
  // 文件操作
  fileExists as isFileExisted,
  readJSONFile as parseJosnFile,
  writeJSONFile as writeJosnFile,
  deleteFile as delFiles,
  renameFile as reNameFile,
  createDirectory as makeDir,
  readHotPEConfig,
  writeHotPEConfig as writeHotPESetting,
  traverseFiles,
} from './core/file';

export {
  // 字符串处理
  isJSON,
  takeLeftStr,
  takeRightStr,
  takeMidStr,
  dealStrForCmd,
  filterArrayNull,
  formatFileSize,
  formatTime,
  generateUUID,
} from './core/string';

export {
  // 系统工具
  delay,
  debounce,
  throttle,
  retry,
  deepClone,
  isEmpty,
  safeGet,
  typeGuards,
  isHotPEDrive,
  getSystemEnvironment
} from './core/system';