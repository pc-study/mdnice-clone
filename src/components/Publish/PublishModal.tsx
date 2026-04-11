import React from 'react';
import {
  usePublishStore,
  type PublishStatus,
  type LoginStatus,
  type PlatformId,
} from '../../store/publishStore';
import { checkPlatformCookies } from '../../utils/extensionBridge';

interface PublishModalProps {
  visible: boolean;
  onClose: () => void;
  onPublish: () => void;
  docTitle: string;
}

/* ---- 样式常量 ---- */
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
};

const panelStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderRadius: 8, width: 520, maxHeight: '85vh',
  overflow: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
};

const headerStyle: React.CSSProperties = {
  padding: '16px 20px', borderBottom: '1px solid #e0e0e0',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 10px', border: '1px solid #d9d9d9',
  borderRadius: 4, fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  padding: '8px 24px', backgroundColor: '#35b378', color: '#fff',
  border: 'none', borderRadius: 4, fontSize: 14, cursor: 'pointer',
  fontWeight: 500,
};

const btnDefault: React.CSSProperties = {
  padding: '8px 16px', backgroundColor: '#f5f5f5', color: '#333',
  border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, cursor: 'pointer',
};

/* ---- 状态颜色映射 ---- */
const statusMap: Record<PublishStatus, { label: string; color: string }> = {
  idle: { label: '等待中', color: '#999' },
  queued: { label: '排队中', color: '#faad14' },
  publishing: { label: '发布中...', color: '#1890ff' },
  success: { label: '成功', color: '#52c41a' },
  failed: { label: '失败', color: '#ff4d4f' },
};

/* ---- 登录状态颜色映射 ---- */
const loginStatusMap: Record<LoginStatus, { label: string; color: string }> = {
  unknown: { label: '未检测', color: '#999' },
  checking: { label: '检测中...', color: '#1890ff' },
  logged_in: { label: '已登录', color: '#52c41a' },
  not_logged_in: { label: '未登录', color: '#ff4d4f' },
};

export const PublishModal: React.FC<PublishModalProps> = ({
  visible, onClose, onPublish, docTitle,
}) => {
  const {
    platforms, togglePlatform,
    articleMeta, setArticleMeta,
    publishProgress, isPublishing,
    extensionInstalled,
    loginStates, setLoginState, setAllLoginChecking,
    isCheckingLogin, setIsCheckingLogin,
  } = usePublishStore();

  // 一键获取 Cookie / 检测登录状态
  const handleCheckCookies = React.useCallback(async () => {
    if (!extensionInstalled) return;
    setIsCheckingLogin(true);
    setAllLoginChecking();
    try {
      const results = await checkPlatformCookies(8000);
      for (const [id, status] of Object.entries(results)) {
        setLoginState(id as PlatformId, {
          loginStatus: status.loggedIn ? 'logged_in' : 'not_logged_in',
          userName: status.userName,
          cookieCount: status.cookieCount,
          error: status.error,
        });
      }
    } catch {
      // 超时或扩展无响应 - 全部标记为未知
      platforms.forEach((p) => {
        setLoginState(p.id, { loginStatus: 'unknown', error: '检测超时' });
      });
    } finally {
      setIsCheckingLogin(false);
    }
  }, [extensionInstalled, platforms, setLoginState, setAllLoginChecking, setIsCheckingLogin]);

  // 用文档标题初始化
  React.useEffect(() => {
    if (visible && !articleMeta.title) {
      setArticleMeta({ title: docTitle });
    }
  }, [visible, docTitle, articleMeta.title, setArticleMeta]);

  if (!visible) return null;

  const enabledCount = platforms.filter((p) => p.enabled).length;
  const hasAnyTask = Object.values(publishProgress).some((s) => s.status !== 'idle');

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* 标题栏 */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#333' }}>多平台发布</h3>
          <button onClick={onClose} style={{
            border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#999',
          }}>✕</button>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {/* 扩展检测提示 */}
          {!extensionInstalled && (
            <div style={{
              padding: '10px 14px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f',
              borderRadius: 4, marginBottom: 16, fontSize: 13, color: '#874d00',
            }}>
              未检测到发布助手扩展。请先安装浏览器扩展后使用自动发布功能。
              <br />
              <span style={{ fontSize: 12, color: '#ad8b00' }}>
                当前可预览发布配置，实际发布需要扩展支持。
              </span>
            </div>
          )}

          {/* 平台选择 */}
          <div style={sectionTitle}>选择目标平台</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {platforms.map((p) => (
              <PlatformToggle
                key={p.id}
                name={p.name}
                enabled={p.enabled}
                status={publishProgress[p.id]?.status || 'idle'}
                loginStatus={loginStates[p.id]?.loginStatus || 'unknown'}
                onChange={(v) => togglePlatform(p.id, v)}
                disabled={isPublishing}
              />
            ))}
          </div>

          {/* 一键获取 Cookie / 登录检测 */}
          {extensionInstalled && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={sectionTitle}>平台登录状态</div>
                <button
                  style={{
                    ...btnDefault,
                    padding: '4px 12px',
                    fontSize: 12,
                    opacity: isCheckingLogin ? 0.6 : 1,
                    cursor: isCheckingLogin ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isCheckingLogin}
                  onClick={handleCheckCookies}
                >
                  {isCheckingLogin ? '检测中...' : '一键获取 Cookie'}
                </button>
              </div>
              <div style={{
                border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden',
              }}>
                {platforms.map((p) => {
                  const ls = loginStates[p.id];
                  const info = loginStatusMap[ls?.loginStatus || 'unknown'];
                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 14px', borderBottom: '1px solid #f0f0f0', fontSize: 13,
                    }}>
                      <span>{p.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {ls?.loginStatus === 'checking' && (
                          <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #1890ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'publish-spin 0.8s linear infinite' }} />
                        )}
                        <span style={{
                          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                          backgroundColor: info.color,
                        }} />
                        <span style={{ color: info.color, fontWeight: 500 }}>{info.label}</span>
                        {ls?.userName && (
                          <span style={{ color: '#666', fontSize: 12 }}>({ls.userName})</span>
                        )}
                        {ls?.cookieCount !== undefined && ls.loginStatus !== 'unknown' && ls.loginStatus !== 'checking' && (
                          <span style={{ color: '#bbb', fontSize: 11 }}>{ls.cookieCount} cookies</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <style>{`@keyframes publish-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* 文章元数据 */}
          <div style={sectionTitle}>文章信息</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <input
              style={inputStyle}
              placeholder="文章标题"
              value={articleMeta.title}
              onChange={(e) => setArticleMeta({ title: e.target.value })}
              disabled={isPublishing}
            />
            <input
              style={inputStyle}
              placeholder="标签（逗号分隔，如：前端,React,Markdown）"
              value={articleMeta.tags}
              onChange={(e) => setArticleMeta({ tags: e.target.value })}
              disabled={isPublishing}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="分类"
                value={articleMeta.category}
                onChange={(e) => setArticleMeta({ category: e.target.value })}
                disabled={isPublishing}
              />
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="封面图链接（可选）"
                value={articleMeta.coverUrl}
                onChange={(e) => setArticleMeta({ coverUrl: e.target.value })}
                disabled={isPublishing}
              />
            </div>
          </div>

          {/* 发布进度 */}
          {hasAnyTask && (
            <>
              <div style={sectionTitle}>发布进度</div>
              <div style={{
                border: '1px solid #e0e0e0', borderRadius: 4,
                marginBottom: 16, overflow: 'hidden',
              }}>
                {platforms.filter((p) => p.enabled).map((p) => {
                  const ps = publishProgress[p.id];
                  const info = statusMap[ps?.status || 'idle'];
                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 14px', borderBottom: '1px solid #f0f0f0', fontSize: 13,
                    }}>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: info.color, fontWeight: 500 }}>{info.label}</span>
                        {ps?.status === 'failed' && ps.errorMsg && (
                          <span style={{ color: '#999', fontSize: 12 }}>({ps.errorMsg})</span>
                        )}
                        {ps?.status === 'success' && ps.resultUrl && (
                          <a href={ps.resultUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, color: '#1890ff' }}>
                            查看
                          </a>
                        )}
                        {ps?.status === 'publishing' && (
                          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #1890ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'publish-spin 0.8s linear infinite' }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <style>{`@keyframes publish-spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button style={btnDefault} onClick={onClose} disabled={isPublishing}>
              取消
            </button>
            <button
              style={{
                ...btnPrimary,
                opacity: enabledCount === 0 || isPublishing ? 0.5 : 1,
                cursor: enabledCount === 0 || isPublishing ? 'not-allowed' : 'pointer',
              }}
              disabled={enabledCount === 0 || isPublishing}
              onClick={onPublish}
            >
              {isPublishing ? '发布中...' : `发布草稿到 ${enabledCount} 个平台`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---- 平台切换按钮子组件 ---- */
interface PlatformToggleProps {
  name: string;
  enabled: boolean;
  status: PublishStatus;
  loginStatus: LoginStatus;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

const PlatformToggle: React.FC<PlatformToggleProps> = ({
  name, enabled, status, loginStatus, onChange, disabled,
}) => {
  const info = statusMap[status];
  const isActive = status !== 'idle';
  const loginInfo = loginStatusMap[loginStatus];

  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      title={loginStatus !== 'unknown' ? `${name}: ${loginInfo.label}` : name}
      style={{
        padding: '6px 14px',
        borderRadius: 16,
        border: enabled ? '1px solid #35b378' : '1px solid #d9d9d9',
        backgroundColor: enabled ? '#f0faf5' : '#fafafa',
        color: enabled ? '#35b378' : '#999',
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: enabled ? 500 : 400,
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      {name}
      {/* 发布状态指示器 */}
      {isActive && (
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          backgroundColor: info.color, marginLeft: 6,
        }} />
      )}
      {/* 登录状态角标 */}
      {!isActive && loginStatus !== 'unknown' && loginStatus !== 'checking' && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          width: 8, height: 8, borderRadius: '50%',
          backgroundColor: loginInfo.color,
          border: '1.5px solid #fff',
        }} />
      )}
    </button>
  );
};
