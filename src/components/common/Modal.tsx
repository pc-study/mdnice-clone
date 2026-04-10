import React from 'react';

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export const Modal: React.FC<ModalProps> = ({ visible, title, onClose, children, width = 400 }) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 8, width, maxHeight: '80vh',
        overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
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
        <div style={{ padding: '16px 20px' }}>{children}</div>
      </div>
    </div>
  );
};
