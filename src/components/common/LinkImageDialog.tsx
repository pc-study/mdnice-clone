import React, { useState, useEffect } from 'react';

interface LinkImageDialogProps {
  visible: boolean;
  type: 'link' | 'image';
  onClose: () => void;
  onInsert: (text: string, url: string) => void;
  initialText?: string;
}

export const LinkImageDialog: React.FC<LinkImageDialogProps> = ({
  visible, type, onClose, onInsert, initialText = '',
}) => {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (visible) {
      setText(initialText);
      setUrl('');
    }
  }, [visible, initialText]);

  if (!visible) return null;

  const isLink = type === 'link';
  const title = isLink ? '插入链接' : '插入图片';
  const textLabel = isLink ? '链接文字' : '图片描述';
  const textPlaceholder = isLink ? '请输入链接文字' : '请输入图片描述';
  const urlPlaceholder = isLink ? 'https://example.com' : 'https://example.com/image.png';

  const handleSubmit = () => {
    const finalText = text.trim() || (isLink ? '链接' : '图片描述');
    const finalUrl = url.trim() || 'url';
    onInsert(finalText, finalUrl);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', fontSize: 14, border: '1px solid #d0d0d0',
    borderRadius: 4, outline: 'none', boxSizing: 'border-box',
  };

  const btnBase: React.CSSProperties = {
    padding: '8px 20px', fontSize: 14, borderRadius: 4, cursor: 'pointer', border: 'none',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 8, width: 400,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e0e0e0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#333' }}>{title}</h3>
          <button onClick={onClose} style={{
            border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#999',
          }}>✕</button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>{textLabel}</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={textPlaceholder}
              autoFocus
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#35b378'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#d0d0d0'; }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>URL 地址</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={urlPlaceholder}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#35b378'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#d0d0d0'; }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={onClose} style={{ ...btnBase, backgroundColor: '#f0f0f0', color: '#666' }}>
              取消
            </button>
            <button onClick={handleSubmit} style={{ ...btnBase, backgroundColor: '#35b378', color: '#fff' }}>
              插入
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
