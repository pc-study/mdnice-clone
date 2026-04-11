# mdnice-clone

> mdnice Markdown 排版编辑器克隆版 —— 专注于微信公众号、知乎、掘金等平台的 Markdown 排版工具

**线上地址**：https://pc-study.github.io/mdnice-clone/

## 功能特性

- 📝 基于 CodeMirror 6 的 Markdown 编辑器，支持语法高亮和快捷键
- 👀 基于 markdown-it 的实时预览，支持数学公式（KaTeX）、代码高亮
- 🎨 62 个排版主题（32 个掘金社区主题 + 30 个 mdnice 原版主题），卡片式主题选择器
- 🖥 268 个代码高亮主题（highlight.js CDN 加载），支持 Mac 三色圆点样式
- 📋 一键复制为微信公众号 / 知乎 / 掘金格式
- 🚀 **多平台一键发布**：通过浏览器扩展将文章一键发布至 CSDN、掘金、知乎、墨天轮、51CTO、ITPUB、微信公众号（7 大平台）
- 🤖 **文章元数据智能提取**：自动从 Markdown 内容中提取标签、摘要、分类和封面图
- 🔑 **一键获取 Cookie**：检测各平台登录状态，免密鉴权
- 📁 本地文件管理系统，支持文件夹和多文件，右键上下文菜单
- 🔄 编辑器与预览区双向同步滚动
- 💾 所有数据 localStorage 持久化，无需后端
- ✨ 支持 mdnice 特殊语法：容器块、分列布局、注音符号、图片尺寸控制
- 🖼 支持图片拖拽上传和剪贴板粘贴（Base64 内嵌）
- 🔗 微信外链自动转脚注、文档格式化（中英文加空格等）
- 📱 响应式设计，窄屏自动适配
- 📊 底部状态栏实时显示行数、字数、字符数
- ❓ 内置帮助系统：Markdown 语法速查表、快捷键列表、关于信息

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 编辑器 | CodeMirror 6 |
| Markdown 解析 | markdown-it + 插件 |
| 数学公式 | KaTeX |
| 代码高亮 | highlight.js |
| 状态管理 | Zustand |
| 数据持久化 | localStorage |
| 浏览器扩展 | Chrome Extension MV3 |

## 安装与运行

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/pc-study/mdnice-clone.git
cd mdnice-clone

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 即可使用。

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录，可直接部署到任意静态服务器。

### 安装浏览器扩展

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选择项目根目录下的 `extension/` 文件夹
4. 扩展安装后，mdnice-clone 会自动检测并启用多平台发布功能

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── MenuBar/         # 顶部菜单栏（文件、格式、主题、代码主题、功能、发布、查看、设置、帮助）
│   ├── Publish/         # 发布相关组件（PublishModal 多平台发布控制台）
│   ├── Sidebar/         # 左侧文件管理面板
│   ├── Editor/          # CodeMirror 6 Markdown 编辑器
│   ├── Preview/         # 实时渲染预览区 + 预览工具条
│   ├── StatusBar/       # 底部状态栏（行数、字数、字符数）
│   └── common/          # 通用组件（Toast、Modal、Dropdown、HelpModal）
├── themes/
│   ├── juejin/          # 32 个掘金社区排版主题 CSS 文件
│   ├── mdnice/          # 30 个 mdnice 原版排版主题 CSS 文件
│   └── index.ts         # 主题定义与注册（分组导出）
├── codeThemes/          # 代码高亮主题（CDN 加载 268 个 + Mac 三色圆点开关）
├── utils/               # 工具函数
│   ├── markdownParser.ts    # Markdown 解析
│   ├── copyToClipboard.ts   # 富文本复制
│   ├── extensionBridge.ts   # Web 端与浏览器扩展通信协议
│   ├── articleExtractor.ts  # 文章元数据智能提取（标签、摘要、分类）
│   ├── fileManager.ts       # 文件导入导出
│   ├── formatDocument.ts    # 文档格式化
│   └── footnotesConverter.ts # 外链转脚注
├── store/               # Zustand 状态管理
│   ├── editorStore.ts       # 编辑器状态
│   ├── themeStore.ts        # 主题状态
│   ├── fileStore.ts         # 文件管理状态
│   └── publishStore.ts      # 多平台发布状态
├── hooks/               # 自定义 React Hooks（同步滚动等）
├── App.tsx              # 主应用组件
└── main.tsx             # 应用入口

extension/               # Chrome 浏览器扩展
├── manifest.json        # MV3 扩展清单
├── src/
│   ├── background.js    # Background Service Worker（适配器调度 + Cookie 检测）
│   ├── content.js       # Content Script（Web ↔ 扩展消息转发）
│   └── adapters/        # 7 个平台适配器
│       ├── juejin.js    # 掘金（API 直接调用）
│       ├── zhihu.js     # 知乎（API 直接调用）
│       ├── csdn.js      # CSDN（页面上下文注入）
│       ├── modb.js      # 墨天轮（DOM 自动化）
│       ├── c51cto.js    # 51CTO（DOM 自动化）
│       ├── itpub.js     # ITPUB（DOM 自动化）
│       └── wechat.js    # 微信公众号（官方 API）
```

## 多平台发布

支持将文章一键发布至 7 个平台，每个平台采用不同的适配策略：

| 平台 | 适配策略 | 鉴权方式 |
|------|---------|---------|
| 掘金 | API 直接调用 | Cookie (sessionid) |
| 知乎 | API 直接调用 | Cookie (z_c0) + XSRF |
| CSDN | 页面上下文注入 | Cookie + 页面注入绕过签名 |
| 墨天轮 | DOM 自动化 | Cookie |
| 51CTO | DOM 自动化 | Cookie |
| ITPUB | DOM 自动化 | Cookie |
| 微信公众号 | 官方 API | AppID + AppSecret |

功能包括：
- **一键获取 Cookie**：自动检测各平台登录状态
- **智能提取**：自动从文章中提取标签、摘要、分类、封面图
- **发布进度**：实时显示各平台发布状态（排队/发布中/成功/失败）

## 使用说明

1. **编辑**：在中间编辑区输入 Markdown 内容，右侧实时预览
2. **切换主题**：通过顶部「主题」菜单选择排版主题
3. **复制到公众号**：点击预览区右上角「复制」按钮，粘贴到微信公众号编辑器
4. **多平台发布**：通过顶部「发布」菜单打开发布控制台，选择平台后一键发布
5. **文件管理**：通过左侧边栏创建/管理多个文档

## 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages，每次推送到 master 分支即自动构建并发布。

- 配置文件：`.github/workflows/deploy.yml`
- Vite base 路径：`/mdnice-clone/`
- 线上地址：https://pc-study.github.io/mdnice-clone/

## 开发文档

- [开发任务文档](./DEVELOPMENT.md) - 项目任务拆分与进度跟踪
- [AI 接管文档](./AI-HANDOVER.md) - AI 维护指南与架构说明
- [多平台发布设计方案](./docs/mdnice-clone%20多平台一键自动发文设计方案.md) - 发布功能技术架构

## License

MIT
