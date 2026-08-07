import type { APIRoute } from 'astro'
import { buildSearchIndex } from '@/lib/search-index'

// 构建期输出 /search-index.json：站内搜索索引独立成文件，
// 搜索页运行时异步 fetch，避免把全部文章正文内联进页面首屏。
export const GET: APIRoute = async () => {
  const index = await buildSearchIndex()
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
