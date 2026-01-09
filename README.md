# Ging IDE

一个轻量级、现代化的桌面代码编辑器，基于 Electron + React + TypeScript 构建。

![Ging IDE](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 功能特性

### 编辑器
- Monaco Editor（VS Code 同款编辑器引擎）
- 多标签页编辑
- 语法高亮（支持 TypeScript、JavaScript、Python、Rust、Go 等）
- 全局文件搜索（Cmd/Ctrl + P）

### 终端
- 集成真实终端（基于 node-pty + xterm.js）
- 多终端标签页支持
- 一键运行项目（自动检测 Node.js、Python、Rust、Go、Java 项目）

### 项目管理
- 文件树浏览器
- 右键菜单（新建文件/文件夹、重命名、删除）
- 最近项目记录
- Git 状态显示（分支名、文件修改状态）

### AI 集成
- 支持 OpenAI / Anthropic API
- 可配置 API Key、Base URL、Model

### 界面
- 玻璃拟态（Glassmorphism）设计风格
- macOS 原生窗口适配
- 深色主题

## 技术栈

| 技术 | 用途 |
|------|------|
| Electron | 跨平台桌面应用 |
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Tailwind CSS | 样式 |
| Monaco Editor | 代码编辑器 |
| xterm.js + node-pty | 终端模拟 |
| simple-git | Git 集成 |
| electron-store | 数据持久化 |

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装

```bash
git clone https://github.com/Gingaoyuzhan/Ging-IDE.git
cd Ging-IDE
npm install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Cmd/Ctrl + P | 全局文件搜索 |
| Cmd/Ctrl + S | 保存文件 |
| Cmd/Ctrl + W | 关闭标签页 |

## 项目结构

```
Ging-IDE/
├── src/
│   ├── main/           # Electron 主进程
│   ├── preload/        # 预加载脚本（IPC 桥接）
│   └── renderer/       # React 渲染进程
│       └── src/
│           ├── components/
│           │   ├── CodeEditor.tsx      # 代码编辑器
│           │   ├── Terminal.tsx        # 终端
│           │   ├── ProjectDrawer.tsx   # 文件树
│           │   ├── CommandPalette.tsx  # 文件搜索
│           │   ├── SettingsPanel.tsx   # 设置面板
│           │   └── ...
│           └── App.tsx
├── resources/          # 应用图标
└── out/                # 构建输出
```

## License

MIT
