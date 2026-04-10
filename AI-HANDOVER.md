# AI 接管维护文档

## 项目简介
mdnice-clone 是一个 mdnice Markdown 排版编辑器的克隆版，纯前端应用，无后端服务。

## 技术栈
- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **编辑器**：CodeMirror 6
- **Markdown 解析**：markdown-it + 插件（footnote、task-lists、sub、sup）
- **数学公式**：KaTeX
- **代码高亮**：highlight.js
- **状态管理**：Zustand
- **数据持久化**：localStorage

## 项目结构
```
mdnice-clone/
├── src/
│   ├── components/          # UI 组件
│   │   ├── MenuBar/         # 顶部菜单栏
│   │   ├── Sidebar/         # 左侧文件管理
│   │   ├── Editor/          # CodeMirror 编辑器
│   │   ├── Preview/         # Markdown 预览
│   │   ├── StatusBar/       # 底部状态栏
│   │   └── common/          # 通用组件（Toast、Modal、Dropdown）
│   ├── themes/              # 排版主题定义
│   ├── codeThemes/          # 代码高亮主题
│   ├── utils/               # 工具函数
│   ├── store/               # Zustand 状态管理
│   ├── hooks/               # 自定义 Hooks
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 入口文件
├── DEVELOPMENT.md           # 开发任务文档
├── AI-HANDOVER.md           # 本文档
└── README.md                # 项目 README
```

## 关键架构决策
1. **三栏布局**：使用 CSS Flexbox，中间编辑区和右侧预览区通过可拖拽分割线调整宽度
2. **主题注入**：主题定义为 TypeScript 对象，切换时动态生成 `<style>` 标签注入预览区容器
3. **同步滚动**：通过 markdown-it 渲染时添加 `data-line` 属性建立源码行号与 DOM 的映射
4. **富文本复制**：将预览区 HTML 的 class 样式转为内联 style，使用 Clipboard API 写入剪贴板
5. **文件管理**：文件树数据结构存储在 Zustand store 中，自动持久化到 localStorage

## 状态管理结构
- **editorStore**：编辑器内容、光标位置、设置（字体大小、行高、自动换行）
- **themeStore**：当前排版主题、当前代码主题
- **fileStore**：文件树结构、当前打开的文件

## 开发约定
- 组件使用函数式组件 + Hooks
- 文件命名：组件用 PascalCase，工具函数用 camelCase
- 样式：CSS Modules（*.module.css）
- 每完成一个任务阶段，更新 DEVELOPMENT.md 并推送 GitHub

## 常见维护任务
- **添加新主题**：在 `src/themes/` 下创建新文件，导出主题对象，在 `src/themes/index.ts` 中注册
- **添加代码主题**：在 `src/codeThemes/` 中注册新的 highlight.js 主题
- **添加 markdown-it 插件**：在 `src/utils/markdownParser.ts` 中配置
- **修改菜单项**：在 `src/components/MenuBar/` 对应文件中修改

## 当前开发进度
参见 DEVELOPMENT.md 的任务列表
