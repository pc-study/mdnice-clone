/**
 * ITPUB 适配器 - DOM 自动化操作型
 *
 * ITPUB 为传统论坛架构（Discuz 类），使用后台标签页 + DOM 操作模拟发帖。
 * 流程：打开发帖页 -> 填写标题 -> 注入富文本内容 -> 提交
 */

const ITPUB_WRITE_URL = 'https://www.itpub.net/forum.php?mod=post&action=newthread&fid=2';

/**
 * 等待指定时间
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取 ITPUB Cookie
 */
async function getITPUBCookies() {
  const cookies = await chrome.cookies.getAll({ domain: '.itpub.net' });
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * 发布到 ITPUB（创建为帖子/草稿）
 * @param {object} data - { title, markdown, html, tags, category, coverUrl, platforms }
 * @returns {object} - { url }
 */
export async function publishToITPUB(data) {
  // 1. 检查 Cookie
  const cookieStr = await getITPUBCookies();
  if (!cookieStr) {
    throw new Error('未找到 ITPUB Cookie，请先在浏览器中登录 ITPUB');
  }

  // 2. 在后台打开发帖页
  const tab = await chrome.tabs.create({
    url: ITPUB_WRITE_URL,
    active: false,
  });

  try {
    // 3. 等待页面加载
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('ITPUB 页面加载超时')), 30000);
      const listener = (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeout);
          resolve();
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });

    await sleep(2000); // 等待编辑器初始化

    // 4. 注入内容
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (title, html) => {
        return new Promise((resolve, reject) => {
          try {
            const waitForEditor = (retries = 20) => {
              // Discuz 论坛的标题输入框
              const titleInput = document.querySelector(
                '#subject, input[name="subject"], .subject input'
              );

              if (!titleInput && retries > 0) {
                setTimeout(() => waitForEditor(retries - 1), 1000);
                return;
              }

              if (!titleInput) {
                reject('ITPUB 编辑器加载超时');
                return;
              }

              // 填写标题
              titleInput.value = title;
              titleInput.dispatchEvent(new Event('input', { bubbles: true }));
              titleInput.dispatchEvent(new Event('change', { bubbles: true }));

              // Discuz 富文本编辑器 - 通常使用 iframe
              const editorIframe = document.querySelector('#e_iframe, iframe[name="e_iframe"]');
              if (editorIframe) {
                const iframeDoc = editorIframe.contentDocument || editorIframe.contentWindow.document;
                const body = iframeDoc.querySelector('body');
                if (body) {
                  body.innerHTML = html;
                }
              } else {
                // 纯文本模式 - 查找 textarea
                const textarea = document.querySelector(
                  '#e_textarea, #fastpostmessage, textarea[name="message"]'
                );
                if (textarea) {
                  // 在纯文本模式下使用简化的 HTML
                  textarea.value = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }

              // 尝试 UEditor API
              if (typeof window.UE !== 'undefined') {
                try {
                  const ueEditor = window.UE.getEditor('editor') || window.UE.getEditor('e_textarea');
                  if (ueEditor) {
                    ueEditor.setContent(html);
                  }
                } catch {
                  // UEditor 可能未初始化
                }
              }

              // 不自动提交论坛帖子（风险较高），仅保存内容
              resolve({ success: true, url: window.location.href });
            };

            waitForEditor();
          } catch (err) {
            reject(err.message);
          }
        });
      },
      args: [data.title, data.html],
    });

    await sleep(2000);

    const updatedTab = await chrome.tabs.get(tab.id);
    const draftUrl = updatedTab.url || ITPUB_WRITE_URL;

    console.log(`[mdnice-ext] ITPUB 内容已填入: ${draftUrl}`);

    // 注意：ITPUB 论坛帖子不自动提交，保留标签页供用户确认
    // 不关闭标签页
    return { url: draftUrl };
  } catch (err) {
    // 出错时关闭标签页
    try {
      await chrome.tabs.remove(tab.id);
    } catch {
      // ignore
    }
    throw err;
  }
}
