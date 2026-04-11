/**
 * 墨天轮适配器 - DOM 自动化操作型
 *
 * 墨天轮缺乏公开 API，使用后台标签页 + DOM 操作模拟发文。
 * 流程：打开发文页 -> 填写标题 -> 注入富文本内容 -> 保存草稿
 */

const MODB_WRITE_URL = 'https://www.modb.pro/write';

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取墨天轮 Cookie
 */
async function getModbCookies() {
  const cookies = await chrome.cookies.getAll({ domain: '.modb.pro' });
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * 发布到墨天轮（创建为草稿）
 * @param {object} data - { title, markdown, html, tags, category, coverUrl, platforms }
 * @returns {object} - { url }
 */
export async function publishToModb(data) {
  // 1. 检查 Cookie
  const cookieStr = await getModbCookies();
  if (!cookieStr) {
    throw new Error('未找到墨天轮 Cookie，请先在浏览器中登录墨天轮');
  }

  // 2. 在后台打开发文页
  const tab = await chrome.tabs.create({
    url: MODB_WRITE_URL,
    active: false,
  });

  try {
    // 3. 等待页面加载
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('墨天轮页面加载超时')), 30000);
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
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (title, html) => {
        return new Promise((resolve, reject) => {
          try {
            const waitForEditor = (retries = 20) => {
              // 查找标题输入框
              const titleInput = document.querySelector(
                'input[placeholder*="标题"], .title-input input, .article-title input, #title'
              );

              // 查找富文本编辑器
              const editorFrame = document.querySelector('iframe.edui-editor-iframeholder');
              const editableDiv = document.querySelector(
                '[contenteditable="true"], .ql-editor, .w-e-text, .edui-body-container'
              );

              if (!titleInput && retries > 0) {
                setTimeout(() => waitForEditor(retries - 1), 1000);
                return;
              }

              if (!titleInput) {
                reject('墨天轮编辑器加载超时');
                return;
              }

              // 填写标题
              const setter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype, 'value'
              ).set;
              setter.call(titleInput, title);
              titleInput.dispatchEvent(new Event('input', { bubbles: true }));
              titleInput.dispatchEvent(new Event('change', { bubbles: true }));

              // 填写内容
              if (editorFrame) {
                // UEditor iframe 模式
                const iframeDoc = editorFrame.contentDocument || editorFrame.contentWindow.document;
                const body = iframeDoc.querySelector('body');
                if (body) {
                  body.innerHTML = html;
                }
              } else if (editableDiv) {
                editableDiv.innerHTML = html;
                editableDiv.dispatchEvent(new Event('input', { bubbles: true }));
              }

              // 尝试通过 UEditor API 设置内容
              if (typeof window.UE !== 'undefined') {
                const ueEditor = window.UE.getEditor('editor') || window.UE.getEditor('container');
                if (ueEditor) {
                  ueEditor.setContent(html);
                }
              }

              // 查找并点击保存/草稿按钮
              setTimeout(() => {
                const saveBtn = document.querySelector(
                  'button[class*="draft"], .save-draft, [class*="save"]'
                );
                if (saveBtn) {
                  saveBtn.click();
                }
                resolve({ success: true, url: window.location.href });
              }, 2000);
            };

            waitForEditor();
          } catch (err) {
            reject(err.message);
          }
        });
      },
      args: [data.title, data.html],
    });

    await sleep(3000); // 等待保存完成

    const updatedTab = await chrome.tabs.get(tab.id);
    const draftUrl = updatedTab.url || MODB_WRITE_URL;

    console.log(`[mdnice-ext] 墨天轮草稿已创建: ${draftUrl}`);

    return { url: draftUrl };
  } finally {
    try {
      await chrome.tabs.remove(tab.id);
    } catch {
      // tab 可能已关闭
    }
  }
}
