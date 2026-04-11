/**
 * 微信公众号适配器 - 官方 API 对接型
 *
 * 微信公众号提供官方 API，需要 AppID + AppSecret 获取 access_token。
 * 流程：获取 token -> 上传图片素材 -> 替换图片链接 -> 创建草稿
 *
 * 注意：微信 API 有 IP 白名单限制，实际使用中可能需要 Serverless 函数转发。
 * 扩展可作为备用方案直接调用（需用户 IP 在白名单内）。
 */

const WECHAT_API = 'https://api.weixin.qq.com/cgi-bin';

/**
 * 获取 access_token
 */
async function getAccessToken(appId, appSecret) {
  const url = `${WECHAT_API}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.errcode) {
    throw new Error(`获取 access_token 失败: ${json.errmsg} (${json.errcode})`);
  }

  return json.access_token;
}

/**
 * 上传图片到微信素材库（永久素材）
 * @returns {string} 微信域名的图片 URL
 */
async function uploadImage(accessToken, imageUrl) {
  try {
    // 先下载图片
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      console.warn(`[mdnice-ext] 无法下载图片: ${imageUrl}`);
      return imageUrl; // 下载失败则保留原链接
    }

    const blob = await imgRes.blob();
    const filename = imageUrl.split('/').pop()?.split('?')[0] || 'image.png';

    // 上传到微信
    const formData = new FormData();
    formData.append('media', blob, filename);

    const uploadUrl = `${WECHAT_API}/media/uploadimg?access_token=${accessToken}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const json = await uploadRes.json();

    if (json.errcode) {
      console.warn(`[mdnice-ext] 上传图片失败: ${json.errmsg}`);
      return imageUrl;
    }

    return json.url; // 微信域名图片链接
  } catch (err) {
    console.warn(`[mdnice-ext] 图片处理失败: ${err.message}`);
    return imageUrl;
  }
}

/**
 * 替换 HTML 中的外部图片为微信域名图片
 */
async function replaceImages(accessToken, html) {
  // 提取所有 img src
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
  const matches = [...html.matchAll(imgRegex)];

  let result = html;

  for (const match of matches) {
    const originalUrl = match[1];

    // 跳过已是微信域名的图片
    if (originalUrl.includes('mmbiz.qpic.cn') || originalUrl.includes('mmbiz.qlogo.cn')) {
      continue;
    }

    // 跳过 base64 图片
    if (originalUrl.startsWith('data:')) {
      continue;
    }

    const wxUrl = await uploadImage(accessToken, originalUrl);
    if (wxUrl !== originalUrl) {
      result = result.replace(originalUrl, wxUrl);
    }
  }

  return result;
}

/**
 * 创建公众号草稿
 */
async function createDraft(accessToken, title, html, thumbMediaId) {
  const url = `${WECHAT_API}/draft/add?access_token=${accessToken}`;

  const article = {
    title,
    content: html,
    content_source_url: '',
    need_open_comment: 0,
    only_fans_can_comment: 0,
  };

  // 如果有封面图素材 ID
  if (thumbMediaId) {
    article.thumb_media_id = thumbMediaId;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      articles: [article],
    }),
  });

  const json = await res.json();

  if (json.errcode) {
    throw new Error(`创建草稿失败: ${json.errmsg} (${json.errcode})`);
  }

  return json.media_id;
}

/**
 * 上传封面图为永久素材（thumb_media_id）
 */
async function uploadThumbMedia(accessToken, coverUrl) {
  if (!coverUrl) return null;

  try {
    const imgRes = await fetch(coverUrl);
    if (!imgRes.ok) return null;

    const blob = await imgRes.blob();
    const filename = coverUrl.split('/').pop()?.split('?')[0] || 'cover.png';

    const formData = new FormData();
    formData.append('media', blob, filename);

    const url = `${WECHAT_API}/material/add_material?access_token=${accessToken}&type=image`;
    const uploadRes = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const json = await uploadRes.json();
    return json.media_id || null;
  } catch {
    return null;
  }
}

/**
 * 发布到微信公众号（创建为草稿）
 *
 * 需要在 publishStore 中配置 appId 和 appSecret。
 * 此处从 localStorage 读取（通过扩展 content script 中转），
 * 或从 data 的扩展字段中获取。
 *
 * @param {object} data - { title, markdown, html, tags, category, coverUrl, platforms, wechatConfig? }
 * @returns {object} - { url }
 */
export async function publishToWechat(data) {
  // 尝试从 data 或 localStorage 获取配置
  const appId = data.wechatConfig?.appId;
  const appSecret = data.wechatConfig?.appSecret;

  if (!appId || !appSecret) {
    throw new Error('微信公众号未配置 AppID 和 AppSecret，请在发布设置中填写');
  }

  // 1. 获取 access_token
  const accessToken = await getAccessToken(appId, appSecret);

  // 2. 替换文章中的外部图片
  let processedHtml = data.html;
  processedHtml = await replaceImages(accessToken, processedHtml);

  // 3. 上传封面图
  const thumbMediaId = await uploadThumbMedia(accessToken, data.coverUrl);

  // 4. 创建草稿
  const mediaId = await createDraft(accessToken, data.title, processedHtml, thumbMediaId);

  const draftUrl = `https://mp.weixin.qq.com/cgi-bin/appmsg?action=list_card&type=10&lang=zh_CN`;

  console.log(`[mdnice-ext] 微信公众号草稿已创建, media_id: ${mediaId}`);

  return { url: draftUrl };
}
