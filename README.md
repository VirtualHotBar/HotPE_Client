# 🔥 HotPE Client

> 现代化的 HotPE 系统管理客户端 - 基于 Electron + React 18 + TypeScript

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![Electron](https://img.shields.io/badge/Electron-Latest-blue.svg)](https://www.electronjs.org/)

## ✨ 特性

- 🚀 **现代化技术栈** - React 18 + TypeScript + Electron
- 🎨 **优雅的用户界面** - 基于 Semi Design 组件库
- 🌙 **主题系统** - 支持亮色/暗色/自动主题切换
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔒 **类型安全** - 100% TypeScript 覆盖
- ⚡ **高性能** - 内置性能监控和优化
- 🛡️ **错误处理** - 完善的错误边界和异常处理
- 🔧 **模块化架构** - 清晰的代码组织和职责分离
- 📊 **实时监控** - 应用性能和资源使用监控
- 🎯 **开发友好** - 丰富的开发工具和调试功能

## 🏗️ 项目架构

```
HotPE Client
├── 📁 src/
│   ├── 📁 main/                 # 主进程
│   │   ├── index.ts            # 主进程入口
│   │   ├── preload.ts          # 预加载脚本
│   │   └── 📁 ipc/             # IPC 处理器
│   │       ├── index.ts        # IPC 统一入口
│   │       ├── window-handlers.ts
│   │       ├── file-handlers.ts
│   │       ├── command-handlers.ts
│   │       ├── path-handlers.ts
│   │       └── dialog-handlers.ts
│   └── 📁 view/                # 渲染进程
│       ├── app.tsx             # 应用主组件
│       ├── index.tsx           # 渲染进程入口
│       ├── 📁 components/      # 可复用组件
│       │   └── ErrorBoundary.tsx
│       ├── 📁 store/           # 状态管理
│       │   └── index.tsx
│       ├── 📁 services/        # 业务服务
│       │   ├── config-manager.ts
│       │   ├── notification-manager.ts
│       │   └── theme-manager.ts
│       ├── 📁 utils/           # 工具函数
│       │   ├── enhanced-utils.ts
│       │   ├── command-executor.ts
│       │   ├── performance-monitor.ts
│       │   └── safeAPI.ts
│       ├── 📁 constants/       # 常量定义
│       │   └── index.ts
│       ├── 📁 layout/          # 布局组件
│       │   ├── header.tsx
│       │   └── Navigation.tsx
│       └── 📁 page/            # 页面组件
│           └── page.tsx
├── 📁 scripts/                 # 开发脚本
│   ├── dev-tools.js           # 开发工具
│   └── format-and-lint.js     # 代码格式化
├── 📁 resources/               # 资源文件
└── 📁 docs/                   # 文档
    ├── API_DOCUMENTATION.md   # API 文档
    ├── REFACTOR_PLAN.md       # 重构计划
    ├── REFACTOR_SUMMARY.md    # 重构总结
    ├── REFACTOR_COMPLETE.md   # 重构完成报告
    └── MIGRATION_GUIDE.md     # 迁移指南
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0 或 **pnpm** >= 7.0.0
- **Windows** 10/11 (主要支持平台)

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或使用批处理文件 (Windows)
./dev-forge.bat
```

### 构建应用

```bash
# 构建生产版本
npm run build

# 打包应用
npm run package

# 制作安装包
npm run make
```

## 🛠️ 开发工具

### 代码质量检查

```bash
# 运行所有检查
node scripts/format-and-lint.js report

# 格式化代码
node scripts/format-and-lint.js format

# ESLint 检查
node scripts/format-and-lint.js lint

# TypeScript 类型检查
node scripts/format-and-lint.js typecheck

# 快速修复常见问题
node scripts/format-and-lint.js fix
```

### 项目分析

```bash
# 分析项目结构
node scripts/dev-tools.js analyze

# 生成组件模板
node scripts/dev-tools.js component MyComponent

# 清理项目
node scripts/dev-tools.js clean
```

## 📚 核心功能

### 🎨 主题系统

支持三种主题模式：

```typescript
import { setTheme, toggleTheme } from '@/services/theme-manager';

// 设置主题
setTheme('light');   // 亮色主题
setTheme('dark');    // 暗色主题
setTheme('auto');    // 跟随系统

// 切换主题
toggleTheme();
```

### 📢 通知系统

统一的消息通知管理：

```typescript
import { showSuccess, showError, successToast } from '@/services/notification-manager';

// 显示通知
showSuccess({ content: '操作成功！' });
showError({ content: '操作失败，请重试' });

// 显示 Toast
successToast('保存成功');
```

### 🏪 状态管理

基于 React Context 的全局状态管理：

```typescript
import { useAppStore } from '@/store';

function MyComponent() {
  const { state, setCurrentPage } = useAppStore();
  
  return (
    <div>
      当前页面: {state.currentPage}
      <button onClick={() => setCurrentPage('Home')}>
        回到首页
      </button>
    </div>
  );
}
```

### ⚡ 性能监控

实时监控应用性能：

```typescript
import { startPerformanceMonitoring, recordPerformanceEvent } from '@/utils/performance-monitor';

// 启动性能监控
startPerformanceMonitoring();

// 记录性能事件
const endEvent = recordPerformanceEvent('文件处理');
// ... 执行操作
endEvent();
```

### 🔧 命令执行

安全的命令执行工具：

```typescript
import { execSync, spawn } from '@/utils/command-executor';

// 同步执行命令
const result = await execSync('dir');
if (result.success) {
  console.log(result.data);
}

// 异步执行命令
const pingResult = await spawn('ping google.com', {
  onOutput: (data) => console.log(data)
});
```

## 🔌 API 接口

### IPC 通信

应用提供了完整的 IPC API 用于主进程和渲染进程通信：

```typescript
// 窗口操作
await window.electronAPI.windows.minimize();
await window.electronAPI.windows.maximize();

// 文件操作
const content = await window.electronAPI.fs.readFile('config.json');
await window.electronAPI.fs.writeFile('data.txt', content);

// 命令执行
const result = await window.electronAPI.cmd.execSync('dir');

// 对话框
const files = await window.electronAPI.dialog.showOpenDialog({
  properties: ['openFile'],
  filters: [{ name: 'JSON', extensions: ['json'] }]
});
```

详细的 API 文档请参考 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🎯 使用场景

### HotPE 系统管理

- **系统部署** - 将 HotPE 系统部署到硬盘或 U 盘
- **ISO 制作** - 创建自定义的 HotPE ISO 镜像
- **包管理** - 下载和管理 HotPE 扩展包
- **任务管理** - 监控和管理系统任务

### 开发和调试

- **性能分析** - 实时监控应用性能指标
- **错误追踪** - 完善的错误处理和日志记录
- **开发工具** - 丰富的开发辅助工具

## 🔧 配置

### 应用配置

配置文件位于用户数据目录，支持以下配置项：

```json
{
  "theme": "auto",
  "language": "zh-CN",
  "autoUpdate": true,
  "performance": {
    "monitoring": true,
    "interval": 1000
  },
  "notifications": {
    "enabled": true,
    "position": "topRight"
  }
}
```

### 开发配置

- **TypeScript** - `tsconfig.json`
- **ESLint** - `.eslintrc.cjs`
- **Prettier** - `.prettierrc.js`
- **Vite** - `vite.config.ts`

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e
```

## 📦 构建和部署

### 本地构建

```bash
# 构建应用
npm run build

# 打包应用 (不创建安装包)
npm run package

# 创建安装包
npm run make
```

### 构建产物

- **Windows**: `.exe` 安装包
- **便携版**: 免安装版本
- **更新包**: 增量更新文件

## 🤝 贡献指南

### 开发流程

1. **Fork** 项目
2. **创建** 功能分支 (`git checkout -b feature/AmazingFeature`)
3. **提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
4. **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **创建** Pull Request

### 代码规范

- 使用 **TypeScript** 进行开发
- 遵循 **ESLint** 规则
- 使用 **Prettier** 格式化代码
- 编写 **单元测试**
- 添加 **JSDoc** 注释

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式化
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

## 📋 更新日志

### v2.0.0 (2025-09-09)

#### 🎉 重大更新
- **全面重构** - 升级到现代化技术栈
- **React 18** - 使用最新的 React 版本和特性
- **TypeScript 严格模式** - 100% 类型安全覆盖
- **模块化架构** - 清晰的代码组织和职责分离

#### ✨ 新功能
- **主题系统** - 支持亮色/暗色/自动主题
- **性能监控** - 实时性能指标和警告
- **通知系统** - 统一的消息通知管理
- **错误边界** - 优雅的错误处理机制
- **开发工具** - 丰富的开发辅助脚本

#### 🚀 性能优化
- **代码分割** - 页面组件懒加载
- **内存管理** - 智能垃圾回收机制
- **渲染优化** - React 18 并发特性

#### 🛠️ 开发体验
- **热重载** - 快速开发调试
- **类型提示** - 完整的 TypeScript 支持
- **代码格式化** - 自动化代码质量检查
- **组件生成** - 快速创建组件模板

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请通过以下方式联系我们：

- **GitHub Issues** - [创建 Issue](https://github.com/your-repo/hotpe-client/issues)
- **讨论区** - [GitHub Discussions](https://github.com/your-repo/hotpe-client/discussions)

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目和贡献者：

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Semi Design](https://semi.design/) - 现代化组件库
- [Vite](https://vitejs.dev/) - 快速构建工具

---

<div align="center">

**🔥 HotPE Client - 让系统管理更简单**

[官网](https://hotpe.top) • [文档](./docs/) • [更新日志](./CHANGELOG.md) • [贡献指南](./CONTRIBUTING.md)

Made with ❤️ by HotPE Team

</div>