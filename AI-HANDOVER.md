# AI 接管维护文档

> **重要：接管本项目前，必须先阅读以下文档，并严格遵守其中的规则。**

## 必读文档清单（按顺序阅读）

| 优先级 | 文档 | 说明 |
|--------|------|------|
| 1 | [docs/RULES.md](./docs/RULES.md) | **开发规则**（沟通、文档维护、Git 工作流、代码规范、技术栈约束）—— 必须严格遵守 |
| 2 | [docs/PROMPT.md](./docs/PROMPT.md) | **需求规格说明书**（完整功能定义、验收标准）—— 所有开发以此为准 |
| 3 | [DEVELOPMENT.md](./DEVELOPMENT.md) | **开发任务文档**（任务拆分、完成状态、开发日志）—— 了解当前进度 |
| 4 | 本文档 | 项目架构、技术决策、维护指南 |

## 核心规则速览

1. **使用中文**沟通和写文档
2. **每完成一项任务**，更新 DEVELOPMENT.md 并推送 GitHub
3. **推送前**确保 `npx tsc --noEmit` 和 `npm run build` 无报错
4. **不可更换技术栈**（React/Vite/CodeMirror 6/markdown-it/KaTeX/highlight.js/Zustand）
5. **不引入后端**，所有数据使用 localStorage
6. **功能需求以 docs/PROMPT.md 为准**，不得自行删减需求

---

## 项目简介

mdnice-clone 是 mdnice Markdown 排版编辑器的克隆版，专注于微信公众号、知乎、掘金等平台的 Markdown 排版。纯前端应用，无后端服务。

**线上地址**：https://pc-study.github.io/mdnice-clone/
**GitHub 仓库**：https://github.com/pc-study/mdnice-clone

## 技术栈

- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **编辑器**：CodeMirror 6
- **Markdown 解析**：markdown-it + 插件（footnote、task-lists、sub、sup）
- **数学公式**：KaTeX（通过 CDN 加载）
- **代码高亮**：highlight.js（主题通过 CDN 加载）
- **状态管理**：Zustand
- **数据持久化**：localStorage
- **部署**：GitHub Pages + GitHub Actions 自动部署

## 项目结构

```
mdnice-clone/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions 自动部署配置
├── docs/
│   ├── PROMPT.md               # 需求规格说明书（原始提示词）
│   └── RULES.md                # 开发规则（必须遵守）
├── src/
│   ├── components/
│   │   ├── MenuBar/
│   │   │   └── MenuBar.tsx     # 顶部菜单栏（文件/格式/主题/功能/发布/查看/设置/帮助）
│   │   ├── ThemeSelector/
│   │   │   └── ThemeSelector.tsx # 主题选择弹窗（卡片预览/分组/搜索）
│   │   ├── Publish/
│   │   │   └── PublishModal.tsx  # 多平台发布控制台弹窗
│   │   ├── Sidebar/
│   │   │   └── FileTree.tsx    # 左侧文件管理面板
│   │   ├── Editor/
│   │   │   └── MarkdownEditor.tsx  # CodeMirror 6 编辑器
│   │   ├── Preview/
│   │   │   ├── MarkdownPreview.tsx # 实时渲染预览区
│   │   │   └── PreviewToolbar.tsx  # 预览区复制按钮
│   │   ├── StatusBar/
│   │   │   └── StatusBar.tsx   # 底部状态栏（行数/字数/字符数）
│   │   └── common/
│   │       ├── Toast.tsx       # Toast 提示组件
│   │       ├── Modal.tsx       # 模态框组件
│   │       ├── Dropdown.tsx    # 下拉菜单组件
│   │       └── HelpModal.tsx   # 帮助弹窗（语法速查/快捷键/关于）
│   ├── themes/
│   │   ├── juejin/            # 32 个掘金社区主题 CSS 文件
│   │   ├── mdnice/            # 30 个 mdnice 原版主题 CSS 文件
│   │   └── index.ts            # 62 个排版主题定义（掘金 + mdnice 两组）
│   ├── codeThemes/
│   │   └── index.ts            # 12 个代码高亮主题（6 标准 + 6 Mac 三色圆点变体）
│   ├── utils/
│   │   ├── markdownParser.ts   # markdown-it 配置 + 特殊语法处理
│   │   ├── editorCommands.ts   # 编辑器命令（加粗/斜体/插入等）
│   │   ├── copyToClipboard.ts  # 富文本复制（微信/知乎/掘金）
│   │   ├── extensionBridge.ts  # Web 端与浏览器扩展通信协议
│   │   ├── articleExtractor.ts # 文章元数据智能提取（标签/摘要/分类）
│   │   ├── fileManager.ts      # 文件导入/导出
│   │   ├── footnotesConverter.ts # 微信外链转脚注
│   │   └── formatDocument.ts   # 文档格式化（中英文加空格等）
│   ├── store/
│   │   ├── editorStore.ts      # 编辑器状态
│   │   ├── themeStore.ts       # 主题状态
│   │   ├── fileStore.ts        # 文件管理状态
│   │   └── publishStore.ts     # 多平台发布状态
│   ├── hooks/
│   │   └── useSyncScroll.ts    # 双向同步滚动 Hook
│   ├── App.tsx                 # 主应用组件（布局 + 状态连接）
│   ├── main.tsx                # 应用入口
│   ├── index.css               # 全局样式
│   └── types.d.ts              # 第三方模块类型声明
├── DEVELOPMENT.md              # 开发任务文档
├── AI-HANDOVER.md              # 本文档
└── README.md                   # 项目 README
```

## 浏览器扩展结构

```
extension/                       # Chrome Extension MV3
├── manifest.json                # 扩展清单（permissions: cookies, tabs, scripting）
├── src/
│   ├── background.js            # Background Service Worker
│   │                            #   - 适配器调度（逐个执行发布）
│   │                            #   - 一键获取 Cookie / 检测登录状态
│   │                            #   - 进度回传至 Web 页面
│   ├── content.js               # Content Script
│   │                            #   - PING/PONG 扩展检测
│   │                            #   - Web ↔ Background 消息转发
│   └── adapters/                # 7 个平台适配器
│       ├── juejin.js            # 掘金（API 直接调用，Cookie sessionid）
│       ├── zhihu.js             # 知乎（API 直接调用，Cookie z_c0 + XSRF）
│       ├── csdn.js              # CSDN（页面上下文注入，绕过签名校验）
│       ├── modb.js              # 墨天轮（DOM 自动化，UEditor 兼容）
│       ├── c51cto.js            # 51CTO（DOM 自动化，TinyMCE 兼容）
│       ├── itpub.js             # ITPUB（DOM 自动化，Discuz 论坛）
│       └── wechat.js            # 微信公众号（官方 API，图片上传 + 草稿创建）
```

## 关键架构决策

1. **三栏布局**：CSS Flexbox，中间编辑区和右侧预览区通过可拖拽分割线（state: splitPos 百分比）调整宽度
2. **主题注入**：排版主题分两组——juejin-markdown-themes 社区（32 个）和 mdnice 原版（30 个），共 62 个，CSS 以 `.markdown-body` 为根选择器；主题选择通过 ThemeSelector 弹窗组件实现，卡片式预览、按来源分组、支持搜索；代码主题通过 CDN 加载（268 个），Mac 三色圆点为独立开关
3. **同步滚动**：通过 markdown-it 渲染时添加 `data-line` 属性建立源码行号与 DOM 的映射，使用 useSyncScroll hook 实现
4. **富文本复制**：将预览区 HTML 的 class 样式转为内联 style，使用 Clipboard API 写入剪贴板
5. **文件管理**：文件树为嵌套结构（FileItem[]），存储在 Zustand store 中，自动持久化到 localStorage
6. **特殊语法**：通过预处理（容器块、分列）和后处理（注音、图片尺寸）实现，在 renderMarkdown 函数中
7. **响应式**：窗口宽度 < 768px 时自动隐藏侧边栏，切换为仅编辑器模式
8. **多平台发布**：采用"纯前端 + 浏览器扩展"混合架构（参考 Wechatsync）。Web 端通过 `window.postMessage` 与扩展通信，扩展 Background Script 调度适配器执行发布。四种适配策略：API 直接调用（掘金/知乎）、页面上下文注入（CSDN）、DOM 自动化（墨天轮/51CTO/ITPUB）、官方 API（微信公众号）
9. **Cookie 检测**：扩展通过 `chrome.cookies.getAll()` 读取各平台域名下的关键 Cookie 判断登录状态，结果通过 content script 回传至 Web 页面
10. **智能提取**：纯前端实现，基于 100+ 关键词词库加权匹配提取标签（代码块语言权重10 > 标题5 > 正文1），正文首段提取摘要，标签投票推断分类

## 状态管理结构

### editorStore
- `content`: 当前编辑器内容
- `fontSize`: 编辑器字体大小（12/14/16/18）
- `lineHeight`: 编辑器行高（1.4/1.6/1.8/2.0）
- `wordWrap`: 是否自动换行
- `viewMode`: 视图模式（'both' | 'editor' | 'preview'）

### themeStore
- `currentTheme`: 当前排版主题 ID
- `currentCodeTheme`: 当前代码高亮主题 ID

### fileStore
- `files`: 文件树（FileItem[]，支持嵌套文件夹）
- `activeFileId`: 当前打开的文件 ID
- `sidebarVisible`: 侧边栏是否可见

### publishStore
- `extensionInstalled`: 浏览器扩展是否已安装
- `platforms`: 各平台配置（PlatformConfig[]，是否启用、默认分类等）
- `publishModalVisible`: 发布弹窗是否可见
- `articleMeta`: 文章元数据（标题、标签、分类、摘要、封面图）
- `publishProgress`: 各平台发布进度（idle/queued/publishing/success/failed）
- `isPublishing`: 是否正在发布
- `loginStates`: 各平台登录状态（unknown/checking/logged_in/not_logged_in）
- `isCheckingLogin`: 是否正在检测登录

## 常见维护任务

### 添加新排版主题
1. 在 `src/themes/juejin/` 或 `src/themes/mdnice/` 中创建新的 `.ts` 文件，导出 CSS 字符串（需以 `.markdown-body` 为根选择器）
2. 在 `src/themes/index.ts` 中导入并注册到 `themes` 对象，设置 `group: 'juejin'` 或 `group: 'mdnice'`
3. `themeList` 会自动包含新主题，ThemeSelector 弹窗会按分组显示

### 添加代码高亮主题
1. 在 `src/codeThemes/index.ts` 中添加新的 CSS 字符串常量
2. 在 `codeThemes` 对象中注册，设置 `id`、`name`、`css`
3. Mac 变体需额外设置 `isMac: true`

### 添加 markdown-it 插件
1. `npm install` 安装插件
2. 在 `src/types.d.ts` 中添加 `declare module` 声明（如无类型定义）
3. 在 `src/utils/markdownParser.ts` 中 `md.use()` 注册

### 添加快捷键
1. 在 `src/utils/editorCommands.ts` 中添加命令函数
2. 在 `src/components/Editor/MarkdownEditor.tsx` 的 keymap 中注册
3. 在 `src/components/MenuBar/MenuBar.tsx` 的格式菜单中添加对应项

### 修改菜单项
- 所有菜单逻辑集中在 `src/components/MenuBar/MenuBar.tsx`

### 添加新的发布平台适配器
1. 在 `extension/src/adapters/` 中创建新的 `.js` 文件，导出 `publishToXxx(data)` 函数
2. 在 `extension/src/background.js` 的 `ADAPTERS` 对象中注册新适配器
3. 在 `src/store/publishStore.ts` 的 `PlatformId` 类型和 `defaultPlatforms` 中添加新平台
4. 在 `defaultProgress` 和 `defaultLoginStates` 中添加默认状态
5. 在 `extension/src/background.js` 的 `PLATFORM_COOKIE_CONFIG` 中添加域名和关键 Cookie 配置
6. 在 `extension/manifest.json` 的 `host_permissions` 中添加新平台域名

### 修改智能提取关键词
- 关键词词库集中在 `src/utils/articleExtractor.ts`
- `LANG_KEYWORDS`：编程语言关键词
- `FRAMEWORK_KEYWORDS`：框架/库关键词
- `DOMAIN_KEYWORDS`：领域/概念关键词
- `CATEGORY_HINTS`：标签到分类的映射

### Web ↔ 扩展通信协议
- 所有消息类型定义在 `src/utils/extensionBridge.ts`
- 消息通过 `window.postMessage` 传递，content script 转发到 background
- 消息类型前缀统一为 `MDNICE_`：
  - `MDNICE_EXTENSION_PING/PONG`：扩展检测
  - `MDNICE_PUBLISH_REQUEST`：发布请求
  - `MDNICE_PUBLISH_PROGRESS`：发布进度回传
  - `MDNICE_CHECK_COOKIES`：Cookie 检测请求
  - `MDNICE_COOKIES_RESULT`：Cookie 检测结果

## 部署

- 每次 push 到 master 分支，GitHub Actions 自动构建并部署到 GitHub Pages
- 配置文件：`.github/workflows/deploy.yml`
- Vite base 路径：`/mdnice-clone/`
- 线上地址：https://pc-study.github.io/mdnice-clone/

## 当前开发进度

参见 [DEVELOPMENT.md](./DEVELOPMENT.md) 的任务列表和开发日志。

**未完成的关键任务**：
- 任务 6.3：表格插入器 UI、链接/图片输入框弹窗
- 任务 7.3：文件拖拽排序
