import { getSiteUrl } from '@/lib/utils'
import type { APIRoute } from 'astro'

const getRobotsTxt = (sitemapURL: URL) => `
User-agent: *
Allow: /

Disallow: /search
Disallow: /tags/
Disallow: /blog-images/

Sitemap: ${sitemapURL.href}
`

export const GET: APIRoute = (context) => {
  const siteUrl = getSiteUrl(context)
  const sitemapURL = new URL('sitemap-index.xml', siteUrl)
  return new Response(getRobotsTxt(sitemapURL))
}
