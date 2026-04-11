/**
 * Background Service Worker
 *
 * 接收来自 Content Script 的发布请求，调度各平台适配器执行发布。
 */

// 动态导入适配器
import { publishToJuejin } from './adapters/juejin.js';
import { publishToZhihu } from './adapters/zhihu.js';
import { publishToCSDN } from './adapters/csdn.js';
import { publishToModb } from './adapters/modb.js';
import { publishTo51CTO } from './adapters/c51cto.js';
import { publishToITPUB } from './adapters/itpub.js';
import { publishToWechat } from './adapters/wechat.js';

const ADAPTERS = {
  juejin: publishToJuejin,
  zhihu: publishToZhihu,
  csdn: publishToCSDN,
  modb: publishToModb,
  c51cto: publishTo51CTO,
  itpub: publishToITPUB,
  wechat: publishToWechat,
};

/** 记录发起发布请求的 tab ID，用于回传进度 */
let sourceTabId = null;

/**
 * 向 Web 页面回传发布进度
 */
function sendProgress(platform, status, extra = {}) {
  if (!sourceTabId) return;
  const message = {
    type: 'MDNICE_PUBLISH_PROGRESS',
    payload: { platform, status, ...extra },
  };
  chrome.tabs.sendMessage(sourceTabId, message).catch((err) => {
    console.warn('[mdnice-ext] 发送进度失败:', err);
  });
}

/**
 * 处理单个平台的发布
 */
async function publishToPlatform(platformId, data) {
  const adapter = ADAPTERS[platformId];
  if (!adapter) {
    sendProgress(platformId, 'failed', { errorMsg: `不支持的平台: ${platformId}` });
    return;
  }

  sendProgress(platformId, 'publishing');

  try {
    const result = await adapter(data);
    sendProgress(platformId, 'success', { resultUrl: result?.url || '' });
  } catch (err) {
    const errorMsg = err?.message || '未知错误';
    console.error(`[mdnice-ext] ${platformId} 发布失败:`, err);
    sendProgress(platformId, 'failed', { errorMsg });
  }
}

// 监听来自 Content Script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'MDNICE_PUBLISH_REQUEST') {
    sourceTabId = sender.tab?.id || null;
    const { payload } = message;

    console.log('[mdnice-ext] 收到发布请求:', payload);

    // 并行发布到所有选中的平台
    const platforms = payload.platforms || [];
    platforms.forEach((platformId) => {
      sendProgress(platformId, 'queued');
    });

    // 逐个执行（避免过多并发导致浏览器限制）
    (async () => {
      for (const platformId of platforms) {
        await publishToPlatform(platformId, payload);
      }
    })();

    sendResponse({ received: true, platforms });
    return true; // 保持消息通道
  }
});

// ====== 一键获取 Cookie / 检测登录状态 ======

/**
 * 各平台的域名和关键 Cookie 配置
 */
const PLATFORM_COOKIE_CONFIG = {
  juejin: {
    domain: '.juejin.cn',
    keyCookies: ['sessionid'],
    loginUrl: 'https://juejin.cn/login',
  },
  zhihu: {
    domain: '.zhihu.com',
    keyCookies: ['z_c0'],
    loginUrl: 'https://www.zhihu.com/signin',
  },
  csdn: {
    domain: '.csdn.net',
    keyCookies: ['UserName', 'UserToken'],
    loginUrl: 'https://passport.csdn.net/login',
  },
  modb: {
    domain: '.modb.pro',
    keyCookies: ['SESSION', 'JSESSIONID'],
    loginUrl: 'https://www.modb.pro/login',
  },
  c51cto: {
    domain: '.51cto.com',
    keyCookies: ['uid', 'uname'],
    loginUrl: 'https://home.51cto.com/login',
  },
  itpub: {
    domain: '.itpub.net',
    keyCookies: ['cdb_auth', 'cdb_sid'],
    loginUrl: 'https://www.itpub.net/member.php?mod=logging&action=login',
  },
  wechat: {
    domain: '.qq.com',
    keyCookies: ['slave_user', 'slave_sid'],
    loginUrl: 'https://mp.weixin.qq.com/',
  },
};

/**
 * 检测单个平台的 Cookie 登录状态
 * @returns {{ loggedIn, cookies, userName }}
 */
async function checkPlatformCookies(platformId) {
  const config = PLATFORM_COOKIE_CONFIG[platformId];
  if (!config) {
    return { loggedIn: false, cookies: [], userName: '', error: '未知平台' };
  }

  try {
    const allCookies = await chrome.cookies.getAll({ domain: config.domain });
    const cookieMap = {};
    allCookies.forEach((c) => { cookieMap[c.name] = c.value; });

    // 检查关键 Cookie 是否存在
    const hasKeyCookies = config.keyCookies.some((key) => !!cookieMap[key]);

    // 尝试提取用户名
    let userName = '';
    if (cookieMap['UserName']) userName = decodeURIComponent(cookieMap['UserName']);
    else if (cookieMap['uname']) userName = decodeURIComponent(cookieMap['uname']);
    else if (cookieMap['loginUserName']) userName = decodeURIComponent(cookieMap['loginUserName']);

    // 收集有效 Cookie 数量
    const cookieCount = allCookies.length;

    return {
      loggedIn: hasKeyCookies,
      cookieCount,
      userName,
      keyCookiesFound: config.keyCookies.filter((key) => !!cookieMap[key]),
    };
  } catch (err) {
    return { loggedIn: false, cookieCount: 0, userName: '', error: err.message };
  }
}

/**
 * 一键检测所有平台的登录状态
 */
async function checkAllPlatformCookies() {
  const results = {};
  const platformIds = Object.keys(PLATFORM_COOKIE_CONFIG);

  await Promise.all(
    platformIds.map(async (id) => {
      results[id] = await checkPlatformCookies(id);
    })
  );

  return results;
}

// 监听 Cookie 检测请求
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'MDNICE_CHECK_COOKIES') {
    const senderTabId = sender.tab?.id || null;

    (async () => {
      const results = await checkAllPlatformCookies();
      // 回传结果
      if (senderTabId) {
        chrome.tabs.sendMessage(senderTabId, {
          type: 'MDNICE_COOKIES_RESULT',
          payload: results,
        }).catch((err) => {
          console.warn('[mdnice-ext] 发送 Cookie 结果失败:', err);
        });
      }
    })();

    sendResponse({ received: true });
    return true;
  }
});

console.log('[mdnice-ext] Background Service Worker 已启动');
