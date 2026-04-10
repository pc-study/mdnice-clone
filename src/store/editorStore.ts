import { create } from 'zustand';

interface EditorState {
  content: string;
  setContent: (content: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineHeight: number;
  setLineHeight: (height: number) => void;
  wordWrap: boolean;
  setWordWrap: (wrap: boolean) => void;
  viewMode: 'both' | 'editor' | 'preview';
  setViewMode: (mode: 'both' | 'editor' | 'preview') => void;
}

const DEFAULT_CONTENT = `# 欢迎使用 mdnice-clone

> 请使用 **Chrome** 浏览器以获得最佳体验。
>
> 本文涵盖所有支持的 Markdown 语法，可直接复制到微信公众号中预览效果。

## 1 基础语法

### 1.1 标题

在文字前书写不同数量的 \`#\` 可完成不同级别的标题，如下：

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

### 1.2 无序列表

无序列表的使用，在符号 \`-\` 后加空格使用：

- 无序列表 1
- 无序列表 2
  - 无序列表 2.1
  - 无序列表 2.2

**由于微信原因，最多支持到二级列表。**

### 1.3 有序列表

有序列表的使用，在数字及符号 \`.\` 后加空格输入内容：

1. 有序列表 1
2. 有序列表 2
3. 有序列表 3

### 1.4 粗体和斜体

**这个是粗体**

*这个是斜体*

***这个是粗体加斜体***

~~这个是删除线~~

### 1.5 链接

微信公众号仅支持公众号文章链接，即域名为 \`https://mp.weixin.qq.com/\` 的合法链接。

使用方法如下：[链接文字](https://example.com)

> 提示：使用「功能 → 微信外链转脚注」可自动将外链转为脚注格式。

### 1.6 引用

引用的格式是在符号 \`>\` 后面书写文字：

> ### 一级引用示例
>
> 读一本好书，就是在和高尚的人谈话。**——歌德**

多级引用：

>> ### 二级引用示例
>>
>> 知识就是力量。**——培根**

>>> ### 三级引用示例
>>>
>>> 学而不思则罔，思而不学则殆。**——孔子**

### 1.7 分割线

可以在一行中用三个以上的减号来建立一个分隔线：

---

### 1.8 表格

可以使用冒号来定义表格的对齐方式：

| 姓名 | 年龄 | 工作 |
| :--- | :---: | ---: |
| 小可爱 | 18 | 吃可爱多 |
| 小勇敢 | 20 | 爬棵勇敢树 |
| 小机智 | 22 | 看一本机智书 |

宽表格可水平滚动：

| 姓名 | 年龄 | 工作 | 邮箱 | 手机 |
| :--- | :---: | ---: | :---: | :---: |
| 小可爱 | 18 | 吃可爱多 | lovely@test.com | 18812345678 |
| 小勇敢 | 20 | 爬棵勇敢树 | brave@test.com | 17712345678 |
| 小机智 | 22 | 看一本机智书 | smart@test.com | 16612345678 |

### 1.9 任务列表

- [x] 已完成任务
- [x] 已完成任务
- [ ] 未完成任务

### 1.10 图片

插入图片格式如下：

![示例图片](https://via.placeholder.com/400x200/35b378/ffffff?text=mdnice-clone)

## 2 代码

### 2.1 行内代码

如果在一个行内需要引用代码，只要用反引号引起来就好，如：Use the \`printf()\` function.

### 2.2 代码块

在需要高亮的代码块前后使用三个反引号，第一行反引号后表示语言：

\`\`\`javascript
// JavaScript 示例
function hello(name) {
  console.log(\\\`Hello, \\\${name}!\\\`);
  return { greeting: "你好世界" };
}

hello("mdnice-clone");
\`\`\`

\`\`\`python
# Python 示例
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

\`\`\`css
/* CSS 示例 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
}
\`\`\`

\`\`\`diff
+ 新增项
- 删除项
  未变更项
\`\`\`

支持语言：bash, javascript, typescript, python, java, go, rust, cpp, css, json, sql, markdown, diff 等。

## 3 数学公式

行内公式：$E = mc^2$，化学公式：$H_2O$

块级公式：

$$
H(D_2) = -\\left(\\frac{2}{4}\\log_2 \\frac{2}{4} + \\frac{2}{4}\\log_2 \\frac{2}{4}\\right) = 1
$$

矩阵：

$$
\\begin{pmatrix}
1 & a_1 & a_1^2 & \\cdots & a_1^n \\\\
1 & a_2 & a_2^2 & \\cdots & a_2^n \\\\
\\vdots & \\vdots & \\vdots & \\ddots & \\vdots \\\\
1 & a_m & a_m^2 & \\cdots & a_m^n
\\end{pmatrix}
$$

> 公式由于微信不支持，会转成 SVG 格式，矢量不失真。

## 4 特殊语法

### 4.1 脚注

有人认为在[大前端时代](https://en.wikipedia.org/wiki/Front-end_web_development "Front-end web development")的背景下，移动端开发将逐步退出历史舞台。

[全栈工程师](是指掌握多种技能，并能利用多种技能独立完成产品的人。 "什么是全栈工程师")在业务开发流程中起到了至关重要的作用。

> 脚注内容请拉到文末查看。

### 4.2 注音符号

支持注音符号，用法如下：

Markdown Nice 这么好用，简直是{喜大普奔|xǐ dà pǔ bēn}呀！

{青青子衿|qīng qīng zǐ jīn}，{悠悠我心|yōu yōu wǒ xīn}。

### 4.3 容器块

::: block-1
**提示块**：这是 block-1 容器样式，适合用来展示提示信息。
:::

::: block-2
**警告块**：这是 block-2 容器样式，适合用来展示警告信息。
:::

::: block-3
**信息块**：这是 block-3 容器样式，适合用来展示一般信息。
:::

### 4.4 分列布局

:::: column
::: column-left 40%
**左侧内容**

这是左侧列，占 40% 宽度。支持任意 Markdown 语法。

- 列表项 1
- 列表项 2
:::
::: column-right 60%
**右侧内容**

这是右侧列，占 60% 宽度。可以放置代码、表格等。

| 项目 | 值 |
|------|------|
| A | 100 |
| B | 200 |
:::
::::

### 4.5 上标和下标

这是上标：X^2^ + Y^2^ = Z^2^

这是下标：H~2~O 是水的化学式

## 5 快捷键

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

## 6 使用指南

1. **编辑**：在左侧编辑区输入 Markdown 内容，右侧实时预览
2. **切换主题**：点击顶部「主题」选择 62 个排版主题中的任意一个
3. **代码主题**：点击「代码主题」选择 268 个代码高亮主题
4. **复制到公众号**：点击预览区右上角「复制」按钮，粘贴到微信公众号编辑器
5. **文件管理**：通过左侧边栏创建 / 管理多个文档
6. **格式化**：使用「功能 → 格式化文档」自动添加中英文空格
7. **外链转脚注**：使用「功能 → 微信外链转脚注」自动处理外链

---

**开始编辑吧！**
`;

export const useEditorStore = create<EditorState>((set) => ({
  content: localStorage.getItem('mdnice-content') || DEFAULT_CONTENT,
  setContent: (content) => {
    localStorage.setItem('mdnice-content', content);
    set({ content });
  },
  fontSize: parseInt(localStorage.getItem('mdnice-fontSize') || '14'),
  setFontSize: (fontSize) => {
    localStorage.setItem('mdnice-fontSize', String(fontSize));
    set({ fontSize });
  },
  lineHeight: parseFloat(localStorage.getItem('mdnice-lineHeight') || '1.6'),
  setLineHeight: (lineHeight) => {
    localStorage.setItem('mdnice-lineHeight', String(lineHeight));
    set({ lineHeight });
  },
  wordWrap: localStorage.getItem('mdnice-wordWrap') !== 'false',
  setWordWrap: (wordWrap) => {
    localStorage.setItem('mdnice-wordWrap', String(wordWrap));
    set({ wordWrap });
  },
  viewMode: (localStorage.getItem('mdnice-viewMode') as EditorState['viewMode']) || 'both',
  setViewMode: (viewMode) => {
    localStorage.setItem('mdnice-viewMode', viewMode);
    set({ viewMode });
  },
}));
