# dsyou - windowssed 的个人博客

个人博客网站：**https://www.dsyou.cn**

## 技术栈

- **框架**：[Astro](https://astro.build/)（基于 [Astro-Theme-Shyne](https://github.com/FuTseYi/Astro-Theme-Shyne) 主题）
- **样式**：Tailwind CSS 4 + React/shadcn 组件
- **托管**：Vercel
- **域名**：dsyou.cn（Cloudflare DNS）

## 架构

- **网站仓库**（本仓库）：主题与代码
- **内容仓库**：[dsyou-content](https://github.com/windowssed/dsyou-content)（存放文章）
- 网站构建时自动从内容仓库拉取并转换文章（见 `sync-content.mjs`）

## 开发

```bash
npm install
npm run dev     # 本地预览
npm run build   # 构建
```
