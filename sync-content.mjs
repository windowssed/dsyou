import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";

const CONTENT_REPO = "https://github.com/windowssed/dsyou-content.git";
// 进程唯一的临时目录，避免并发构建互相竞争 git 工作区；构建结束后统一清理
const SRC_DIR = path.join(os.tmpdir(), `dsyou-content-src-${process.pid}`);
const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");
// RSS 等场景需要可公开访问的原图，复制到 public 下由站点原样托管
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public", "blog-images");

console.log("[sync-content] 正在从 dsyou-content 仓库同步并转换文章...");

fs.rmSync(BLOG_DIR, { recursive: true, force: true });
fs.mkdirSync(BLOG_DIR, { recursive: true });

/** 递归收集 blog/ 下的文章文件；跳过 images 目录（图片由下方单独复制处理） */
function collectMarkdownFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "images") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, out);
    } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

try {
  fs.rmSync(SRC_DIR, { recursive: true, force: true });
  execSync(`git clone --depth 1 ${CONTENT_REPO} "${SRC_DIR}"`, { stdio: "inherit" });

  const postsSrc = path.join(SRC_DIR, "blog");

  if (fs.existsSync(path.join(postsSrc, "images"))) {
    fs.cpSync(path.join(postsSrc, "images"), path.join(BLOG_DIR, "images"), {
      recursive: true,
    });
    fs.rmSync(PUBLIC_IMAGES_DIR, { recursive: true, force: true });
    fs.cpSync(path.join(postsSrc, "images"), PUBLIC_IMAGES_DIR, {
      recursive: true,
    });
  } else {
    // 内容仓库里没有图片时，清掉上次残留的公开图片，避免引用失效的旧图
    fs.rmSync(PUBLIC_IMAGES_DIR, { recursive: true, force: true });
  }

  let count = 0;
  if (fs.existsSync(postsSrc)) {
    const files = collectMarkdownFiles(postsSrc);

    for (const file of files) {
      const raw = fs.readFileSync(file, "utf-8");
      const parsed = matter(raw);
      const data = parsed.data;

      const formatPublishedDate = (value) => {
        if (!value) return undefined;
        // 已是 YYYY-MM-DD：直接返回，避免 Date 解析时的时区偏移
        const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
        if (isoDateMatch) return `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          console.warn(
            `[sync-content] 文章 "${file}" 的 publishedAt 格式无效: "${value}"，已忽略日期。`
          );
          return undefined;
        }
        // 用本地时区取年月日，避免 toISOString 的 UTC 偏移导致日期往前/后跳一天
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      const newData = {
        title: data.title ?? "未命名文章",
        description: data.summary ?? data.description ?? "",
        date: formatPublishedDate(data.publishedAt),
        tags:
          typeof data.tags === "string"
            ? data.tags
                .split(/[,，]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : Array.isArray(data.tags)
              ? data.tags
              : undefined,
        // 子文章排序权重：同一父文章下按 order 升序排列
        order: data.order,
        draft: false,
      };

      // slug = 相对路径去扩展名，分隔符统一为 "/"。
      // 含 "/" 的 slug 即子文章（前段为父文章），激活站点已有的子文章体系（目录/导航/组合阅读时长）
      const slug = path
        .relative(postsSrc, file)
        .replace(/\.(md|mdx)$/, "")
        .split(path.sep)
        .join("/");
      const frontmatter = Object.entries(newData)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
        .join("\n");

      const output = `---\n${frontmatter}\n---\n\n${parsed.content.trim()}\n`;
      const outputPath = path.join(BLOG_DIR, `${slug}.md`);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, output, "utf-8");
      count++;
    }
    console.log(`[sync-content] 同步完成，共 ${count} 篇文章。`);
  } else {
    console.warn("[sync-content] 内容仓库中没有 blog 文件夹。");
  }
} finally {
  fs.rmSync(SRC_DIR, { recursive: true, force: true });
}
