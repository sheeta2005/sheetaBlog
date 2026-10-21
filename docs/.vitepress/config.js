import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import { readFileSync } from 'node:fs'
import { generateProjectSidebar } from './projectSidebar.js'
import { generateFeaturedSidebar } from './featured.js'

// 项目按完整阅读链路导航，精选文章单独按大类和标精状态导航。
const projectSidebar = generateProjectSidebar()
const featuredSidebar = generateFeaturedSidebar()

// 内联首屏底色与微型插画，外部样式和背景图片未到时也有完整的主题底色。
const homeBackgroundStyle = readFileSync(new URL('./theme/homeBackground.css', import.meta.url), 'utf8')
// 只有游戏列表和准备页带上轻量入口样式；实际棋盘样式继续由动态游戏模块加载。
const gameEntryStyle = readFileSync(new URL('./theme/games/games.css', import.meta.url), 'utf8')
// 分享卡片与页面标题共用站点信息。
const siteTitle = 'sheeta1998的技术博客'
const siteDescription = 'Java 后端实习求职 | takeMe 社区助老平台 | Redis 限流组件 | 工程实践与学习笔记'
const siteOrigin = 'https://bblog.sheeta1998.com'

// 将已有 JVM 分组提升为独立模块，文章仍沿用原地址；新模块入口指向各自导读页。
function organizeBackendSidebar(sidebars) {
  const items = sidebars['/posts/backend/'].items
  const java = items.find(item => item.text === 'Java基础相关')
  const [jvm] = java.items.splice(java.items.findIndex(item => item.text === 'JVM虚拟机'), 1)
  jvm.link = 'Java基础相关/JVM虚拟机/'
  const modules = ['操作系统', '计算机网络', 'Tomcat'].map(name => {
    const [item] = items.splice(items.findIndex(item => item.text === name), 1)
    item.link = `${name}/`
    return item
  })
  items.splice(items.indexOf(java) + 1, 0, modules[0], modules[1], jvm, modules[2])
  return sidebars
}

export default defineConfig({

  title: siteTitle,
  description: siteDescription,
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['style', { id: 'home-background-fallback' }, homeBackgroundStyle],
    ['meta', { property: 'og:site_name', content: siteTitle }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:image', content: `${siteOrigin}/social-card.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'sheeta1998的技术博客分享封面' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${siteOrigin}/social-card.png` }]
  ],

  transformPageData(pageData) {
    // 写入页面数据，让直接访问和站内跳转都更新文章的分享标题、摘要与地址。
    const title = pageData.title || siteTitle
    const description = pageData.description || siteDescription
    const path = '/' + pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
    // 自定义 404 承接中文页面数据，画面仍复用主题已有的错误页结构。
    const isNotFound = pageData.relativePath === '404.md'
    const article = !isNotFound && (!pageData.frontmatter.layout || pageData.frontmatter.layout === 'doc')
    return {
      isNotFound,
      frontmatter: {
        ...pageData.frontmatter,
        head: [
          ...(pageData.frontmatter.head || []),
          ...(pageData.relativePath.startsWith('misc/') && pageData.frontmatter.layout === 'page' ? [['style', { id: 'game-entry-style' }, gameEntryStyle]] : []),
          ['meta', { property: 'og:type', content: article ? 'article' : 'website' }],
          ['meta', { property: 'og:title', content: title }],
          ['meta', { property: 'og:description', content: description }],
          ['meta', { property: 'og:url', content: new URL(path, siteOrigin).href }],
          ['meta', { name: 'twitter:title', content: title }],
          ['meta', { name: 'twitter:description', content: description }]
        ]
      }
    }
  },

  transformHead({ pageData }) {
    if (pageData.frontmatter.layout !== 'home') return []
    // 此脚本排在 VitePress 的主题初始化之后，只优先请求当前主题的完整插画。
    return [
      // 仅首页提前请求头像，与页面中的图片共用请求，避免慢网时等到解析介绍区才开始下载。
      ['link', { rel: 'preload', as: 'image', href: '/avatar.jpg', fetchpriority: 'high' }],
      ['script', { id: 'preload-home-background' }, `(() => {
      const background = document.createElement('link')
      background.rel = 'preload'
      background.as = 'image'
      background.type = 'image/webp'
      background.fetchPriority = 'high'
      background.href = document.documentElement.classList.contains('dark') ? '/background_night.webp' : '/background.webp'
      document.head.appendChild(background)
    })()`]
    ]
  },

  transformHtml(html) {
    // 将兜底样式、原有主题判断和背景预加载提前到外部样式之前，慢网时避免先闪出浅色底。
    const earlyTags = html.match(/<(style|script) id="(?:home-background-fallback|check-dark-mode|preload-home-background)"[^>]*>[\s\S]*?<\/\1>/g) || []
    for (const tag of earlyTags) html = html.replace(tag, '')
    return html.replace(/<meta name="viewport"[^>]*>/, tag => `${tag}\n${earlyTags.join('\n')}`)
  },

  base: '/',
  outDir: './.vitepress/dist',
  strict: true,
  // Git 更新时间与笔记归档日期分开记录，未提交的新文只展示归档日期。
  lastUpdated: true,
  themeConfig: {
    appearance: 'dark',

    // 优先展示项目实践与全站精选，完整学习专栏继续从学习笔记进入。
    nav: [
      { text: '首页', link: '/' },
      { text: '项目实践', link: '/projects/' },
      { text: '精选文章', link: '/articles/' },
      {
        text: '学习笔记',
        items: [
          { text: '笔记导航', link: '/notes/' },
          { text: '后端专栏', link: '/posts/backend/' },
          { text: '算法专栏', link: '/posts/algorithm/' },
          { text: '前端专栏', link: '/posts/frontend/' },
          { text: '学校学习相关', link: '/posts/sundries/' }
        ]
      },
      { text: '杂项', link: '/misc/' },
      { text: '关于我', link: '/about' },
      { text: 'GitHub', link: 'https://github.com/sheeta2005', target: '_blank' }
    ],

    // 右侧文章目录
    outline: {
      level: [2, 6],
      label: '文章目录',
      collapsible: true,  // 允许这个分组被折叠
      collapsed: true     // 默认是收起状态
    },

    // 本地搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索站内文章与笔记' },
          modal: {
            displayDetails: '切换摘要显示',
            resetButtonTitle: '清空搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关内容：',
            footer: {
              selectText: '打开', selectKeyAriaLabel: '回车',
              navigateText: '选择', navigateUpKeyAriaLabel: '向上', navigateDownKeyAriaLabel: '向下',
              closeText: '关闭', closeKeyAriaLabel: '退出'
            }
          }
        },
        miniSearch: {
          fields: ['title', 'content', 'headings']
        }
      }
    },

    // 页脚配置
    footer: {
      message: 'Powered by VitePress 1.6.4 | 持续更新中',
      copyright: 'Copyright © 2026 sheeta1998'
    },

    // 最后更新时间显示
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },

    // 原生特性
    sidebarMenuLabel: '导航菜单',
    returnToTopLabel: '返回顶部',
    docFooter: { prev: '上一篇', next: '下一篇' },
    darkModeSwitchLabel: '主题切换',
    lightModeSwitchTitle: '切换到薄荷晴昼',
    darkModeSwitchTitle: '切换到花火夏夜',

    // 404 复用默认主题结构，中文提示与阅读页材质保持一致。
    notFound: {
      title: '这一页暂时不在这里',
      quote: '也许链接已经搬家，回到首页，再找找想读的内容。',
      linkLabel: '返回博客首页',
      linkText: '返回首页 →'
    },

    // 学习专栏继续按目录生成，项目与精选文章按明确归属生成。
    sidebar: {
      '/projects/': projectSidebar,
      '/articles/': featuredSidebar,
      ...organizeBackendSidebar(generateSidebar([
      {
        documentRootPath: 'docs',
        scanStartPath: 'posts/algorithm',
        resolvePath: '/posts/algorithm/',
        collapsible: true,  // 允许这个分组被折叠
        collapsed: true,   // 默认是收起状态
        useTitleFromFileHeading: true,
        useTitleFromFrontmatter: true,
        debugPrint: false
      },
      {
        documentRootPath: 'docs',
        scanStartPath: 'posts/backend',
        resolvePath: '/posts/backend/',
        collapsible: true,  // 允许这个分组被折叠
        collapsed: true,   // 默认是收起状态
        useTitleFromFileHeading: true,
        useTitleFromFrontmatter: true,
        debugPrint: false
      },
      {
        documentRootPath: 'docs',
        scanStartPath: 'posts/frontend',
        resolvePath: '/posts/frontend/',
        collapsible: true,  // 允许这个分组被折叠
        collapsed: true,   // 默认是收起状态
        useTitleFromFileHeading: true,
        useTitleFromFrontmatter: true,
        debugPrint: false
      },
      {
        documentRootPath: 'docs',
        scanStartPath: 'posts/sundries',
        resolvePath: '/posts/sundries/',
        collapsible: true,  // 允许这个分组被折叠
        collapsed: true,   // 默认是收起状态
        useTitleFromFileHeading: true,
        useTitleFromFrontmatter: true,
        debugPrint: false
      },
      // 随笔沿用自动导航，新文章放入此目录即可出现在专栏中。
      {
        documentRootPath: 'docs',
        scanStartPath: 'misc/essays',
        resolvePath: '/misc/essays/',
        rootGroupText: '随笔',
        rootGroupCollapsed: false,
        useTitleFromFrontmatter: true,
        useTitleFromFileHeading: true
      }
      ]))
    }

  },


  // Markdown 配置
  markdown: {
    codeCopyButtonTitle: '复制代码',
    // 阅读信息由正文计算，插入首个一级标题之后，避免逐篇维护同样的模板。
    config(md) {
      md.core.ruler.after('inline', 'reading-minutes', state => {
        if (!state.env.frontmatter) return
        const text = state.tokens.filter(token => token.type === 'inline').map(token => token.content).join(' ')
        const chinese = (text.match(/[\u3400-\u9fff]/g) || []).length
        const words = (text.match(/[A-Za-z0-9]+/g) || []).length
        state.env.frontmatter.readingMinutes = Math.max(1, Math.ceil(chinese / 450 + words / 200))
      })
      const closeHeading = md.renderer.rules.heading_close || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options))
      md.renderer.rules.heading_close = (tokens, index, options, env, renderer) => {
        const heading = closeHeading(tokens, index, options, env, renderer)
        const firstTitle = tokens.findIndex(token => token.type === 'heading_close' && token.tag === 'h1')
        return index === firstTitle ? `${heading}<ArticleMeta />\n` : heading
      }
      // 表格内容保持原样，仅增加局部滚动与边缘提示容器。
      const openTable = md.renderer.rules.table_open || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options))
      const closeTable = md.renderer.rules.table_close || ((tokens, index, options, env, renderer) => renderer.renderToken(tokens, index, options))
      md.renderer.rules.table_open = (...args) => `<ReadingTable>\n${openTable(...args)}`
      md.renderer.rules.table_close = (...args) => `${closeTable(...args)}</ReadingTable>\n`
    },
    lineNumbers: true,
    math: true,
    shiki: {
      langs: [
        'ini',
        'properties',
        'nginx',
        'redis',
        'yaml',
        'xml',
        'sql'
      ]
    }
  },

  vite: {
    ssr: {
      noExternal: ['vitepress']
    },
    optimizeDeps: {
      exclude: ['vitepress']
    }
  }
})
