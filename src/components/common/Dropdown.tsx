import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface DropdownItem {
  label: string;
  shortcut?: string;
  onClick?: () => void;
  divider?: boolean;
  checked?: boolean;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
}

// Global event bus so opening one dropdown closes others
const dropdownCloseCallbacks = new Set<() => void>();

export const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const closeThis = useCallback(() => setOpen(false), []);

  useEffect(() => {
    dropdownCloseCallbacks.add(closeThis);
    return () => { dropdownCloseCallbacks.delete(closeThis); };
  }, [closeThis]);

  // Close on click outside (check both button and portal panel)
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleToggle = () => {
    if (!open) {
      // Close all other dropdowns first
      dropdownCloseCallbacks.forEach((cb) => {
        if (cb !== closeThis) cb();
      });
      // Calculate position from button rect
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        // Ensure dropdown doesn't overflow right edge
        const left = Math.min(rect.left, window.innerWidth - 210);
        setPos({ top: rect.bottom, left: Math.max(0, left) });
      }
    }
    setOpen(!open);
  };

  // Render dropdown panel into document.body via Portal
  const dropdownPanel = open ? ReactDOM.createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed', top: pos.top, left: pos.left, minWidth: 200,
        backgroundColor: '#fff', borderRadius: 6, boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
        border: '1px solid #e0e0e0', padding: '4px 0', zIndex: 2147483647,
        maxHeight: 'calc(100vh - 60px)', overflowY: 'auto',
      }}
    >
      {items.map((item, i) => (
        item.divider ? (
          <div key={i} style={{ height: 1, backgroundColor: '#e8e8e8', margin: '4px 0' }} />
        ) : (
          <div key={i} onClick={() => { item.onClick?.(); setOpen(false); }}
            style={{
              padding: '6px 16px', cursor: 'pointer', fontSize: 13, color: '#333',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span>{item.checked !== undefined ? (item.checked ? '\u2713 ' : '   ') : ''}{item.label}</span>
            {item.shortcut && <span style={{ color: '#999', fontSize: 12, marginLeft: 20 }}>{item.shortcut}</span>}
          </div>
        )
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <div style={{ flexShrink: 0 }}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        style={{
          background: open ? '#f0f0f0' : 'none', border: 'none', padding: '6px 12px',
          cursor: 'pointer', fontSize: 14, color: '#333', borderRadius: 4, whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { if (!open) (e.target as HTMLElement).style.backgroundColor = '#f5f5f5'; }}
        onMouseLeave={(e) => { if (!open) (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
      >
        {label}
      </button>
      {dropdownPanel}
    </div>
  );
};
