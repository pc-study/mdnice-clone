/**
 * Content Script - 注入到所有页面
 *
 * 职责：
 * 1. 在 mdnice-clone 页面上监听 Web 端消息，转发到 Background
 * 2. 响应 PING 请求（扩展检测）
 * 3. 在目标平台页面上执行 DOM 操作
 */

// 监听来自 Web 页面的消息
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  const { data } = event;

  // 扩展检测：响应 PING
  if (data?.type === 'MDNICE_EXTENSION_PING') {
    window.postMessage({ type: 'MDNICE_EXTENSION_PONG' }, '*');
    return;
  }

  // 发布请求：转发到 Background Script
  if (data?.type === 'MDNICE_PUBLISH_REQUEST') {
    chrome.runtime.sendMessage(data, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[mdnice-ext] 发送消息到 Background 失败:', chrome.runtime.lastError);
      } else {
        console.log('[mdnice-ext] Background 已接收发布请求:', response);
      }
    });
    return;
  }
});

// 监听来自 Background 的进度回调
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === 'MDNICE_PUBLISH_PROGRESS') {
    window.postMessage(message, '*');
  }
});

console.log('[mdnice-ext] Content Script 已加载');
