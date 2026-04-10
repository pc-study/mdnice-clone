// Convert class-based styles to inline styles for WeChat compatibility
function getComputedStylesForElement(el: Element): string {
  const computed = window.getComputedStyle(el);
  const important = [
    'color', 'background-color', 'font-size', 'font-weight', 'font-style',
    'font-family', 'line-height', 'text-align', 'text-decoration', 'margin',
    'padding', 'border', 'border-left', 'border-bottom', 'border-radius',
    'display', 'width', 'max-width', 'overflow', 'white-space',
    'list-style-type', 'list-style-position', 'vertical-align',
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
  return clone.outerHTML;
}

export async function copyAsWechat(previewContainer: Element): Promise<void> {
  const themeEl = previewContainer.querySelector('.preview-theme');
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
  const themeEl = previewContainer.querySelector('.preview-theme');
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
