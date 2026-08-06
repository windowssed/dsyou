import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import matter from "gray-matter";

const CONTENT_REPO = "https://github.com/windowssed/dsyou-content.git";
const SRC_DIR = path.join(os.tmpdir(), "dsyou-content-src");
const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

console.log("[sync-content] 正在从 dsyou-content 仓库同步并转换文章...");

fs.rmSync(BLOG_DIR, { recursive: true, force: true });
fs.mkdirSync(BLOG_DIR, { recursive: true });

if (fs.existsSync(path.join(SRC_DIR, ".git"))) {
  execSync(`git -C "${SRC_DIR}" pull --ff-only --quiet`, { stdio: "inherit" });
} else {
  fs.rmSync(SRC_DIR, { recursive: true, force: true });
  execSync(`git clone --depth 1 ${CONTENT_REPO} "${SRC_DIR}"`, { stdio: "inherit" });
}

const postsSrc = path.join(SRC_DIR, "blog");

if (fs.existsSync(path.join(postsSrc, "images"))) {
  fs.cpSync(path.join(postsSrc, "images"), path.join(BLOG_DIR, "images"), {
    recursive: true,
  });
}

let count = 0;
if (fs.existsSync(postsSrc)) {
  const files = fs
    .readdirSync(postsSrc)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsSrc, file), "utf-8");
    const parsed = matter(raw);
    const data = parsed.data;

    const formatPublishedDate = (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        console.warn(
          `[sync-content] 文章 "${file}" 的 publishedAt 格式无效: "${value}"，已忽略日期。`
        );
        return undefined;
      }
      return date.toISOString().slice(0, 10);
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
      draft: false,
    };

    const slug = file.replace(/\.(md|mdx)$/, "");
    const frontmatter = Object.entries(newData)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join("\n");

    const output = `---\n${frontmatter}\n---\n\n${parsed.content.trim()}\n`;
    fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), output, "utf-8");
    count++;
  }
  console.log(`[sync-content] 同步完成，共 ${count} 篇文章。`);
} else {
  console.warn("[sync-content] 内容仓库中没有 blog 文件夹。");
}
