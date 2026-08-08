/**
 * 生成安全的 JSON-LD 脚本内容。
 *
 * 把 `<` 转义为 `\u003c`，避免标题/描述等字段中出现 `</script>` 时
 * 提前闭合 `<script type="application/ld+json">` 标签，破坏页面结构。
 */
export function toJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
