import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { themes, juejinThemes, mdniceThemes } from '../../themes';
import { useThemeStore } from '../../store/themeStore';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

// 预览用的示例 Markdown HTML
const PREVIEW_HTML = `<h2 style="margin:0 0 6px 0">标题示例</h2><p style="margin:0 0 6px 0">正文内容，<strong>加粗</strong>和<code>代码</code>展示。</p><blockquote style="margin:0"><p style="margin:0">引用文本</p></blockquote>`;

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onClose }) => {
  const { currentTheme, setCurrentTheme } = useThemeStore();
  const [search, setSearch] = useState('');
  const [juejinCollapsed, setJuejinCollapsed] = useState(false);
  const [mdniceCollapsed, setMdniceCollapsed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 搜索过滤
  const filteredJuejin = useMemo(() => {
    if (!search.trim()) return juejinThemes;
    const q = search.toLowerCase();
    return juejinThemes.filter(t => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [search]);

  const filteredMdnice = useMemo(() => {
    if (!search.trim()) return mdniceThemes;
    const q = search.toLowerCase();
    return mdniceThemes.filter(t => t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [search]);

  // 点击遮罩关闭
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  // ESC 关闭
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  // 选择主题
  const handleSelect = useCallback((themeId: string) => {
    setCurrentTheme(themeId);
  }, [setCurrentTheme]);

  if (!visible) return null;

  return (
    <div ref={overlayRef} onClick={handleOverlayClick} style={overlayStyle}>
      <div style={modalStyle}>
        {/* 头部 */}
        <div style={headerStyle}>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>选择主题</span>
          <button onClick={onClose} style={closeButtonStyle} title="关闭">✕</button>
        </div>

        {/* 搜索框 */}
        <div style={{ padding: '0 24px 16px' }}>
          <input
            type="text"
            placeholder="搜索主题..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={searchInputStyle}
            autoFocus
          />
        </div>

        {/* 主题列表 */}
        <div style={listContainerStyle}>
          {/* 掘金社区主题 */}
          <ThemeGroup
            title={`掘金社区主题（${filteredJuejin.length}）`}
            collapsed={juejinCollapsed}
            onToggle={() => setJuejinCollapsed(!juejinCollapsed)}
            themes={filteredJuejin}
            currentTheme={currentTheme}
            onSelect={handleSelect}
          />

          {/* mdnice 原版主题 */}
          <ThemeGroup
            title={`mdnice 主题（${filteredMdnice.length}）`}
            collapsed={mdniceCollapsed}
            onToggle={() => setMdniceCollapsed(!mdniceCollapsed)}
            themes={filteredMdnice}
            currentTheme={currentTheme}
            onSelect={handleSelect}
          />

          {filteredJuejin.length === 0 && filteredMdnice.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: 40 }}>
              没有找到匹配的主题
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === 主题分组子组件 ===
interface ThemeGroupProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  themes: { id: string; name: string }[];
  currentTheme: string;
  onSelect: (id: string) => void;
}

const ThemeGroup: React.FC<ThemeGroupProps> = ({ title, collapsed, onToggle, themes: themeItems, currentTheme, onSelect }) => {
  if (themeItems.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={onToggle} style={groupHeaderStyle}>
        <span style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block', marginRight: 8, fontSize: 12 }}>▼</span>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{title}</span>
      </button>
      {!collapsed && (
        <div style={gridStyle}>
          {themeItems.map(t => (
            <ThemeCard
              key={t.id}
              themeId={t.id}
              themeName={t.name}
              isSelected={currentTheme === t.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// === 主题卡片子组件 ===
interface ThemeCardProps {
  themeId: string;
  themeName: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ThemeCard: React.FC<ThemeCardProps> = React.memo(({ themeId, themeName, isSelected, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const themeCSS = themes[themeId]?.css || '';

  return (
    <div
      onClick={() => onSelect(themeId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...cardStyle,
        borderColor: isSelected ? '#35b378' : hovered ? '#b0b0b0' : '#e8e8e8',
        boxShadow: isSelected
          ? '0 0 0 2px rgba(53,179,120,0.2), 0 2px 8px rgba(0,0,0,0.08)'
          : hovered
            ? '0 4px 12px rgba(0,0,0,0.1)'
            : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* 预览区域 */}
      <div style={previewContainerStyle}>
        <style>{scopeCSS(themeId, themeCSS)}</style>
        <div className={`theme-preview-${themeId}`}>
          <div className="markdown-body" dangerouslySetInnerHTML={{ __html: PREVIEW_HTML }} style={{ padding: '8px 10px', fontSize: 10, lineHeight: 1.4, overflow: 'hidden', transform: 'scale(1)', transformOrigin: 'top left' }} />
        </div>
      </div>
      {/* 名称 */}
      <div style={cardFooterStyle}>
        <span style={{ fontSize: 12, color: isSelected ? '#35b378' : '#555', fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {themeName}
        </span>
        {isSelected && <span style={{ color: '#35b378', fontSize: 14, flexShrink: 0 }}>✓</span>}
      </div>
    </div>
  );
});

// 将主题 CSS 作用域限定到卡片内部
function scopeCSS(themeId: string, css: string): string {
  return css.replace(/\.markdown-body/g, `.theme-preview-${themeId} .markdown-body`);
}

// === 样式常量 ===
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 10000, backdropFilter: 'blur(2px)',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: 12, width: '90vw', maxWidth: 840,
  maxHeight: '85vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 24px 12px', flexShrink: 0,
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: 18, color: '#999',
  cursor: 'pointer', padding: '4px 8px', borderRadius: 4,
  lineHeight: 1,
};

const searchInputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const listContainerStyle: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '0 24px 24px',
};

const groupHeaderStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', padding: '10px 0',
  width: '100%', textAlign: 'left',
};

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
  gap: 14,
};

const cardStyle: React.CSSProperties = {
  borderRadius: 8, border: '2px solid #e8e8e8', cursor: 'pointer',
  overflow: 'hidden', transition: 'all 0.2s ease',
  backgroundColor: '#fff',
};

const previewContainerStyle: React.CSSProperties = {
  height: 100, overflow: 'hidden', borderBottom: '1px solid #f0f0f0',
  backgroundColor: '#fafafa', position: 'relative',
};

const cardFooterStyle: React.CSSProperties = {
  padding: '8px 10px', display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', minHeight: 32,
};
