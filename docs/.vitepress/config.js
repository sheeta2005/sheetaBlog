import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

export default defineConfig({

  title: 'sheeta1998的技术博客',
  description: 'Java 后端实习求职 | takeMe 社区助老平台 | Redis 限流组件 | 工程实践与学习笔记',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  base: '/',
  outDir: './.vitepress/dist',
  strict: true,
  themeConfig: {
    appearance: 'dark',

    logo: {
      src: '/avatar.jpg',
      style: {
        borderRadius: '50%'
      }
    },

    // 优先展示求职项目与工程复盘，原有专栏统一收进学习笔记。
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
          { text: '课程与杂项', link: '/posts/sundries/' }
        ]
      },
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
    darkModeSwitchLabel: '主题切换',
    lightModeSwitchTitle: '切换到薄荷晴昼',
    darkModeSwitchTitle: '切换到花火夏夜',

    // 侧边栏配置（为每个专栏单独生成）
    sidebar: generateSidebar([
      // 新增项目与复盘的阅读导航，沿用已有的自动侧边栏生成方式。
      {
        documentRootPath: 'docs',
        scanStartPath: 'projects',
        resolvePath: '/projects/',
        useTitleFromFrontmatter: true,
        useTitleFromFileHeading: true
      },
      {
        documentRootPath: 'docs',
        scanStartPath: 'articles',
        resolvePath: '/articles/',
        useTitleFromFrontmatter: true,
        useTitleFromFileHeading: true
      },
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
      }
    ])

  },


  // Markdown 配置
  markdown: {
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
