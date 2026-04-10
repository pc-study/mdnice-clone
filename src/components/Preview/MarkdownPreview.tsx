import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useThemeStore } from '../../store/themeStore';
import { themes } from '../../themes';
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

  useEffect(() => {
    // Load highlight.js theme CSS
    const linkId = 'hljs-theme-link';
    let link = document.getElementById(linkId) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${currentCodeTheme}.min.css`;
  }, [currentCodeTheme]);

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
      <style>{`
        .code-block-wrapper { position: relative; margin: 1em 0; }
        .code-lang-label { position: absolute; top: 0; right: 8px; font-size: 12px; color: #999; padding: 2px 8px; }
        .code-block-body { display: flex; }
        .code-line-numbers { padding: 16px 8px 16px 12px; text-align: right; color: #666; font-size: 13px; line-height: 1.5; font-family: monospace; user-select: none; background: rgba(0,0,0,0.05); }
        .code-line-numbers span { display: block; }
        .hljs { flex: 1; margin: 0; }
      `}</style>
      <div
        className="preview-theme"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
