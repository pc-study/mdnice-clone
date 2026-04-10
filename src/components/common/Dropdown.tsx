import React, { useState, useRef, useEffect } from 'react';

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

export const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? '#f0f0f0' : 'none', border: 'none', padding: '6px 12px',
          cursor: 'pointer', fontSize: 14, color: '#333', borderRadius: 4,
        }}
        onMouseEnter={(e) => { if (!open) (e.target as HTMLElement).style.backgroundColor = '#f5f5f5'; }}
        onMouseLeave={(e) => { if (!open) (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
      >
        {label}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, minWidth: 200,
          backgroundColor: '#fff', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          border: '1px solid #e0e0e0', padding: '4px 0', zIndex: 1000,
        }}>
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
                <span>{item.checked !== undefined ? (item.checked ? '✓ ' : '   ') : ''}{item.label}</span>
                {item.shortcut && <span style={{ color: '#999', fontSize: 12, marginLeft: 20 }}>{item.shortcut}</span>}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};
