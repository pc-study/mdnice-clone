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

> 一个 Markdown 排版编辑器，专注于微信公众号、知乎、掘金等平台

## 功能特性

- **实时预览**：所见即所得的编辑体验
- **多主题切换**：20+ 精美排版主题
- **一键复制**：直接粘贴到微信公众号

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, mdnice-clone!");
}
\`\`\`

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

## 表格

| 功能 | 状态 |
|------|------|
| 编辑器 | ✅ |
| 预览 | ✅ |
| 主题 | ✅ |

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
