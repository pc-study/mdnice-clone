import React, { useState, useRef } from 'react';
import { useFileStore } from '../../store/fileStore';
import type { FileItem } from '../../store/fileStore';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const FileItemComponent: React.FC<{
  item: FileItem;
  depth: number;
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMove: (dragId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  dragId: string | null;
  setDragId: (id: string | null) => void;
}> = ({ item, depth, activeFileId, onSelect, onDelete, onRename, onMove, dragId, setDragId }) => {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [hovered, setHovered] = useState(false);
  const [dropPos, setDropPos] = useState<'before' | 'after' | 'inside' | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const isActive = item.id === activeFileId;
  const isFile = item.type === 'file';

  const handleDoubleClick = () => { setEditing(true); setEditName(item.name); };
  const handleRenameSubmit = () => { if (editName.trim()) onRename(item.id, editName.trim()); setEditing(false); };
  const handleDelete = () => {
    const typeName = item.type === 'folder' ? '文件夹' : '文件';
    if (confirm(`确定删除${typeName} "${item.name}"？${item.type === 'folder' ? '（将同时删除其中的所有内容）' : ''}`)) {
      onDelete(item.id);
    }
    setShowMenu(false);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item.id); setDragId(item.id); };
  const handleDragEnd = () => { setDragId(null); setDropPos(null); };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    if (!rowRef.current || dragId === item.id) return;
    const rect = rowRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top, h = rect.height;
    if (item.type === 'folder') { setDropPos(y < h * 0.25 ? 'before' : y > h * 0.75 ? 'after' : 'inside'); }
    else { setDropPos(y < h / 2 ? 'before' : 'after'); }
  };
  const handleDragLeave = () => setDropPos(null);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const srcId = e.dataTransfer.getData('text/plain');
    if (srcId && srcId !== item.id && dropPos) onMove(srcId, item.id, dropPos);
    setDropPos(null); setDragId(null);
  };

  const dropStyle = (): React.CSSProperties => {
    if (!dropPos || dragId === item.id) return {};
    if (dropPos === 'before') return { borderTop: '2px solid #35b378' };
    if (dropPos === 'after') return { borderBottom: '2px solid #35b378' };
    return { backgroundColor: 'rgba(53,179,120,0.15)' };
  };

  return (
    <div style={{ opacity: dragId === item.id ? 0.4 : 1 }}>
      <div
        ref={rowRef} draggable={!editing}
        onDragStart={handleDragStart} onDragEnd={handleDragEnd}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        style={{
          padding: isFile ? '8px 12px' : '6px 12px', paddingLeft: depth * 16 + 12,
          cursor: editing ? 'text' : 'pointer',
          backgroundColor: isActive ? '#35b378' : hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
          display: 'flex', alignItems: 'flex-start', fontSize: 13,
          color: isActive ? '#fff' : '#ddd', gap: 8,
          transition: 'background-color 0.15s', position: 'relative',
          ...dropStyle(),
        }}
        onClick={() => isFile ? onSelect(item.id) : setExpanded(!expanded)}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowMenu(false); }}
        onContextMenu={(e) => { e.preventDefault(); handleDelete(); }}
      >
        <span style={{ fontSize: 14, width: 18, textAlign: 'center', flexShrink: 0, color: isActive ? '#fff' : '#999', marginTop: 1 }}>
          {item.type === 'folder' ? (expanded ? '📂' : '📁') : '📄'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input value={editName} onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRenameSubmit} onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              autoFocus onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', fontSize: 13, border: '1px solid #35b378', padding: '1px 4px', borderRadius: 2, outline: 'none', backgroundColor: '#fff', color: '#333' }}
            />
          ) : (
            <>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 500 : 400, lineHeight: '18px' }}>
                {item.name}
              </div>
              {isFile && (
                <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.7)' : '#888', marginTop: 2, lineHeight: '14px' }}>
                  {formatDate(item.updatedAt || item.createdAt)}
                </div>
              )}
            </>
          )}
        </div>
        {hovered && !editing && (
          <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '0 2px', color: isActive ? 'rgba(255,255,255,0.8)' : '#999', lineHeight: 1, flexShrink: 0, marginTop: 1 }}
            title="操作"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        )}
        {showMenu && (
          <div style={{ position: 'absolute', right: 8, top: '100%', zIndex: 100, backgroundColor: '#fff', borderRadius: 6, padding: '4px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', minWidth: 100, border: '1px solid #e0e0e0' }}
            onClick={(e) => e.stopPropagation()}>
            <div onClick={() => { setEditing(true); setEditName(item.name); setShowMenu(false); }}
              style={{ padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#333' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}>重命名</div>
            <div onClick={handleDelete}
              style={{ padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#e53935' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}>删除</div>
          </div>
        )}
      </div>
      {item.type === 'folder' && expanded && item.children?.map((child) => (
        <FileItemComponent key={child.id} item={child} depth={depth + 1} activeFileId={activeFileId}
          onSelect={onSelect} onDelete={onDelete} onRename={onRename} onMove={onMove}
          dragId={dragId} setDragId={setDragId} />
      ))}
    </div>
  );
};

export const FileTree: React.FC = () => {
  const { files, activeFileId, setActiveFileId, addFile, addFolder, deleteFile, renameFile, moveFile } = useFileStore();
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState<'file' | 'folder' | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) { setShowNew(null); return; }
    if (showNew === 'file') {
      const name = newName.trim().endsWith('.md') ? newName.trim() : newName.trim() + '.md';
      const file = addFile(name, null);
      setActiveFileId(file.id);
    } else { addFolder(newName.trim(), null); }
    setNewName(''); setShowNew(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#2b2b2b' }}>
      <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
        <button onClick={() => setShowNew('file')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#aaa', padding: '2px 6px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; }} title="新建文件">+ 文件</button>
        <button onClick={() => setShowNew('folder')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#aaa', padding: '2px 6px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; }} title="新建文件夹">+ 文件夹</button>
      </div>
      {showNew && (
        <div style={{ padding: '4px 12px' }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} onBlur={handleCreate}
            placeholder={showNew === 'file' ? '文件名.md' : '文件夹名'} autoFocus
            style={{ width: '100%', fontSize: 13, padding: '5px 8px', border: '1px solid #35b378', borderRadius: 3, outline: 'none', boxSizing: 'border-box', backgroundColor: '#3a3a3a', color: '#fff' }} />
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {files.map((item) => (
          <FileItemComponent key={item.id} item={item} depth={0} activeFileId={activeFileId}
            onSelect={setActiveFileId} onDelete={deleteFile} onRename={renameFile}
            onMove={moveFile} dragId={dragId} setDragId={setDragId} />
        ))}
      </div>
    </div>
  );
};
