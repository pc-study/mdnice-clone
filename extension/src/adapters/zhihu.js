/**
 * 知乎适配器 - API 直接调用型
 *
 * 知乎专栏使用 Cookie 鉴权，发文接口接受 HTML 格式。
 * 流程：创建草稿 -> 返回草稿链接
 */

const ZHIHU_API = 'https://zhuanlan.zhihu.com/api';

/**
 * 获取知乎 Cookie
 */
async function getZhihuCookies() {
  const cookies = await chrome.cookies.getAll({ domain: '.zhihu.com' });
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * 从 Cookie 中提取 XSRF Token（知乎要求）
 */
async function getXSRFToken() {
  const cookies = await chrome.cookies.getAll({ domain: '.zhihu.com', name: '_xsrf' });
  return cookies[0]?.value || '';
}

/**
 * 检查知乎登录状态
 */
async function checkLoginStatus(cookieStr) {
  const res = await fetch('https://www.zhihu.com/api/v4/me', {
    method: 'GET',
    headers: {
      Cookie: cookieStr,
    },
  });
  if (!res.ok) {
    throw new Error('知乎未登录或 Cookie 已过期，请先在浏览器中登录知乎');
  }
  return await res.json();
}

/**
 * 创建专栏文章草稿
 */
async function createDraft(cookieStr, xsrf, data) {
  const res = await fetch(`${ZHIHU_API}/articles/drafts`, {
    method: 'POST',
    headers: {
      Cookie: cookieStr,
      'Content-Type': 'application/json',
      'x-xsrftoken': xsrf,
    },
    body: JSON.stringify({
      title: data.title,
      content: data.html,
      delta_time: 0,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`创建草稿失败 (${res.status}): ${text}`);
  }

  return await res.json();
}

/**
 * 更新草稿内容（补充标题和正文）
 */
async function updateDraft(cookieStr, xsrf, draftId, data) {
  const res = await fetch(`${ZHIHU_API}/articles/${draftId}/draft`, {
    method: 'PATCH',
    headers: {
      Cookie: cookieStr,
      'Content-Type': 'application/json',
      'x-xsrftoken': xsrf,
    },
    body: JSON.stringify({
      title: data.title,
      content: data.html,
      table_of_contents: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`更新草稿失败 (${res.status}): ${text}`);
  }

  return await res.json();
}

/**
 * 发布到知乎（创建为草稿）
 * @param {object} data - { title, markdown, html, tags, category, coverUrl, platforms }
 * @returns {object} - { url }
 */
export async function publishToZhihu(data) {
  // 1. 获取 Cookie 和 XSRF Token
  const cookieStr = await getZhihuCookies();
  if (!cookieStr) {
    throw new Error('未找到知乎 Cookie，请先在浏览器中登录知乎');
  }

  const xsrf = await getXSRFToken();
  if (!xsrf) {
    throw new Error('未找到知乎 XSRF Token，请刷新知乎页面后重试');
  }

  // 2. 检查登录状态
  await checkLoginStatus(cookieStr);

  // 3. 创建草稿
  const draft = await createDraft(cookieStr, xsrf, data);
  const draftId = draft.id;

  // 4. 更新草稿内容
  await updateDraft(cookieStr, xsrf, draftId, data);

  const draftUrl = `https://zhuanlan.zhihu.com/p/${draftId}/edit`;

  console.log(`[mdnice-ext] 知乎草稿已创建: ${draftUrl}`);

  return { url: draftUrl };
}
