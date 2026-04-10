// Import .md file
export function importMarkdownFile(): Promise<{ name: string; content: string }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { reject(new Error('No file selected')); return; }
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, content: reader.result as string });
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    };
    input.click();
  });
}

// Export as .md
export function exportMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, filename.endsWith('.md') ? filename : filename + '.md');
}

// Export as .html with theme styles
export function exportHTML(html: string, themeCSS: string, title: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <style>${themeCSS}</style>
  <style>
    body { max-width: 800px; margin: 0 auto; padding: 20px; }
    .code-block-wrapper { position: relative; margin: 1em 0; }
    .code-lang-label { position: absolute; top: 0; right: 8px; font-size: 12px; color: #999; padding: 2px 8px; }
    .code-block-body { display: flex; }
    .code-line-numbers { padding: 16px 8px 16px 12px; text-align: right; color: #666; font-size: 13px; line-height: 1.5; font-family: monospace; user-select: none; background: rgba(0,0,0,0.05); }
    .code-line-numbers span { display: block; }
    .hljs { flex: 1; margin: 0; }
  </style>
</head>
<body>
  <div class="markdown-body">${html}</div>
</body>
</html>`;
  downloadBlob(new Blob([fullHtml], { type: 'text/html;charset=utf-8' }), title + '.html');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
