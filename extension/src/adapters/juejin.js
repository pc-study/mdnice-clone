/**
 * 掘金适配器 - API 直接调用型
 *
 * 掘金 Web 端使用 Cookie 中的 sessionid 鉴权。
 * 流程：创建草稿 -> 返回草稿链接
 */

const JUEJIN_API = 'https://api.juejin.cn';

/**
 * 获取掘金 Cookie
 */
async function getJuejinCookies() {
  const cookies = await chrome.cookies.getAll({ domain: '.juejin.cn' });
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

/**
 * 检查掘金登录状态
 */
async function checkLoginStatus(cookieStr) {
  const res = await fetch(`${JUEJIN_API}/user_api/v1/user/get`, {
    method: 'GET',
    headers: {
      Cookie: cookieStr,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  if (json.err_no !== 0) {
    throw new Error('掘金未登录或 Cookie 已过期，请先在浏览器中登录掘金');
  }
  return json.data;
}

/**
 * 创建文章草稿
 */
async function createDraft(cookieStr, data) {
  const res = await fetch(`${JUEJIN_API}/content_api/v1/article_draft/create`, {
    method: 'POST',
    headers: {
      Cookie: cookieStr,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      category_id: '0',
      tag_ids: [],
      link_url: '',
      cover_image: data.coverUrl || '',
      title: data.title,
      brief_content: '',
      edit_type: 10, // 10 = Markdown
      html_content: 'deprecated',
      mark_content: data.markdown,
    }),
  });

  const json = await res.json();
  if (json.err_no !== 0) {
    throw new Error(json.err_msg || '创建草稿失败');
  }

  return json.data;
}

/**
 * 发布到掘金（创建为草稿）
 * @param {object} data - { title, markdown, html, tags, category, coverUrl, platforms }
 * @returns {object} - { url }
 */
export async function publishToJuejin(data) {
  // 1. 获取 Cookie
  const cookieStr = await getJuejinCookies();
  if (!cookieStr) {
    throw new Error('未找到掘金 Cookie，请先在浏览器中登录掘金');
  }

  // 2. 检查登录状态
  await checkLoginStatus(cookieStr);

  // 3. 创建草稿
  const draft = await createDraft(cookieStr, data);
  const draftId = draft.id;
  const draftUrl = `https://juejin.cn/editor/drafts/${draftId}`;

  console.log(`[mdnice-ext] 掘金草稿已创建: ${draftUrl}`);

  return { url: draftUrl };
}
