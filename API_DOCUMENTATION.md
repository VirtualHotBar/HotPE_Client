# HotPE Client API 文档

## 📚 概览

本文档详细介绍了重构后的 HotPE Client 应用程序的 API 接口、组件使用方法和最佳实践。

## 🏗️ 架构概览

```
HotPE Client
├── 主进程 (Main Process)
│   ├── 窗口管理
│   ├── IPC 通信
│   ├── 文件系统操作
│   └── 系统集成
└── 渲染进程 (Renderer Process)
    ├── React 应用
    ├── 状态管理
    ├── 服务层
    └── 工具库
```

## 🔌 IPC API

### 窗口操作 API

#### `window.electronAPI.windows`

```typescript
interface WindowAPI {
  // 最小化窗口
  minimize(): Promise<void>;
  
  // 最大化窗口
  maximize(): Promise<void>;
  
  // 恢复窗口
  restore(): Promise<void>;
  
  // 关闭窗口
  close(): Promise<void>;
  
  // 退出应用
  exit(): Promise<void>;
  
  // 获取窗口状态
  getState(): Promise<WindowState>;
  
  // 设置窗口大小
  setSize(width: number, height: number): Promise<void>;
  
  // 设置窗口位置
  setPosition(x: number, y: number): Promise<void>;
}
```

**使用示例:**
```typescript
// 最小化窗口
await window.electronAPI.windows.minimize();

// 获取窗口状态
const state = await window.electronAPI.windows.getState();
console.log('窗口是否最大化:', state.isMaximized);
```

### 文件系统 API

#### `window.electronAPI.fs`

```typescript
interface FileSystemAPI {
  // 读取文件
  readFile(filePath: string, encoding?: string): Promise<string>;
  
  // 写入文件
  writeFile(filePath: string, content: string, encoding?: string): Promise<void>;
  
  // 检查文件是否存在
  exists(filePath: string): Promise<boolean>;
  
  // 创建目录
  mkdir(dirPath: string, recursive?: boolean): Promise<void>;
  
  // 删除文件
  unlink(filePath: string): Promise<void>;
  
  // 删除目录
  rmdir(dirPath: string, recursive?: boolean): Promise<void>;
  
  // 获取文件信息
  stat(filePath: string): Promise<FileStats>;
  
  // 列出目录内容
  readdir(dirPath: string): Promise<string[]>;
  
  // 复制文件
  copyFile(src: string, dest: string): Promise<void>;
  
  // 移动文件
  moveFile(src: string, dest: string): Promise<void>;
}
```

**使用示例:**
```typescript
// 读取配置文件
const config = await window.electronAPI.fs.readFile('config.json');
const configData = JSON.parse(config);

// 写入日志文件
await window.electronAPI.fs.writeFile('app.log', logContent);

// 检查文件是否存在
const exists = await window.electronAPI.fs.exists('data.txt');
if (!exists) {
  await window.electronAPI.fs.writeFile('data.txt', '');
}
```

### 命令执行 API

#### `window.electronAPI.cmd`

```typescript
interface CommandAPI {
  // 同步执行命令
  execSync(command: string, options?: ExecOptions): Promise<string>;
  
  // 异步执行命令
  spawn(command: string, options?: SpawnOptions): Promise<CommandResult>;
  
  // 监听命令输出
  onOutput(callback: (data: string) => void): void;
  
  // 停止命令执行
  kill(pid: number): Promise<void>;
}

interface CommandResult {
  success: boolean;
  output: string;
  code: number;
}
```

**使用示例:**
```typescript
// 执行系统命令
const result = await window.electronAPI.cmd.execSync('dir');
console.log('目录列表:', result);

// 异步执行长时间运行的命令
const pingResult = await window.electronAPI.cmd.spawn('ping google.com');
console.log('Ping 结果:', pingResult);

// 监听命令输出
window.electronAPI.cmd.onOutput((data) => {
  console.log('命令输出:', data);
});
```

### 路径操作 API

#### `window.electronAPI.path`

```typescript
interface PathAPI {
  // 连接路径
  join(...paths: string[]): string;
  
  // 解析路径
  resolve(...paths: string[]): string;
  
  // 获取目录名
  dirname(filePath: string): string;
  
  // 获取文件名
  basename(filePath: string, ext?: string): string;
  
  // 获取文件扩展名
  extname(filePath: string): string;
  
  // 规范化路径
  normalize(filePath: string): string;
  
  // 获取相对路径
  relative(from: string, to: string): string;
  
  // 检查是否为绝对路径
  isAbsolute(filePath: string): boolean;
}
```

**使用示例:**
```typescript
// 构建文件路径
const configPath = window.electronAPI.path.join(appDir, 'config', 'app.json');

// 获取文件扩展名
const ext = window.electronAPI.path.extname('document.pdf'); // '.pdf'

// 获取文件名
const filename = window.electronAPI.path.basename('/path/to/file.txt'); // 'file.txt'
```

### 对话框 API

#### `window.electronAPI.dialog`

```typescript
interface DialogAPI {
  // 显示打开文件对话框
  showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogResult>;
  
  // 显示保存文件对话框
  showSaveDialog(options: SaveDialogOptions): Promise<SaveDialogResult>;
  
  // 显示消息框
  showMessageBox(options: MessageBoxOptions): Promise<MessageBoxResult>;
  
  // 显示错误对话框
  showErrorBox(title: string, content: string): void;
}
```

**使用示例:**
```typescript
// 选择文件
const result = await window.electronAPI.dialog.showOpenDialog({
  title: '选择配置文件',
  filters: [
    { name: 'JSON 文件', extensions: ['json'] },
    { name: '所有文件', extensions: ['*'] }
  ],
  properties: ['openFile']
});

if (!result.canceled && result.filePaths.length > 0) {
  const filePath = result.filePaths[0];
  // 处理选中的文件
}

// 显示确认对话框
const response = await window.electronAPI.dialog.showMessageBox({
  type: 'question',
  buttons: ['确定', '取消'],
  defaultId: 0,
  message: '确定要删除这个文件吗？'
});

if (response.response === 0) {
  // 用户点击了确定
}
```

## 🎯 React 组件 API

### 全局状态管理

#### `useAppStore`

```typescript
interface AppState {
  currentPage: string;
  isMenuLocked: boolean;
  isLoading: boolean;
  theme: ThemeMode;
  notifications: NotificationRecord[];
}

interface AppActions {
  setCurrentPage: (page: string) => void;
  setMenuLocked: (locked: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  addNotification: (notification: NotificationRecord) => void;
}

function useAppStore(): {
  state: AppState;
} & AppActions;
```

**使用示例:**
```typescript
import { useAppStore } from '@/store';

function MyComponent() {
  const { state, setCurrentPage, setLoading } = useAppStore();
  
  const handleNavigate = (page: string) => {
    setLoading(true);
    setCurrentPage(page);
    // 模拟异步操作
    setTimeout(() => setLoading(false), 1000);
  };
  
  return (
    <div>
      <p>当前页面: {state.currentPage}</p>
      <button onClick={() => handleNavigate('Home')}>
        回到首页
      </button>
    </div>
  );
}
```

### 错误边界组件

#### `ErrorBoundary`

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element;
```

**使用示例:**
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      fallback={<div>出现错误，请刷新页面</div>}
      onError={(error, errorInfo) => {
        console.error('应用错误:', error, errorInfo);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## 🛠️ 服务层 API

### 配置管理

#### `ConfigManager`

```typescript
class ConfigManager {
  // 获取配置
  get config(): Config;
  
  // 更新配置
  updateConfig(updates: Partial<Config>): void;
  
  // 保存配置
  saveConfig(): Promise<void>;
  
  // 加载配置
  loadConfig(): Promise<void>;
  
  // 重置配置
  resetConfig(): void;
  
  // 监听配置变化
  onConfigChange(callback: (config: Config) => void): void;
}
```

**使用示例:**
```typescript
import { configManager } from '@/services/config-manager';

// 获取当前配置
const config = configManager.config;

// 更新配置
configManager.updateConfig({
  theme: 'dark',
  language: 'zh-CN'
});

// 保存配置
await configManager.saveConfig();

// 监听配置变化
configManager.onConfigChange((newConfig) => {
  console.log('配置已更新:', newConfig);
});
```

### 通知管理

#### `NotificationManager`

```typescript
class NotificationManager {
  // 显示成功通知
  success(options: NotificationOptions): void;
  
  // 显示错误通知
  error(options: NotificationOptions): void;
  
  // 显示警告通知
  warning(options: NotificationOptions): void;
  
  // 显示信息通知
  info(options: NotificationOptions): void;
  
  // 显示 Toast 消息
  toast(type: NotificationType, options: ToastOptions): void;
  
  // 获取通知历史
  getHistory(): NotificationRecord[];
  
  // 清除所有通知
  closeAll(): void;
}
```

**使用示例:**
```typescript
import { 
  showSuccess, 
  showError, 
  successToast 
} from '@/services/notification-manager';

// 显示成功通知
showSuccess({
  title: '操作成功',
  content: '文件已成功保存到桌面',
  duration: 3000
});

// 显示错误通知
showError({
  content: '网络连接失败，请检查网络设置',
  duration: 5000
});

// 显示简单的 Toast 消息
successToast('操作完成！');
```

### 主题管理

#### `ThemeManager`

```typescript
class ThemeManager {
  // 获取当前主题
  getCurrentTheme(): ThemeMode;
  
  // 设置主题
  setTheme(theme: ThemeMode): void;
  
  // 切换主题
  toggleTheme(): void;
  
  // 更新主题配置
  updateConfig(updates: Partial<ThemeConfig>): void;
  
  // 添加主题变更监听器
  addThemeChangeListener(listener: (event: ThemeChangeEvent) => void): void;
  
  // 应用主题预设
  applyPreset(presetName: string): void;
}
```

**使用示例:**
```typescript
import { 
  setTheme, 
  toggleTheme, 
  addThemeChangeListener 
} from '@/services/theme-manager';

// 设置暗色主题
setTheme('dark');

// 切换主题
toggleTheme();

// 监听主题变化
addThemeChangeListener((event) => {
  console.log('主题已切换:', event.newTheme);
});
```

## 🔧 工具库 API

### 命令执行器

#### `CommandExecutor`

```typescript
class CommandExecutor {
  // 同步执行命令
  execSync(command: string, options?: CommandOptions): Promise<Result<string>>;
  
  // 异步执行命令
  spawn(command: string, options?: CommandOptions): Promise<Result<CommandResult>>;
  
  // 批量执行命令
  execBatch(commands: string[], options?: CommandOptions): Promise<Result<CommandResult[]>>;
  
  // 执行 PowerShell 脚本
  execPowerShell(script: string, options?: CommandOptions): Promise<Result<CommandResult>>;
  
  // 检查命令是否存在
  commandExists(command: string): Promise<Result<boolean>>;
}
```

**使用示例:**
```typescript
import { execSync, spawn, execPowerShell } from '@/utils/command-executor';

// 同步执行命令
const result = await execSync('dir');
if (result.success) {
  console.log('目录内容:', result.data);
} else {
  console.error('命令执行失败:', result.error);
}

// 异步执行命令并监听输出
const pingResult = await spawn('ping google.com', {
  onOutput: (data) => console.log('输出:', data),
  timeout: 10000
});

// 执行 PowerShell 脚本
const psResult = await execPowerShell('Get-Process | Select-Object Name, CPU');
```

### 性能监控

#### `PerformanceMonitor`

```typescript
class PerformanceMonitor {
  // 开始监控
  startMonitoring(interval?: number): void;
  
  // 停止监控
  stopMonitoring(): void;
  
  // 记录性能事件
  recordEvent(name: string, metadata?: Record<string, any>): () => void;
  
  // 测量异步函数性能
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
  
  // 获取性能指标
  getMetrics(): PerformanceMetrics;
  
  // 获取性能报告
  getPerformanceReport(): PerformanceReport;
}
```

**使用示例:**
```typescript
import { 
  startPerformanceMonitoring, 
  recordPerformanceEvent,
  measureAsyncPerformance 
} from '@/utils/performance-monitor';

// 启动性能监控
startPerformanceMonitoring(1000);

// 记录性能事件
const endEvent = recordPerformanceEvent('文件处理');
// ... 执行操作
endEvent();

// 测量异步操作性能
const result = await measureAsyncPerformance('数据加载', async () => {
  const response = await fetch('/api/data');
  return response.json();
});
```

### 增强工具函数

#### `EnhancedUtils`

```typescript
// 安全的异步操作包装
function safeAsync<T>(fn: () => Promise<T>): Promise<Result<T>>;

// 重试机制
function retry<T>(
  fn: () => Promise<T>, 
  maxRetries: number, 
  delay: number
): Promise<Result<T>>;

// 防抖函数
function debounce<T extends (...args: any[]) => any>(
  func: T, 
  wait: number
): (...args: Parameters<T>) => void;

// 节流函数
function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void;

// 深度克隆
function deepClone<T>(obj: T): T;

// 格式化文件大小
function formatFileSize(bytes: number): string;

// 格式化时间
function formatDuration(ms: number): string;
```

**使用示例:**
```typescript
import { 
  safeAsync, 
  retry, 
  debounce, 
  formatFileSize 
} from '@/utils/enhanced-utils';

// 安全的异步操作
const result = await safeAsync(async () => {
  const response = await fetch('/api/data');
  return response.json();
});

if (result.success) {
  console.log('数据:', result.data);
} else {
  console.error('请求失败:', result.error);
}

// 重试机制
const retryResult = await retry(
  () => unstableApiCall(),
  3, // 最多重试3次
  1000 // 每次重试间隔1秒
);

// 防抖搜索
const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);

// 格式化文件大小
const size = formatFileSize(1024 * 1024); // "1.00 MB"
```

## 📝 最佳实践

### 1. 错误处理

```typescript
// ✅ 推荐：使用 Result 类型处理错误
const result = await safeAsync(() => riskyOperation());
if (result.success) {
  // 处理成功情况
  console.log(result.data);
} else {
  // 处理错误情况
  showError({ content: result.error.message });
}

// ❌ 不推荐：直接使用 try-catch
try {
  const data = await riskyOperation();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

### 2. 状态管理

```typescript
// ✅ 推荐：使用全局状态管理
const { state, setCurrentPage } = useAppStore();

// ❌ 不推荐：在组件间传递大量 props
function ParentComponent() {
  const [currentPage, setCurrentPage] = useState('Home');
  return (
    <ChildComponent 
      currentPage={currentPage} 
      onPageChange={setCurrentPage} 
    />
  );
}
```

### 3. 性能优化

```typescript
// ✅ 推荐：使用 React.memo 优化组件
const MyComponent = React.memo(function MyComponent({ data }) {
  return <div>{data.name}</div>;
});

// ✅ 推荐：使用 useCallback 优化回调函数
const handleClick = useCallback(() => {
  // 处理点击事件
}, [dependency]);

// ✅ 推荐：使用懒加载优化页面组件
const LazyPage = lazy(() => import('./MyPage'));
```

### 4. 类型安全

```typescript
// ✅ 推荐：定义明确的接口
interface UserData {
  id: number;
  name: string;
  email: string;
}

function processUser(user: UserData) {
  // 类型安全的处理
}

// ❌ 不推荐：使用 any 类型
function processUser(user: any) {
  // 缺乏类型安全
}
```

## 🔍 调试和测试

### 开发者工具

```typescript
// 启用性能监控
if (process.env.NODE_ENV === 'development') {
  startPerformanceMonitoring();
}

// 使用调试日志
console.log('调试信息:', debugData);
```

### 错误追踪

```typescript
// 全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason);
  showError({ content: '应用出现错误，请重试' });
});
```

## 📚 更多资源

- [React 18 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Electron 文档](https://www.electronjs.org/docs/)
- [Semi Design 组件库](https://semi.design/)

---

**文档版本**: v2.0.0  
**最后更新**: 2025年9月9日  
**维护者**: HotPE Client 开发团队