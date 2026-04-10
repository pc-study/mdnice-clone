import React, { useState } from 'react';
import { useFileStore } from '../../store/fileStore';
import type { FileItem } from '../../store/fileStore';

const FileItemComponent: React.FC<{
  item: FileItem;
  depth: number;
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}> = ({ item, depth, activeFileId, onSelect, onDelete, onRename }) => {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [hovered, setHovered] = useState(false);
  const isActive = item.id === activeFileId;

  const handleDoubleClick = () => {
    setEditing(true);
    setEditName(item.name);
  };

  const handleRenameSubmit = () => {
    if (editName.trim()) onRename(item.id, editName.trim());
    setEditing(false);
  };

  return (
    <div>
      <div
        style={{
          padding: '5px 8px', paddingLeft: depth * 16 + 8, cursor: 'pointer',
          backgroundColor: isActive ? '#e8f5e9' : hovered ? '#f0f0f0' : 'transparent',
          display: 'flex', alignItems: 'center', fontSize: 13, color: isActive ? '#2e7d32' : '#333',
          gap: 6, borderLeft: isActive ? '3px solid #35b378' : '3px solid transparent',
          transition: 'background-color 0.15s, border-color 0.15s',
        }}
        onClick={() => item.type === 'file' ? onSelect(item.id) : setExpanded(!expanded)}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault();
          if (confirm(`删除 "${item.name}"？`)) onDelete(item.id);
        }}
      >
        <span style={{ color: isActive ? '#35b378' : '#999', fontSize: 12, width: 14, textAlign: 'center', flexShrink: 0 }}>
          {item.type === 'folder' ? (expanded ? '\u{25BC}' : '\u{25B6}') : '\u{1F4C4}'}
        </span>
        {editing ? (
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            autoFocus
            style={{ flex: 1, fontSize: 13, border: '1px solid #35b378', padding: '0 4px', borderRadius: 2, outline: 'none' }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isActive ? 500 : 400 }}>{item.name}</span>
        )}
      </div>
      {item.type === 'folder' && expanded && item.children?.map((child) => (
        <FileItemComponent key={child.id} item={child} depth={depth + 1} activeFileId={activeFileId}
          onSelect={onSelect} onDelete={onDelete} onRename={onRename} />
      ))}
    </div>
  );
};
export const FileTree: React.FC = () => {
  const { files, activeFileId, setActiveFileId, addFile, addFolder, deleteFile, renameFile } = useFileStore();
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState<'file' | 'folder' | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) { setShowNew(null); return; }
    if (showNew === 'file') {
      const name = newName.trim().endsWith('.md') ? newName.trim() : newName.trim() + '.md';
      const file = addFile(name, null);
      setActiveFileId(file.id);
    } else {
      addFolder(newName.trim(), null);
    }
    setNewName('');
    setShowNew(null);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid #e0e0e0', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>文件管理</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setShowNew('file')} style={{
            border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#666', padding: '0 4px',
          }} title="新建文件">+ 文件</button>
          <button onClick={() => setShowNew('folder')} style={{
            border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: '#666', padding: '0 4px',
          }} title="新建文件夹">+ 文件夹</button>
        </div>
      </div>
      {showNew && (
        <div style={{ padding: '4px 8px' }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            onBlur={handleCreate}
            placeholder={showNew === 'file' ? '文件名.md' : '文件夹名'}
            autoFocus
            style={{ width: '100%', fontSize: 13, padding: '4px', border: '1px solid #35b378', borderRadius: 2, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {files.map((item) => (
          <FileItemComponent key={item.id} item={item} depth={0} activeFileId={activeFileId}
            onSelect={setActiveFileId} onDelete={deleteFile} onRename={renameFile} />
        ))}
      </div>
    </div>
  );
};
