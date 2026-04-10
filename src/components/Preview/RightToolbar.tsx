import React, { useState } from 'react';

interface RightToolbarProps {
  onCopyWechat: () => void;
  onCopyZhihu: () => void;
  onCopyJuejin: () => void;
}

interface ToolBtn {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

export const RightToolbar: React.FC<RightToolbarProps> = ({ onCopyWechat, onCopyZhihu, onCopyJuejin }) => {
  const buttons: ToolBtn[] = [
    {
      title: '复制到微信公众号',
      color: '#35b378',
      onClick: onCopyWechat,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.198 6.198 0 01-.242-1.716c0-3.67 3.514-6.64 7.843-6.64.259 0 .514.013.768.037C17.321 4.81 13.427 2.188 8.691 2.188zM5.785 7.11a1.045 1.045 0 110 2.089 1.045 1.045 0 010-2.089zm5.813 0a1.045 1.045 0 110 2.089 1.045 1.045 0 010-2.089zM24 14.474c0-3.322-3.238-6.017-7.229-6.017-3.99 0-7.229 2.695-7.229 6.017 0 3.322 3.239 6.017 7.229 6.017.846 0 1.662-.12 2.42-.343a.706.706 0 01.585.08l1.558.912a.269.269 0 00.137.044c.131 0 .237-.108.237-.241 0-.06-.023-.117-.039-.174l-.32-1.213a.483.483 0 01.175-.544C23.025 18.033 24 16.372 24 14.474zm-9.358-1.022a.855.855 0 110 1.71.855.855 0 010-1.71zm4.258 0a.855.855 0 110 1.71.855.855 0 010-1.71z"/>
        </svg>
      ),
    },
    {
      title: '复制到知乎',
      color: '#0066ff',
      onClick: onCopyZhihu,
      icon: <span style={{ fontSize: 14, fontWeight: 700 }}>知</span>,
    },
    {
      title: '复制到掘金',
      color: '#1e80ff',
      onClick: onCopyJuejin,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
    },
    {
      title: '复制渲染结果',
      color: '#666',
      onClick: onCopyWechat,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{
      width: 36, backgroundColor: '#fafafa', borderLeft: '1px solid #e0e0e0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 8, gap: 4, flexShrink: 0,
    }}>
      {buttons.map((btn, i) => (
        <ToolButton key={i} {...btn} />
      ))}
    </div>
  );
};

const ToolButton: React.FC<ToolBtn> = ({ title, icon, onClick, color }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28, height: 28, border: 'none', borderRadius: 4,
        backgroundColor: hovered ? '#e8e8e8' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color || '#666', transition: 'background-color 0.15s',
        padding: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
    </button>
  );
};
