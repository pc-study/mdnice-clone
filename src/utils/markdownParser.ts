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
    if (lang && hljs.getLanguage(lang)) {
      try {
        const result = hljs.highlight(str, { language: lang, ignoreIllegals: true });
        const lines = result.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        const lineNumbers = lines.map((_: string, i: number) => `<span class="code-line-number">${i + 1}</span>`).join('\n');
        const code = lines.join('\n');
        return `<div class="code-block-wrapper"><div class="code-lang-label">${lang}</div><div class="code-block-body"><div class="code-line-numbers">${lineNumbers}</div><pre class="hljs"><code>${code}</code></pre></div></div>`;
      } catch (_e) { /* empty */ }
    }
    return `<div class="code-block-wrapper"><div class="code-block-body"><pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre></div></div>`;
  },
});

md.use(footnote);
md.use(taskLists, { enabled: true });
md.use(sub);
md.use(sup);

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

// Add data-line to headings
const defaultHeadingOpen = md.renderer.rules.heading_open || function(tokens: any[], idx: number, options: any, _env: any, self: any) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.heading_open = function(tokens: any[], idx: number, options: any, env: any, self: any) {
  const token = tokens[idx];
  if (token.map && token.map.length) {
    token.attrSet('data-line', String(token.map[0]));
  }
  return defaultHeadingOpen(tokens, idx, options, env, self);
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

export function renderMarkdown(source: string): string {
  let processed = source;
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

  return html;
}

export { md };
