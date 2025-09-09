# HotPE Client 重构迁移指南

## 快速开始

### 1. 安装依赖
```bash
# 删除旧的node_modules和锁文件（如果需要）
rm -rf node_modules
rm package-lock.json  # 如果存在

# 安装新依赖
npm install
# 或者使用pnpm
pnpm install
```

### 2. 检查TypeScript配置
```bash
# 检查TypeScript编译
npx tsc --noEmit

# 运行ESLint检查
npm run lint
```

### 3. 启动开发环境
```bash
# 使用现有的开发脚本
npm run dev
# 或
./dev-forge.bat
```

## 主要变更说明

### API调用变更

#### 旧方式 (已废弃)
```typescript
// 旧的window.require方式
const fs = window.require('fs');
const { execSync } = window.require('child_process');
```

#### 新方式 (推荐)
```typescript
// 使用类型安全的API
const content = await window.electronAPI.fs.readFile(filePath);
const result = await window.electronAPI.cmd.execSync(command);
```

### 状态管理变更

#### 旧方式
```typescript
// 分散的useState
const [navKey, setNavKey] = useState('Home');
const [lockMenu, setLockMenu] = useState(false);
```

#### 新方式
```typescript
// 统一的状态管理
import { useAppStore } from './store';

function MyComponent() {
  const { state, setCurrentPage, setMenuLocked } = useAppStore();
  // 使用 state.currentPage, state.isMenuLocked 等
}
```

### 配置管理变更

#### 旧方式
```typescript
import { config, saveConfig } from './services/config';
```

#### 新方式
```typescript
import { configManager } from './services/config-manager';

// 获取配置
const config = configManager.config;

// 更新配置
configManager.updateConfig({ /* 更新内容 */ });

// 保存配置
await configManager.saveConfig();
```

### 错误处理变更

#### 旧方式
```typescript
try {
  const result = someOperation();
} catch (error) {
  console.error(error);
}
```

#### 新方式
```typescript
import { safeAsync, Result } from './utils/enhanced-utils';

const result: Result<string> = await safeAsync(() => someOperation());
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## 组件迁移示例

### 旧组件结构
```typescript
export default function MyComponent(props: any) {
  // 组件逻辑
}
```

### 新组件结构
```typescript
interface MyComponentProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function MyComponent({ onNavigate, currentPage }: MyComponentProps) {
  // 类型安全的组件逻辑
}
```

## 常见问题解决

### 1. TypeScript错误

**问题**: `Property 'xxx' does not exist on type 'ElectronAPI'`

**解决**: 检查是否使用了正确的API路径
```typescript
// 错误
window.electronAPI.exitApp()

// 正确
window.electronAPI.windows.exit()
```

### 2. 导入路径错误

**问题**: 模块找不到

**解决**: 使用新的路径映射
```typescript
// 旧方式
import { config } from '../services/config';

// 新方式
import { configManager } from '@/services/config-manager';
```

### 3. 状态管理错误

**问题**: 状态更新不生效

**解决**: 确保组件被 `AppProvider` 包装
```typescript
// App.tsx 中
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
```

## 性能优化建议

### 1. 使用选择器优化渲染
```typescript
// 避免不必要的重渲染
const currentPage = useAppSelector(selectors.currentPage);
const isLoading = useAppSelector(selectors.isLoading);
```

### 2. 使用 React.memo 优化组件
```typescript
const MyComponent = React.memo(function MyComponent(props) {
  // 组件逻辑
});
```

### 3. 使用 useCallback 优化回调
```typescript
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependency]);
```

## 调试技巧

### 1. 开发者工具
- 按 F12 或使用菜单打开开发者工具
- 使用 React Developer Tools 调试组件状态

### 2. 日志记录
```typescript
// 使用增强的日志记录
import { safeAsync } from '@/utils/enhanced-utils';

const result = await safeAsync(() => riskyOperation());
console.log('Operation result:', result);
```

### 3. 错误边界
- 错误会被 ErrorBoundary 捕获并显示友好界面
- 开发模式下可以看到详细错误信息

## 测试建议

### 1. 功能测试清单
- [ ] 应用启动正常
- [ ] 页面导航工作
- [ ] 文件操作功能
- [ ] 命令执行功能
- [ ] 配置保存/加载
- [ ] 错误处理显示

### 2. 性能测试
- 检查内存使用情况
- 测试启动时间
- 验证响应速度

## 回滚方案

如果遇到严重问题需要回滚：

1. **备份当前更改**
```bash
git stash push -m "重构后的代码"
```

2. **恢复到重构前**
```bash
git checkout HEAD~1  # 或具体的commit hash
```

3. **重新应用部分更改**
```bash
git cherry-pick <specific-commit>
```

## 后续开发建议

1. **逐步迁移**: 不要一次性修改所有文件，逐个组件迁移
2. **保持测试**: 每次修改后都要测试相关功能
3. **文档更新**: 及时更新相关文档和注释
4. **代码审查**: 重要修改建议进行代码审查

## 支持和帮助

如果在迁移过程中遇到问题：

1. 检查控制台错误信息
2. 参考 TypeScript 错误提示
3. 查看重构总结文档
4. 对比新旧代码结构

重构的目标是提高代码质量和开发体验，如有任何问题，建议逐步迁移而不是一次性替换所有代码。