import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { MenuBar } from './components/MenuBar/MenuBar';
import { FileTree } from './components/Sidebar/FileTree';
import { MarkdownEditor } from './components/Editor/MarkdownEditor';
import { MarkdownPreview } from './components/Preview/MarkdownPreview';
import { PreviewToolbar } from './components/Preview/PreviewToolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Toast } from './components/common/Toast';
import { HelpModal } from './components/common/HelpModal';
import { useEditorStore } from './store/editorStore';
import { useFileStore } from './store/fileStore';
import { copyAsWechat, copyAsZhihu, copyAsJuejin } from './utils/copyToClipboard';
import { useSyncScroll } from './hooks/useSyncScroll';

const App: React.FC = () => {
  const { content, viewMode, setViewMode } = useEditorStore();
  const { sidebarVisible, setSidebarVisible, activeFileId, updateFileContent } = useFileStore();
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [helpModal, setHelpModal] = useState<'markdown' | 'shortcuts' | 'about' | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const { handleEditorScroll, handlePreviewScroll } = useSyncScroll(editorViewRef, previewRef);

  // Responsive: auto-hide sidebar and switch to editor view on narrow screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarVisible(false);
        setViewMode('editor');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarVisible, setViewMode]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  // Sync editor content changes to the active file in fileStore
  const prevContentRef = useRef(content);
  useEffect(() => {
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      if (activeFileId) {
        updateFileContent(activeFileId, content);
      }
    }
  }, [content, activeFileId, updateFileContent]);

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

  // Sync scroll handled by useSyncScroll hook

  const handleCopyWechat = useCallback(async () => {
    if (previewRef.current) {
      try {
        await copyAsWechat(previewRef.current);
        showToast('已复制到剪贴板（微信格式）');
      } catch { showToast('复制失败'); }
    }
  }, [showToast]);

  const handleCopyZhihu = useCallback(async () => {
    if (previewRef.current) {
      try {
        await copyAsZhihu(previewRef.current);
        showToast('已复制到剪贴板（知乎格式）');
      } catch { showToast('复制失败'); }
    }
  }, [showToast]);

  const handleCopyJuejin = useCallback(async () => {
    try {
      await copyAsJuejin(content);
      showToast('已复制到剪贴板（掘金格式）');
    } catch { showToast('复制失败'); }
  }, [content, showToast]);

  const showEditor = viewMode === 'both' || viewMode === 'editor';
  const showPreview = viewMode === 'both' || viewMode === 'preview';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <MenuBar
        onToast={showToast}
        previewRef={previewRef}
        editorViewRef={editorViewRef}
        onShowMarkdownHelp={() => setHelpModal('markdown')}
        onShowShortcuts={() => setHelpModal('shortcuts')}
        onShowAbout={() => setHelpModal('about')}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarVisible ? 220 : 0,
          backgroundColor: '#f7f7f7',
          borderRight: sidebarVisible ? '1px solid #e0e0e0' : 'none',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.2s ease',
        }}>
          {sidebarVisible && <FileTree />}
        </div>
        {/* Sidebar toggle */}
        <div
          onClick={() => setSidebarVisible(!sidebarVisible)}
          style={{
            width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backgroundColor: '#f7f7f7', borderRight: '1px solid #e0e0e0',
            flexShrink: 0, fontSize: 14, color: '#999', userSelect: 'none',
          }}
          title={sidebarVisible ? '收起侧边栏' : '展开侧边栏'}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eaeaea'; e.currentTarget.style.color = '#555'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f7f7f7'; e.currentTarget.style.color = '#999'; }}
        >
          {sidebarVisible ? '\u276E' : '\u2630'}
        </div>
        {/* Editor */}
        {showEditor && (
          <div style={{
            width: showPreview ? `${splitPos}%` : '100%',
            flexShrink: 0, overflow: 'hidden',
            borderRight: showPreview ? 'none' : undefined,
          }}>
            <MarkdownEditor onScroll={handleEditorScroll} editorViewRef={editorViewRef} />
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
              onCopyWechat={handleCopyWechat}
              onCopyZhihu={handleCopyZhihu}
              onCopyJuejin={handleCopyJuejin}
            />
            <MarkdownPreview previewRef={previewRef} onScroll={handlePreviewScroll} />
          </div>
        )}
      </div>
      <StatusBar />
      <Toast message={toastMsg} visible={toastVisible} onClose={() => setToastVisible(false)} />
      {helpModal && (
        <HelpModal type={helpModal} onClose={() => setHelpModal(null)} />
      )}
    </div>
  );
};

export default App;
