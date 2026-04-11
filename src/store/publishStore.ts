import { create } from 'zustand';

/** 支持的发布平台 */
export type PlatformId = 'csdn' | 'modb' | 'juejin' | 'zhihu' | 'itpub' | 'c51cto' | 'wechat';

/** 单个平台的配置 */
export interface PlatformConfig {
  id: PlatformId;
  name: string;
  enabled: boolean;
  /** 默认分类 */
  defaultCategory?: string;
  /** 微信公众号专用：AppID */
  appId?: string;
  /** 微信公众号专用：AppSecret */
  appSecret?: string;
}

/** 单个平台的发布状态 */
export type PublishStatus = 'idle' | 'queued' | 'publishing' | 'success' | 'failed';

export interface PlatformPublishState {
  status: PublishStatus;
  /** 失败时的错误信息 */
  errorMsg?: string;
  /** 发布成功后的文章链接 */
  resultUrl?: string;
}

/** 单个平台的登录状态 */
export type LoginStatus = 'unknown' | 'checking' | 'logged_in' | 'not_logged_in';

export interface PlatformLoginState {
  loginStatus: LoginStatus;
  userName?: string;
  cookieCount?: number;
  error?: string;
}

/** 文章元数据 */
export interface ArticleMeta {
  title: string;
  tags: string;
  category: string;
  coverUrl: string;
}

interface PublishState {
  /** 扩展是否已安装 */
  extensionInstalled: boolean;
  setExtensionInstalled: (v: boolean) => void;

  /** 各平台配置 */
  platforms: PlatformConfig[];
  togglePlatform: (id: PlatformId, enabled: boolean) => void;
  updatePlatformConfig: (id: PlatformId, patch: Partial<PlatformConfig>) => void;

  /** 发布弹窗是否可见 */
  publishModalVisible: boolean;
  setPublishModalVisible: (v: boolean) => void;

  /** 文章元数据 */
  articleMeta: ArticleMeta;
  setArticleMeta: (patch: Partial<ArticleMeta>) => void;

  /** 各平台发布进度 */
  publishProgress: Record<PlatformId, PlatformPublishState>;
  setPublishStatus: (id: PlatformId, state: PlatformPublishState) => void;
  resetPublishProgress: () => void;

  /** 是否正在发布中 */
  isPublishing: boolean;
  setIsPublishing: (v: boolean) => void;

  /** 各平台登录状态 */
  loginStates: Record<PlatformId, PlatformLoginState>;
  setLoginState: (id: PlatformId, state: PlatformLoginState) => void;
  setAllLoginChecking: () => void;
  isCheckingLogin: boolean;
  setIsCheckingLogin: (v: boolean) => void;
}

const STORAGE_KEY = 'mdnice-publish-platforms';

const defaultPlatforms: PlatformConfig[] = [
  { id: 'juejin', name: '掘金', enabled: true },
  { id: 'zhihu', name: '知乎', enabled: true },
  { id: 'csdn', name: 'CSDN', enabled: true },
  { id: 'modb', name: '墨天轮', enabled: false },
  { id: 'c51cto', name: '51CTO', enabled: false },
  { id: 'itpub', name: 'ITPUB', enabled: false },
  { id: 'wechat', name: '微信公众号', enabled: false },
];

function loadPlatforms(): PlatformConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as PlatformConfig[];
      // 合并：以 defaultPlatforms 为基础，覆盖已保存的字段
      return defaultPlatforms.map((dp) => {
        const sp = saved.find((s) => s.id === dp.id);
        return sp ? { ...dp, ...sp } : dp;
      });
    }
  } catch { /* ignore */ }
  return defaultPlatforms;
}

function savePlatforms(platforms: PlatformConfig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(platforms));
}

const defaultProgress: Record<PlatformId, PlatformPublishState> = {
  csdn: { status: 'idle' },
  modb: { status: 'idle' },
  juejin: { status: 'idle' },
  zhihu: { status: 'idle' },
  itpub: { status: 'idle' },
  c51cto: { status: 'idle' },
  wechat: { status: 'idle' },
};

const defaultLoginStates: Record<PlatformId, PlatformLoginState> = {
  csdn: { loginStatus: 'unknown' },
  modb: { loginStatus: 'unknown' },
  juejin: { loginStatus: 'unknown' },
  zhihu: { loginStatus: 'unknown' },
  itpub: { loginStatus: 'unknown' },
  c51cto: { loginStatus: 'unknown' },
  wechat: { loginStatus: 'unknown' },
};

export const usePublishStore = create<PublishState>((set, get) => ({
  extensionInstalled: false,
  setExtensionInstalled: (extensionInstalled) => set({ extensionInstalled }),

  platforms: loadPlatforms(),
  togglePlatform: (id, enabled) => {
    const platforms = get().platforms.map((p) =>
      p.id === id ? { ...p, enabled } : p
    );
    savePlatforms(platforms);
    set({ platforms });
  },
  updatePlatformConfig: (id, patch) => {
    const platforms = get().platforms.map((p) =>
      p.id === id ? { ...p, ...patch } : p
    );
    savePlatforms(platforms);
    set({ platforms });
  },

  publishModalVisible: false,
  setPublishModalVisible: (publishModalVisible) => set({ publishModalVisible }),

  articleMeta: { title: '', tags: '', category: '', coverUrl: '' },
  setArticleMeta: (patch) =>
    set((s) => ({ articleMeta: { ...s.articleMeta, ...patch } })),

  publishProgress: { ...defaultProgress },
  setPublishStatus: (id, state) =>
    set((s) => ({
      publishProgress: { ...s.publishProgress, [id]: state },
    })),
  resetPublishProgress: () => set({ publishProgress: { ...defaultProgress } }),

  isPublishing: false,
  setIsPublishing: (isPublishing) => set({ isPublishing }),

  loginStates: { ...defaultLoginStates },
  setLoginState: (id, state) =>
    set((s) => ({
      loginStates: { ...s.loginStates, [id]: state },
    })),
  setAllLoginChecking: () => {
    const checking: Record<PlatformId, PlatformLoginState> = {} as Record<PlatformId, PlatformLoginState>;
    for (const key of Object.keys(defaultLoginStates) as PlatformId[]) {
      checking[key] = { loginStatus: 'checking' };
    }
    set({ loginStates: checking });
  },
  isCheckingLogin: false,
  setIsCheckingLogin: (isCheckingLogin) => set({ isCheckingLogin }),
}));
