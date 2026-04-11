/**
 * CSDN 适配器 - 页面上下文注入型
 *
 * CSDN 发布接口有 x-ca-signature 签名校验，逆向难度高。
 * 策略：在后台打开 CSDN Markdown 编辑器页面，注入脚本填写内容并触发发布。
 * 流程：打开编辑器 -> 注入内容 -> 触发保存草稿 -> 返回链接
 */

const CSDN_EDITOR_URL = 'https://editor.csdn.net/md/';

/**
 * 获取 CSDN Cookie
 */
async function getCSDNCookies() {
  const cookies = await chrome.cookies.getAll({ domain: '.csdn.net' });
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 在 CSDN 编辑器页面注入内容的脚本
 * 此函数将作为 content script 注入到 CSDN 编辑器页面中执行
 */
function injectContentScript(title, markdown) {
  return new Promise((resolve, reject) => {
    try {
      // 等待编辑器加载完成
      const waitForEditor = (retries = 30) => {
        // CSDN 使用 CodeMirror 或自定义编辑器
        const titleInput = document.querySelector('.article-bar__title input, .article-bar__user-title input, #title');
        const editor = document.querySelector('.editor__inner, .CodeMirror, .toastui-editor');

        if (!titleInput && retries > 0) {
          setTimeout(() => waitForEditor(retries - 1), 1000);
          return;
        }

        if (!titleInput) {
          reject(new Error('CSDN 编辑器加载超时'));
          return;
        }

        // 填写标题
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(titleInput, title);
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));

        // 填写 Markdown 内容到编辑器
        if (editor) {
          // 尝试 CodeMirror 实例
          const cm = editor.querySelector('.CodeMirror');
          if (cm && cm.CodeMirror) {
            cm.CodeMirror.setValue(markdown);
          } else {
            // 尝试直接设置 textarea 或 contenteditable
            const textarea = editor.querySelector('textarea');
            if (textarea) {
              nativeInputValueSetter.call(textarea, markdown);
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              const editable = editor.querySelector('[contenteditable="true"]');
              if (editable) {
                editable.innerHTML = markdown.replace(/\n/g, '<br>');
                editable.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          }
        }

        // 触发保存草稿（Ctrl+S）
        setTimeout(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 's', code: 'KeyS', ctrlKey: true, bubbles: true,
          }));
          resolve({ success: true });
        }, 2000);
      };

      waitForEditor();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 发布到 CSDN（创建为草稿）
 * @param {object} data - { title, markdown, html, tags, category, coverUrl, platforms }
 * @returns {object} - { url }
 */
export async function publishToCSDN(data) {
  // 1. 检查 Cookie
  const cookieStr = await getCSDNCookies();
  if (!cookieStr) {
    throw new Error('未找到 CSDN Cookie，请先在浏览器中登录 CSDN');
  }

  // 2. 在后台打开 CSDN 编辑器
  const tab = await chrome.tabs.create({
    url: CSDN_EDITOR_URL,
    active: false, // 后台打开
  });

  try {
    // 3. 等待页面加载完成
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('CSDN 页面加载超时')), 30000);

      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeout);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });

    // 4. 注入内容脚本
    await sleep(3000); // 额外等待编辑器 JS 加载

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (title, markdown) => {
        return new Promise((resolve, reject) => {
          try {
            const waitForEditor = (retries = 30) => {
              const titleInput = document.querySelector(
                '.article-bar__title input, .article-bar__user-title input, #title'
              );

              if (!titleInput && retries > 0) {
                setTimeout(() => waitForEditor(retries - 1), 1000);
                return;
              }

              if (!titleInput) {
                reject('CSDN 编辑器加载超时');
                return;
              }

              // 填写标题
              const setter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype, 'value'
              ).set;
              setter.call(titleInput, title);
              titleInput.dispatchEvent(new Event('input', { bubbles: true }));
              titleInput.dispatchEvent(new Event('change', { bubbles: true }));

              // 填写 Markdown - 尝试多种编辑器实例
              const cmEl = document.querySelector('.CodeMirror');
              if (cmEl && cmEl.CodeMirror) {
                cmEl.CodeMirror.setValue(markdown);
              } else {
                const textarea = document.querySelector('.editor textarea, #editor textarea');
                if (textarea) {
                  setter.call(textarea, markdown);
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }

              // 触发 Ctrl+S 保存
              setTimeout(() => {
                document.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 's', code: 'KeyS', ctrlKey: true, bubbles: true,
                }));
                resolve({ success: true, url: window.location.href });
              }, 2000);
            };

            waitForEditor();
          } catch (err) {
            reject(err.message);
          }
        });
      },
      args: [data.title, data.markdown],
    });

    await sleep(3000); // 等待保存完成

    // 获取最终 URL
    const updatedTab = await chrome.tabs.get(tab.id);
    const draftUrl = updatedTab.url || CSDN_EDITOR_URL;

    console.log(`[mdnice-ext] CSDN 草稿已创建: ${draftUrl}`);

    return { url: draftUrl };
  } finally {
    // 5. 关闭后台标签页
    try {
      await chrome.tabs.remove(tab.id);
    } catch {
      // tab 可能已关闭
    }
  }
}
