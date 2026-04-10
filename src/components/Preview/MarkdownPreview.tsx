import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';
import { themes } from '../../themes';
import { fetchCodeThemeCSS } from '../../codeThemes';
import { renderMarkdown } from '../../utils/markdownParser';

interface MarkdownPreviewProps {
  onScroll?: (info: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ onScroll, previewRef: externalRef }) => {
  const content = useEditorStore((s) => s.content);
  const { currentTheme, currentCodeTheme, macStyleEnabled } = useThemeStore();
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = externalRef || internalRef;

  // Debounced content for rendering (300ms)
  const [debouncedContent, setDebouncedContent] = useState(content);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(content), 300);
    return () => clearTimeout(timer);
  }, [content]);

  // Fetch code theme CSS from CDN with caching
  const [codeThemeCSS, setCodeThemeCSS] = useState('');
  useEffect(() => {
    let cancelled = false;
    fetchCodeThemeCSS(currentCodeTheme).then((css) => {
      if (!cancelled) setCodeThemeCSS(css);
    });
    return () => { cancelled = true; };
  }, [currentCodeTheme]);

  const html = useMemo(() => renderMarkdown(debouncedContent), [debouncedContent]);
  const themeCSS = useMemo(() => themes[currentTheme]?.css || '', [currentTheme]);

  const handleScroll = () => {
    if (onScroll && ref.current) {
      onScroll({
        scrollTop: ref.current.scrollTop,
        scrollHeight: ref.current.scrollHeight,
        clientHeight: ref.current.clientHeight,
      });
    }
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', backgroundColor: '#fff' }} ref={ref} onScroll={handleScroll}>
      <style>{themeCSS}</style>
      <style>{codeThemeCSS}</style>
      <style>{`
        .markdown-body {
          padding: 20px 24px;
        }
        /* === 代码块整体容器 === */
        .markdown-body .code-block-wrapper {
          position: relative;
          margin: 16px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
        }
        /* === 顶部 Header 栏 === */
        .markdown-body .code-header {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background: inherit;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          min-height: 36px;
          box-sizing: border-box;
        }
        .markdown-body .code-mac-dots {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .markdown-body .code-mac-dots .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
        }
        .markdown-body .code-mac-dots .dot.red { background: #fc625d; }
        .markdown-body .code-mac-dots .dot.yellow { background: #fdbc40; }
        .markdown-body .code-mac-dots .dot.green { background: #35cd4b; }
        .markdown-body .code-lang-label {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          line-height: 1;
          flex: 1;
        }
        .markdown-body .code-copy-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          flex-shrink: 0;
          transition: color 0.15s, background 0.15s;
        }
        .markdown-body .code-copy-btn:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.1);
        }
        /* === 代码内容区 === */
        .markdown-body .code-block-body {
          display: flex;
          overflow: auto;
        }
        .markdown-body .code-line-numbers {
          padding: 14px 0 14px 16px;
          min-width: 28px;
          text-align: right;
          color: rgba(255,255,255,0.25);
          font-size: 13px;
          line-height: 20px;
          font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          user-select: none;
          flex-shrink: 0;
          background: inherit;
        }
        .markdown-body .code-line-numbers span {
          display: block;
          padding-right: 14px;
        }
        .markdown-body .code-block-wrapper pre.hljs {
          flex: 1;
          margin: 0 !important;
          padding: 14px 16px 14px 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .markdown-body .code-block-wrapper pre.hljs code {
          padding: 0 !important;
          font-size: 13px;
          line-height: 20px;
          font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          background: transparent !important;
          display: block;
        }
        /* === 不显示 Mac 圆点时隐藏 === */
        .markdown-body:not(.mac-code-theme) .code-mac-dots {
          display: none;
        }
        .markdown-body img {
          max-width: 100%;
        }
        .markdown-body table {
          border-collapse: collapse;
          width: auto;
          display: table;
        }
      `}</style>
      <div
        className={`markdown-body${macStyleEnabled ? ' mac-code-theme' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
