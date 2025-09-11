# HotPE Client

<div align="center">
  <img src="logo.ico" alt="HotPE Client Logo" width="128" height="128">
  
  <p>一个现代化的 Windows PE 系统管理客户端</p>
  
  [![Version](https://img.shields.io/badge/version-0.0.3-blue.svg)](https://github.com/VirtualHotBar/HotPE_Client)
  [![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
  [![Electron](https://img.shields.io/badge/Electron-38.1.0-47848f.svg)](https://electronjs.org/)
  [![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6.svg)](https://www.typescriptlang.org/)
</div>

## 📖 简介

HotPE Client 是一个基于 Electron + React + TypeScript 开发的桌面应用程序，专为 Windows PE 系统的管理和部署而设计。它提供了直观的用户界面来管理 PE 系统资源、创建启动盘、系统安装等功能。

## ✨ 主要特性

- 🚀 **现代化界面**: 基于 Semi Design 的美观 UI 设计
- 💾 **PE 系统管理**: 下载、更新和管理 PE 系统资源
- 🔧 **系统安装**: 支持制作 ISO 镜像和 U 盘启动盘
- 📦 **包管理**: HotPE 包管理器 (HPM) 支持
- ⚡ **高性能下载**: 基于 Aria2 的多线程下载
- 🎨 **主题支持**: 支持明暗主题切换
- 🔄 **自动更新**: 客户端和 PE 系统的自动更新检查

## 🛠️ 技术栈

### 前端技术
- **Electron**: 跨平台桌面应用框架
- **React 18**: 用户界面库
- **TypeScript**: 类型安全的 JavaScript
- **Semi Design**: UI 组件库
- **Vite**: 现代化构建工具

### 主要依赖
- **@douyinfe/semi-ui**: UI 组件库
- **@icon-park/react**: 图标库
- **react-markdown**: Markdown 渲染
- **iconv-lite**: 字符编码转换
- **ini**: INI 文件解析

## 📁 项目结构

```
HotPE_Client/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.ts         # 主进程入口
│   │   ├── preload.ts       # 预加载脚本
│   │   └── ipc/             # IPC 通信处理
│   ├── view/                # 渲染进程 (React)
│   │   ├── components/      # React 组件
│   │   ├── page/           # 页面组件
│   │   ├── layout/         # 布局组件
│   │   ├── services/       # 服务层
│   │   ├── controller/     # 控制器
│   │   ├── store/          # 状态管理
│   │   └── utils/          # 工具函数
│   └── types/              # TypeScript 类型定义
├── resources/              # 资源文件
│   ├── files/             # PE 和客户端文件
│   └── tools/             # 工具程序
├── docs/                  # 文档
└── scripts/               # 构建脚本
```

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **Bun**: 推荐使用 Bun 作为包管理器
- **Windows**: 仅支持 Windows 系统

### 安装依赖

```bash
# 使用 Bun (推荐)
bun install

# 或使用 npm
npm install
```

### 开发模式

```bash
# 启动开发服务器
bun run start

# 或使用 npm
npm run start
```

### 构建应用

```bash
# 构建应用
bun run build

# 打包应用
bun run make
```

## 📋 可用脚本

| 命令 | 描述 |
|------|------|
| `bun run start` | 启动开发服务器 |
| `bun run build` | 构建应用程序 |
| `bun run make` | 打包应用程序 |
| `bun run package` | 仅打包不制作安装包 |
| `bun run lint` | 运行 ESLint 检查 |
| `bun run preview` | 预览构建结果 |

## 🔧 配置说明

### 应用配置

应用配置文件位于 `resources/config.json`，包含以下主要配置：

- **API 配置**: 服务器 API 地址
- **环境配置**: 系统环境信息
- **资源配置**: PE 系统和客户端资源
- **设置配置**: 用户偏好设置

### 构建配置

- **Electron Forge**: 用于打包和分发
- **Vite**: 用于前端构建
- **TypeScript**: 类型检查和编译

## 🌐 相关链接

- **官方网站**: [https://www.hotpe.top/](https://www.hotpe.top/)
- **项目仓库**: [https://github.com/VirtualHotBar/HotPE_Client](https://github.com/VirtualHotBar/HotPE_Client)
- **文档中心**: [https://docs.hotpe.top/](https://docs.hotpe.top/)
- **博客**: [https://blog.hotpe.top/](https://blog.hotpe.top/)

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 编写清晰的提交信息
- 添加适当的注释和文档

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请通过以下方式联系我们：

- [GitHub Issues](https://github.com/VirtualHotBar/HotPE_Client/issues)
- 官方网站反馈

## 📄 许可证

本项目基于 [Apache License 2.0](LICENSE) 许可证开源。

## 🙏 致谢

感谢所有为 HotPE Client 项目做出贡献的开发者和用户！

---

<div align="center">
  <p>Made with ❤️ by HotPE Team</p>
</div>