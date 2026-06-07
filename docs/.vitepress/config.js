import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

export default defineConfig({

  title: 'sheeta1998的技术博客',
  description: '后端开发学习笔记 | Java | Redis | MySQL | 算法',

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

    // 顶部导航栏（更新为新的路径）
    nav: [
      { text: '首页', link: '/' },
      { text: '算法专栏', link: '/posts/algorithm/' },
      { text: '后端专栏', link: '/posts/backend/' },
      { text: '前端专栏', link: '/posts/frontend/' },
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

    // 侧边栏配置（为每个专栏单独生成）
    sidebar: generateSidebar([
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