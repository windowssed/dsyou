import { FAVICON, SITE } from '@/config'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPosts } from '@/lib/data-utils'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

const parser = new MarkdownIt()

// 文章正文里的本地图片是相对路径（如 ./images/demo.jpg），
// 它们在网站构建时被优化为 /_astro/*.avif，但 RSS 消费端无法解析相对路径。
// 同步脚本会把原图复制到 public/blog-images/，这里统一重写为指向该目录的绝对 URL。
function rewriteLocalImageSrcs(html: string, baseUrl: string): string {
  return html.replace(/<img([^>]*)>/gi, (whole, attrs: string) => {
    const srcMatch = /src\s*=\s*"([^"]*)"|src\s*=\s*'([^']*)'/i.exec(attrs)
    if (!srcMatch) return whole
    const originalSrc = srcMatch[1] ?? srcMatch[2]
    if (!originalSrc || /^https?:\/\//i.test(originalSrc)) return whole

    // ./images/xxx 或 ../images/xxx → /blog-images/xxx
    const normalized = originalSrc.replace(/^\.\.?\/+images\//, '/blog-images/')
    const absolute = toAbsoluteUrl(normalized, baseUrl)
    const newAttrs = attrs.replace(
      /src\s*=\s*"([^"]*)"|src\s*=\s*'([^']*)'/i,
      () => `src="${absolute}"`
    )
    return `<img${newAttrs}>`
  })
}

function stripInvalidXmlChars(str: string): string {
  return str.replace(
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
    ''
  )
}

function toAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  try {
    return new URL(pathOrUrl, baseUrl).toString()
  } catch {
    return pathOrUrl
  }
}

// Main
export async function GET(_context: APIContext) {
  try {
    const posts = await getAllPosts()
    const siteUrl = SITE.href
    const iconUrl = toAbsoluteUrl(FAVICON.ico, siteUrl)
    const appleTouchIconUrl = toAbsoluteUrl(FAVICON.appleTouchIcon, siteUrl)

    return rss({
      title: SITE.title,
      description: SITE.description,
      site: siteUrl,
      stylesheet: '/rss/rss-styles.xsl',
      items: posts.map((post) => {
        const content = typeof post.body === 'string' ? post.body : String(post.body || '')
        const cleanedContent = stripInvalidXmlChars(content)
        const renderedContent = rewriteLocalImageSrcs(
          parser.render(cleanedContent),
          siteUrl
        )

        return {
          title: post.data.title ?? '',
          description: post.data.description ?? undefined,
          pubDate: post.data.date ?? undefined,
          link: `/blog/${post.id}/`,
          content: sanitizeHtml(renderedContent, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          }),
        }
      }),
      customData: `<language>${SITE.locale ?? 'en'}</language><image><url>${iconUrl}</url><title>${SITE.title}</title><link>${siteUrl}</link></image><appleTouchIcon>${appleTouchIconUrl}</appleTouchIcon>`,
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
