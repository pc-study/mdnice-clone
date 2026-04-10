// Convert class-based styles to inline styles for WeChat compatibility
function getComputedStylesForElement(el: Element): string {
  const computed = window.getComputedStyle(el);
  const important = [
    'color', 'background-color', 'background',
    'font-size', 'font-weight', 'font-style', 'font-family',
    'line-height', 'text-align', 'text-decoration', 'text-indent',
    'letter-spacing', 'word-spacing',
    // 使用具体方向的 margin/padding，因为 getComputedStyle 对 shorthand 不可靠
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border', 'border-left', 'border-right', 'border-top', 'border-bottom',
    'border-collapse', 'border-spacing', 'border-radius',
    'display', 'width', 'min-width', 'max-width', 'height',
    'overflow', 'white-space',
    'list-style-type', 'list-style-position', 'vertical-align',
    'box-sizing', 'word-break', 'overflow-wrap',
    'text-shadow', 'box-shadow', 'opacity',
  ];
  const parts: string[] = [];
  for (const prop of important) {
    const val = computed.getPropertyValue(prop);
    if (val && val !== 'none' && val !== 'normal' && val !== 'auto' && val !== '0px'
      && val !== 'visible' && val !== 'baseline' && val !== 'start'
      && val !== 'content-box' && val !== 'disc' && val !== 'outside') {
      // 跳过默认值以减小 HTML 体积
      parts.push(`${prop}:${val}`);
    }
  }
  return parts.join(';');
}

/**
 * 将代码块转换为微信公众号兼容结构
 * 保留 Mac 三色圆点、语言标签、行号、语法高亮
 * 移除微信不支持的：flex 布局、button、SVG
 * 圆点用 display:inline-block + 固定宽高 + border-radius 实现
 * 行号嵌入到每行代码前面，用 span 包裹
 */
function convertCodeBlocksForWechat(clone: Element, original: Element, macEnabled: boolean) {
  const wrappers = Array.from(clone.querySelectorAll('.code-block-wrapper'));
  const originalWrappers = Array.from(original.querySelectorAll('.code-block-wrapper'));

  wrappers.forEach((wrapper, idx) => {
    const origWrapper = originalWrappers[idx];
    if (!origWrapper) return;

    // 背景色
    const wrapperBg = window.getComputedStyle(origWrapper).backgroundColor || '#282c34';
    // 判断浅色主题
    const isLight = isLightBackground(wrapperBg);
    const textColor = isLight ? '#383a42' : '#abb2bf';
    const dimColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    const labelColor = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)';

    // 获取代码元素
    const codeEl = wrapper.querySelector('pre.hljs code');
    const origCodeEl = origWrapper.querySelector('pre.hljs code');
    if (!codeEl || !origCodeEl) return;

    // 内联高亮 span 颜色
    const codeSpans = codeEl.querySelectorAll('span');
    const origCodeSpans = origCodeEl.querySelectorAll('span');
    codeSpans.forEach((span, i) => {
      if (span.closest('.code-line-numbers') || span.closest('.code-header')) return;
      if (origCodeSpans[i]) {
        const cs = window.getComputedStyle(origCodeSpans[i]);
        let s = `color:${cs.color};`;
        if (cs.fontWeight !== '400' && cs.fontWeight !== 'normal') s += `font-weight:${cs.fontWeight};`;
        if (cs.fontStyle !== 'normal') s += `font-style:${cs.fontStyle};`;
        (span as HTMLElement).setAttribute('style', s);
      }
    });

    // 提取纯代码 HTML 和行数
    const codeHTML = codeEl.innerHTML;
    const codeText = codeEl.textContent || '';
    const lines = codeText.split('\n');
    // 去掉尾部空行
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    const lineCount = lines.length;

    // 获取语言标签
    const langLabel = wrapper.querySelector('.code-lang-label');
    const lang = langLabel ? langLabel.textContent || '' : '';

    // ---- 构建微信兼容 HTML ----
    const section = document.createElement('section');
    section.setAttribute('style', `background:${wrapperBg};border-radius:8px;margin:20px 0;overflow:auto;`);

    // -- Header: Mac 圆点 + 语言标签 --
    const header = document.createElement('section');
    header.setAttribute('style', `padding:8px 16px;margin:0;border-bottom:1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(128,128,128,0.1)'};`);

    if (macEnabled) {
      // Mac 三色圆点（inline-block span，不用 flex）
      const dotStyle = (color: string) =>
        `display:inline-block;width:12px;height:12px;border-radius:50%;background:${color};margin-right:6px;`;
      const dotsSpan = document.createElement('span');
      dotsSpan.innerHTML =
        `<span style="${dotStyle('#fc625d')}"></span>` +
        `<span style="${dotStyle('#fdbc40')}"></span>` +
        `<span style="${dotStyle('#35cd4b')}margin-right:12px;"></span>`;
      header.appendChild(dotsSpan);
    }

    if (lang) {
      const langSpan = document.createElement('span');
      langSpan.setAttribute('style', `font-size:13px;color:${labelColor};font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;`);
      langSpan.textContent = lang;
      header.appendChild(langSpan);
    }

    section.appendChild(header);

    // -- 代码区域：行号 + 代码 用 table 实现（微信对 table 支持好）--
    const table = document.createElement('table');
    table.setAttribute('style', `border-collapse:collapse;width:100%;border:none;margin:0;background:transparent;`);

    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    tr.setAttribute('style', 'border:none;background:transparent;');

    // 行号列
    const lineNumTd = document.createElement('td');
    lineNumTd.setAttribute('style', `padding:14px 0 14px 16px;border:none;vertical-align:top;color:${dimColor};font-size:13px;line-height:20px;font-family:"SFMono-Regular",Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;white-space:pre;text-align:right;width:1px;`);
    lineNumTd.innerHTML = Array.from({ length: lineCount }, (_, i) =>
      `<span style="display:block;color:${dimColor};">${i + 1}</span>`
    ).join('');

    // 代码列
    const codeTd = document.createElement('td');
    codeTd.setAttribute('style', 'padding:0;border:none;vertical-align:top;');

    const pre = document.createElement('pre');
    pre.setAttribute('style', `background:transparent;margin:0;padding:14px 16px 14px 12px;border:none;overflow-x:auto;`);

    const code = document.createElement('code');
    code.setAttribute('style', `font-size:13px;line-height:20px;font-family:"SFMono-Regular",Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;background:transparent;border:none;padding:0;display:block;white-space:pre;word-wrap:normal;color:${textColor};`);
    code.innerHTML = codeHTML;

    pre.appendChild(code);
    codeTd.appendChild(pre);

    tr.appendChild(lineNumTd);
    tr.appendChild(codeTd);
    tbody.appendChild(tr);
    table.appendChild(tbody);
    section.appendChild(table);

    wrapper.parentNode?.replaceChild(section, wrapper);
  });
}

function isLightBackground(bg: string): boolean {
  let r = 0, g = 0, b = 0;
  const hex = bg.match(/#([0-9a-fA-F]{3,8})/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) { r = parseInt(h[0]+h[0],16); g = parseInt(h[1]+h[1],16); b = parseInt(h[2]+h[2],16); }
    else { r = parseInt(h.substring(0,2),16); g = parseInt(h.substring(2,4),16); b = parseInt(h.substring(4,6),16); }
  } else {
    const rgb = bg.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (rgb) { r = +rgb[1]; g = +rgb[2]; b = +rgb[3]; }
    else return false;
  }
  return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.5;
}

function inlineStyles(container: Element): string {
  const tempAttr = '_wc_idx';

  // ★ 关键修复：先在原始 DOM 上打标记，再 clone
  //   这样 clone 出来的元素也会携带 _wc_idx 属性，后续才能正确匹配回原始元素获取计算样式
  const origAllEls = container.querySelectorAll('*');
  origAllEls.forEach((el, i) => el.setAttribute(tempAttr, String(i)));

  const clone = container.cloneNode(true) as Element;

  // 立即清除原始 DOM 上的标记（不影响 clone）
  origAllEls.forEach((el) => el.removeAttribute(tempAttr));

  // 检测是否启用了 Mac 风格
  const macEnabled = container.classList.contains('mac-code-theme');

  // 1. 先转换代码块为微信兼容结构（保留 Mac 圆点和行号）
  convertCodeBlocksForWechat(clone, container, macEnabled);

  // 2. 移除残留的交互元素
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
  //    clone 中的元素携带 _wc_idx 标记，可直接匹配回原始 DOM 获取计算样式
  const cloneAllEls = clone.querySelectorAll('*');
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
      if (attr.name.startsWith('data-') || attr.name === 'class' || attr.name === tempAttr) {
        el.removeAttribute(attr.name);
      }
    });
  });
  clone.removeAttribute('class');
  clone.removeAttribute(tempAttr);

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
