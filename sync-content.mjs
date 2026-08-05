import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CONTENT_REPO = "https://github.com/windowssed/dsyou-content.git";
const SRC_DIR = path.join(os.tmpdir(), "dsyou-content-src");
const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

console.log("[sync-content] 正在从 dsyou-content 仓库同步文章...");

fs.rmSync(BLOG_DIR, { recursive: true, force: true });
fs.mkdirSync(BLOG_DIR, { recursive: true });

if (fs.existsSync(path.join(SRC_DIR, ".git"))) {
  execSync(`git -C "${SRC_DIR}" pull --ff-only --quiet`, { stdio: "inherit" });
} else {
  fs.rmSync(SRC_DIR, { recursive: true, force: true });
  execSync(`git clone --depth 1 ${CONTENT_REPO} "${SRC_DIR}"`, { stdio: "inherit" });
}

const postsSrc = path.join(SRC_DIR, "blog");
if (fs.existsSync(postsSrc)) {
  fs.cpSync(postsSrc, BLOG_DIR, { recursive: true });
  const count = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md")).length;
  console.log(`[sync-content] 同步完成，共 ${count} 篇文章。`);
} else {
  console.warn("[sync-content] 内容仓库中没有 blog 文件夹。");
}
