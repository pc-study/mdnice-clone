import React, { useState } from 'react';

interface TableInsertDialogProps {
  visible: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
}

const MAX_ROWS = 8;
const MAX_COLS = 8;

export const TableInsertDialog: React.FC<TableInsertDialogProps> = ({ visible, onClose, onInsert }) => {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);

  if (!visible) return null;

  const handleInsert = () => {
    if (hoverRow > 0 && hoverCol > 0) {
      onInsert(hoverRow, hoverCol);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
    }} onClick={onClose}>
      <div
        style={{
          position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#fff', borderRadius: 8, padding: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)', minWidth: 220,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 12 }}>
          插入表格
        </div>
        <div style={{ display: 'inline-block' }}>
          {Array.from({ length: MAX_ROWS }, (_, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {Array.from({ length: MAX_COLS }, (_, c) => {
                const isSelected = r < hoverRow && c < hoverCol;
                return (
                  <div
                    key={c}
                    style={{
                      width: 22, height: 22, margin: 1, borderRadius: 2,
                      border: '1px solid #d0d0d0',
                      backgroundColor: isSelected ? '#35b378' : '#f9f9f9',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={() => { setHoverRow(r + 1); setHoverCol(c + 1); }}
                    onClick={handleInsert}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#666', textAlign: 'center' }}>
          {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} 行 × ${hoverCol} 列` : '移动鼠标选择大小'}
        </div>
      </div>
    </div>
  );
};
