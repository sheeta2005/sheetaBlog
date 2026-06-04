import { defineConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'

export default defineConfig({
  // ========== 这里改成你自己的信息 ==========
  title: 'XXX 的技术博客',
  description: '后端开发学习笔记 | Java | Redis | MySQL | 算法',
  // ========================================

  base: '/',
  outDir: '../dist',
  strict: true,

  themeConfig: {
    logo: '/avatar.jpg',

    // 顶部导航栏（更新为新的路径）
    nav: [
      { text: '首页', link: '/' },
      { text: '算法专栏', link: '/posts/algorithm/' },
      { text: '后端专栏', link: '/posts/backend/' },
      { text: '前端专栏', link: '/posts/frontend/' },
      { text: 'GitHub', link: 'https://github.com/你的GitHub用户名', target: '_blank' }
    ],

    // 右侧文章目录
    outline: {
      level: [2, 6],
      label: '文章目录',
      collapsed: false
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
      copyright: 'Copyright © 2026 XXX'
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

    // 侧边栏配置（使用 withSidebar 自动生成）
    sidebar: withSidebar({
      docsDir: 'docs',
      docsRoot: 'docs',
      contentRoot: 'posts',
      collapsed: true,
      useTitleFromFileHeading: true,
      useTitleFromFrontmatter: true,
      manualSortFileNameByPriority: ['algorithm', 'backend', 'frontend'],
      sortByName: false,
      sortByFileDatePrefix: false,
      removePrefixAfterOrdering: false,
      prefixSeparator: '.',
      debugPrint: false
    })
  },


  // Markdown 配置
  markdown: {
    lineNumbers: true,
    highlight: {
      theme: 'github-dark'
    },
    math: true
  }
})