import React, { useState } from 'react';

interface PreviewToolbarProps {
  onCopyWechat: () => void;
  onCopyZhihu: () => void;
  onCopyJuejin: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({ onCopyWechat, onCopyZhihu, onCopyJuejin }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: 'absolute', top: 8, right: 16, display: 'flex', gap: 6, zIndex: 10,
        opacity: hovered ? 1 : 0.2,
        transition: 'opacity 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {[
        { label: '复制', onClick: onCopyWechat },
        { label: '知乎', onClick: onCopyZhihu },
        { label: '掘金', onClick: onCopyJuejin },
      ].map((btn) => (
        <button key={btn.label} onClick={btn.onClick} style={{
          padding: '4px 12px', fontSize: 12, backgroundColor: '#35b378', color: '#fff',
          border: 'none', borderRadius: 4, cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: hovered ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};
