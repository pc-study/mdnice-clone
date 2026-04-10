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
        .markdown-body .code-block-wrapper {
          position: relative;
          margin: 16px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }
        .markdown-body .code-lang-label {
          position: absolute;
          top: 8px;
          right: 12px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          padding: 1px 8px;
          z-index: 1;
          pointer-events: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .markdown-body .code-block-body {
          display: flex;
          overflow: auto;
        }
        .markdown-body .code-line-numbers {
          padding: 12px 0 12px 12px;
          min-width: 32px;
          text-align: right;
          color: rgba(255,255,255,0.3);
          font-size: 13px;
          line-height: 1.5;
          font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          user-select: none;
          flex-shrink: 0;
          background: inherit;
        }
        .markdown-body .code-line-numbers span {
          display: block;
          padding-right: 12px;
        }
        .markdown-body .code-block-wrapper pre.hljs {
          flex: 1;
          margin: 0 !important;
          padding: 12px 16px 12px 12px !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .markdown-body .code-block-wrapper pre.hljs code {
          padding: 0 !important;
          font-size: 13px;
          line-height: 1.5;
          font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          background: transparent !important;
          display: block;
        }
        .markdown-body img {
          max-width: 100%;
        }
        .markdown-body table {
          border-collapse: collapse;
          width: auto;
          display: table;
        }
        /* Mac 风格三色圆点 */
        .markdown-body.mac-code-theme .code-block-wrapper {
          padding-top: 28px;
        }
        .markdown-body.mac-code-theme .code-block-wrapper::before {
          content: '';
          position: absolute;
          top: 9px;
          left: 14px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fc625d;
          box-shadow: 16px 0 0 #fdbc40, 32px 0 0 #35cd4b;
          z-index: 2;
        }
        .markdown-body.mac-code-theme .code-lang-label {
          top: 6px;
        }
      `}</style>
      <div
        className={`markdown-body${macStyleEnabled ? ' mac-code-theme' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
