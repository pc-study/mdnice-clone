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

console.log('[mdnice-ext] Background Service Worker 已启动');
