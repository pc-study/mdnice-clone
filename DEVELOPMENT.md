# mdnice-clone 项目开发文档

## 项目概述
从零构建 mdnice Markdown 排版编辑器克隆版，技术栈：React 18 + TypeScript + Vite + CodeMirror 6 + markdown-it

## 任务列表

### 阶段一：项目初始化与基础布局 ✅
- [x] 任务 1.1：创建 GitHub 私人仓库
- [x] 任务 1.2：Vite + React + TypeScript 项目初始化
- [x] 任务 1.3：安装所有核心依赖包
- [x] 任务 1.4：实现三栏布局（左侧边栏 + 编辑区 + 预览区）
- [x] 任务 1.5：实现可拖拽分割线
- [x] 任务 1.6：实现顶部菜单栏骨架
- [x] 任务 1.7：实现底部状态栏

### 阶段二：编辑器集成 ✅
- [x] 任务 2.1：集成 CodeMirror 6 编辑器
- [x] 任务 2.2：实现 Markdown 语法高亮
- [x] 任务 2.3：实现行号显示、自动补全括号
- [x] 任务 2.4：实现快捷键系统

### 阶段三：预览引擎 ✅
- [x] 任务 3.1：集成 markdown-it 及插件
- [x] 任务 3.2：实现 KaTeX 数学公式渲染
- [x] 任务 3.3：实现代码块语法高亮
- [x] 任务 3.4：实现 mdnice 特殊语法（脚注、注音、容器块、分列、横滑）

### 阶段四：同步滚动 ✅
- [x] 任务 4.1：实现编辑器到预览区的同步滚动
- [x] 任务 4.2：实现预览区到编辑器的同步滚动

### 阶段五：主题系统 ✅
- [x] 任务 5.1：实现主题引擎和动态注入机制
- [x] 任务 5.2：集成 31 个掘金社区排版主题（juejin-markdown-themes）
- [x] 任务 5.3：实现代码高亮主题（CDN 加载，支持所有 highlight.js 样式 268 个）
- [x] 任务 5.4：主题切换与持久化

### 阶段六：快捷键与格式菜单 ✅
- [x] 任务 6.1：实现所有快捷键（9 组）
- [x] 任务 6.2：实现格式菜单的快捷插入功能
- [x] 任务 6.3：实现表格插入器、链接/图片输入框

### 阶段七：文件管理系统 ✅
- [x] 任务 7.1：实现文件树组件
- [x] 任务 7.2：实现文件/文件夹 CRUD
- [x] 任务 7.3：实现文件拖拽排序
- [x] 任务 7.4：实现文件数据 localStorage 持久化

### 阶段八：复制与导出 ✅
- [x] 任务 8.1：实现 CSS 内联转换工具
- [x] 任务 8.2：实现微信公众号格式富文本复制
- [x] 任务 8.3：实现知乎格式复制
- [x] 任务 8.4：实现掘金格式复制
- [x] 任务 8.5：实现 .md / .html 导出

### 阶段九：功能完善 ✅
- [x] 任务 9.1：微信外链转脚注
- [x] 任务 9.2：格式化文档（中英文加空格等）
- [x] 任务 9.3：图片拖拽上传和粘贴
- [x] 任务 9.4：图片尺寸语法支持

### 阶段十：UI 打磨与优化 ✅
- [x] 任务 10.1：响应式设计
- [x] 任务 10.2：交互动画与过渡效果
- [x] 任务 10.3：右键上下文菜单
- [x] 任务 10.4：性能优化（防抖、缓存）

### 阶段十一：多平台一键发布 ✅
- [x] 任务 11.1：前端 UI 改造（发布菜单、PublishModal 发布控制台、publishStore 状态管理）
- [x] 任务 11.2：Web ↔ 扩展通信协议（extensionBridge.ts，PING/PONG 检测、发布请求/进度回传）
- [x] 任务 11.3：Chrome 扩展骨架（MV3 manifest、content script、background service worker）
- [x] 任务 11.4：掘金适配器（API 直接调用，Cookie sessionid 鉴权）
- [x] 任务 11.5：知乎适配器（API 直接调用，Cookie z_c0 + XSRF 鉴权）
- [x] 任务 11.6：CSDN 适配器（页面上下文注入，绕过 x-ca-signature 签名校验）
- [x] 任务 11.7：墨天轮适配器（DOM 自动化，UEditor 兼容）
- [x] 任务 11.8：51CTO 适配器（DOM 自动化，TinyMCE/CodeMirror 兼容）
- [x] 任务 11.9：ITPUB 适配器（DOM 自动化，Discuz 论坛架构）
- [x] 任务 11.10：微信公众号适配器（官方 API，AppID + AppSecret，图片上传 + 草稿创建）
- [x] 任务 11.11：一键获取 Cookie / 检测各平台登录状态
- [x] 任务 11.12：文章元数据智能提取（标签、摘要、分类、封面图自动生成）

### 待完善任务
- 所有任务已完成 ✅

## 开发日志

### 2026-04-10
- 创建 GitHub 私人仓库 https://github.com/pc-study/mdnice-clone
- 初始化 Vite + React + TypeScript 项目
- 安装核心依赖：CodeMirror 6、markdown-it、KaTeX、highlight.js、zustand 等
- 完成阶段一：三栏布局、可拖拽分割线、菜单栏、状态栏
- 完成阶段二：CodeMirror 6 编辑器集成、语法高亮、行号、自动补全
- 完成阶段三：markdown-it 预览引擎、KaTeX 公式、代码高亮
- 完成阶段四：双向同步滚动（useSyncScroll hook）
- 完成阶段五：20 个排版主题 + 8 个代码主题 + 主题持久化
- 完成阶段六：9 组快捷键 + 格式菜单连接编辑器命令
- 完成阶段七：文件树 CRUD + localStorage 持久化
- 完成阶段八：富文本复制（微信/知乎/掘金）+ 文件导入导出
- 完成阶段九：微信外链转脚注 + 文档格式化
- 完成阶段十：UI 打磨、特殊语法、帮助系统、响应式设计
- 配置 GitHub Actions 自动部署到 GitHub Pages
- 线上地址：https://pc-study.github.io/mdnice-clone/
- 替换排版主题为掘金社区主题（juejin-markdown-themes），共 31 个
- 修复预览区渲染质量（CSS reset 冲突、padding、代码块样式）
- 实现 Mac 代码主题三色圆点（红/黄/绿，CSS ::before/::after 伪元素）
- 代码主题扩展为 12 个（6 标准 + 6 Mac 变体）
- 代码高亮主题改为 CDN 加载，支持所有 highlight.js 样式（268 个：22 常用 + 80 标准 + 166 Base16）
- 排版主题的 highlight 字段生效，切换排版主题时自动切换对应代码高亮主题
- Mac 三色圆点改为独立开关，可搭配任意代码主题使用
- 代码主题下拉菜单按 常用/标准/Base16 分组展示

### 2026-04-10（第二轮）
- 从 git 历史恢复 30 个 mdnice 原版主题（橙心、姹紫、凝夜紫、极客黑等经典主题）
- 重组主题目录结构：juejin/（32个掘金社区主题）、mdnice/（30个原版主题）
- 主题文件从数字编号重命名为语义化命名（如 theme_1.ts → orange-heart.ts）
- 新增 ThemeSelector 弹窗组件：卡片式主题预览、按来源分组、搜索过滤
- 菜单栏「主题」改为打开主题选择弹窗，替代原有的下拉菜单
- 排版主题总数从 32 个扩展到 62 个

### 2026-04-10（第三轮）
- 完成任务 6.3：表格插入器 UI（类似 Word 的行列选择器，最大 8×8）
- 完成任务 6.3：链接/图片插入弹窗（输入文字和 URL，支持回车提交）
- 完成任务 7.3：文件拖拽排序（支持同级排序和拖入文件夹）
- 改进文件/文件夹删除体验：hover 时显示删除按钮（✕），右键菜单删除保留
- 删除确认提示区分文件和文件夹，文件夹提示将删除所有内容
- 格式菜单新增「TOC 目录」选项，插入 `[TOC]` 标记自动生成目录
- 新增 editorCommands：insertTOC、insertLinkWithDialog、insertImageWithDialog

### 2026-04-11（多平台一键发布）
- 阅读并分析《多平台一键自动发文设计方案》
- 完成前端 UI 改造：MenuBar 新增「发布」菜单、PublishModal 发布控制台弹窗、publishStore 状态管理
- 新增 extensionBridge.ts：Web 端与浏览器扩展的通信协议（PING/PONG 检测、发布请求、进度回传、Cookie 检测）
- 新增 Chrome 扩展骨架（MV3）：manifest.json、content.js（消息转发）、background.js（适配器调度）
- 完成 7 个平台适配器：
  - 掘金（API 直接调用，Cookie sessionid）
  - 知乎（API 直接调用，Cookie z_c0 + XSRF Token）
  - CSDN（页面上下文注入，绕过 x-ca-signature）
  - 墨天轮（DOM 自动化，UEditor iframe 兼容）
  - 51CTO（DOM 自动化，TinyMCE/CodeMirror 兼容）
  - ITPUB（DOM 自动化，Discuz 论坛，不自动提交）
  - 微信公众号（官方 API，图片上传至素材库 + draft/add 创建草稿）
- 新增一键获取 Cookie 功能：Background 并行检测 7 个平台的关键 Cookie 登录状态
- 新增文章元数据智能提取（articleExtractor.ts）：
  - 标签提取：代码块语言(权重10) > 标题关键词(权重5) > 正文频次(权重1)，100+ 关键词词库
  - 摘要提取：跳过标题/代码块/图片，取正文前 150 字并清理 Markdown 语法
  - 分类推断：根据标签投票推断技术领域
  - 封面图：自动提取文章中第一张图片
- PublishModal 新增「智能提取」按钮，首次打开自动填充；标签药丸样式展示
- 所有代码通过 TypeScript 类型检查和 Vite 生产构建
- 更新所有文档（README.md、DEVELOPMENT.md、AI-HANDOVER.md）
