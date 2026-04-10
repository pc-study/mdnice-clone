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

// 检测代码主题是浅色还是深色（基于 .hljs 背景色亮度）
function detectLightCodeTheme(css: string): boolean {
  const bgMatch = css.match(/\.hljs\s*\{[^}]*?background\s*:\s*([^;}]+)/i)
    || css.match(/\.hljs\s*\{[^}]*?background-color\s*:\s*([^;}]+)/i);
  if (!bgMatch) return false;
  const bg = bgMatch[1].trim();
  let r = 0, g = 0, b = 0;
  const hexMatch = bg.match(/#([0-9a-fA-F]{3,8})/);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else {
    const rgbMatch = bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1]);
      g = parseInt(rgbMatch[2]);
      b = parseInt(rgbMatch[3]);
    } else if (/white|#fff\b/i.test(bg)) {
      return true;
    } else {
      return false;
    }
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
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
  const [isLightCode, setIsLightCode] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetchCodeThemeCSS(currentCodeTheme).then((css) => {
      if (!cancelled) {
        setCodeThemeCSS(css);
        setIsLightCode(detectLightCodeTheme(css));
      }
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

  const codeColorClass = isLightCode ? ' light-code-theme' : '';

  return (
    <div className="preview-scroll-container" style={{ height: '100%', overflow: 'auto', backgroundColor: '#fff' }} ref={ref} onScroll={handleScroll}>
      <style>{themeCSS}</style>
      <style>{codeThemeCSS}</style>
      <style>{`
        /* === 预览区滚动条 === */
        .preview-scroll-container::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .preview-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .preview-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 3px;
        }
        .preview-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }

        /* === 排版节奏 === */
        .markdown-body {
          padding: 24px 32px;
          max-width: 780px;
          margin: 0 auto;
        }

        /* === 代码块整体容器 === */
        .markdown-body .code-block-wrapper {
          position: relative;
          margin: 20px 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
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
          border-bottom: 1px solid rgba(128,128,128,0.1);
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

        /* 深色代码主题 - 默认 */
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

        /* 浅色代码主题 - 覆盖颜色 */
        .markdown-body.light-code-theme .code-lang-label {
          color: rgba(0,0,0,0.4);
        }
        .markdown-body.light-code-theme .code-copy-btn {
          color: rgba(0,0,0,0.35);
        }
        .markdown-body.light-code-theme .code-copy-btn:hover {
          color: rgba(0,0,0,0.7);
          background: rgba(0,0,0,0.06);
        }
        .markdown-body.light-code-theme .code-line-numbers {
          color: rgba(0,0,0,0.2);
        }
        .markdown-body.light-code-theme .code-header {
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .markdown-body.light-code-theme .code-block-wrapper {
          border-color: rgba(0,0,0,0.12);
        }

        /* === 代码内容区 === */
        .markdown-body .code-block-body {
          display: flex;
          overflow: auto;
          width: 100%;
          box-sizing: border-box;
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

        /* === 图片优化 === */
        .markdown-body img {
          max-width: 100%;
          display: block;
          margin: 16px auto;
          border-radius: 4px;
        }

        /* === 表格优化 === */
        .markdown-body .table-wrapper {
          overflow-x: auto;
          margin: 16px 0;
          -webkit-overflow-scrolling: touch;
        }
        .markdown-body .table-wrapper table {
          margin: 0;
        }
        .markdown-body table {
          border-collapse: collapse;
          min-width: 100%;
          display: table;
        }
        .markdown-body table th,
        .markdown-body table td {
          min-width: 80px;
        }

        /* === 行内代码保底样式 === */
        .markdown-body code:not(.hljs):not([class*="language-"]) {
          padding: 0.1em 0.4em;
          border-radius: 3px;
          font-size: 0.875em;
        }

        /* === 移动端适配 === */
        @media (max-width: 768px) {
          .markdown-body {
            padding: 16px 16px !important;
            max-width: none;
          }
          .markdown-body .code-block-wrapper {
            margin: 12px 0;
            border-radius: 6px;
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
            font-size: 12px;
            min-width: 22px;
          }
          .markdown-body .code-line-numbers span {
            padding-right: 8px;
          }
          .markdown-body .code-block-wrapper pre.hljs {
            padding: 10px 10px 10px 0 !important;
          }
          .markdown-body .code-block-wrapper pre.hljs code {
            font-size: 12px;
            line-height: 18px;
          }
          .markdown-body .code-mac-dots .dot {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
      <div
        className={`markdown-body${macStyleEnabled ? ' mac-code-theme' : ''}${codeColorClass}`}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
      />
    </div>
  );
};
