# shiyou — shiyou 的投资笔记

> 个人投资笔记网站，代码与内容分离管理。
> 线上地址：**https://www.dongshiyou.com**

本文件是**完整的使用与维护文档**，面向所有读者（包括 AI 代理）。任何人读到本文档，都应能独立完成本仓库的日常维护。

> [!IMPORTANT]
> **强制声明：未来任何功能上线、配置变更、目录结构变动，必须同步更新本 README.md（以及 shiyou-content/README.md 中涉及的部分）。这是维护约定，不是可选项。**

---

## 目录

- [项目概述](#项目概述)
- [架构说明（两个仓库）](#架构说明两个仓库)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [快速开始（本地开发）](#快速开始本地开发)
- [写文章（博客）](#写文章博客)
  - [frontmatter 字段](#frontmatter-字段)
  - [文章支持的功能](#文章支持的功能)
  - [本地图片放哪里](#本地图片放哪里)
  - [自动附加的风险提示](#自动附加的风险提示)
- [相册](#相册)
- [项目](#项目)
- [经历](#经历)
- [替换头像](#替换头像)
- [替换 favicon](#替换-favicon)
- [修改站点信息](#修改站点信息)
- [部署机制](#部署机制)
- [搜索与 RSS](#搜索与-rss)
- [常见问题](#常见问题)
- [维护约定（强制）](#维护约定强制)

---

## 项目概述

shiyou 的个人投资笔记网站，内容围绕：

- 股票投资相关的观察
- 行业研究、公司分析与市场思考
- 投资方法、数据整理与复盘

网站定位的官方描述（同时用于 SEO meta description 与 RSS 描述）：

> shiyou 的投资笔记：市场千变万化，我只想搞清楚明天买什么。

## 架构说明（两个仓库）

网站采用「代码与内容分离」的架构，由两个仓库组成：

| 仓库 | 作用 | 何时修改 |
|---|---|---|
| **shiyou**（本仓库） | 网站主题、代码、页面、站点配置、相册/项目/经历内容 | 改样式/功能/相册/项目/经历/头像/站点信息时 |
| **shiyou-content** | 博客文章（`.mdx` 文件） | 写文章时 |

> 重要：
> - **写文章永远只改 shiyou-content 仓库**，不要在本仓库改文章。
> - 网站构建时 `sync-content.mjs` 会自动从 shiyou-content 拉取最新文章并转换为本站内容格式。

## 技术栈

- **Astro 7**（静态站点生成，SSG）
- **Tailwind CSS 4**（`@tailwindcss/vite` 插件，`@theme inline` 自定义变量）
- **React 19**（少量交互岛：相册弹窗、极坐标卡片等）
- **shadcn/ui 风格组件**（`radix-ui` + `cva` + `tailwind-merge`）
- **KaTeX**（数学公式）、**Expressive Code**（代码高亮）、**Shiki**（行内代码）
- **markdown-it + sanitize-html**（RSS 正文渲染）
- **sharp**（图片优化，`webp` 强制转 `avif`）
- 托管于 **Vercel**，DNS 由 Cloudflare 托管

## 目录结构

```
shiyou/
├── astro.config.ts            # Astro 配置（markdown 插件链、站点地址、图片服务）
├── components.json            # shadcn/ui 配置
├── package.json               # 依赖与脚本
├── sync-content.mjs           # 构建前从 shiyou-content 同步并转换文章（prebuild）
├── public/
│   ├── avatar.avif            # 站点头像
│   ├── favicon/               # favicon 全套
│   ├── fonts/                 # 自托管字体（woff2）
│   ├── rss/                   # RSS 样式表（xsl/css）
│   └── blog-images/           # 构建时生成的博客图片副本（.gitignore，勿手动改）
└── src/
    ├── config.ts              # ★ 站点核心配置（标题/描述/导航/社交/每页文章数）
    ├── content.config.ts      # ★ 内容集合 schema（blog/projects/experience/photos）
    ├── types.ts               # 配置类型定义
    ├── env.d.ts
    ├── image-service.mjs      # 图片服务：强制 webp → avif
    ├── components/
    │   ├── base/              # 基础组件（Header/Footer/Head/Link/…）
    │   ├── photos/            # 相册相关（时间线/极坐标卡片/弹窗）
    │   ├── posts/
    │   │   ├── base/          # 文章页组件（含 PostCopyright 版权+风险提示）
    │   │   ├── card/          # BlogCard
    │   │   └── toc/           # 目录相关
    │   ├── projects/          # ProjectCard
    │   └── ui/                # shadcn 风格 UI（avatar/badge/button/…）
    ├── layouts/               # Layout/Header/Footer
    ├── lib/
    │   ├── utils.ts           # cn()/formatDate()/readingTime() 等工具
    │   ├── data-utils.ts      # 内容查询与排序逻辑
    │   ├── photos.ts          # 相册图片解析/优化
    │   └── reading-progress.ts
    ├── pages/                 # 路由页面（见下方路由表）
    ├── plugins/               # markdown 自定义插件
    ├── styles/                # global.css / typography.css / misc.css
    └── content/               # 内容目录（见下）
```

### 路由表

| 路径 | 文件 | 说明 |
|---|---|---|
| `/` | `src/pages/index.astro` | 首页 |
| `/about` | `src/pages/about.astro` | 关于 |
| `/blog` | `src/pages/blog/[...page].astro` | 博客列表（分页） |
| `/blog/[id]` | `src/pages/blog/[...id].astro` | 文章详情 |
| `/archive` | `src/pages/archive/index.astro` | 归档 |
| `/projects` | `src/pages/projects/index.astro`、`[...id].astro` | 项目 |
| `/experience` | `src/pages/experience/index.astro` | 经历 |
| `/photos` | `src/pages/photos/index.astro` | 相册 |
| `/search` | `src/pages/search.astro` | 站内搜索 |
| `/tags` | `src/pages/tags/index.astro`、`[...id].astro` | 标签 |
| `/404` | `src/pages/404.astro` | 404 |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS 订阅 |
| `/robots.txt` | `src/pages/robots.txt.ts` | robots |
| `sitemap-index.xml` | 由 `@astrojs/sitemap` 自动生成 | sitemap |

### 内容目录

```
src/content/
├── blog/       # 构建时由 sync-content.mjs 生成（.gitignore 排除，勿手动编辑）
├── photos/     # 相册内容（每组一个文件夹）
├── projects/   # 项目内容（.md）
└── experience/ # 经历内容（.md）
```

## 快速开始（本地开发）

```bash
npm install
npm run dev       # 本地开发（默认 http://localhost:1234）
npm run build     # 构建（构建前会自动同步文章）
npm run preview   # 本地预览构建产物
npm run prettier  # 格式化代码
```

> 本地构建需要能访问 GitHub（`sync-content.mjs` 会克隆/拉取 shiyou-content 仓库）。

### 脚本一览

| 脚本 | 命令 | 说明 |
|---|---|---|
| `dev` | `astro dev` | 本地开发服务器（端口 1234） |
| `build` | `astro build` | 构建，前置执行 `sync-content.mjs` |
| `prebuild` | `node sync-content.mjs` | 同步内容仓库文章 |
| `preview` | `astro preview` | 预览构建产物 |
| `prettier` | `prettier --write ...` | 格式化代码 |

## 写文章（博客）

### 操作流程

1. 在 **shiyou-content** 仓库的 `blog/` 文件夹新建 `.mdx` 文件。
2. 按下方 frontmatter 格式填写元信息。
3. 推送：`git add . && git commit -m "添加新文章" && git push`。
4. 网站自动重新构建，几分钟后文章上线。

### frontmatter 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 文章标题 |
| `publishedAt` | 是 | 发布日期，格式 `YYYY-MM-DD` |
| `summary` | 否 | 文章简介（用于列表、SEO、RSS；缺省时用 `description`） |
| `tags` | 否 | 标签，逗号分隔（中英文逗号均可） |
| `order` | 否 | 子文章排序权重，同一父文章下越小越靠前（仅对子文章生效） |

示例：

```mdx
---
title: "文章标题"
publishedAt: "2026-08-06"
summary: "文章简介"
tags: "标签1, 标签2"
---

这里是文章正文，支持完整 Markdown 语法。
```

> 文件名即文章 URL：`hello-world.mdx` → `/blog/hello-world`。文件名请避免 `/` 等特殊字符（`/` 用于表示子文章，见下文「子文章 / 系列文章」）。

### 发布后自动生成的功能

你只需要写文章和推送，以下功能由网站构建时自动完成，**无需额外操作**：

| 功能 | 说明 |
|---|---|
| 博客列表 | `/blog` 自动按日期倒序展示文章，并自动分页（每页 `SITE.postsPerPage` 篇） |
| 文章详情页 | `/blog/{文件名}` 自动生成，含目录、上一篇/下一篇导航 |
| 标签页 | 文章 `tags` 自动生成 `/tags/{标签}` 聚合页和标签索引页 |
| 归档页 | `/archive` 自动按年份归档 |
| 搜索 | `/search` 自动索引全部文章标题/简介/标签 |
| RSS 订阅 | `/rss.xml` 自动包含文章全文 |
| SEO 元信息 | 自动生成 title / description / og: / twitter: 标签 |
| 阅读时间 | 文章页自动计算并显示"X 分钟阅读" |
| 风险提示 | 每篇文章底部自动附加投资免责声明 |
| 图片优化 | 正文图片自动压缩为 avif |

### frontmatter 补充说明

- `summary` 与 `description` 二选一即可，都写时优先用 `summary`。
- `publishedAt` 建议使用 `YYYY-MM-DD`；其他日期格式也会被自动规范化，无效格式会被忽略。
- `tags` 支持英文逗号或中文逗号（`，`）分隔，也支持 YAML 数组写法。

### 已知限制（博客引擎）

当前 `sync-content.mjs` 有以下限制，文章作者**不要使用**以下功能，否则不会生效：

| 特性 | 现状 |
|---|---|
| `draft: true` | **不支持**，同步时强制设为 `false`，所有文章都会发布 |
| 子文章 / 系列文章 | **支持**，`blog/` 子文件夹内的文章自动成为子文章（见下文） |
| `order` 字段 | **支持**，同一父文章下按 `order` 升序排列（缺省按 `publishedAt` 升序） |
| 自定义 permalink / slug | **不支持**，URL 固定为文件名（含相对子目录路径） |
| 文章头图 cover image | **不支持**，没有 frontmatter 头图字段 |

### 子文章 / 系列文章

把 `.mdx` 文件放进 `blog/` 的子文件夹，即可生成「父文章 + 子文章」结构：

```
shiyou-content/
└── blog/
    ├── 投资系列.mdx          ← 父文章（slug: 投资系列）
    └── 投资系列/
        ├── 01-开篇.mdx       ← 子文章（slug: 投资系列/01-开篇）
        └── 02-方法.mdx       ← 子文章（slug: 投资系列/02-方法）
```

- 子文章 URL = `/blog/父文件夹/文件名`（如 `/blog/投资系列/01-开篇`）。
- 父文章详情页自动展示子文章导航、组合阅读时长与合并目录；子文章之间自动生成上一篇/下一篇导航。
- 子文章排序：先按 `publishedAt` 升序，日期相同时按 `order` 升序（`order` 缺省为 0）。
- `blog/images/` 是全站图片目录，不会作为文章处理。

### 文章支持的功能

- **文字格式**：`**加粗**`、`*斜体*`、`~~删除线~~`、`[链接](https://...)`
- **列表**、**引用**、**表格**、**代码块**（自动高亮）
- **数学公式**（KaTeX）：行内 `$E = mc^2$`，块级 `$$...$$`
- **提示框**：

  ```
  > [!TIP]
  > 这是提示框
  ```

  支持 `NOTE` / `TIP` / `IMPORTANT` / `WARNING` / `CAUTION`
- **图片**：图片放进同仓库 `blog/images/`，正文用相对路径引用：

  ```mdx
  ![图片说明](./images/xxx.jpg)
  ```

  构建时图片会被优化为 avif。
- **嵌入视频**：直接写 iframe HTML（YouTube / B 站都支持）

### 本地图片放哪里

```
shiyou-content/
├── blog/
│   ├── 我的文章.mdx
│   └── images/
│       └── xxx.jpg    ← 图片放这里
```

### 自动附加的风险提示

网站会自动为**每一篇文章**（含子文章）底部附加投资风险提示：

> 免责声明：本文仅为个人观点分享，不构成任何投资建议。股市有风险，投资需谨慎。

- 实现在 `src/components/posts/base/PostCopyright.astro`。
- 作者无需在文章中手动添加。
- **如要修改文案，只改该组件**（新增风险提示功能时请同步更新本文档）。

## 相册

相册内容在本仓库的 `src/content/photos/`。**每组相册 = 一个文件夹**，文件夹里放一个 `.md` 文件和一个 `assets/` 图片目录。

### 新建一组相册

在 `src/content/photos/` 新建文件夹（如 `2026-travel/`），创建 `xxx.md`：

```md
---
title: "某次旅行"
description: "简单描述这组照片"
startDate: 2026-08-01
endDate: 2026-08-03
location: "杭州"
---

![](./assets/1.jpg)
![](./assets/2.jpg)
```

字段说明：

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 相册标题 |
| `description` | 否 | 相册描述 |
| `startDate` / `endDate` | 否 | 时间范围，决定时间线位置（新的排前面） |
| `location` | 否 | 地点 |
| `favicon` / `iconType` | 否 | 时间线图标（emoji/颜色/数字/图片），缺省 `📷` |
| `images` | 否 | 可选，替代正文 `![]()` 的显式声明方式（见 schema 注释） |

> - 正文用 `![](./assets/文件名)` 引用图片，构建时自动优化。
> - 没有照片时页面会显示"还没有照片哦"，不会报错。

## 项目

项目内容在本仓库的 `src/content/projects/`。新建 `.md` 文件：

```md
---
name: "项目名称"
description: "项目简介"
startDate: 2026-01-01
endDate: 2026-06-01
sourceCodeLink: "https://github.com/xxx"
siteLink: "https://xxx.com"
relatedBlogsLink: "https://www.dongshiyou.com/blog/xxx"
tags: "标签1, 标签2"
featured: true
order: 1
---

```

字段说明：

| 字段 | 必填 | 说明 |
|---|---|---|
| `name` | 是 | 项目名称 |
| `description` | 否 | 项目简介 |
| `startDate` / `endDate` | 否 | 时间范围；不填 `endDate` 视为进行中，排在前面 |
| `sourceCodeLink` | 否 | 源码链接 |
| `siteLink` | 否 | 在线地址 |
| `relatedBlogsLink` | 否 | 相关博客文章链接 |
| `tags` | 否 | 标签 |
| `featured` | 否 | `true` 时进入首页推荐区 |
| `order` | 否 | 手动排序权重（越小越靠前） |

> 没有内容时页面显示"暂无项目，敬请期待"。

## 经历

经历内容在本仓库的 `src/content/experience/`。新建 `.md` 文件：

```md
---
role: "职位"
company: "公司名"
description: "工作内容描述"
startDate: 2024-01-01
endDate: 2025-06-30
location: "北京"
companyUrl: "https://xxx.com"
companyLogo: "./assets/logo.png"
tags: "标签1, 标签2"
---

```

字段说明：

| 字段 | 必填 | 说明 |
|---|---|---|
| `role` | 是 | 职位 |
| `company` | 是 | 公司名 |
| `description` | 否 | 工作内容描述 |
| `startDate` / `endDate` | 否 | 时间范围；不填 `endDate` 视为在职，排在最前 |
| `location` | 否 | 地点 |
| `companyUrl` | 否 | 公司官网 |
| `companyLogo` | 否 | 公司 logo（本地图片路径） |
| `tags` | 否 | 标签 |

> 没有内容时页面显示"暂无经历，敬请期待"。

## 替换头像

1. 把新头像放到 `public/` 目录，推荐 **avif 格式**（体积小，加载快）。
   - 转换命令示例：`npx sharp-cli -i 原图.jpg -o public/avatar.avif`（或用在线工具）。
2. 更新两处引用：
   - `src/pages/index.astro`
   - `src/pages/about.astro`

   两处均为 `src="/avatar.avif"`。
3. 删除旧的 `public/avatar.*`，提交推送。

> `public/` 里的文件是原样上线、不做压缩的，所以**放进去前先转好格式/压缩好**。
> 建议尺寸：正方形 500~1200px。

## 替换 favicon

1. 用 https://realfavicongenerator.net/ 生成全套 favicon，放到 `public/favicon/`。
2. 更新 `src/config.ts` 中的 `FAVICON` 路径。

## 修改站点信息

所有站点级配置都在 **`src/config.ts`**：

| 配置项 | 说明 |
|---|---|
| `SITE.title` | 站点名称 |
| `SITE.description` | 站点简介（同时用于首页及各页 `<meta description>`、RSS `<description>`） |
| `SITE.author` | 作者名 |
| `SITE.href` | 站点地址 |
| `SITE.locale` | 语言（如 `zh-CN`） |
| `SITE.footer.items` | 页脚自定义文字/链接 |
| `SITE.featuredPostCount` / `featuredProjectCount` / `featuredExperienceCount` | 首页各栏目展示数量 |
| `SITE.postsPerPage` | 博客每页文章数 |
| `HEADER_LINKS` | 顶部导航 |
| `FOOTER_LINKS` | 底部导航 |
| `SOCIAL_LINKS` | 社交链接 |
| `FAVICON` | favicon 路径 |

改完提交推送即可，无需其他操作。

> 注意：`SITE.description` 是全站的重要文案，修改后**同时影响 SEO 与 RSS**，请一并评估。

## 部署机制

```
你在 shiyou-content 推送文章
        ↓
GitHub Action 触发 Vercel Deploy Hook
        ↓
Vercel 构建 shiyou 仓库
  ├─ 1. prebuild：sync-content.mjs 拉取 shiyou-content 最新文章
  ├─ 2. astro build：生成静态页面（文章图片自动压缩为 avif）
  └─ 3. 部署上线
```

- **内容仓库**（shiyou-content）的推送通过 GitHub Action + `VERCEL_DEPLOY_HOOK` secret 触发重建。
- **网站仓库**（本仓库）的推送由 Vercel 的 GitHub 集成自动触发。
- 域名 dongshiyou.com 由 Cloudflare DNS 托管，指向 Vercel。

## 搜索与 RSS

- **站内搜索**（`/search`）：基于页面内全部文章与项目的 JSON 数据做客户端过滤，无需后端。
- **RSS**（`/rss.xml`）：包含文章全文；本地图片路径会被重写为绝对 URL（`/blog-images/...`）；提示框标记会被转换为可读的中文标签；数学公式保留 LaTeX 源码。
- **sitemap**：由 `@astrojs/sitemap` 自动生成，覆盖所有公开页面。

## 常见问题

**Q: 改了文章但网站没更新？**
检查 shiyou-content 的 GitHub Action 运行状态（Actions 标签页），确认 `VERCEL_DEPLOY_HOOK` secret 是否有效。

**Q: 添加相册/项目后报错？**
检查 frontmatter 字段名是否拼写正确（如 `startDate` 不是 `date`），图片路径 `./assets/文件名` 是否与文件名一致。

**Q: 文章里的 class 样式不生效？**
文章内容用的是 Tailwind 类（如 `aspect-video`）。`sync-content.mjs` 生成的文章在 `src/content/blog/`（已被 `.gitignore` 排除），Tailwind 通过 `global.css` 里的 `@source "../content/blog/**/*.md"` 显式扫描，**请勿删除该行**。

**Q: 想修改自动风险提示文案？**
改 `src/components/posts/base/PostCopyright.astro` 中的免责声明段落。

**Q: 构建时报"collection does not exist or is empty"？**
这是正常的。当 `projects` / `experience` / `photos` 目录下还没有任何内容时，Astro 会提示对应集合为空，页面会显示空状态，不影响构建。

**Q: 想换 favicon？**
见上方「替换 favicon」一节。

## 维护约定（强制）

> [!IMPORTANT]
> 以下为强制维护约定，任何 AI 或人类开发者都必须遵守：
>
> 1. **新增功能、修改配置、调整目录结构、变更内容 schema 后，必须同步更新本 README.md。**
> 2. **影响 shiyou-content 仓库的约定（如文章 frontmatter 变化）必须同步更新 shiyou-content/README.md。**
> 3. **本文件被视为"项目事实来源"（source of truth）。如果发现文档与代码不一致，优先更新文档或说明原因。**
> 4. **写文章请在 shiyou-content 仓库进行，不要在本仓库直接编辑 `src/content/blog/`（该目录是构建产物，会被覆盖）。**
