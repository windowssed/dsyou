import { getAllPosts, getAllProjects } from '@/lib/data-utils'

export type SearchIndexItem = {
  id: string
  title: string
  description: string
  tags: string[]
  date: string
  slug: string
  type: 'post' | 'project'
  body: string
}

// 从文章 HTML 正文中提取纯文本，供客户端全文搜索。
// 会移除 script/style 与标签，解码常见 HTML 实体，并压缩空白。
export function extractPostText(html: string): string {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// 构建站内搜索索引：文章（含正文纯文本）+ 项目元数据。
// 由 /search-index.json 端点调用，构建期输出为独立 JSON，避免内联进搜索页。
export async function buildSearchIndex(): Promise<SearchIndexItem[]> {
  const allPosts = await getAllPosts()
  const allProjects = await getAllProjects()

  const postsData: SearchIndexItem[] = allPosts.map((post) => ({
    id: post.id,
    title: post.data.title ?? '',
    description: post.data.description ?? '',
    tags: post.data.tags || [],
    date: post.data.date?.toISOString() || '',
    slug: `/${post.collection}/${post.id}`,
    type: 'post',
    body: extractPostText(post.body || ''),
  }))

  const projectsData: SearchIndexItem[] = allProjects.map((project) => ({
    id: project.id,
    title: project.data.name ?? '',
    description: project.data.description ?? '',
    tags: project.data.tags || [],
    date: '',
    slug: `/projects/${project.id}`,
    type: 'project',
    body: '',
  }))

  return [...postsData, ...projectsData]
}
