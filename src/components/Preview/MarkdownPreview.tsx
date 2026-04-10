import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';
import { themes } from '../../themes';
import { fetchCodeThemeCSS } from '../../codeThemes';
import { renderMarkdown } from '../../utils/markdownParser';

interface MarkdownPreviewProps {
  onScroll?: (info: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

const COPY_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>';

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

  // Event delegation for copy buttons
  const handleClick = useCallback((e: React.MouseEvent) => {
    const btn = (e.target as HTMLElement).closest('.code-copy-btn') as HTMLButtonElement | null;
    if (!btn) return;
    const wrapper = btn.closest('.code-block-wrapper');
    const codeEl = wrapper?.querySelector('code');
    if (codeEl) {
      navigator.clipboard.writeText(codeEl.textContent || '').then(() => {
        btn.textContent = '已复制';
        setTimeout(() => {
          btn.innerHTML = COPY_SVG + '复制';
        }, 1500);
      });
    }
  }, []);

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
        /* 覆盖排版主题对 pre 的边框/边距/圆角等影响 */
        .markdown-body .code-block-wrapper pre,
        .markdown-body .code-block-wrapper pre.hljs {
          border: none !important;
          outline: none !important;
          margin: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
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
          width: 100%;
          box-sizing: border-box;
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
          padding: 14px 16px 14px 0 !important;
        }
        .markdown-body .code-block-wrapper pre.hljs code {
          padding: 0 !important;
          font-size: 13px;
          line-height: 20px;
          font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          background: transparent !important;
          display: block;
          border: none !important;
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
        /* === 移动端适配 === */
        @media (max-width: 768px) {
          .markdown-body {
            padding: 12px 12px !important;
          }
          .markdown-body .code-block-wrapper {
            margin: 10px 0;
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
          }
          .markdown-body .code-header {
            padding: 6px 10px;
            min-height: 30px;
          }
          .markdown-body .code-lang-label {
            font-size: 11px;
          }
          .markdown-body .code-copy-btn {
            font-size: 11px;
            padding: 2px 6px;
          }
          .markdown-body .code-line-numbers {
            padding: 10px 0 10px 10px;
            font-size: 11px;
            min-width: 22px;
          }
          .markdown-body .code-line-numbers span {
            padding-right: 8px;
          }
          .markdown-body .code-block-wrapper pre.hljs {
            padding: 10px 10px 10px 0 !important;
          }
          .markdown-body .code-block-wrapper pre.hljs code {
            font-size: 11px;
            line-height: 18px;
          }
          .markdown-body .code-mac-dots .dot {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
      <div
        className={`markdown-body${macStyleEnabled ? ' mac-code-theme' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
      />
    </div>
  );
};
