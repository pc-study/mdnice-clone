// Convert class-based styles to inline styles for WeChat compatibility
function getComputedStylesForElement(el: Element): string {
  const computed = window.getComputedStyle(el);
  const important = [
    'color', 'background-color', 'background', 'font-size', 'font-weight', 'font-style',
    'font-family', 'line-height', 'text-align', 'text-decoration', 'margin',
    'padding', 'border', 'border-left', 'border-right', 'border-top', 'border-bottom',
    'border-collapse', 'border-spacing', 'border-radius',
    'display', 'width', 'min-width', 'max-width', 'overflow', 'white-space',
    'list-style-type', 'list-style-position', 'vertical-align',
    'box-sizing', 'word-break', 'word-wrap',
  ];
  return important.map((prop) => `${prop}:${computed.getPropertyValue(prop)}`).join(';');
}

function inlineStyles(container: Element): string {
  const clone = container.cloneNode(true) as Element;
  // Apply computed styles to all elements
  const allElements = clone.querySelectorAll('*');
  const originalElements = container.querySelectorAll('*');
  allElements.forEach((el, i) => {
    if (originalElements[i]) {
      (el as HTMLElement).setAttribute('style', getComputedStylesForElement(originalElements[i]));
    }
  });
  // Also set root styles
  (clone as HTMLElement).setAttribute('style', getComputedStylesForElement(container));

  // WeChat special handling: unwrap .table-wrapper divs (WeChat doesn't support overflow-x)
  clone.querySelectorAll('.table-wrapper').forEach((wrapper) => {
    const table = wrapper.querySelector('table');
    if (table) {
      wrapper.parentNode?.replaceChild(table, wrapper);
    }
  });

  // WeChat special handling: ensure every table cell has explicit border
  clone.querySelectorAll('table').forEach((table) => {
    const htmlTable = table as HTMLElement;
    const existingStyle = htmlTable.getAttribute('style') || '';
    // Remove computed width/min-width and force 100% width + fixed layout
    const cleanedStyle = existingStyle
      .replace(/\bwidth\s*:[^;]+;?/g, '')
      .replace(/\bmin-width\s*:[^;]+;?/g, '')
      .replace(/\bmax-width\s*:[^;]+;?/g, '');
    htmlTable.setAttribute('style', cleanedStyle + ';border-collapse:collapse;width:100%;table-layout:fixed;');
  });
  clone.querySelectorAll('th, td').forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    const existingStyle = htmlCell.getAttribute('style') || '';
    // Remove computed width/min-width so cells distribute evenly
    const cleanedStyle = existingStyle
      .replace(/\bwidth\s*:[^;]+;?/g, '')
      .replace(/\bmin-width\s*:[^;]+;?/g, '')
      .replace(/\bmax-width\s*:[^;]+;?/g, '');
    // Only add border if not already present with a visible value
    if (!cleanedStyle.includes('border:') || cleanedStyle.includes('border:none') || cleanedStyle.includes('border: none')) {
      htmlCell.setAttribute('style', cleanedStyle + ';border:1px solid #dfe2e5;padding:6px 13px;');
    }
  });

  // Remove code copy buttons and line numbers (not useful in WeChat)
  clone.querySelectorAll('.code-copy-btn').forEach((btn) => btn.remove());

  return clone.outerHTML;
}

export async function copyAsWechat(previewContainer: Element): Promise<void> {
  const themeEl = previewContainer.querySelector('.markdown-body');
  if (!themeEl) throw new Error('Preview content not found');

  const html = inlineStyles(themeEl);
  const blob = new Blob([html], { type: 'text/html' });
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob }),
    ]);
  } catch {
    // Fallback
    const range = document.createRange();
    range.selectNodeContents(themeEl);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    document.execCommand('copy');
    sel?.removeAllRanges();
  }
}

export async function copyAsZhihu(previewContainer: Element): Promise<void> {
  const themeEl = previewContainer.querySelector('.markdown-body');
  if (!themeEl) throw new Error('Preview content not found');
  const html = themeEl.innerHTML;
  const blob = new Blob([html], { type: 'text/html' });
  await navigator.clipboard.write([
    new ClipboardItem({ 'text/html': blob }),
  ]);
}

export async function copyAsJuejin(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}
