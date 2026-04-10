import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import taskLists from 'markdown-it-task-lists';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import hljs from 'highlight.js';

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    const langDisplay = lang || '';
    const headerHtml = `<div class="code-header"><span class="code-mac-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></span><span class="code-lang-label">${langDisplay}</span><button class="code-copy-btn" data-copy="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:3px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg>复制</button></div>`;
    if (lang && hljs.getLanguage(lang)) {
      try {
        const result = hljs.highlight(str, { language: lang, ignoreIllegals: true });
        const lines = result.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        const lineNumbers = lines.map((_: string, i: number) => `<span>${i + 1}</span>`).join('');
        const code = lines.join('\n');
        return `<div class="code-block-wrapper">${headerHtml}<div class="code-block-body"><div class="code-line-numbers">${lineNumbers}</div><pre class="hljs"><code>${code}</code></pre></div></div>`;
      } catch (_e) { /* empty */ }
    }
    return `<div class="code-block-wrapper">${headerHtml}<div class="code-block-body"><pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre></div></div>`;
  },
});

md.use(footnote);
md.use(taskLists, { enabled: true });
md.use(sub);
md.use(sup);

// Override fence rule to use highlight output directly (avoid markdown-it wrapping in <pre><code>)
md.renderer.rules.fence = function(tokens: any[], idx: number, options: any, _env: any, _self: any) {
  const token = tokens[idx];
  const info = token.info ? token.info.trim() : '';
  const lang = info.split(/\s+/g)[0] || '';
  const str = token.content;
  if (options.highlight) {
    const highlighted = options.highlight(str, lang, '');
    if (highlighted) {
      // Add data-line attribute for sync scrolling
      if (token.map && token.map.length) {
        return highlighted.replace(/^<div /, `<div data-line="${token.map[0]}" `);
      }
      return highlighted;
    }
  }
  // Fallback
  return `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`;
};

// Wrap tables in a scrollable container for overflow handling
const defaultTableOpen = md.renderer.rules.table_open || function(tokens: any[], idx: number, options: any, _env: any, self: any) {
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.table_open = function(tokens: any[], idx: number, options: any, env: any, self: any) {
  return '<div class="table-wrapper">' + defaultTableOpen(tokens, idx, options, env, self);
};
const defaultTableClose = md.renderer.rules.table_close || function(tokens: any[], idx: number, options: any, _env: any, self: any) {
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.table_close = function(tokens: any[], idx: number, options: any, env: any, self: any) {
  return defaultTableClose(tokens, idx, options, env, self) + '</div>';
};

// Add data-line attributes for sync scrolling
const defaultRender = md.renderer.rules.paragraph_open || function(tokens: any[], idx: number, options: any, _env: any, self: any) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.paragraph_open = function(tokens: any[], idx: number, options: any, env: any, self: any) {
  const token = tokens[idx];
  if (token.map && token.map.length) {
    token.attrSet('data-line', String(token.map[0]));
  }
  return defaultRender(tokens, idx, options, env, self);
};

// Add data-line to headings + wrap content in prefix/content/suffix spans (for mdnice theme compatibility)
const defaultHeadingOpen = md.renderer.rules.heading_open || function(tokens: any[], idx: number, options: any, _env: any, self: any) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.heading_open = function(tokens: any[], idx: number, options: any, env: any, self: any) {
  const token = tokens[idx];
  if (token.map && token.map.length) {
    token.attrSet('data-line', String(token.map[0]));
  }
  return defaultHeadingOpen(tokens, idx, options, env, self) +
    '<span class="prefix"></span><span class="content">';
};

const defaultHeadingClose = md.renderer.rules.heading_close || function(tokens: any[], idx: number, options: any, _env: any, self: any) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.heading_close = function(tokens: any[], idx: number, options: any, env: any, self: any) {
  return '</span><span class="suffix"></span>' + defaultHeadingClose(tokens, idx, options, env, self);
};

// KaTeX support
function renderKaTeX(content: string): string {
  try {
    const katex = (window as any).katex;
    if (!katex) return content;
    // Block math $$...$$
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string, formula: string) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false, output: 'html' });
      } catch (_e) { return _match; }
    });
    // Inline math $...$
    content = content.replace(/\$([^\$\n]+?)\$/g, (_match: string, formula: string) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false, output: 'html' });
      } catch (_e) { return _match; }
    });
    return content;
  } catch (_e) {
    return content;
  }
}

// Pre-process: column layout (:::: column ... ::::)
function preprocessColumns(source: string): string {
  return source.replace(
    /^:{4}\s+column\s*\n([\s\S]*?)^:{4}\s*$/gm,
    (_match: string, inner: string) => {
      let html = '<div class="column-container" style="display:flex;gap:10px;">\n';
      // Match each ::: column-left/right with optional width
      const colRe = /^:{3}\s+(column-\w+)\s*(\d+%?)?\s*\n([\s\S]*?)^:{3}\s*$/gm;
      let m: RegExpExecArray | null;
      while ((m = colRe.exec(inner)) !== null) {
        const className = m[1];
        const width = m[2] || 'auto';
        const content = m[3].trim();
        const widthStyle = width !== 'auto' ? `width:${width};` : 'flex:1;';
        html += `<div class="${className}" style="${widthStyle}">\n\n${content}\n\n</div>\n`;
      }
      html += '</div>';
      return html;
    }
  );
}

// Pre-process: container blocks (::: block-N ... :::)
function preprocessContainers(source: string): string {
  return source.replace(
    /^:{3}\s+(block-\w+)\s*\n([\s\S]*?)^:{3}\s*$/gm,
    (_match: string, className: string, content: string) => {
      return `<div class="block-container ${className}">\n\n${content.trim()}\n\n</div>`;
    }
  );
}

// Post-process: ruby annotation {文字|拼音}
function postprocessRuby(html: string): string {
  return html.replace(
    /\{([^{}|]+)\|([^{}|]+)\}/g,
    (_match: string, text: string, pinyin: string) => {
      return `<ruby>${text}<rp>(</rp><rt>${pinyin}</rt><rp>)</rp></ruby>`;
    }
  );
}

// Post-process: image size syntax ![alt](url =WxH) or ![alt](url =W%x)
function postprocessImageSize(html: string): string {
  return html.replace(
    /<img\s+src="([^"]*?)\s*=(\d+%?)x(\d+%?)?"([^>]*?)alt="([^"]*?)"([^>]*?)\/?>/g,
    (_match: string, src: string, w: string, h: string, before: string, alt: string, after: string) => {
      const width = w ? ` width="${w}"` : '';
      const height = h ? ` height="${h}"` : '';
      return `<img src="${src.trim()}"${before}alt="${alt}"${after}${width}${height} />`;
    }
  );
}

// Post-process: TOC (Table of Contents)
// Replaces [TOC] placeholder with a generated table of contents from h2/h3 headings
function postprocessTOC(html: string): string {
  if (!html.includes('%%TOC_PLACEHOLDER%%')) return html;

  // Extract h2 and h3 headings from rendered HTML
  const headingRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: { level: number; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(html)) !== null) {
    // Strip HTML tags from heading text
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      headings.push({ level: parseInt(m[1]), text });
    }
  }

  if (headings.length === 0) {
    return html.replace(/%%TOC_PLACEHOLDER%%/g, '');
  }

  // Generate TOC HTML as nested list
  let toc = '<div class="toc-container" style="padding:12px 20px;margin:16px 0;border-radius:6px;background:#f8f9fa;border:1px solid #e9ecef;">\n';
  toc += '<p style="font-weight:600;margin:0 0 8px;color:#333;">目录</p>\n<ul style="list-style:none;padding:0;margin:0;">\n';

  for (const h of headings) {
    const indent = h.level === 3 ? 'padding-left:20px;' : '';
    const fontSize = h.level === 3 ? 'font-size:13px;' : 'font-size:14px;';
    toc += `<li style="${indent}${fontSize}line-height:2;color:#555;">${h.text}</li>\n`;
  }

  toc += '</ul>\n</div>';

  return html.replace(/%%TOC_PLACEHOLDER%%/g, toc);
}

export function renderMarkdown(source: string): string {
  let processed = source;

  // Pre-process: replace [TOC] with placeholder (before math extraction to avoid conflicts)
  processed = processed.replace(/^\[TOC\]\s*$/gm, '%%TOC_PLACEHOLDER%%');

  const mathBlocks: string[] = [];
  // Block math
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_match: string) => {
    mathBlocks.push(_match);
    return `%%MATH_BLOCK_${mathBlocks.length - 1}%%`;
  });
  // Inline math
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_match: string) => {
    mathBlocks.push(_match);
    return `%%MATH_BLOCK_${mathBlocks.length - 1}%%`;
  });

  // Pre-process: column layouts (must come before container blocks)
  processed = preprocessColumns(processed);
  // Pre-process: container blocks
  processed = preprocessContainers(processed);

  let html = md.render(processed);

  // Restore math and render with KaTeX
  html = html.replace(/%%MATH_BLOCK_(\d+)%%/g, (_match: string, idx: string) => {
    return mathBlocks[parseInt(idx)];
  });

  html = renderKaTeX(html);

  // Post-process: ruby annotations
  html = postprocessRuby(html);

  // Post-process: image sizes
  html = postprocessImageSize(html);

  // Post-process: TOC
  html = postprocessTOC(html);

  return html;
}

export { md };
