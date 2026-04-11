# 开发规则（所有开发者和 AI 必须严格遵守）

## 一、沟通规则

1. **使用中文沟通**：所有文档、注释、commit message、PR 描述均使用中文

## 二、文档维护规则

### 2.1 项目开发文档（DEVELOPMENT.md）
- 将项目开发拆分为多项任务，记录在 DEVELOPMENT.md 中
- **每完成一项任务**，必须更新 DEVELOPMENT.md 中对应任务的状态
- 每次推送 GitHub 时，DEVELOPMENT.md 必须是最新状态
- 开发日志部分记录每日完成的具体工作

### 2.2 AI 接管维护文档（AI-HANDOVER.md）
- 维护项目架构、技术决策、状态管理、开发约定等信息
- 新的 AI 接管后，必须先阅读此文档了解项目全貌
- 每次有架构变更时必须同步更新

### 2.3 README 文档（README.md）
- 介绍项目架构及安装部署方式
- 功能变更后及时更新功能列表

### 2.4 提示词文档（docs/PROMPT.md）
- 这是项目的**核心需求规格说明书**，记录了所有功能需求的完整定义
- **任何功能开发都必须以此文档为准**
- 不得随意修改此文档，除非经过明确确认
- 验收标准以此文档第十一节为准

## 三、Git 工作流规则

1. 每完成一项任务或一组相关任务，**立即 commit 并 push**
2. commit message 格式：`<type>: <中文描述>`，type 包括 feat/fix/docs/ci/refactor/style/perf
3. 推送前确保 `npx tsc --noEmit` 和 `npm run build` 无报错
4. 不要一次性提交大量不相关的变更

## 四、代码规范

1. 组件使用函数式组件 + React Hooks
2. 文件命名：组件 PascalCase，工具函数 camelCase
3. 样式：CSS Modules（*.module.css）或内联 style 对象
4. 状态管理：Zustand store，按领域划分（editor/theme/file/publish）
5. 类型安全：不使用 `any`（除非与第三方库交互不可避免）
6. 所有用户可见的文字使用中文

## 五、技术栈约束（不可更换）

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 不可更换 |
| 构建工具 | Vite | 不可更换 |
| 编辑器 | CodeMirror 6 | 不可更换 |
| Markdown 解析 | markdown-it + 插件 | 不可更换 |
| 数学公式 | KaTeX | 不可更换 |
| 代码高亮 | highlight.js | 不可更换 |
| 状态管理 | Zustand | 不可更换 |
| 数据持久化 | localStorage | 不可更换，不引入后端 |

## 六、浏览器扩展开发规则

1. 扩展代码位于 `extension/` 目录，使用 Chrome Extension MV3 规范
2. 扩展使用纯 JavaScript（非 TypeScript），不经过 Vite 构建
3. Web 端与扩展的通信统一通过 `window.postMessage`，消息类型前缀为 `MDNICE_`
4. 通信协议定义集中在 `src/utils/extensionBridge.ts`
5. 新增平台适配器时，需同步更新：
   - `extension/src/adapters/` 新增适配器文件
   - `extension/src/background.js` 的 `ADAPTERS` 和 `PLATFORM_COOKIE_CONFIG`
   - `extension/manifest.json` 的 `host_permissions`
   - `src/store/publishStore.ts` 的 `PlatformId` 类型和 `defaultPlatforms`

## 七、功能开发优先级

按照 docs/PROMPT.md 第十节的开发步骤顺序推进，未完成的任务参见 DEVELOPMENT.md。
多平台发布功能参见 `docs/mdnice-clone 多平台一键自动发文设计方案.md`。

## 八、验收标准

所有功能必须通过 docs/PROMPT.md 第十一节列出的验收标准检查。
