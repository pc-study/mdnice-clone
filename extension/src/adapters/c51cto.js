/**
 * 51CTO 适配器 - DOM 自动化操作型
 *
 * 51CTO 缺乏公开 API，使用后台标签页 + DOM 操作模拟发文。
 * 流程：打开写文章页 -> 填写标题 -> 注入富文本/Markdown -> 保存草稿
 */

const C51CTO_WRITE_URL = 'https://blog.51cto.com/blogger/publish';

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取 51CTO Cookie
 */
async function get51CTOCookies() {
  const cookies = await chrome.cookies.getAll({ domain: '.51cto.com' });
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * 发布到 51CTO（创建为草稿）
 * @param {object} data - { title, markdown, html, tags, category, coverUrl, platforms }
 * @returns {object} - { url }
 */
export async function publishTo51CTO(data) {
  // 1. 检查 Cookie
  const cookieStr = await get51CTOCookies();
  if (!cookieStr) {
    throw new Error('未找到 51CTO Cookie，请先在浏览器中登录 51CTO');
  }

  // 2. 在后台打开写文章页
  const tab = await chrome.tabs.create({
    url: C51CTO_WRITE_URL,
    active: false,
  });

  try {
    // 3. 等待页面加载
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('51CTO 页面加载超时')), 30000);
      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeout);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });

    await sleep(3000); // 等待编辑器初始化

    // 4. 注入内容
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (title, markdown, html) => {
        return new Promise((resolve, reject) => {
          try {
            const waitForEditor = (retries = 20) => {
              // 查找标题输入框
              const titleInput = document.querySelector(
                'input[placeholder*="标题"], .title-input, #title, .article-title input'
              );

              if (!titleInput && retries > 0) {
                setTimeout(() => waitForEditor(retries - 1), 1000);
                return;
              }

              if (!titleInput) {
                reject('51CTO 编辑器加载超时');
                return;
              }

              // 填写标题
              if (titleInput.tagName === 'INPUT' || titleInput.tagName === 'TEXTAREA') {
                const setter = Object.getOwnPropertyDescriptor(
                  HTMLInputElement.prototype, 'value'
                ).set;
                setter.call(titleInput, title);
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                titleInput.dispatchEvent(new Event('change', { bubbles: true }));
              } else {
                titleInput.textContent = title;
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
              }

              // 尝试 Markdown 编辑器（CodeMirror）
              const cmEl = document.querySelector('.CodeMirror');
              if (cmEl && cmEl.CodeMirror) {
                cmEl.CodeMirror.setValue(markdown);
                setTimeout(() => {
                  const saveBtn = document.querySelector(
                    '.save-draft, [class*="draft"], button[class*="save"]'
                  );
                  if (saveBtn) saveBtn.click();
                  resolve({ success: true, url: window.location.href });
                }, 2000);
                return;
              }

              // 尝试富文本编辑器
              const editableDiv = document.querySelector(
                '[contenteditable="true"], .ql-editor, .w-e-text, .tox-edit-area__iframe'
              );

              if (editableDiv) {
                if (editableDiv.tagName === 'IFRAME') {
                  const iframeDoc = editableDiv.contentDocument || editableDiv.contentWindow.document;
                  const body = iframeDoc.querySelector('body');
                  if (body) body.innerHTML = html;
                } else {
                  editableDiv.innerHTML = html;
                  editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }

              // 尝试 TinyMCE
              if (typeof window.tinymce !== 'undefined' && window.tinymce.activeEditor) {
                window.tinymce.activeEditor.setContent(html);
              }

              // 查找保存草稿按钮
              setTimeout(() => {
                const saveBtn = document.querySelector(
                  '.save-draft, [class*="draft"], button[class*="save"]'
                );
                if (saveBtn) saveBtn.click();
                resolve({ success: true, url: window.location.href });
              }, 2000);
            };

            waitForEditor();
          } catch (err) {
            reject(err.message);
          }
        });
      },
      args: [data.title, data.markdown, data.html],
    });

    await sleep(3000); // 等待保存完成

    const updatedTab = await chrome.tabs.get(tab.id);
    const draftUrl = updatedTab.url || C51CTO_WRITE_URL;

    console.log(`[mdnice-ext] 51CTO 草稿已创建: ${draftUrl}`);

    return { url: draftUrl };
  } finally {
    try {
      await chrome.tabs.remove(tab.id);
    } catch {
      // tab 可能已关闭
    }
  }
}
