/**
 * 浏览器扩展通信桥
 *
 * Web 端通过 window.postMessage / CustomEvent 与浏览器扩展通信。
 * 扩展端的 Content Script 监听这些事件并转发到 Background Script。
 */

/** 发送给扩展的消息类型 */
export interface PublishMessage {
  type: 'MDNICE_PUBLISH_REQUEST';
  payload: {
    title: string;
    markdown: string;
    html: string;
    tags: string[];
    category: string;
    coverUrl: string;
    platforms: string[];
  };
}

/** 扩展返回的进度消息 */
export interface PublishProgressMessage {
  type: 'MDNICE_PUBLISH_PROGRESS';
  payload: {
    platform: string;
    status: 'queued' | 'publishing' | 'success' | 'failed';
    errorMsg?: string;
    resultUrl?: string;
  };
}

/** 扩展心跳响应 */
export interface ExtensionPingResponse {
  type: 'MDNICE_EXTENSION_PONG';
}

/**
 * 检测扩展是否已安装
 * 通过发送 PING 并等待 PONG 响应
 */
export function detectExtension(timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (
        event.source === window &&
        event.data?.type === 'MDNICE_EXTENSION_PONG'
      ) {
        window.removeEventListener('message', handler);
        resolve(true);
      }
    };

    window.addEventListener('message', handler);
    window.postMessage({ type: 'MDNICE_EXTENSION_PING' }, '*');

    setTimeout(() => {
      window.removeEventListener('message', handler);
      resolve(false);
    }, timeoutMs);
  });
}

/**
 * 向扩展发送发布请求
 */
export function sendPublishRequest(data: PublishMessage['payload']): void {
  const message: PublishMessage = {
    type: 'MDNICE_PUBLISH_REQUEST',
    payload: data,
  };
  window.postMessage(message, '*');
}

/**
 * 监听扩展的发布进度回调
 * 返回取消监听的函数
 */
export function onPublishProgress(
  callback: (progress: PublishProgressMessage['payload']) => void
): () => void {
  const handler = (event: MessageEvent) => {
    if (
      event.source === window &&
      event.data?.type === 'MDNICE_PUBLISH_PROGRESS'
    ) {
      callback(event.data.payload);
    }
  };
  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
