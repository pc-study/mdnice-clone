// ============================================================
// 微信公众号富文本复制 — 完整重写
//
// 策略：
// 1. Diff-based 内联：只内联与浏览器默认值不同的属性（减少 HTML 90%+）
// 2. 智能伪元素物化：背景图 → <img>，文本 → <span>，装饰线 → <span>
// 3. 微信兼容：flex → block/inline-block，strip position:absolute
// 4. 代码块：table 布局保留行号 + 语法高亮
// ============================================================

// -- 需要检查的 CSS 属性 --
const STYLE_PROPS = [
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
  'display', 'width', 'max-width', 'min-width',
  'height', 'max-height', 'min-height',
  'overflow', 'white-space', 'word-break', 'overflow-wrap',
  'list-style-type', 'list-style-position',
  'vertical-align', 'box-sizing', 'box-shadow', 'opacity',
];

// 可继承属性（子元素需显式设置，因为微信上下文中不会有父级继承）
const INHERITED_PROPS = new Set([
  'color', 'font-size', 'font-weight', 'font-style', 'font-family',
  'line-height', 'letter-spacing', 'word-spacing', 'text-align',
  'text-indent', 'text-transform', 'white-space', 'word-break',
  'overflow-wrap', 'list-style-type', 'list-style-position',
  'text-decoration',
]);

// ---------- 默认样式缓存 ----------
// 创建一个隐藏容器，放在 body 外部获取浏览器默认计算样式

let _defaultCache: Map<string, Map<string, string>> | null = null;

function getDefaultStylesForTag(tagName: string): Map<string, string> {
  if (!_defaultCache) _defaultCache = new Map();
  const key = tagName.toLowerCase();
  if (_defaultCache.has(key)) return _defaultCache.get(key)!;

  // 创建裸元素
  const sandbox = document.createElement('div');
  sandbox.style.cssText = 'position:fixed;left:-99999px;top:-99999px;visibility:hidden;pointer-events:none;';
  document.body.appendChild(sandbox);

  const el = document.createElement(tagName);
  sandbox.appendChild(el);

  const computed = window.getComputedStyle(el);
  const styles = new Map<string, string>();
  for (const prop of STYLE_PROPS) {
    styles.set(prop, computed.getPropertyValue(prop));
  }

  document.body.removeChild(sandbox);
  _defaultCache.set(key, styles);
  return styles;
}

/** 获取元素相对于默认样式的差异，生成紧凑的内联 style */
function getDiffStyle(origEl: Element): string {
  const computed = window.getComputedStyle(origEl);
  const tag = origEl.tagName.toLowerCase();
  const defaults = getDefaultStylesForTag(tag);
  const parts: string[] = [];

  for (const prop of STYLE_PROPS) {
    const val = computed.getPropertyValue(prop);
    if (!val) continue;
    const def = defaults.get(prop) || '';

    if (val !== def) {
      // 微信兼容：flex → block
      if (prop === 'display') {
        if (val === 'flex') { parts.push('display:block'); continue; }
        if (val === 'inline-flex') { parts.push('display:inline-block'); continue; }
      }
      // 微信兼容：跳过 background-image（微信不支持渐变/data URL，会报图片错误）
      if (prop === 'background-image') continue;
      parts.push(`${prop}:${val}`);
    } else if (INHERITED_PROPS.has(prop)) {
      // 可继承属性即使与 "默认裸元素" 相同，也可能是从主题根继承的值
      // 需要检查是否与真正的浏览器默认值不同
      // 但这里 defaults 已是浏览器默认值（裸元素在无主题容器中）
      // 所以如果值相同就不需要内联——跳过
    }
  }

  return parts.join(';');
}

// ---------- 伪元素物化 ----------

function materializePseudoElements(cloneEl: Element, origEl: Element) {
  for (const pseudo of ['::before', '::after'] as const) {
    const cs = window.getComputedStyle(origEl, pseudo);
    const content = cs.getPropertyValue('content');
    if (!content || content === 'none' || content === 'normal') continue;
    const display = cs.getPropertyValue('display');
    if (display === 'none') continue;

    // 解析 content 文本
    let text = '';
    const m = content.match(/^["']([\s\S]*)["']$/);
    if (m) text = m[1];

    const bgImage = cs.getPropertyValue('background-image');
    const width = cs.getPropertyValue('width');
    const height = cs.getPropertyValue('height');

    let node: HTMLElement;

    if (!text && bgImage && bgImage !== 'none') {
      // 模式 A：content:"" + background-image（图标装饰）
      // 微信兼容：不使用 <img> 或 background-image，改为空白占位 span
      // 因为微信会将 data URL 和渐变背景视为图片并报错
      node = document.createElement('span');
      const w = width && width !== 'auto' ? width : '16px';
      const h = height && height !== 'auto' ? height : '16px';
      node.setAttribute('style',
        `display:inline-block;width:${w};height:${h};vertical-align:middle;margin-right:5px;`);
    } else if (!text) {
      // 模式 B：content:"" + 边框/背景色（装饰线）
      // 检查是否有可见边框或背景色
      const bgColor = cs.getPropertyValue('background-color');
      const hasBorder = ['top', 'right', 'bottom', 'left'].some(side => {
        const style = cs.getPropertyValue(`border-${side}-style`);
        const width = cs.getPropertyValue(`border-${side}-width`);
        return style && style !== 'none' && width && width !== '0px';
      });
      const hasBg = bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent';

      if (!hasBorder && !hasBg) continue; // 纯装饰无视觉效果，跳过

      node = document.createElement('span');
      const parts: string[] = ['display:inline-block'];
      const w = width && width !== 'auto' ? width : undefined;
      const h = height && height !== 'auto' ? height : undefined;
      if (w) parts.push(`width:${w}`);
      if (h) parts.push(`height:${h}`);
      if (hasBg) parts.push(`background-color:${bgColor}`);
      // 复制边框
      for (const side of ['top', 'right', 'bottom', 'left']) {
        const s = cs.getPropertyValue(`border-${side}-style`);
        const bw = cs.getPropertyValue(`border-${side}-width`);
        const c = cs.getPropertyValue(`border-${side}-color`);
        if (s && s !== 'none') {
          parts.push(`border-${side}-style:${s}`);
          parts.push(`border-${side}-width:${bw}`);
          parts.push(`border-${side}-color:${c}`);
        }
      }
      const br = cs.getPropertyValue('border-radius');
      if (br && br !== '0px') parts.push(`border-radius:${br}`);
      parts.push('vertical-align:middle');
      node.setAttribute('style', parts.join(';'));
    } else {
      // 模式 C：有文本内容
      node = document.createElement('span');
      node.textContent = text;
      const parts: string[] = [];
      // 复制视觉属性（不包括 position:absolute）
      const propsToInline = [
        'display', 'color', 'background-color', 'font-size', 'font-weight',
        'font-style', 'font-family', 'line-height', 'text-align', 'letter-spacing',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'border-top-style', 'border-top-width', 'border-top-color',
        'border-right-style', 'border-right-width', 'border-right-color',
        'border-bottom-style', 'border-bottom-width', 'border-bottom-color',
        'border-left-style', 'border-left-width', 'border-left-color',
        'border-top-left-radius', 'border-top-right-radius',
        'border-bottom-left-radius', 'border-bottom-right-radius',
        'width', 'height', 'text-shadow', 'box-shadow', 'vertical-align',
      ];
      for (const prop of propsToInline) {
        const val = cs.getPropertyValue(prop);
        if (!val) continue;
        if (prop === 'display') {
          if (val === 'flex') { parts.push('display:inline-block'); continue; }
          if (val === 'inline-flex') { parts.push('display:inline-block'); continue; }
          if (val === 'block') { parts.push('display:inline-block'); continue; }
        }
        parts.push(`${prop}:${val}`);
      }
      node.setAttribute('style', parts.join(';'));
    }

    if (pseudo === '::before') {
      cloneEl.insertBefore(node, cloneEl.firstChild);
    } else {
      cloneEl.appendChild(node);
    }
  }
}

// ---------- 代码块转换 ----------

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

  // 1. 标记原始 DOM，然后 clone
  const origAllEls = Array.from(container.querySelectorAll('*'));
  origAllEls.forEach((el, i) => el.setAttribute(tempAttr, String(i)));
  const clone = container.cloneNode(true) as Element;
  origAllEls.forEach((el) => el.removeAttribute(tempAttr));

  const macEnabled = container.classList.contains('mac-code-theme');

  // 2. 转换代码块
  convertCodeBlocksForWechat(clone, container, macEnabled);

  // 3. 移除交互元素
  clone.querySelectorAll('.code-copy-btn').forEach((btn) => btn.remove());
  clone.querySelectorAll('.code-mac-dots').forEach((el) => el.remove());
  clone.querySelectorAll('.code-line-numbers').forEach((el) => el.remove());

  // 4. 标记代码块区域（已处理，跳过）
  const processedEls = new Set<Element>();
  clone.querySelectorAll('section').forEach((sec) => {
    const s = sec.getAttribute('style') || '';
    if (s.includes('border-radius:8px') && s.includes('overflow:auto')) {
      processedEls.add(sec);
      sec.querySelectorAll('*').forEach((child) => processedEls.add(child));
    }
  });

  // 5. 内联样式 + 物化伪元素
  const cloneAllEls = Array.from(clone.querySelectorAll('*'));
  cloneAllEls.forEach((el) => {
    if (processedEls.has(el)) return;
    const idx = el.getAttribute(tempAttr);
    if (idx === null) return;

    const origEl = origAllEls[parseInt(idx)];
    if (!origEl) return;

    // Diff-based 内联（只包含与默认值不同的属性）
    const style = getDiffStyle(origEl);
    if (style) (el as HTMLElement).setAttribute('style', style);

    // 物化伪元素
    materializePseudoElements(el, origEl);

    el.removeAttribute(tempAttr);
  });

  // 6. 根元素
  const rootStyle = getDiffStyle(container);
  if (rootStyle) (clone as HTMLElement).setAttribute('style', rootStyle);
  materializePseudoElements(clone, container);

  // 7. 表格处理
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
    if (!existingStyle.includes('border') || existingStyle.includes('border:none')) {
      htmlCell.setAttribute('style', existingStyle + ';border:1px solid #dfe2e5;padding:6px 13px;');
    }
  });

  // 8. 清理属性
  clone.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-') || attr.name === 'class' || attr.name === tempAttr) {
        el.removeAttribute(attr.name);
      }
    });
  });
  clone.removeAttribute('class');
  clone.removeAttribute(tempAttr);

  // 9. 微信兼容：移除 SVG 元素（微信不支持内联 SVG）
  clone.querySelectorAll('svg').forEach((svg) => svg.remove());

  // 10. 微信兼容：清理残留的 background-image 样式（防止微信报图片错误）
  clone.querySelectorAll('*').forEach((el) => {
    const style = (el as HTMLElement).getAttribute('style');
    if (style && style.includes('background-image')) {
      const cleaned = style.replace(/background-image\s*:[^;]+;?/g, '');
      (el as HTMLElement).setAttribute('style', cleaned);
    }
  });

  // 清空默认样式缓存
  _defaultCache = null;

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
      new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([themeEl.textContent || ''], { type: 'text/plain' }),
      }),
    ]);
  } catch {
    // Fallback: 创建临时元素并用 execCommand
    const temp = document.createElement('div');
    temp.innerHTML = html;
    temp.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(temp);
    const range = document.createRange();
    range.selectNodeContents(temp);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    document.execCommand('copy');
    sel?.removeAllRanges();
    document.body.removeChild(temp);
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
