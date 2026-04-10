import React from 'react';
import { Modal } from './Modal';

interface HelpModalProps {
  type: 'markdown' | 'shortcuts' | 'about';
  onClose: () => void;
}

const cellStyle: React.CSSProperties = {
  padding: '6px 10px', borderBottom: '1px solid #eee', fontSize: 13,
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle, fontWeight: 600, backgroundColor: '#f7f7f7',
};

const MarkdownCheatSheet: React.FC = () => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={headerCellStyle}>语法</th>
        <th style={headerCellStyle}>效果</th>
      </tr>
    </thead>
    <tbody>
      {[
        ['# 标题', '一级标题'],
        ['## 标题', '二级标题'],
        ['**加粗**', '加粗文字'],
        ['*斜体*', '斜体文字'],
        ['~~删除线~~', '删除线文字'],
        ['`行内代码`', '行内代码'],
        ['```code```', '代码块'],
        ['[链接](url)', '超链接'],
        ['![图片](url)', '图片'],
        ['> 引用', '引用块'],
        ['- 列表', '无序列表'],
        ['1. 列表', '有序列表'],
        ['---', '分割线'],
        ['| A | B |', '表格'],
        ['$E=mc^2$', '行内公式'],
        ['$$公式$$', '块级公式'],
        ['{文字|拼音}', '注音标注'],
        ['::: block-1 ... :::', '容器块'],
      ].map(([syntax, effect], i) => (
        <tr key={i}>
          <td style={{ ...cellStyle, fontFamily: 'monospace' }}>{syntax}</td>
          <td style={cellStyle}>{effect}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ShortcutsList: React.FC = () => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={headerCellStyle}>快捷键</th>
        <th style={headerCellStyle}>功能</th>
      </tr>
    </thead>
    <tbody>
      {[
        ['Ctrl/Cmd + B', '加粗'],
        ['Ctrl/Cmd + I', '斜体'],
        ['Ctrl/Cmd + D', '删除线'],
        ['Ctrl/Cmd + K', '插入链接'],
        ['Ctrl/Cmd + Shift + I', '插入图片'],
        ['Ctrl/Cmd + Shift + C', '插入代码块'],
        ['Ctrl/Cmd + Shift + O', '有序列表'],
        ['Ctrl/Cmd + Shift + U', '无序列表'],
        ['Ctrl/Cmd + Shift + Q', '引用'],
        ['Ctrl/Cmd + Z', '撤销'],
        ['Ctrl/Cmd + Shift + Z', '重做'],
      ].map(([key, action], i) => (
        <tr key={i}>
          <td style={{ ...cellStyle, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{key}</td>
          <td style={cellStyle}>{action}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AboutDialog: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '20px 0' }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: '#35b378', marginBottom: 12 }}>
      mdnice-clone
    </div>
    <p style={{ fontSize: 14, color: '#666', margin: '8px 0' }}>
      Markdown 排版编辑器
    </p>
    <p style={{ fontSize: 13, color: '#999', margin: '8px 0' }}>
      专注于微信公众号、知乎、掘金等平台的文章排版
    </p>
    <p style={{ fontSize: 13, color: '#999', margin: '16px 0 0' }}>
      支持 20+ 主题 | 实时预览 | 一键复制
    </p>
  </div>
);

export const HelpModal: React.FC<HelpModalProps> = ({ type, onClose }) => {
  const titles: Record<string, string> = {
    markdown: 'Markdown 语法速查表',
    shortcuts: '快捷键列表',
    about: '关于',
  };

  return (
    <Modal visible={true} title={titles[type]} onClose={onClose} width={type === 'about' ? 360 : 480}>
      {type === 'markdown' && <MarkdownCheatSheet />}
      {type === 'shortcuts' && <ShortcutsList />}
      {type === 'about' && <AboutDialog />}
    </Modal>
  );
};
