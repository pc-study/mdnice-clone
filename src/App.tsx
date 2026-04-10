import React, { useState, useRef, useCallback } from 'react';
import { MenuBar } from './components/MenuBar/MenuBar';
import { FileTree } from './components/Sidebar/FileTree';
import { MarkdownEditor } from './components/Editor/MarkdownEditor';
import { MarkdownPreview } from './components/Preview/MarkdownPreview';
import { PreviewToolbar } from './components/Preview/PreviewToolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Toast } from './components/common/Toast';
import { useEditorStore } from './store/editorStore';
import { useFileStore } from './store/fileStore';

const App: React.FC = () => {
  const { viewMode } = useEditorStore();
  const { sidebarVisible } = useFileStore();
  const [splitPos, setSplitPos] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const sidebarWidth = sidebarVisible ? 220 : 0;
    const availableWidth = rect.width - sidebarWidth;
    const x = e.clientX - rect.left - sidebarWidth;
    const pct = Math.max(20, Math.min(80, (x / availableWidth) * 100));
    setSplitPos(pct);
  }, [isDragging, sidebarVisible]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Sync scroll handlers
  const handleEditorScroll = useCallback((info: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (previewRef.current) {
      const ratio = info.scrollTop / (info.scrollHeight - info.clientHeight || 1);
      previewRef.current.scrollTop = ratio * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }
    setTimeout(() => { syncingRef.current = false; }, 50);
  }, []);

  const handleCopy = () => {
    if (previewRef.current) {
      const el = previewRef.current.querySelector('.preview-theme');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand('copy');
        sel?.removeAllRanges();
        showToast('已复制到剪贴板');
      }
    }
  };

  const showEditor = viewMode === 'both' || viewMode === 'editor';
  const showPreview = viewMode === 'both' || viewMode === 'preview';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <MenuBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarVisible && (
          <div style={{ width: 220, backgroundColor: '#f7f7f7', borderRight: '1px solid #e0e0e0', flexShrink: 0, overflow: 'hidden' }}>
            <FileTree />
          </div>
        )}
        {/* Editor */}
        {showEditor && (
          <div style={{
            width: showPreview ? `${splitPos}%` : '100%',
            flexShrink: 0, overflow: 'hidden',
            borderRight: showPreview ? 'none' : undefined,
          }}>
            <MarkdownEditor onScroll={handleEditorScroll} />
          </div>
        )}
        {/* Splitter */}
        {showEditor && showPreview && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              width: 4, cursor: 'col-resize', backgroundColor: isDragging ? '#35b378' : '#e0e0e0',
              flexShrink: 0, transition: isDragging ? 'none' : 'background-color 0.2s',
            }}
            onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = '#ccc'; }}
            onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
          />
        )}
        {/* Preview */}
        {showPreview && (
          <div style={{
            flex: 1, position: 'relative', overflow: 'hidden',
          }}>
            <PreviewToolbar
              onCopyWechat={handleCopy}
              onCopyZhihu={handleCopy}
              onCopyJuejin={handleCopy}
            />
            <MarkdownPreview previewRef={previewRef} />
          </div>
        )}
      </div>
      <StatusBar />
      <Toast message={toastMsg} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
};

export default App;
