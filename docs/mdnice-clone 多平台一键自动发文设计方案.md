# mdnice-clone 多平台一键自动发文设计方案

## 一、需求背景与目标

mdnice-clone 目前已经实现了核心的 Markdown 编辑、实时预览、主题切换以及针对微信公众号、知乎、掘金的富文本复制功能。为了进一步提升内容创作者的效率，计划引入“一键多平台自动发文”功能。

本方案旨在设计一套完整的技术架构，支持将当前编辑器中的文章一键发布至以下 7 个主流内容平台：
- CSDN
- 墨天轮
- 掘金
- 知乎
- ITPUB
- 51CTO
- 微信公众号

## 二、技术挑战与约束分析

在设计多平台发布方案时，需要充分考虑 mdnice-clone 现有的架构约束以及各平台的技术壁垒。

### 2.1 现有架构约束
根据 `RULES.md` 和 `PROMPT.md`，mdnice-clone 是一个纯前端的 React 18 + Vite 应用，**不引入后端服务**，所有数据依赖 `localStorage` 持久化。这意味着我们无法通过部署一个中心化的后端服务器来代理用户的发布请求，也无法在后端集中管理用户的平台账号和 Cookie。

### 2.2 各平台发文机制调研
经过对 7 个目标平台的深入调研，各平台的发文接口和鉴权机制存在显著差异 [1] [2]：

| 平台 | 接口开放程度 | 鉴权方式 | 内容格式要求 | 自动化难度 |
|------|--------------|----------|--------------|------------|
| 微信公众号 | 提供官方 API | AppID + AppSecret | HTML（需内联样式） | 低（需认证账号） |
| 掘金 | 无官方 API，有 Web 接口 | Cookie | Markdown | 中 |
| 知乎 | 无官方 API，有 Web 接口 | Cookie + Header | HTML | 中 |
| CSDN | 无官方 API，有 Web 接口 | Cookie + 复杂签名校验 | Markdown + HTML | 高 |
| 墨天轮 | 无公开接口 | Cookie | HTML/富文本 | 高 |
| 51CTO | 无公开接口 | Cookie | HTML/富文本 | 高 |
| ITPUB | 传统论坛架构 | Cookie | 论坛代码/富文本 | 高 |

对于 CSDN，其新版发布接口引入了复杂的 `x-ca-signature` 签名校验机制，纯前端逆向和模拟请求的难度极高 [3]。而墨天轮、51CTO 和 ITPUB 缺乏结构化的发布接口，通常需要依赖浏览器自动化工具（如 Selenium 或 Playwright）来模拟用户点击和表单填写 [4]。

## 三、核心架构设计

鉴于纯前端应用的跨域限制（CORS）以及各平台复杂的鉴权机制，直接在 mdnice-clone 网页端发起跨域 API 请求是不可行的。综合评估后，本方案采用 **“纯前端 Web 应用 + 浏览器扩展（Chrome Extension）”** 的混合架构。

### 3.1 为什么选择浏览器扩展方案？
浏览器扩展方案（参考开源项目 Wechatsync [5]）完美契合了 mdnice-clone 的纯前端约束：
1. **突破跨域限制**：扩展的 Background Script 可以向任意域名发起请求，不受 CORS 限制。
2. **免密鉴权**：扩展可以直接读取用户在浏览器中已登录平台的 Cookie，无需用户在 mdnice-clone 中输入账号密码，极大地保障了安全性。
3. **规避签名校验**：对于 CSDN 等具有复杂请求签名的平台，扩展可以通过注入 Content Script，直接在目标平台的页面上下文中执行 JavaScript，调用其原生的发布函数，从而绕过签名逆向的难题。

### 3.2 系统交互流程

整个自动发文流程分为三个主要阶段：

1. **内容准备阶段（Web 端）**：
   用户在 mdnice-clone 中完成文章编辑。点击“一键发布”按钮后，Web 端收集当前文章的标题、Markdown 源码以及经过主题渲染后的 HTML 内容（包含内联 CSS）。
2. **通信阶段（Web 端 -> 扩展端）**：
   Web 端通过 `window.postMessage` 或自定义事件，将打包好的文章数据发送给已安装的浏览器扩展。
3. **分发阶段（扩展端 -> 各平台）**：
   扩展接收到数据后，根据用户选择的目标平台，并行执行发布逻辑。对于提供 Web API 的平台（如掘金、知乎），扩展直接携带本地 Cookie 发起 HTTP 请求；对于需要页面交互的平台（如 51CTO、ITPUB），扩展在后台打开隐藏标签页，注入脚本模拟表单填写和提交。

## 四、各平台适配策略

针对 7 个目标平台，扩展端将采用不同的适配策略来保证发布的成功率。

### 4.1 API 直接调用型（掘金、知乎）
这类平台虽然没有开放平台 API，但其 Web 端的发文接口相对清晰，且仅依赖 Cookie 鉴权。
- **掘金**：扩展读取 `sessionid` Cookie，直接向 `https://api.juejin.cn/content_api/v1/article_draft/create` 发送 POST 请求，提交 Markdown 内容创建草稿，随后调用发布接口。
- **知乎**：扩展向 `https://zhuanlan.zhihu.com/api/articles/drafts` 发送请求创建草稿。知乎要求 HTML 格式，我们将直接使用 mdnice-clone 渲染好的 HTML 内容。

### 4.2 页面上下文注入型（CSDN）
CSDN 的 `saveArticle` 接口需要计算 `x-ca-signature` [3]。为了避免复杂的逆向工程，扩展将在后台静默打开 CSDN 的 Markdown 编辑器页面（`https://editor.csdn.net/md/`），注入 Content Script。脚本将文章内容填入编辑器实例，并直接触发页面上原有的“发布”按钮绑定的 JavaScript 事件，让 CSDN 自身的代码去完成签名和请求发送。

### 4.3 DOM 自动化操作型（墨天轮、51CTO、ITPUB）
这三个平台缺乏现代化的 API 接口，强依赖传统的表单提交。
扩展将在后台打开对应的发文页面，通过 Content Script 执行 DOM 操作：
1. 定位标题输入框并赋值。
2. 定位富文本编辑器（如 UEditor、TinyMCE 等），通过其暴露的全局 API（如 `tinymce.activeEditor.setContent()`）注入 HTML 内容。
3. 模拟点击提交按钮。

### 4.4 官方 API 对接型（微信公众号）
微信公众号提供了完善的官方 API [6]。如果用户拥有认证的公众号，可以在 mdnice-clone 的设置中填入 `AppID` 和 `AppSecret`。
Web 端将直接调用微信 API（需通过一个简单的 Serverless 函数转发以解决微信 API 的跨域问题，或由扩展代发）：
1. 获取 `access_token`。
2. 将文章中的外部图片上传至微信素材库，替换为微信域名图片。
3. 调用新增草稿接口（`draft/add`）。

## 五、Web 端 UI 改造方案

为了接入上述能力，mdnice-clone 的前端界面需要进行相应的扩展。

### 5.1 菜单栏扩展
在顶部的 `MenuBar` 组件中，新增一个 **“发布”** 一级菜单。包含以下子项：
- **多平台发布配置**：打开配置弹窗，管理各平台的开关状态。
- **一键发布草稿**：触发发布流程，默认将文章发布为各平台的草稿状态，供用户二次确认。
- **安装发布助手扩展**：引导用户前往 Chrome 商店安装配套的浏览器扩展。

### 5.2 发布控制台弹窗
新增一个 `PublishModal` 组件。当用户点击发布时弹出，展示：
- 目标平台列表及当前登录状态（通过与扩展通信获取）。
- 文章元数据配置区：允许用户统一设置文章的标签（Tags）、分类（Category）和封面图（Cover Image）。
- 实时发布进度条：展示每个平台的发布状态（排队中、发布中、成功、失败及错误原因）。

### 5.3 状态管理
在 Zustand 中新增 `publishStore`，用于管理：
- 扩展是否已安装的检测状态。
- 各平台的配置信息（是否启用、默认分类等），持久化至 `localStorage`。
- 当前的发布任务队列和进度。

## 六、总结

通过引入浏览器扩展作为发布引擎，mdnice-clone 能够在坚守纯前端架构约束的前提下，安全、高效地实现多平台一键发文功能。该方案不仅避免了后端服务器的维护成本，还最大程度地保护了用户的账号隐私，为内容创作者提供了一个无缝的创作与分发体验。

## 参考资料

[1] GitHub. ddean2009/blog-auto-publishing-tools. https://github.com/ddean2009/blog-auto-publishing-tools
[2] GitHub. chenzijia12300/juejin-api. https://github.com/chenzijia12300/juejin-api
[3] 腾讯云开发者社区. x-ca-key,x-ca-nonce,x-ca-signature与x-ca-signature-headers探索. https://cloud.tencent.com/developer/article/2420128
[4] 墨天轮. 如何使用浏览器自动化框架Playwright开发“万媒易发”实现多平台自动发布文章. https://www.modb.pro/db/1727239150045831168
[5] GitHub. wechatsync/Wechatsync. https://github.com/wechatsync/Wechatsync
[6] 微信开放文档. 新增草稿. https://developers.weixin.qq.com/doc/service/api/draftbox/draftmanage/api_draft_add
