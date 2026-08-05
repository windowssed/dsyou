# dsyou - shiyou 的个人博客

个人博客网站：**https://www.dsyou.cn**

## 目录

- [架构说明](#架构说明)
- [快速开始（本地开发）](#快速开始本地开发)
- [写文章（博客）](#写文章博客)
- [相册](#相册)
- [项目](#项目)
- [经历](#经历)
- [替换头像](#替换头像)
- [修改站点信息（标题/导航/社交链接）](#修改站点信息标题导航社交链接)
- [部署机制](#部署机制)
- [常见问题](#常见问题)

## 架构说明

网站采用「代码与内容分离」的架构，由两个仓库组成：

| 仓库 | 作用 | 何时修改 |
|---|---|---|
| **dsyou**（本仓库） | 网站主题、代码、页面、站点配置 | 改样式/功能/相册/项目/经历/头像时 |
| **dsyou-content** | 博客文章（`.mdx` 文件） | 写文章时 |

> 重要：**写文章永远只改 dsyou-content 仓库**，不要在本仓库改文章。
> 网站构建时 `sync-content.mjs` 会自动从 dsyou-content 拉取最新文章并转换。

## 快速开始（本地开发）

```bash
npm install
npm run dev     # 本地预览（默认 http://localhost:1234）
npm run build   # 构建（构建前会自动同步文章）
npm run preview # 本地预览构建产物
```

> 本地构建需要能访问 GitHub（`sync-content.mjs` 会克隆 dsyou-content 仓库）。

## 写文章（博客）

### 1. 在内容仓库新建文章

在 [dsyou-content](https://github.com/windowssed/dsyou-content) 的 `blog/` 文件夹新建一个 `.mdx` 文件，格式如下：

```mdx
---
title: "文章标题"
publishedAt: "2026-08-06"
summary: "文章简介"
tags: "标签1, 标签2"
---

这里是文章正文，支持完整 Markdown 语法。
```

### 2. 推送到 GitHub

```bash
git add .
git commit -m "添加新文章"
git push
```

推送后 GitHub Action 会自动触发 Vercel 重新构建，几分钟后文章上线。

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
- **嵌入视频**：直接写 iframe HTML（YouTube / B 站都支持）

### 本地图片放哪里

```
dsyou-content/
├── blog/
│   ├── 我的文章.mdx
│   └── images/
│       └── xxx.jpg    ← 图片放这里
```

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

- `assets/` 里的图片用 `![](./assets/文件名)` 引用，会**自动压缩成 avif**，不用担心体积
- `startDate` / `endDate` 决定时间线上的位置，新的排前面
- `location` 显示地点
- 没有照片时页面会显示"还没有照片哦"，不会报错

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
tags: "标签1, 标签2"
featured: true
---

```

- `featured: true` 会进入首页推荐区
- 不填 `endDate` 视为进行中的项目，排在前面
- 没有内容时页面显示"暂无项目，敬请期待"

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
tags: "标签1, 标签2"
---

```

- 不填 `endDate` 视为在职，排在最前
- `companyLogo` 可选，可指向一张本地图片
- 没有内容时页面显示"暂无经历，敬请期待"

## 替换头像

1. 把新头像放到 `public/` 目录，推荐 **avif 格式**（体积小，加载快）
   - 转换命令示例：`npx sharp-cli -i 原图.jpg -o public/avatar.avif`（或用在线工具）
2. 更新两处引用（`src/pages/index.astro` 和 `src/pages/about.astro`）：
   ```astro
   src="/avatar.avif"
   ```
3. 删除旧的 `public/avatar.*`，提交推送

> `public/` 里的文件是原样上线、不做压缩的，所以**放进去前先转好格式/压缩好**。
> 建议尺寸：正方形 500~1200px。

## 修改站点信息（标题/导航/社交链接）

所有站点级配置都在 **`src/config.ts`**：

| 配置项 | 说明 |
|---|---|
| `SITE.title` / `description` / `author` | 站点名称、简介、作者 |
| `SITE.href` | 站点地址 |
| `HEADER_LINKS` | 顶部导航菜单 |
| `FOOTER_LINKS` | 底部导航菜单 |
| `SOCIAL_LINKS` | 社交链接（GitHub / RSS 等） |
| `SITE.postsPerPage` | 博客每页文章数 |

改完提交推送即可，无需其他操作。

## 部署机制

```
你在 dsyou-content 推送文章
        ↓
GitHub Action 触发 Vercel Deploy Hook
        ↓
Vercel 构建 dsyou 仓库
  ├─ 1. prebuild：sync-content.mjs 拉取 dsyou-content 最新文章
  ├─ 2. astro build：生成静态页面（文章图片自动压缩为 avif）
  └─ 3. 部署上线
```

- **内容仓库**（dsyou-content）的推送通过 GitHub Action + `VERCEL_DEPLOY_HOOK` secret 触发重建
- **网站仓库**（本仓库）的推送由 Vercel 的 GitHub 集成自动触发
- 域名 dsyou.cn 由 Cloudflare DNS 托管，指向 Vercel

## 常见问题

**Q: 改了文章但网站没更新？**
检查 dsyou-content 的 GitHub Action 运行状态（Actions 标签页），确认 `VERCEL_DEPLOY_HOOK` secret 是否有效。

**Q: 添加相册/项目后报错？**
检查 frontmatter 字段名是否拼写正确（如 `startDate` 不是 `date`），图片路径 `./assets/文件名` 是否与文件名一致。

**Q: 文章里的 class 样式不生效？**
文章内容用的是 Tailwind 类（如 `aspect-video`）。`sync-content.mjs` 生成的文章在 `src/content/blog/`（已被 `.gitignore` 排除），Tailwind 通过 `global.css` 里的 `@source "../content/blog/**/*.md"` 显式扫描，请勿删除该行。

**Q: 想换 favicon？**
把新图标放到 `public/favicon/`，并在 `src/config.ts` 的 `FAVICON` 里更新路径（建议用 https://realfavicongenerator.net/ 生成全套）。
