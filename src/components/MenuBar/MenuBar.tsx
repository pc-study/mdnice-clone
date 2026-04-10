import React from 'react';
import { Dropdown } from '../common/Dropdown';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';
import { useFileStore } from '../../store/fileStore';
import { themeList } from '../../themes';
import { codeThemeList } from '../../codeThemes';
import { importMarkdownFile, exportMarkdown, exportHTML } from '../../utils/fileManager';
import { copyAsWechat, copyAsZhihu, copyAsJuejin } from '../../utils/copyToClipboard';
import { formatDocument } from '../../utils/formatDocument';
import { convertLinksToFootnotes } from '../../utils/footnotesConverter';
import { renderMarkdown } from '../../utils/markdownParser';
import { themes } from '../../themes';
import { EditorView } from '@codemirror/view';
import {
  wrapSelection,
  prefixLines,
  prefixLinesOrdered,
  insertCodeBlock,
  insertLink,
  insertImage,
  insertTable,
  insertHorizontalRule,
  insertInlineCode,
} from '../../utils/editorCommands';

interface MenuBarProps {
  onToast?: (msg: string) => void;
  previewRef?: React.RefObject<HTMLDivElement | null>;
  editorViewRef?: React.MutableRefObject<EditorView | null>;
  onShowMarkdownHelp?: () => void;
  onShowShortcuts?: () => void;
  onShowAbout?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({ onToast, previewRef, editorViewRef, onShowMarkdownHelp, onShowShortcuts, onShowAbout }) => {
  const { content, setContent, viewMode, setViewMode, fontSize, setFontSize, lineHeight, setLineHeight, wordWrap, setWordWrap } = useEditorStore();
  const { currentTheme, setCurrentTheme, currentCodeTheme, setCurrentCodeTheme, macStyleEnabled, setMacStyleEnabled } = useThemeStore();
  const { addFile, setActiveFileId, activeFileId, updateFileContent } = useFileStore();

  const toast = (msg: string) => onToast?.(msg);

  const fileItems = [
    {
      label: '新建文章',
      onClick: () => {
        const file = addFile('未命名文章.md', null);
        setActiveFileId(file.id);
        setContent(file.content || '');
        toast('已创建新文章');
      },
    },
    {
      label: '导入 .md 文件',
      onClick: async () => {
        try {
          const { name, content: fileContent } = await importMarkdownFile();
          const file = addFile(name, null);
          updateFileContent(file.id, fileContent);
          setActiveFileId(file.id);
          setContent(fileContent);
          toast(`已导入: ${name}`);
        } catch {
          // User cancelled or error
        }
      },
    },
    { divider: true, label: '' },
    {
      label: '导出 .md 文件',
      onClick: () => {
        const filename = activeFileId ? '文章' : '文章';
        exportMarkdown(content, filename);
        toast('已导出 Markdown 文件');
      },
    },
    {
      label: '导出 .html 文件',
      onClick: () => {
        const html = renderMarkdown(content);
        const themeCSS = themes[currentTheme]?.css || '';
        exportHTML(html, themeCSS, '文章');
        toast('已导出 HTML 文件');
      },
    },
  ];

  const ev = () => editorViewRef?.current;

  const formatItems = [
    { label: '加粗', shortcut: 'Ctrl+B', onClick: () => { if (ev()) wrapSelection(ev()!, '**', '**'); } },
    { label: '斜体', shortcut: 'Ctrl+I', onClick: () => { if (ev()) wrapSelection(ev()!, '*', '*'); } },
    { label: '删除线', shortcut: 'Ctrl+D', onClick: () => { if (ev()) wrapSelection(ev()!, '~~', '~~'); } },
    { divider: true, label: '' },
    { label: '有序列表', shortcut: 'Ctrl+Shift+O', onClick: () => { if (ev()) prefixLinesOrdered(ev()!); } },
    { label: '无序列表', shortcut: 'Ctrl+Shift+U', onClick: () => { if (ev()) prefixLines(ev()!, '- '); } },
    { label: '引用', shortcut: 'Ctrl+Shift+Q', onClick: () => { if (ev()) prefixLines(ev()!, '> '); } },
    { divider: true, label: '' },
    { label: '代码块', shortcut: 'Ctrl+Shift+C', onClick: () => { if (ev()) insertCodeBlock(ev()!); } },
    { label: '行内代码', onClick: () => { if (ev()) insertInlineCode(ev()!); } },
    { label: '链接', shortcut: 'Ctrl+K', onClick: () => { if (ev()) insertLink(ev()!); } },
    { label: '图片', shortcut: 'Ctrl+Shift+I', onClick: () => { if (ev()) insertImage(ev()!); } },
    { label: '表格', onClick: () => { if (ev()) insertTable(ev()!); } },
    { label: '分割线', onClick: () => { if (ev()) insertHorizontalRule(ev()!); } },
  ];

  const themeItems = themeList.map((t) => ({
    label: t.name,
    checked: currentTheme === t.id,
    onClick: () => setCurrentTheme(t.id),
  }));

  const codeThemeItems: { label: string; checked?: boolean; onClick?: () => void; divider?: boolean }[] = [
    {
      label: macStyleEnabled ? 'Mac 风格: 开启' : 'Mac 风格: 关闭',
      checked: macStyleEnabled,
      onClick: () => setMacStyleEnabled(!macStyleEnabled),
    },
    { label: '', divider: true },
    ...codeThemeList.map((t) =>
      t.divider
        ? { label: t.name, divider: true }
        : { label: t.name, checked: currentCodeTheme === t.id, onClick: () => setCurrentCodeTheme(t.id) }
    ),
  ];

  const functionItems = [
    {
      label: '微信外链转脚注',
      shortcut: 'Alt+Cmd+L',
      onClick: () => {
        const converted = convertLinksToFootnotes(content);
        setContent(converted);
        if (activeFileId) updateFileContent(activeFileId, converted);
        toast('已转换外链为脚注');
      },
    },
    {
      label: '格式化文档',
      shortcut: 'Alt+Cmd+F',
      onClick: () => {
        const formatted = formatDocument(content);
        setContent(formatted);
        if (activeFileId) updateFileContent(activeFileId, formatted);
        toast('文档已格式化');
      },
    },
    { divider: true, label: '' },
    {
      label: '一键复制（微信公众号）',
      onClick: async () => {
        if (previewRef?.current) {
          try {
            await copyAsWechat(previewRef.current);
            toast('已复制到剪贴板（微信格式）');
          } catch { toast('复制失败'); }
        }
      },
    },
    {
      label: '复制为知乎格式',
      onClick: async () => {
        if (previewRef?.current) {
          try {
            await copyAsZhihu(previewRef.current);
            toast('已复制到剪贴板（知乎格式）');
          } catch { toast('复制失败'); }
        }
      },
    },
    {
      label: '复制为掘金格式',
      onClick: async () => {
        try {
          await copyAsJuejin(content);
          toast('已复制到剪贴板（掘金格式）');
        } catch { toast('复制失败'); }
      },
    },
  ];

  const viewItems = [
    { label: '编辑器 + 预览', checked: viewMode === 'both', onClick: () => setViewMode('both') },
    { label: '仅编辑器', checked: viewMode === 'editor', onClick: () => setViewMode('editor') },
    { label: '仅预览', checked: viewMode === 'preview', onClick: () => setViewMode('preview') },
  ];

  const settingsItems = [
    { label: '字号 12', checked: fontSize === 12, onClick: () => setFontSize(12) },
    { label: '字号 14', checked: fontSize === 14, onClick: () => setFontSize(14) },
    { label: '字号 16', checked: fontSize === 16, onClick: () => setFontSize(16) },
    { label: '字号 18', checked: fontSize === 18, onClick: () => setFontSize(18) },
    { divider: true, label: '' },
    { label: '行高 1.4', checked: lineHeight === 1.4, onClick: () => setLineHeight(1.4) },
    { label: '行高 1.6', checked: lineHeight === 1.6, onClick: () => setLineHeight(1.6) },
    { label: '行高 1.8', checked: lineHeight === 1.8, onClick: () => setLineHeight(1.8) },
    { label: '行高 2.0', checked: lineHeight === 2.0, onClick: () => setLineHeight(2.0) },
    { divider: true, label: '' },
    { label: wordWrap ? '关闭自动换行' : '开启自动换行', checked: wordWrap, onClick: () => setWordWrap(!wordWrap) },
  ];

  const helpItems = [
    { label: 'Markdown 语法速查表', onClick: () => onShowMarkdownHelp?.() },
    { label: '快捷键列表', onClick: () => onShowShortcuts?.() },
    { divider: true, label: '' },
    { label: '关于', onClick: () => onShowAbout?.() },
  ];

  return (
    <div style={{
      height: 40, backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0',
      display: 'flex', alignItems: 'center', padding: '0 8px', flexShrink: 0,
      overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      position: 'relative', zIndex: 100,
    }}>
      <div style={{ fontWeight: 700, color: '#35b378', marginRight: 20, fontSize: 16, padding: '0 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
        mdnice-clone
      </div>
      <Dropdown label="文件" items={fileItems} />
      <Dropdown label="格式" items={formatItems} />
      <Dropdown label="主题" items={themeItems} />
      <Dropdown label="代码主题" items={codeThemeItems} />
      <Dropdown label="功能" items={functionItems} />
      <Dropdown label="查看" items={viewItems} />
      <Dropdown label="设置" items={settingsItems} />
      <Dropdown label="帮助" items={helpItems} />
    </div>
  );
};
