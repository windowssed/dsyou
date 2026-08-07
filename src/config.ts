import type {
  Site,
  Favicon,
  NavLink,
  SocialLink,
} from '@/types'

export const SITE: Site = {
  title: "shiyou",
  description:
    "shiyou 的投资笔记：市场千变万化，我只想搞清楚明天买什么。",
  href: "https://dongshiyou.com/",
  author: "shiyou",
  footer: {
    items: [
      { type: "text", value: "© " },
      { type: "text", value: new Date().getFullYear().toString() },
      { type: "text", value: " shiyou" },
    ],
  },
  locale: "zh-CN",
  featuredExperienceCount: 2,
  featuredPostCount: 3,
  featuredProjectCount: 3,
  postsPerPage: 6,
}

// Use https://realfavicongenerator.net/ to generate favicons
export const FAVICON: Favicon = {
  svg: "/favicon/favicon.svg",
  png96: "/favicon/favicon-96x96.png",
  ico: "/favicon/favicon.ico",
  appleTouchIcon: "/favicon/apple-touch-icon.png",
}

export const HEADER_LINKS: NavLink[] = [
  {
    label: "博客",
    href: "/blog",
  },
  {
    label: "项目",
    href: "/projects",
  },
  {
    label: "相册",
    href: "/photos",
  },
  {
    label: "关于",
    href: "/about",
  },
  {
    label: "",
    href: "/search",
    icon: "lucide:search",
  },
]

export const FOOTER_LINKS: NavLink[] = [
  {
    label: "关于",
    href: "/about",
    icon: "lucide:user-star",
  },
  {
    label: "经历",
    href: "/experience",
    icon: "lucide:briefcase-business",
  },
  {
    label: "标签",
    href: "/tags",
    icon: "lucide:tags",
  },
]

// Social media links - customize with your own profiles
export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/windowssed",
    icon: "simple-icons:github",
  },
  {
    label: "RSS",
    href: "/rss.xml",
    icon: "lucide:rss",
  },
]
