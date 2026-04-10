import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';
import { themes } from '../../themes';
import { codeThemes } from '../../codeThemes';
import { renderMarkdown } from '../../utils/markdownParser';

interface MarkdownPreviewProps {
  onScroll?: (info: { scrollTop: number; scrollHeight: number; clientHeight: number }) => void;
  previewRef?: React.RefObject<HTMLDivElement | null>;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ onScroll, previewRef: externalRef }) => {
  const content = useEditorStore((s) => s.content);
  const { currentTheme, currentCodeTheme } = useThemeStore();
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = externalRef || internalRef;

  // Debounced content for rendering (300ms)
  const [debouncedContent, setDebouncedContent] = useState(content);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedContent(content), 300);
    return () => clearTimeout(timer);
  }, [content]);

  const html = useMemo(() => renderMarkdown(debouncedContent), [debouncedContent]);
  const themeCSS = useMemo(() => themes[currentTheme]?.css || '', [currentTheme]);
  const codeThemeCSS = useMemo(() => codeThemes[currentCodeTheme]?.css || '', [currentCodeTheme]);
  const isMacCodeTheme = codeThemes[currentCodeTheme]?.isMac || false;

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
          margin: 10px 0;
          border-radius: 5px;
          overflow: hidden;
          box-shadow: rgba(0, 0, 0, 0.12) 0px 2px 8px;
        }
        .markdown-body .code-lang-label {
          position: absolute;
          top: 6px;
          right: 12px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          padding: 0 6px;
          z-index: 1;
          pointer-events: none;
        }
        .markdown-body .code-block-body {
          display: flex;
          overflow: auto;
        }
        .markdown-body .code-line-numbers {
          padding: 15px 8px 15px 12px;
          text-align: right;
          color: rgba(255,255,255,0.35);
          font-size: 12px;
          line-height: 1.75;
          font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
          user-select: none;
          flex-shrink: 0;
        }
        .markdown-body .code-line-numbers span { display: block; }
        .markdown-body .code-block-wrapper pre.hljs {
          flex: 1;
          margin: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .markdown-body .code-block-wrapper pre.hljs code {
          padding: 15px 12px !important;
          font-size: 12px;
          line-height: 1.75;
          background: transparent !important;
        }
        .markdown-body .code-line-numbers {
          background: inherit;
        }
        .markdown-body img {
          max-width: 100%;
        }
        .markdown-body table {
          border-collapse: collapse;
          width: auto;
          display: table;
        }
        .markdown-body.mac-code-theme .code-block-wrapper::before {
          content: '';
          display: block;
          height: 30px;
          width: 100%;
          background: inherit;
          border-radius: 5px 5px 0 0;
          position: relative;
        }
        .markdown-body.mac-code-theme .code-block-wrapper::after {
          content: '';
          position: absolute;
          top: 10px;
          left: 12px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fc625d;
          box-shadow: 20px 0 0 #fdbc40, 40px 0 0 #35cd4b;
          z-index: 2;
        }
        .markdown-body.mac-code-theme .code-block-body {
          margin-top: -7px;
        }
        .markdown-body.mac-code-theme .code-lang-label {
          top: 36px;
        }
      `}</style>
      <div
        className={`markdown-body${isMacCodeTheme ? ' mac-code-theme' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
