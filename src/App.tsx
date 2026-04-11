import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { MenuBar } from './components/MenuBar/MenuBar';
import { FileTree } from './components/Sidebar/FileTree';
import { MarkdownEditor } from './components/Editor/MarkdownEditor';
import { MarkdownPreview } from './components/Preview/MarkdownPreview';
import { RightToolbar } from './components/Preview/RightToolbar';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Toast } from './components/common/Toast';
import { HelpModal } from './components/common/HelpModal';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { PublishModal } from './components/Publish/PublishModal';
import { useEditorStore } from './store/editorStore';
import { useFileStore } from './store/fileStore';
import { usePublishStore, type PlatformId } from './store/publishStore';
import { copyAsWechat, copyAsZhihu, copyAsJuejin } from './utils/copyToClipboard';
import { renderMarkdown } from './utils/markdownParser';
import { useThemeStore } from './store/themeStore';
import { themes } from './themes';
import { detectExtension, sendPublishRequest, onPublishProgress } from './utils/extensionBridge';
import { useSyncScroll } from './hooks/useSyncScroll';

const App: React.FC = () => {
  const { content, viewMode } = useEditorStore();
  const { sidebarVisible, setSidebarVisible, activeFileId, updateFileContent, files } = useFileStore();
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  const [helpModal, setHelpModal] = useState<'markdown' | 'shortcuts' | 'about' | null>(null);
  const [themeSelectorVisible, setThemeSelectorVisible] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const { handleEditorScroll, handlePreviewScroll } = useSyncScroll(editorViewRef, previewRef);

  const {
    publishModalVisible, setPublishModalVisible,
    platforms, articleMeta, setArticleMeta,
    setPublishStatus, resetPublishProgress,
    setIsPublishing,
    setExtensionInstalled, extensionInstalled,
  } = usePublishStore();

  const { currentTheme } = useThemeStore();

  // 检测扩展安装状态
  useEffect(() => {
    detectExtension().then(setExtensionInstalled);
  }, [setExtensionInstalled]);

  // 监听扩展发布进度
  useEffect(() => {
    const unsub = onPublishProgress((progress) => {
      setPublishStatus(progress.platform as PlatformId, {
        status: progress.status,
        errorMsg: progress.errorMsg,
        resultUrl: progress.resultUrl,
      });
      // 如果所有平台都完成，结束发布状态
      const allDone = platforms
        .filter((p) => p.enabled)
        .every((p) => {
          const ps = usePublishStore.getState().publishProgress[p.id];
          return ps.status === 'success' || ps.status === 'failed';
        });
      if (allDone) setIsPublishing(false);
    });
    return unsub;
  }, [platforms, setPublishStatus, setIsPublishing]);

  // 查找文档标题
  const findDocTitle = (items: typeof files, id: string | null): string => {
    if (!id) return 'mdnice-clone';
    for (const f of items) {
      if (f.id === id) return f.name.replace(/\.md$/, '');
      if (f.children) {
        const found = findDocTitle(f.children, id);
        if (found !== 'mdnice-clone') return found;
      }
    }
    return 'mdnice-clone';
  };
  const docTitle = findDocTitle(files, activeFileId);

  // 发布处理
  const handlePublish = useCallback(() => {
    const enabledPlatforms = platforms.filter((p) => p.enabled);
    if (enabledPlatforms.length === 0) return;

    resetPublishProgress();
    setIsPublishing(true);

    // 设置所有启用平台为排队状态
    enabledPlatforms.forEach((p) => {
      setPublishStatus(p.id, { status: 'queued' });
    });

    // 准备文章数据
    const html = renderMarkdown(content);
    const themeCSS = themes[currentTheme]?.css || '';
    const fullHtml = `<style>${themeCSS}</style><div class="markdown-body">${html}</div>`;

    const title = articleMeta.title || docTitle;
    setArticleMeta({ title });

    if (extensionInstalled) {
      // 通过扩展发布
      sendPublishRequest({
        title,
        markdown: content,
        html: fullHtml,
        tags: articleMeta.tags ? articleMeta.tags.split(',').map((t) => t.trim()) : [],
        category: articleMeta.category,
        summary: articleMeta.summary,
        coverUrl: articleMeta.coverUrl,
        platforms: enabledPlatforms.map((p) => p.id),
      });
    } else {
      // 模拟发布进度（扩展未安装时的演示模式）
      enabledPlatforms.forEach((p, i) => {
        setTimeout(() => {
          setPublishStatus(p.id, { status: 'publishing' });
        }, i * 500);
        setTimeout(() => {
          setPublishStatus(p.id, {
            status: 'failed',
            errorMsg: '发布助手扩展未安装',
          });
          // 检查是否全部完成
          const allDone = enabledPlatforms.every((_, j) => j <= i);
          if (allDone && i === enabledPlatforms.length - 1) {
            setIsPublishing(false);
          }
        }, i * 500 + 800);
      });
    }

    showToast('开始发布...');
  }, [platforms, content, currentTheme, articleMeta, docTitle, extensionInstalled,
    resetPublishProgress, setIsPublishing, setPublishStatus, setArticleMeta, showToast]);

  // Responsive: auto-hide sidebar on narrow screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarVisible(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarVisible]);

  // Sync editor content changes to the active file in fileStore
  const prevContentRef = useRef(content);
  useEffect(() => {
    if (content !== prevContentRef.current) {
      prevContentRef.current = content;
      if (activeFileId) updateFileContent(activeFileId, content);
    }
  }, [content, activeFileId, updateFileContent]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const sidebarWidth = sidebarVisible ? 260 : 0;
    const rightToolbarWidth = 36;
    const availableWidth = rect.width - sidebarWidth - rightToolbarWidth;
    const x = e.clientX - rect.left - sidebarWidth;
    const pct = Math.max(20, Math.min(80, (x / availableWidth) * 100));
    setSplitPos(pct);
  }, [isDragging, sidebarVisible]);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleCopyWechat = useCallback(async () => {
    if (previewRef.current) {
      try { await copyAsWechat(previewRef.current); showToast('已复制到剪贴板（微信格式）'); }
      catch { showToast('复制失败'); }
    }
  }, [showToast]);

  const handleCopyZhihu = useCallback(async () => {
    if (previewRef.current) {
      try { await copyAsZhihu(previewRef.current); showToast('已复制到剪贴板（知乎格式）'); }
      catch { showToast('复制失败'); }
    }
  }, [showToast]);

  const handleCopyJuejin = useCallback(async () => {
    try { await copyAsJuejin(content); showToast('已复制到剪贴板（掘金格式）'); }
    catch { showToast('复制失败'); }
  }, [content, showToast]);

  const showEditor = viewMode === 'both' || viewMode === 'editor';
  const showPreview = viewMode === 'both' || viewMode === 'preview';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
    >
      <MenuBar
        onToast={showToast}
        previewRef={previewRef}
        editorViewRef={editorViewRef}
        onShowMarkdownHelp={() => setHelpModal('markdown')}
        onShowShortcuts={() => setHelpModal('shortcuts')}
        onShowAbout={() => setHelpModal('about')}
        onShowThemeSelector={() => setThemeSelectorVisible(true)}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        sidebarVisible={sidebarVisible}
        onShowPublishModal={() => setPublishModalVisible(true)}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarVisible ? 260 : 0,
          backgroundColor: '#2b2b2b',
          flexShrink: 0, overflow: 'hidden',
          transition: 'width 0.2s ease',
        }}>
          {sidebarVisible && <FileTree />}
        </div>

        {/* Editor + Splitter + Preview */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
          {/* Editor */}
          {showEditor && (
            <div style={{
              width: showPreview ? `calc(${splitPos}% - 2px)` : '100%',
              flexShrink: 0, flexGrow: 0, overflow: 'hidden',
            }}>
              <MarkdownEditor onScroll={handleEditorScroll} editorViewRef={editorViewRef} />
            </div>
          )}

          {/* Splitter */}
          {showEditor && showPreview && (
            <div
              onMouseDown={handleMouseDown}
              style={{
                width: 4, cursor: 'col-resize',
                backgroundColor: isDragging ? '#35b378' : '#e0e0e0',
                flexShrink: 0, flexGrow: 0,
                transition: isDragging ? 'none' : 'background-color 0.2s',
              }}
              onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = '#ccc'; }}
              onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = '#e0e0e0'; }}
            />
          )}

          {/* Preview */}
          {showPreview && (
            <div style={{
              width: showEditor ? `calc(${100 - splitPos}% - 2px)` : '100%',
              flexShrink: 0, flexGrow: 0, position: 'relative', overflow: 'hidden',
            }}>
              <MarkdownPreview previewRef={previewRef} onScroll={handlePreviewScroll} />
            </div>
          )}
        </div>

        {/* Right Toolbar */}
        <RightToolbar
          onCopyWechat={handleCopyWechat}
          onCopyZhihu={handleCopyZhihu}
          onCopyJuejin={handleCopyJuejin}
        />
      </div>
      <StatusBar />
      <Toast message={toastMsg} visible={toastVisible} onClose={() => setToastVisible(false)} />
      {helpModal && <HelpModal type={helpModal} onClose={() => setHelpModal(null)} />}
      <ThemeSelector visible={themeSelectorVisible} onClose={() => setThemeSelectorVisible(false)} />
      <PublishModal
        visible={publishModalVisible}
        onClose={() => setPublishModalVisible(false)}
        onPublish={handlePublish}
        docTitle={docTitle}
        markdown={content}
      />
    </div>
  );
};

export default App;
