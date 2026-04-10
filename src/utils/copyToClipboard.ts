// ============================================================
// 微信公众号富文本复制
// 核心思路：将预览区的 CSS class 样式转为内联 style，
//          将 ::before/::after 伪元素物化为真实 DOM 节点，
//          将 flex 等微信不支持的布局转为兼容方案。
// ============================================================

// 需要内联的 CSS 属性列表（覆盖所有视觉属性，不用 shorthand）
const INLINE_PROPS = [
  'color', 'background-color', 'background-image', 'background-repeat',
  'background-position', 'background-size',
  'font-size', 'font-weight', 'font-style', 'font-family',
  'line-height', 'text-align', 'text-decoration', 'text-indent',
  'letter-spacing', 'word-spacing', 'text-transform', 'text-shadow',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-style', 'border-top-width', 'border-top-color',
  'border-right-style', 'border-right-width', 'border-right-color',
  'border-bottom-style', 'border-bottom-width', 'border-bottom-color',
  'border-left-style', 'border-left-width', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-left-radius', 'border-bottom-right-radius',
  'border-collapse', 'border-spacing',
  'display', 'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
  'overflow', 'overflow-x', 'overflow-y',
  'white-space', 'word-break', 'overflow-wrap', 'word-wrap',
  'list-style-type', 'list-style-position',
  'vertical-align', 'box-sizing', 'box-shadow', 'opacity',
  'float', 'clear',
  'position', 'top', 'right', 'bottom', 'left',
  'z-index',
  // flex（给物化的伪元素和部分容器保留）
  'flex-direction', 'justify-content', 'align-items', 'flex-wrap',
  'flex-grow', 'flex-shrink', 'flex-basis',
];

// 用于伪元素的属性列表（稍少一些）
const PSEUDO_PROPS = [
  'content', 'display',
  'color', 'background-color', 'background-image',
  'font-size', 'font-weight', 'font-style', 'font-family',
  'line-height', 'text-align', 'text-decoration', 'text-indent',
  'letter-spacing', 'word-spacing', 'text-shadow',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-style', 'border-top-width', 'border-top-color',
  'border-right-style', 'border-right-width', 'border-right-color',
  'border-bottom-style', 'border-bottom-width', 'border-bottom-color',
  'border-left-style', 'border-left-width', 'border-left-color',
  'border-top-left-radius', 'border-top-right-radius',
  'border-bottom-left-radius', 'border-bottom-right-radius',
  'width', 'height', 'max-width', 'min-width',
  'position', 'top', 'right', 'bottom', 'left',
  'float', 'clear', 'vertical-align',
  'box-sizing', 'box-shadow', 'opacity',
];

/** 从 getComputedStyle 提取指定属性列表为内联 style 字符串 */
function buildStyleString(computed: CSSStyleDeclaration, props: string[]): string {
  const parts: string[] = [];
  for (const prop of props) {
    const val = computed.getPropertyValue(prop);
    if (val) parts.push(`${prop}:${val}`);
  }
  return parts.join(';');
}

/** 将 flex display 转换为微信兼容的 display（微信不支持 flex） */
function fixDisplayForWechat(style: string): string {
  // 将 display:flex / display:inline-flex 替换为 block
  return style
    .replace(/display\s*:\s*inline-flex/g, 'display:inline-block')
    .replace(/display\s*:\s*flex/g, 'display:block');
}

/**
 * 物化伪元素（::before / ::after）
 * 检查原始 DOM 元素的 ::before 和 ::after，如果有可见内容，
 * 在 clone 的对应元素中插入一个真实的 <span> 携带其计算样式。
 */
function materializePseudoElements(cloneEl: Element, origEl: Element) {
  for (const pseudo of ['::before', '::after'] as const) {
    const cs = window.getComputedStyle(origEl, pseudo);
    const content = cs.getPropertyValue('content');
    // content 为 none / "" / normal 时表示不存在
    if (!content || content === 'none' || content === 'normal' || content === '""' || content === "''") continue;
    const display = cs.getPropertyValue('display');
    if (display === 'none') continue;

    const span = document.createElement('span');

    // 解析 content 值（去掉引号）
    let text = '';
    const m = content.match(/^["'](.*)["']$/);
    if (m) text = m[1];
    // content 可能是 attr() / url() 等，这里只处理文本
    if (text) span.textContent = text;

    // 构建样式
    let style = buildStyleString(cs, PSEUDO_PROPS);
    // 移除 content 属性（已作为 textContent）
    style = style.replace(/content\s*:[^;]+;?/g, '');
    // 修复 display
    style = fixDisplayForWechat(style);
    span.setAttribute('style', style);

    if (pseudo === '::before') {
      cloneEl.insertBefore(span, cloneEl.firstChild);
    } else {
      cloneEl.appendChild(span);
    }
  }
}

// ---------- 代码块转换（微信兼容） ----------

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

function convertCodeBlocksForWechat(clone: Element, original: Element, macEnabled: boolean) {
  const wrappers = Array.from(clone.querySelectorAll('.code-block-wrapper'));
  const originalWrappers = Array.from(original.querySelectorAll('.code-block-wrapper'));

  wrappers.forEach((wrapper, idx) => {
    const origWrapper = originalWrappers[idx];
    if (!origWrapper) return;

    const wrapperBg = window.getComputedStyle(origWrapper).backgroundColor || '#282c34';
    const isLight = isLightBackground(wrapperBg);
    const textColor = isLight ? '#383a42' : '#abb2bf';
    const dimColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    const labelColor = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)';

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

    const codeHTML = codeEl.innerHTML;
    const codeText = codeEl.textContent || '';
    const lines = codeText.split('\n');
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
    const lineCount = lines.length;

    const langLabel = wrapper.querySelector('.code-lang-label');
    const lang = langLabel ? langLabel.textContent || '' : '';

    // 构建微信兼容 HTML
    const section = document.createElement('section');
    section.setAttribute('style', `background:${wrapperBg};border-radius:8px;margin:20px 0;overflow:auto;`);

    const header = document.createElement('section');
    header.setAttribute('style', `padding:8px 16px;margin:0;border-bottom:1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(128,128,128,0.1)'};`);

    if (macEnabled) {
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

    // 用 table 实现行号 + 代码
    const table = document.createElement('table');
    table.setAttribute('style', 'border-collapse:collapse;width:100%;border:none;margin:0;background:transparent;');
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    tr.setAttribute('style', 'border:none;background:transparent;');

    const lineNumTd = document.createElement('td');
    lineNumTd.setAttribute('style', `padding:14px 0 14px 16px;border:none;vertical-align:top;color:${dimColor};font-size:13px;line-height:20px;font-family:"SFMono-Regular",Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;white-space:pre;text-align:right;width:1px;`);
    lineNumTd.innerHTML = Array.from({ length: lineCount }, (_, i) =>
      `<span style="display:block;color:${dimColor};">${i + 1}</span>`
    ).join('');

    const codeTd = document.createElement('td');
    codeTd.setAttribute('style', 'padding:0;border:none;vertical-align:top;');
    const pre = document.createElement('pre');
    pre.setAttribute('style', 'background:transparent;margin:0;padding:14px 16px 14px 12px;border:none;overflow-x:auto;');
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

// ---------- 主函数 ----------

function inlineStyles(container: Element): string {
  const tempAttr = '_wc_idx';

  // 1. 先在原始 DOM 打标记，clone 后就能匹配
  const origAllEls = Array.from(container.querySelectorAll('*'));
  origAllEls.forEach((el, i) => el.setAttribute(tempAttr, String(i)));

  const clone = container.cloneNode(true) as Element;

  // 立即清除原始 DOM 标记
  origAllEls.forEach((el) => el.removeAttribute(tempAttr));

  const macEnabled = container.classList.contains('mac-code-theme');

  // 2. 代码块转换（在物化伪元素之前，因为代码块区域不需要物化）
  convertCodeBlocksForWechat(clone, container, macEnabled);

  // 3. 移除交互元素
  clone.querySelectorAll('.code-copy-btn').forEach((btn) => btn.remove());
  clone.querySelectorAll('.code-mac-dots').forEach((el) => el.remove());
  clone.querySelectorAll('.code-line-numbers').forEach((el) => el.remove());

  // 4. 标记已转换的代码块区域（不需要再处理）
  const processedEls = new Set<Element>();
  clone.querySelectorAll('section').forEach((sec) => {
    const s = sec.getAttribute('style') || '';
    if (s.includes('border-radius:8px') && s.includes('overflow:auto')) {
      processedEls.add(sec);
      sec.querySelectorAll('*').forEach((child) => processedEls.add(child));
    }
  });

  // 5. 遍历 clone 元素，内联样式 + 物化伪元素
  const cloneAllEls = Array.from(clone.querySelectorAll('*'));
  cloneAllEls.forEach((el) => {
    if (processedEls.has(el)) return;

    const idx = el.getAttribute(tempAttr);
    if (idx === null) return;

    const origEl = origAllEls[parseInt(idx)];
    if (!origEl) return;

    // 内联计算样式
    const computed = window.getComputedStyle(origEl);
    let style = buildStyleString(computed, INLINE_PROPS);
    style = fixDisplayForWechat(style);
    (el as HTMLElement).setAttribute('style', style);

    // 物化伪元素
    materializePseudoElements(el, origEl);

    el.removeAttribute(tempAttr);
  });

  // 6. 根元素样式
  let rootStyle = buildStyleString(window.getComputedStyle(container), INLINE_PROPS);
  rootStyle = fixDisplayForWechat(rootStyle);
  (clone as HTMLElement).setAttribute('style', rootStyle);
  // 物化根元素伪元素
  materializePseudoElements(clone, container);

  // 7. 处理表格
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
    if (!cleanedStyle.includes('border:') && !cleanedStyle.includes('border-top-style:solid')) {
      htmlCell.setAttribute('style', cleanedStyle + ';border:1px solid #dfe2e5;padding:6px 13px;');
    }
  });

  // 8. 移除 data-* / class / 临时标记属性
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

// ---------- 导出 ----------

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
