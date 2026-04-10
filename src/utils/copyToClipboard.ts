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

/**
 * 将代码块转换为微信公众号兼容的简单结构
 * 微信不支持：flex布局、button、SVG、复杂嵌套div
 * 转为：<section style="..."><pre style="..."><code style="...">高亮代码</code></pre></section>
 */
function convertCodeBlocksForWechat(clone: Element, original: Element) {
  const wrappers = Array.from(clone.querySelectorAll('.code-block-wrapper'));
  const originalWrappers = Array.from(original.querySelectorAll('.code-block-wrapper'));

  wrappers.forEach((wrapper, idx) => {
    const origWrapper = originalWrappers[idx];
    if (!origWrapper) return;

    // 获取代码块背景色
    const wrapperBg = window.getComputedStyle(origWrapper).backgroundColor || '#282c34';

    // 获取代码元素
    const codeEl = wrapper.querySelector('pre.hljs code');
    const origCodeEl = origWrapper.querySelector('pre.hljs code');
    if (!codeEl || !origCodeEl) return;

    // 内联所有 highlight.js 的 span 颜色
    const spans = codeEl.querySelectorAll('span');
    const origSpans = origCodeEl.querySelectorAll('span');
    spans.forEach((span, i) => {
      // 跳过行号区域的 span
      if (span.closest('.code-line-numbers')) return;
      if (origSpans[i]) {
        const computed = window.getComputedStyle(origSpans[i]);
        const color = computed.color;
        const fw = computed.fontWeight;
        const fs = computed.fontStyle;
        let style = `color:${color};`;
        if (fw && fw !== '400' && fw !== 'normal') style += `font-weight:${fw};`;
        if (fs && fs !== 'normal') style += `font-style:${fs};`;
        (span as HTMLElement).setAttribute('style', style);
      }
    });

    const codeHTML = codeEl.innerHTML;

    // 获取语言标签
    const langLabel = wrapper.querySelector('.code-lang-label');
    const lang = langLabel ? langLabel.textContent || '' : '';

    // 构建微信兼容结构
    const section = document.createElement('section');
    section.setAttribute('style', [
      `background:${wrapperBg}`,
      'border-radius:8px',
      'margin:20px 0',
      'overflow:auto',
    ].join(';'));

    // 语言标签
    if (lang) {
      const langP = document.createElement('p');
      langP.setAttribute('style', [
        'padding:8px 16px 0',
        'margin:0',
        'font-size:13px',
        'color:rgba(255,255,255,0.5)',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
      ].join(';'));
      langP.textContent = lang;
      section.appendChild(langP);
    }

    const pre = document.createElement('pre');
    pre.setAttribute('style', [
      `background:${wrapperBg}`,
      'margin:0',
      'padding:14px 16px',
      'overflow-x:auto',
      'border:none',
      'border-radius:0 0 8px 8px',
    ].join(';'));

    const code = document.createElement('code');
    code.setAttribute('style', [
      'font-size:13px',
      'line-height:20px',
      'font-family:"SFMono-Regular",Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
      'background:transparent',
      'border:none',
      'padding:0',
      'display:block',
      'white-space:pre',
      'word-wrap:normal',
      'overflow-x:auto',
      'color:#abb2bf',
    ].join(';'));
    code.innerHTML = codeHTML;

    pre.appendChild(code);
    section.appendChild(pre);

    wrapper.parentNode?.replaceChild(section, wrapper);
  });
}

function inlineStyles(container: Element): string {
  const clone = container.cloneNode(true) as Element;

  // 1. 先转换代码块为微信兼容结构
  convertCodeBlocksForWechat(clone, container);

  // 2. 移除不需要的交互元素（残留的）
  clone.querySelectorAll('.code-copy-btn').forEach((btn) => btn.remove());
  clone.querySelectorAll('.code-mac-dots').forEach((el) => el.remove());
  clone.querySelectorAll('.code-line-numbers').forEach((el) => el.remove());

  // 3. 记录已被代码块替换的 section 元素（已有内联样式，无需重复处理）
  const processedEls = new Set<Element>();
  clone.querySelectorAll('section').forEach((sec) => {
    const style = sec.getAttribute('style') || '';
    if (style.includes('border-radius:8px') && style.includes('overflow:auto')) {
      processedEls.add(sec);
      sec.querySelectorAll('*').forEach((child) => processedEls.add(child));
    }
  });

  // 4. 为其他元素内联计算样式
  //    由于代码块结构已改变，用索引匹配不再可靠
  //    改为：对 clone 中非代码块的元素，找到对应的原始元素来获取样式
  //    简化策略：先对原始元素建立标签路径索引
  const origAllEls = container.querySelectorAll('*');
  const cloneAllEls = clone.querySelectorAll('*');

  // 对非代码块元素尝试索引匹配（不完美但足够用）
  // 因为代码块之前的元素索引不变，之后的可能偏移
  // 更好的方案：先给原始 DOM 打标记
  const tempAttr = '_wc_idx';
  origAllEls.forEach((el, i) => el.setAttribute(tempAttr, String(i)));

  // 在 clone 里找到有标记的元素直接用
  cloneAllEls.forEach((el) => {
    if (processedEls.has(el)) return;
    const idx = el.getAttribute(tempAttr);
    if (idx !== null) {
      const origEl = origAllEls[parseInt(idx)];
      if (origEl) {
        (el as HTMLElement).setAttribute('style', getComputedStylesForElement(origEl));
      }
      el.removeAttribute(tempAttr);
    }
  });

  // 清除原始 DOM 上的标记
  origAllEls.forEach((el) => el.removeAttribute(tempAttr));

  // 根元素样式
  (clone as HTMLElement).setAttribute('style', getComputedStylesForElement(container));

  // 5. 处理表格
  clone.querySelectorAll('.table-wrapper').forEach((wrapper) => {
    const table = wrapper.querySelector('table');
    if (table) wrapper.parentNode?.replaceChild(table, wrapper);
  });

  clone.querySelectorAll('table').forEach((table) => {
    const htmlTable = table as HTMLElement;
    const existingStyle = htmlTable.getAttribute('style') || '';
    const cleanedStyle = existingStyle
      .replace(/\bwidth\s*:[^;]+;?/g, '')
      .replace(/\bmin-width\s*:[^;]+;?/g, '')
      .replace(/\bmax-width\s*:[^;]+;?/g, '');
    htmlTable.setAttribute('style', cleanedStyle + ';border-collapse:collapse;width:100%;table-layout:fixed;');
  });

  clone.querySelectorAll('th, td').forEach((cell) => {
    const htmlCell = cell as HTMLElement;
    const existingStyle = htmlCell.getAttribute('style') || '';
    const cleanedStyle = existingStyle
      .replace(/\bwidth\s*:[^;]+;?/g, '')
      .replace(/\bmin-width\s*:[^;]+;?/g, '')
      .replace(/\bmax-width\s*:[^;]+;?/g, '');
    if (!cleanedStyle.includes('border:') || cleanedStyle.includes('border:none') || cleanedStyle.includes('border: none')) {
      htmlCell.setAttribute('style', cleanedStyle + ';border:1px solid #dfe2e5;padding:6px 13px;');
    }
  });

  // 6. 移除 data-* 和 class 属性
  clone.querySelectorAll('*').forEach((el) => {
    const attrs = Array.from(el.attributes);
    attrs.forEach((attr) => {
      if (attr.name.startsWith('data-') || attr.name === 'class') {
        el.removeAttribute(attr.name);
      }
    });
  });
  clone.removeAttribute('class');

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
