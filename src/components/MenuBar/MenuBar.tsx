import React from 'react';
import { Dropdown } from '../common/Dropdown';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';
import { themeList } from '../../themes';
import { codeThemeList } from '../../codeThemes';

export const MenuBar: React.FC = () => {
  const { viewMode, setViewMode } = useEditorStore();
  const { currentTheme, setCurrentTheme, currentCodeTheme, setCurrentCodeTheme } = useThemeStore();

  const fileItems = [
    { label: '新建文章', onClick: () => {} },
    { label: '导入 .md 文件', onClick: () => {} },
    { divider: true, label: '' },
    { label: '导出 .md 文件', onClick: () => {} },
    { label: '导出 .html 文件', onClick: () => {} },
  ];

  const formatItems = [
    { label: '加粗', shortcut: 'Ctrl+B', onClick: () => {} },
    { label: '斜体', shortcut: 'Ctrl+I', onClick: () => {} },
    { label: '删除线', shortcut: 'Ctrl+D', onClick: () => {} },
    { divider: true, label: '' },
    { label: '有序列表', shortcut: 'Ctrl+Shift+O', onClick: () => {} },
    { label: '无序列表', shortcut: 'Ctrl+Shift+U', onClick: () => {} },
    { label: '引用', shortcut: 'Ctrl+Shift+Q', onClick: () => {} },
    { divider: true, label: '' },
    { label: '代码块', shortcut: 'Ctrl+Shift+C', onClick: () => {} },
    { label: '行内代码', onClick: () => {} },
    { label: '链接', shortcut: 'Ctrl+K', onClick: () => {} },
    { label: '图片', shortcut: 'Ctrl+Shift+I', onClick: () => {} },
    { label: '表格', onClick: () => {} },
    { label: '分割线', onClick: () => {} },
  ];

  const themeItems = themeList.map((t) => ({
    label: t.name,
    checked: currentTheme === t.id,
    onClick: () => setCurrentTheme(t.id),
  }));

  const codeThemeItems = codeThemeList.map((t) => ({
    label: t.name,
    checked: currentCodeTheme === t.id,
    onClick: () => setCurrentCodeTheme(t.id),
  }));

  const functionItems = [
    { label: '微信外链转脚注', shortcut: 'Alt+Cmd+L', onClick: () => {} },
    { label: '格式化文档', shortcut: 'Alt+Cmd+F', onClick: () => {} },
    { divider: true, label: '' },
    { label: '一键复制（微信公众号）', onClick: () => {} },
    { label: '复制为知乎格式', onClick: () => {} },
    { label: '复制为掘金格式', onClick: () => {} },
  ];

  const viewItems = [
    { label: '编辑器 + 预览', checked: viewMode === 'both', onClick: () => setViewMode('both') },
    { label: '仅编辑器', checked: viewMode === 'editor', onClick: () => setViewMode('editor') },
    { label: '仅预览', checked: viewMode === 'preview', onClick: () => setViewMode('preview') },
  ];

  const helpItems = [
    { label: 'Markdown 语法速查表', onClick: () => {} },
    { label: '快捷键列表', onClick: () => {} },
    { divider: true, label: '' },
    { label: '关于', onClick: () => {} },
  ];

  return (
    <div style={{
      height: 40, backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0',
      display: 'flex', alignItems: 'center', padding: '0 8px', flexShrink: 0,
    }}>
      <div style={{ fontWeight: 700, color: '#35b378', marginRight: 20, fontSize: 16, padding: '0 8px' }}>
        mdnice-clone
      </div>
      <Dropdown label="文件" items={fileItems} />
      <Dropdown label="格式" items={formatItems} />
      <Dropdown label="主题" items={themeItems} />
      <Dropdown label="代码主题" items={codeThemeItems} />
      <Dropdown label="功能" items={functionItems} />
      <Dropdown label="查看" items={viewItems} />
      <Dropdown label="帮助" items={helpItems} />
    </div>
  );
};
