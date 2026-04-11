/**
 * 文章元数据自动提取工具
 *
 * 从 Markdown 源码中智能提取标签、摘要、分类等信息，
 * 供多平台发布时自动填充。
 */

// ====== 技术关键词词库 ======

/** 编程语言 / 运行时 */
const LANG_KEYWORDS: Record<string, string> = {
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', go: 'Go', rust: 'Rust', cpp: 'C++', 'c++': 'C++',
  csharp: 'C#', 'c#': 'C#', php: 'PHP', ruby: 'Ruby', swift: 'Swift',
  kotlin: 'Kotlin', scala: 'Scala', dart: 'Dart', lua: 'Lua',
  shell: 'Shell', bash: 'Bash', sql: 'SQL', html: 'HTML', css: 'CSS',
  jsx: 'React', tsx: 'React', node: 'Node.js', nodejs: 'Node.js',
  deno: 'Deno', bun: 'Bun',
};

/** 框架 / 库 */
const FRAMEWORK_KEYWORDS: Record<string, string> = {
  react: 'React', vue: 'Vue', angular: 'Angular', svelte: 'Svelte',
  nextjs: 'Next.js', 'next.js': 'Next.js', nuxt: 'Nuxt', nuxtjs: 'Nuxt',
  express: 'Express', nestjs: 'NestJS', fastify: 'Fastify', koa: 'Koa',
  spring: 'Spring', django: 'Django', flask: 'Flask', fastapi: 'FastAPI',
  gin: 'Gin', echo: 'Echo', fiber: 'Fiber',
  tailwind: 'TailwindCSS', tailwindcss: 'TailwindCSS',
  bootstrap: 'Bootstrap', antd: 'Ant Design', 'ant design': 'Ant Design',
  'element-ui': 'Element UI', elementui: 'Element UI',
  webpack: 'Webpack', vite: 'Vite', rollup: 'Rollup', esbuild: 'esbuild',
  jquery: 'jQuery', redux: 'Redux', mobx: 'MobX', zustand: 'Zustand',
  pinia: 'Pinia', vuex: 'Vuex',
  electron: 'Electron', tauri: 'Tauri',
  'react native': 'React Native', flutter: 'Flutter',
  pytorch: 'PyTorch', tensorflow: 'TensorFlow',
};

/** 领域 / 概念关键词 */
const DOMAIN_KEYWORDS: Record<string, string> = {
  '前端': '前端', '后端': '后端', '全栈': '全栈',
  '算法': '算法', '数据结构': '数据结构',
  '机器学习': '机器学习', '深度学习': '深度学习', '人工智能': '人工智能', ai: 'AI',
  llm: 'LLM', 'chatgpt': 'ChatGPT', gpt: 'GPT', openai: 'OpenAI',
  '大模型': '大模型', 'prompt': 'Prompt',
  docker: 'Docker', kubernetes: 'Kubernetes', k8s: 'Kubernetes',
  devops: 'DevOps', cicd: 'CI/CD', 'ci/cd': 'CI/CD',
  linux: 'Linux', nginx: 'Nginx', redis: 'Redis',
  mysql: 'MySQL', postgresql: 'PostgreSQL', mongodb: 'MongoDB',
  elasticsearch: 'Elasticsearch', kafka: 'Kafka', rabbitmq: 'RabbitMQ',
  graphql: 'GraphQL', grpc: 'gRPC', restful: 'RESTful', api: 'API',
  websocket: 'WebSocket', http: 'HTTP', https: 'HTTPS',
  '微服务': '微服务', '分布式': '分布式', '高并发': '高并发',
  '性能优化': '性能优化', '设计模式': '设计模式',
  '面试': '面试', '源码': '源码分析',
  css: 'CSS', '响应式': '响应式布局', '动画': 'CSS动画',
  '安全': '网络安全', xss: 'XSS', csrf: 'CSRF',
  git: 'Git', github: 'GitHub', gitlab: 'GitLab',
  markdown: 'Markdown', '正则': '正则表达式', regex: '正则表达式',
  '数据库': '数据库', orm: 'ORM', '缓存': '缓存',
  '测试': '测试', '单元测试': '单元测试', jest: 'Jest', vitest: 'Vitest',
  '部署': '部署', '运维': '运维', '监控': '监控',
  '低代码': '低代码', '可视化': '数据可视化', echarts: 'ECharts', d3: 'D3.js',
  wasm: 'WebAssembly', webassembly: 'WebAssembly',
  pwa: 'PWA', ssr: 'SSR', ssg: 'SSG', spa: 'SPA',
};

/** 分类推断映射（关键词 -> 分类） */
const CATEGORY_HINTS: Record<string, string> = {
  'React': '前端', 'Vue': '前端', 'Angular': '前端', 'CSS': '前端',
  'JavaScript': '前端', 'TypeScript': '前端', 'HTML': '前端',
  'Node.js': '后端', 'Express': '后端', 'NestJS': '后端',
  'Spring': '后端', 'Django': '后端', 'Go': '后端', 'Rust': '后端',
  'Java': '后端', 'Python': '后端', 'PHP': '后端',
  'Docker': '运维', 'Kubernetes': '运维', 'DevOps': '运维', 'Linux': '运维',
  'MySQL': '数据库', 'PostgreSQL': '数据库', 'MongoDB': '数据库', 'Redis': '数据库',
  'AI': '人工智能', 'LLM': '人工智能', 'ChatGPT': '人工智能',
  '机器学习': '人工智能', '深度学习': '人工智能', '大模型': '人工智能',
  '算法': '算法', '数据结构': '算法',
  '面试': '面试', 'Git': '工具',
};

export interface ExtractedMeta {
  tags: string[];
  summary: string;
  category: string;
}

/**
 * 从 Markdown 内容中提取标签
 */
function extractTags(markdown: string): string[] {
  const found = new Map<string, number>(); // tag -> weight

  const lowerContent = markdown.toLowerCase();

  // 1. 从代码块语言标识提取（权重最高）
  const codeBlockLangs = markdown.matchAll(/```(\w+)/g);
  for (const m of codeBlockLangs) {
    const lang = m[1].toLowerCase();
    const mapped = LANG_KEYWORDS[lang];
    if (mapped) {
      found.set(mapped, (found.get(mapped) || 0) + 10);
    }
  }

  // 2. 从标题中提取（权重高）
  const headings = markdown.matchAll(/^#{1,3}\s+(.+)$/gm);
  const headingText = [...headings].map((m) => m[1]).join(' ');
  const headingLower = headingText.toLowerCase();

  // 3. 匹配所有词库
  const allKeywords = {
    ...LANG_KEYWORDS,
    ...FRAMEWORK_KEYWORDS,
    ...DOMAIN_KEYWORDS,
  };

  for (const [keyword, tag] of Object.entries(allKeywords)) {
    // 创建单词边界匹配的正则
    const escapedKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 中文关键词不需要单词边界
    const isChinese = /[\u4e00-\u9fff]/.test(keyword);
    const regex = isChinese
      ? new RegExp(escapedKw, 'gi')
      : new RegExp(`\\b${escapedKw}\\b`, 'gi');

    // 标题中出现权重 +5
    const headingMatches = headingLower.match(regex);
    if (headingMatches) {
      found.set(tag, (found.get(tag) || 0) + headingMatches.length * 5);
    }

    // 正文中出现权重 +1（每次出现）
    const bodyMatches = lowerContent.match(regex);
    if (bodyMatches) {
      found.set(tag, (found.get(tag) || 0) + bodyMatches.length);
    }
  }

  // 4. 按权重排序，取前 5 个
  const sorted = [...found.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return sorted.slice(0, 5);
}

/**
 * 从 Markdown 内容中提取摘要
 *
 * 策略：
 * 1. 优先取第一个段落（非标题、非代码块、非图片）
 * 2. 如果第一段太短，拼接前几段
 * 3. 截断到 150 字
 */
function extractSummary(markdown: string): string {
  const lines = markdown.split('\n');

  let inCodeBlock = false;
  const paragraphs: string[] = [];
  let currentPara = '';

  for (const line of lines) {
    // 跟踪代码块状态
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (currentPara.trim()) {
        paragraphs.push(currentPara.trim());
        currentPara = '';
      }
      continue;
    }

    if (inCodeBlock) continue;

    const trimmed = line.trim();

    // 跳过标题行
    if (/^#{1,6}\s/.test(trimmed)) {
      if (currentPara.trim()) {
        paragraphs.push(currentPara.trim());
        currentPara = '';
      }
      continue;
    }

    // 跳过图片、链接单独成行、分割线、表格、列表标记
    if (/^!\[/.test(trimmed)) continue;
    if (/^---+$|^===+$|^\*\*\*+$/.test(trimmed)) continue;
    if (/^\|/.test(trimmed)) continue;
    if (/^\[toc\]/i.test(trimmed)) continue;

    // 空行表示段落分隔
    if (trimmed === '') {
      if (currentPara.trim()) {
        paragraphs.push(currentPara.trim());
        currentPara = '';
      }
      continue;
    }

    currentPara += (currentPara ? ' ' : '') + trimmed;
  }

  if (currentPara.trim()) {
    paragraphs.push(currentPara.trim());
  }

  // 清理 Markdown 语法标记
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')     // **bold**
      .replace(/\*(.+?)\*/g, '$1')           // *italic*
      .replace(/~~(.+?)~~/g, '$1')           // ~~strikethrough~~
      .replace(/`(.+?)`/g, '$1')             // `code`
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')    // [text](url)
      .replace(/!\[.*?\]\(.+?\)/g, '')        // ![alt](url)
      .replace(/^[-*+]\s+/gm, '')            // list markers
      .replace(/^\d+\.\s+/gm, '')            // ordered list
      .replace(/^>\s+/gm, '')                // blockquote
      .trim();
  };

  // 拼接段落直到 150 字
  let summary = '';
  for (const para of paragraphs) {
    const cleaned = cleanMarkdown(para);
    if (!cleaned) continue;

    if (summary) {
      summary += ' ' + cleaned;
    } else {
      summary = cleaned;
    }

    if (summary.length >= 150) break;
  }

  // 截断
  if (summary.length > 150) {
    summary = summary.slice(0, 147) + '...';
  }

  return summary;
}

/**
 * 根据提取到的标签推断文章分类
 */
function inferCategory(tags: string[]): string {
  const categoryVotes: Record<string, number> = {};

  for (const tag of tags) {
    const cat = CATEGORY_HINTS[tag];
    if (cat) {
      categoryVotes[cat] = (categoryVotes[cat] || 0) + 1;
    }
  }

  const sorted = Object.entries(categoryVotes).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || '';
}

/**
 * 从 Markdown 中提取第一张图片作为封面候选
 */
function extractFirstImage(markdown: string): string {
  const match = markdown.match(/!\[.*?\]\((.+?)\)/);
  return match?.[1] || '';
}

/**
 * 一键提取文章元数据
 *
 * @param markdown - Markdown 源码
 * @param title - 文档标题（用于辅助分析）
 * @returns 提取的标签、摘要、分类
 */
export function extractArticleMeta(markdown: string, title?: string): ExtractedMeta & { coverUrl: string } {
  // 如果传入标题，将其纳入分析
  const fullContent = title ? `# ${title}\n\n${markdown}` : markdown;

  const tags = extractTags(fullContent);
  const summary = extractSummary(markdown);
  const category = inferCategory(tags);
  const coverUrl = extractFirstImage(markdown);

  return { tags, summary, category, coverUrl };
}
