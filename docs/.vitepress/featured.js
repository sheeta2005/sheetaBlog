import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

// 精选的大类沿用内容目录；原有 categories 仍用于各篇文章的技术主题。
const categories = [
  { id: 'projects', title: '项目实践', description: '业务设计、工程复盘与组件验证。', roots: ['articles', 'projects'], allUrl: '/projects/' },
  { id: 'backend', title: '后端专栏', description: 'Java、Spring、数据库与中间件。', roots: ['posts/backend'], allUrl: '/posts/backend/' },
  { id: 'algorithm', title: '算法专栏', description: '算法思路、搜索策略与典型题解。', roots: ['posts/algorithm'], allUrl: '/posts/algorithm/' },
  { id: 'frontend', title: '前端专栏', description: 'TypeScript、Vue 与前端开发笔记。', roots: ['posts/frontend'], allUrl: '/posts/frontend/' },
  { id: 'school', title: '学校学习相关', description: '课程知识、软件工程与学习整理。', roots: ['posts/sundries'], allUrl: '/posts/sundries/' },
  { id: 'misc', title: '杂项', description: '技术之外的随笔与感想。', roots: ['misc'], allUrl: '/misc/' }
]

// 构建时统一筛选标精文章，卡片数量、分类列表和侧栏共用此结果。
export function generateFeaturedCategories(docsRoot = fileURLToPath(new URL('../', import.meta.url))) {
  return categories.map(({ roots, ...category }) => {
    const articles = []
    for (const root of roots) {
      for (const file of readdirSync(join(docsRoot, root), { recursive: true })) {
        const relativePath = `${root}/${file.replace(/\\/g, '/')}`
        // 导航页与小游戏不参与精选，游戏即使误写标记也不会进入列表。
        if (!file.endsWith('.md') || basename(file) === 'index.md' || relativePath.startsWith('misc/games/')) continue
        const { data, content } = matter(readFileSync(join(docsRoot, relativePath), 'utf8'))
        if (data.featured !== true || data.layout === 'page' || data.layout === 'home') continue
        if (data.featuredOrder != null && !Number.isFinite(data.featuredOrder)) {
          throw new Error(`文章 ${relativePath} 的精选顺序必须是数字`)
        }
        // 项目归属只用于说明来源，精选顺序不影响项目原有阅读顺序。
        const project = data.project && matter(readFileSync(join(docsRoot, 'projects', `${data.project}.md`), 'utf8')).data.title
        articles.push({
          relativePath,
          url: `/${relativePath.replace(/\.md$/, '.html')}`,
          title: data.title || content.match(/^#\s+(.+)$/m)?.[1] || basename(file, '.md'),
          description: data.description || '',
          label: project || (Array.isArray(data.tags) ? data.tags.slice(0, 3).join(' · ') : ''),
          order: data.featuredOrder ?? Number.MAX_SAFE_INTEGER
        })
      }
    }
    articles.sort((a, b) => a.order - b.order || a.url.localeCompare(b.url))
    return { ...category, url: `/articles/featured/${category.id}.html`, articles }
  })
}

// 精选页单独按六个大类导航，项目入口继续使用完整的项目导航树。
export function generateFeaturedSidebar(groups = generateFeaturedCategories()) {
  return [
    { text: '精选文章', link: '/articles/' },
    ...groups.map(category => ({
      text: category.title,
      link: category.url,
      ...(category.articles.length ? {
        collapsed: true,
        items: category.articles.map(article => ({ text: article.title, link: article.url }))
      } : {})
    }))
  ]
}
