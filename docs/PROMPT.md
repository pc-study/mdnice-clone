# AI 提示词：从零构建 mdnice Markdown 排版编辑器克隆版

## 项目总述

请从零开始构建一个功能完整的 Markdown 排版编辑器 Web 应用，该应用 1:1 复刻 mdnice（https://editor.mdnice.com/）的核心编辑器功能。技术栈使用 React + TypeScript + Vite，不需要后端服务，所有数据使用 localStorage 持久化。不需要用户登录/注册系统。

---

## 一、整体布局结构

### 1.1 三栏式布局

- **左侧边栏（可折叠，约 220px 宽）**：文件/文件夹管理面板
- **中间栏（弹性宽度，约 50%）**：Markdown 源码编辑区
- **右侧栏（弹性宽度，约 50%）**：实时渲染预览区
- 中间栏和右侧栏之间有可拖拽的分割线，支持自由调整两栏宽度比例
- 顶部为菜单栏和工具栏

### 1.2 顶部菜单栏
水平菜单栏包含以下菜单项，每个可点击展开下拉菜单：

| 菜单 | 子项 |
|------|------|
| **文件** | 新建文章、导入 .md 文件、导出 .md 文件、导出 .html 文件 |
| **格式** | 加粗、斜体、删除线、有序列表、无序列表、引用、代码块、行内代码、链接、图片、表格、分割线、TOC 目录、数学公式（行内/块级） |
| **主题** | 展示所有可选排版主题列表（见第四节），点击即切换 |
| **代码主题** | 展示所有可选代码高亮主题列表，点击即切换 |
| **功能** | 微信外链转脚注、格式化文档（Prettier 风格）、一键复制渲染结果（富文本，用于粘贴到微信公众号等平台）、复制为知乎格式、复制为掘金格式 |
| **查看** | 仅编辑器 / 仅预览 / 编辑器+预览（三种视图模式切换） |
| **设置** | 编辑器字体大小调节、编辑器行高调节、编辑器自动换行开关 |
| **帮助** | Markdown 语法速查表、快捷键列表、关于 |

### 1.3 底部状态栏
显示以下信息，实时更新：
- 当前行数
- 当前字数（中文按字计算，英文按词计算）
- 当前字符数

---

## 二、Markdown 编辑器（中间栏）

### 2.1 编辑器核心
- 使用 CodeMirror 6 作为代码编辑器内核
- 支持 Markdown 语法高亮
- 支持行号显示
- 支持自动补全括号和引号
- 支持缩进（Tab 键插入 2 或 4 空格，可在设置中调整）
- 支持编辑器内搜索替换（Ctrl/Cmd + F）
- 支持撤销/重做（Ctrl/Cmd + Z / Ctrl/Cmd + Shift + Z）

### 2.2 快捷键支持
实现以下快捷键（同时标注在菜单项右侧）：

| 快捷键 | 功能 |
|--------|------|
| Ctrl/Cmd + B | 加粗 |
| Ctrl/Cmd + I | 斜体 |
| Ctrl/Cmd + D | 删除线 |
| Ctrl/Cmd + K | 插入链接 |
| Ctrl/Cmd + Shift + I | 插入图片 |
| Ctrl/Cmd + Shift + C | 插入代码块 |
| Ctrl/Cmd + Shift + O | 有序列表 |
| Ctrl/Cmd + Shift + U | 无序列表 |
| Ctrl/Cmd + Shift + Q | 引用 |
| Alt/Opt + Cmd + L | 微信外链转脚注 |
| Alt/Opt + Cmd + F | 格式化文档 |

### 2.3 图片处理
- 支持图片拖拽上传到编辑器（将图片转为 Base64 Data URL 内嵌，或使用 localStorage 存储）
- 支持截图粘贴（Ctrl/Cmd + V 粘贴剪贴板中的图片）
- 插入图片后自动生成 `![描述](url)` 语法
- 支持 mdnice 图片尺寸语法：`![alt](url =widthxheight)` 和 `![alt](url =百分比x)`

### 2.4 编辑器与预览同步滚动
- 编辑器滚动时，预览区应同步滚动到对应位置
- 预览区滚动时，编辑器也应同步滚动
- 同步算法基于源码行号与渲染 DOM 元素的映射关系

---

## 三、实时预览区（右侧栏）

### 3.1 Markdown 渲染引擎
使用 markdown-it 作为核心解析器，并加载以下插件：
- **markdown-it-footnote**：脚注支持
- **markdown-it-task-lists**：任务列表（复选框）
- **markdown-it-sub / markdown-it-sup**：上下标
- **KaTeX**：数学公式渲染（行内 `$...$`，块级 `$$...$$`），公式转为 SVG 输出以兼容微信
- **highlight.js 或 Prism.js**：代码块语法高亮，支持以下语言：bash, clojure, cpp, cs, css, dart, dockerfile, diff, erlang, go, gradle, groovy, haskell, java, javascript, json, julia, kotlin, lisp, lua, makefile, markdown, matlab, objectivec, perl, php, python, r, ruby, rust, scala, shell, sql, swift, tex, typescript, verilog, vhdl, xml, yaml

### 3.2 特殊语法渲染
实现以下 mdnice 特有语法的解析与渲染：

#### 3.2.1 脚注
```
[文字](脚注解释 "脚注名字")
```
渲染为正文中的上标序号 `[1]`，文末自动生成「参考资料」区域列出所有脚注。

#### 3.2.2 注音符号（Ruby）
```
{文字|拼音}
```
渲染为 HTML `<ruby>` 标签。

#### 3.2.3 横滑布局（仅微信可用，预览中模拟效果）
```
<![](url1),![](url2),![](url3)>
```
渲染为水平可滚动的图片容器，并在底部显示「<<< 左右滑动见更多 >>>」提示。

#### 3.2.4 容器块
```
::: block-1
内容
:::
```
支持 `block-1`、`block-2`、`block-3` 三种容器样式，每种有不同的背景色/边框样式，可在主题 CSS 中自定义。

#### 3.2.5 分列布局
```
:::: column
::: column-left 30%
左侧内容
:::
::: column-right 70%
右侧内容
:::
::::
```
渲染为 flexbox 两列布局，支持百分比宽度设置。

#### 3.2.6 图片尺寸控制
```
![alt](url =150x150)
![alt](url =40%x)
```

### 3.3 微信公众号兼容性处理
- 所有外链自动转换为脚注格式（微信仅支持 mp.weixin.qq.com 域名链接）
- 数学公式渲染为内联 SVG
- 样式全部使用内联 style（微信不支持 class 样式）
- 图片使用 https 协议

### 3.4 预览区工具条
预览区右上角悬浮工具条：
- **复制** 按钮：将预览区的富文本（含样式）复制到剪贴板，可直接粘贴到微信公众号编辑器
- **复制为知乎格式** 按钮
- **复制为掘金格式** 按钮

---

## 四、主题系统

### 4.1 内置排版主题
至少实现以下 20 个排版主题，每个主题是一套完整的 CSS 样式，控制预览区中所有 Markdown 元素的外观：

1. **橙心**：橙色调，温暖清新
2. **姹紫**：紫色调，优雅大气
3. **绿意**：绿色调，自然清爽
4. **蓝蓝**：蓝色调，沉稳内敛
5. **科技蓝**：深蓝科技风
6. **兰青**：青蓝色调
7. **极客黑**：暗色/深色主题
8. **全栈蓝**：程序员风格蓝色
9. **嫩青**：浅青色，清新淡雅
10. **凝夜紫**：深紫暗色主题
11. **简**：极简黑白风格
12. **墨黑**：纯黑底白字
13. **前端之巅**：前端社区风格
14. **红绯**：红色调，热情奔放
15. **山吹**：黄色调，明亮温暖
16. **v-green**：Vue 风格绿色
17. **橙蓝风**：橙蓝撞色
18. **萌绿**：浅绿可爱风
19. **微绿**：微信绿色调
20. **极简黑**：另一种极简暗色

### 4.2 每个主题需要覆盖的 CSS 选择器
每个主题必须为以下 Markdown 元素定义完整样式：
- 全局容器（字体、字号、行高、颜色、背景色）
- 一级标题 ~ 六级标题（字号、颜色、字重、边框/装饰、间距）
- 段落文本
- 粗体、斜体、粗斜体
- 有序列表、无序列表（列表标记颜色/样式、缩进）
- 引用块（边框颜色、背景色、文字颜色）
- 多级引用
- 代码块（背景色、圆角、内边距，实际高亮颜色由代码主题控制）
- 行内代码（背景色、字体、颜色）
- 表格（表头样式、边框、奇偶行背景色）
- 图片（圆角、阴影、居中方式、图注样式）
- 链接（颜色、下划线）
- 分割线（颜色、样式）
- 脚注区域
- 删除线
- 容器块 block-1/2/3

### 4.3 代码高亮主题
集成至少以下代码高亮主题：
- **微信代码主题**（仿微信公众号官方代码样式，带行号，不换行）
- **atom-one-dark**
- **atom-one-light**
- **monokai**
- **github**
- **vs2015**
- **xcode**
- **a11y-dark**
- **dracula**

代码块显示需包含：
- 左侧行号
- 右上角语言标识
- 语法高亮

### 4.4 主题切换机制
- 主题切换时，预览区实时更新样式
- 当前选中主题需在菜单中高亮显示（打勾或高亮）
- 主题选择持久化到 localStorage

---

## 五、文件管理系统（左侧边栏）

### 5.1 文件树
- 支持创建文件夹和文件
- 支持文件/文件夹重命名
- 支持文件/文件夹删除（带确认提示）
- 支持文件拖拽排序
- 文件树数据持久化到 localStorage
- 每个文件存储：文件名、创建时间、修改时间、Markdown 内容

### 5.2 文件操作
- 点击文件切换到该文件进行编辑
- 当前编辑的文件在文件树中高亮显示
- 新建文件时自动填入默认的 Markdown 模板内容（包含常见语法示例）
- 支持导入外部 .md 文件到文件树
- 支持导出当前文件为 .md 或 .html

---

## 六、发布/导出功能

### 6.1 一键复制（核心功能）
这是 mdnice 最核心的功能，实现要求如下：

#### 复制为微信公众号格式
- 将预览区内容转换为微信兼容的 HTML
- 所有 CSS 样式内联（使用 style 属性，不用 class）
- 外链自动转脚注
- 数学公式转 SVG
- 图片保持原始 URL（粘贴到微信后会自动上传到微信服务器）
- 使用 `document.execCommand('copy')` 或 Clipboard API 复制富文本到剪贴板
- 复制成功后显示 Toast 提示

#### 复制为知乎格式
- 知乎支持大部分 HTML 标签
- 无需转脚注
- 保留外链

#### 复制为掘金格式
- 保留 Markdown 源码格式
- 或转为掘金兼容的 HTML

### 6.2 导出功能
- 导出为 .md 文件（纯 Markdown 源码）
- 导出为 .html 文件（完整 HTML 页面，内含主题 CSS 和渲染后的内容）

---

## 七、功能性细节

### 7.1 微信外链转脚注
自动扫描文档中所有非微信域名的链接 `[文字](url)`，转换为脚注格式，在文末生成「参考资料」部分，格式：
```
[1] 链接文字: url
[2] 链接文字: url
```

### 7.2 格式化文档
对当前 Markdown 内容进行格式化：
- 中英文之间自动加空格（pangu.js 风格）
- 统一列表标记符号
- 统一标题格式
- 移除多余空行

### 7.3 快捷插入
通过「格式」菜单或快捷键快捷插入 Markdown 语法模板：
- 插入表格时弹出行列数选择器（类似 Word 的表格插入 UI）
- 插入链接/图片时弹出输入框填写 URL 和描述
- 插入代码块时可选择语言

---

## 八、UI/UX 设计要求

### 8.1 视觉风格
- 整体风格简洁、专业，参考 mdnice 原版设计
- 顶部菜单栏背景色为白色，文字为深灰色，间距适中
- 左侧边栏浅灰色背景
- 编辑区使用等宽字体（如 Fira Code、Source Code Pro、Menlo）
- 预览区使用系统默认衬线/无衬线字体，由主题决定
- 响应式设计：窄屏时自动隐藏左侧边栏，可切换为仅编辑器或仅预览模式

### 8.2 交互细节
- 菜单项 hover 时有背景色变化
- 下拉菜单有适当的阴影和圆角
- 主题切换有平滑过渡动画
- Toast 提示自动消失（3 秒）
- 文件操作有右键上下文菜单
- 编辑器和预览区分割线可拖拽，拖拽时有视觉反馈

### 8.3 配色参考
- 菜单栏：`#ffffff` 背景，`#333333` 文字
- 左侧边栏：`#f7f7f7` 背景
- 编辑区：`#ffffff` 背景，`#24292e` 文字
- 分割线：`#e0e0e0`
- 主色调：`#35b378`（mdnice 品牌绿）
- 强调色/选中态：`#35b378`

---

## 九、技术实现要求

### 9.1 技术栈
- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **编辑器**：CodeMirror 6（@codemirror/view, @codemirror/state, @codemirror/lang-markdown）
- **Markdown 解析**：markdown-it + 相关插件
- **数学公式**：KaTeX
- **代码高亮**：highlight.js
- **样式方案**：CSS Modules 或 Tailwind CSS + 主题动态注入
- **状态管理**：Zustand 或 React Context
- **数据持久化**：localStorage
- **复制功能**：Clipboard API（navigator.clipboard.write）
- **文件操作**：File API（FileReader、Blob、download）

### 9.2 项目结构
```
src/
├── components/
│   ├── MenuBar/              # 顶部菜单栏
│   │   ├── FileMenu.tsx
│   │   ├── FormatMenu.tsx
│   │   ├── ThemeMenu.tsx
│   │   ├── CodeThemeMenu.tsx
│   │   ├── FunctionMenu.tsx
│   │   ├── ViewMenu.tsx
│   │   ├── SettingsMenu.tsx
│   │   └── HelpMenu.tsx
│   ├── Sidebar/              # 左侧文件管理
│   │   ├── FileTree.tsx
│   │   └── FileItem.tsx
│   ├── Editor/               # Markdown 编辑器
│   │   └── MarkdownEditor.tsx
│   ├── Preview/              # 实时预览
│   │   ├── MarkdownPreview.tsx
│   │   └── PreviewToolbar.tsx
│   ├── StatusBar/            # 底部状态栏
│   │   └── StatusBar.tsx
│   └── common/               # 通用组件
│       ├── Toast.tsx
│       ├── Modal.tsx
│       └── Dropdown.tsx
├── themes/                   # 排版主题 CSS
│   ├── orangeHeart.ts        # 橙心
│   ├── purple.ts             # 姹紫
│   ├── green.ts              # 绿意
│   └── ...                   # 其他主题
├── codeThemes/               # 代码高亮主题
│   └── index.ts
├── utils/
│   ├── markdownParser.ts     # markdown-it 配置和自定义插件
│   ├── copyToClipboard.ts    # 富文本复制逻辑
│   ├── inlineStyles.ts       # CSS 内联转换工具
│   ├── footnotesConverter.ts # 外链转脚注
│   ├── formatDocument.ts     # 文档格式化
│   └── fileManager.ts        # 文件管理 CRUD
├── store/                    # 状态管理
│   ├── editorStore.ts        # 编辑器状态
│   ├── themeStore.ts         # 主题状态
│   └── fileStore.ts          # 文件状态
├── hooks/
│   ├── useSyncScroll.ts      # 同步滚动 Hook
│   └── useAutoSave.ts        # 自动保存 Hook
├── App.tsx
├── main.tsx
└── index.css
```

### 9.3 关键实现细节

#### 主题注入方式
每个主题定义为一个 TypeScript 对象，包含所有 CSS 规则。切换主题时，动态生成 `<style>` 标签注入到预览区的 Shadow DOM 或 scoped 容器中，确保主题样式不影响编辑器 UI。

#### 富文本复制实现
```typescript
// 核心思路
async function copyRichText(html: string) {
  // 1. 将所有 class 样式转为内联 style
  const inlinedHtml = convertToInlineStyles(html, currentThemeCSS);
  // 2. 创建 ClipboardItem
  const blob = new Blob([inlinedHtml], { type: 'text/html' });
  const item = new ClipboardItem({ 'text/html': blob });
  // 3. 写入剪贴板
  await navigator.clipboard.write([item]);
}
```

#### 同步滚动实现
```typescript
// 核心思路：通过 data-line 属性建立映射
// 1. markdown-it 渲染时为每个块级元素添加 data-line="源码行号"
// 2. 编辑器滚动时，计算当前可见的第一行行号
// 3. 在预览区找到对应 data-line 的元素，滚动到该位置
// 4. 反向同理
```

### 9.4 性能优化
- Markdown 渲染使用防抖（300ms），避免每次击键都重新渲染
- 大文档（> 10000 字符）时使用虚拟滚动或分段渲染
- 主题 CSS 缓存，切换时不重复解析
- 文件自动保存使用防抖（1 秒）

---

## 十、开发步骤建议

按以下顺序逐步实现：

1. **项目初始化**：Vite + React + TypeScript 项目搭建，安装所有依赖
2. **基础布局**：实现三栏布局 + 可拖拽分割线 + 顶部菜单栏骨架 + 底部状态栏
3. **编辑器集成**：集成 CodeMirror 6，实现 Markdown 语法高亮和基础编辑功能
4. **预览引擎**：集成 markdown-it + 插件，实现基础 Markdown 渲染
5. **同步滚动**：实现编辑器和预览区的双向同步滚动
6. **主题系统**：实现 20 个排版主题 + 代码主题切换
7. **特殊语法**：实现脚注、注音、容器块、分列、横滑等 mdnice 特有语法
8. **快捷键与格式菜单**：实现所有快捷键和格式插入功能
9. **文件管理**：实现左侧文件树的 CRUD 和持久化
10. **复制与导出**：实现核心的富文本复制（微信/知乎/掘金）和文件导出功能
11. **UI 打磨**：完善交互细节、动画、响应式、Toast 等
12. **测试与优化**：性能优化、Edge Case 处理、跨浏览器兼容性

---

## 十一、验收标准

- [ ] 打开应用能看到完整的三栏布局，顶部菜单栏和底部状态栏
- [ ] 在编辑器中输入 Markdown 内容，右侧预览区实时渲染
- [ ] 所有标准 Markdown 语法正确渲染（标题、列表、引用、表格、代码块、图片、链接等）
- [ ] 数学公式正确渲染为 SVG
- [ ] 代码块支持多语言语法高亮
- [ ] 可以在 20 个排版主题间自由切换，预览区立即生效
- [ ] 可以切换代码高亮主题
- [ ] 编辑器和预览区同步滚动
- [ ] 点击「复制」按钮后，粘贴到微信公众号编辑器中样式正确保留
- [ ] 文件树可以创建/重命名/删除文件和文件夹
- [ ] 所有快捷键正常工作
- [ ] 状态栏实时显示行数、字数、字符数
- [ ] 页面刷新后数据不丢失（localStorage 持久化）
- [ ] 微信外链转脚注功能正常
- [ ] 格式化文档功能正常
- [ ] 导入/导出 .md 和 .html 文件正常
