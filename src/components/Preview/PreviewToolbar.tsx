import React from 'react';

interface PreviewToolbarProps {
  onCopyWechat: () => void;
  onCopyZhihu: () => void;
  onCopyJuejin: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({ onCopyWechat, onCopyZhihu, onCopyJuejin }) => {
  return (
    <div style={{
      position: 'absolute', top: 8, right: 16, display: 'flex', gap: 6, zIndex: 10,
    }}>
      {[
        { label: '复制', onClick: onCopyWechat },
        { label: '知乎', onClick: onCopyZhihu },
        { label: '掘金', onClick: onCopyJuejin },
      ].map((btn) => (
        <button key={btn.label} onClick={btn.onClick} style={{
          padding: '4px 12px', fontSize: 12, backgroundColor: '#35b378', color: '#fff',
          border: 'none', borderRadius: 4, cursor: 'pointer', opacity: 0.9,
        }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.9')}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};
