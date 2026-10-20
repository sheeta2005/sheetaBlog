import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

// 项目顺序沿用现有导航；名称读取项目介绍，文章仅按 project 标识归属。
const projectIds = ['rate-limiter', 'skytakeout', 'takeme', 'tlias', 'xu-speak-to-me']

// 构建时读取文章元信息：project 对应项目文件名，order 越小越靠前；未归属文章不参与项目聚合。
export function generateProjectSidebar(docsRoot = fileURLToPath(new URL('../', import.meta.url))) {
  const projects = new Map(projectIds.map(id => [id, []]))
  const articlesRoot = join(docsRoot, 'articles')
  for (const file of readdirSync(articlesRoot, { recursive: true }).filter(file => file.endsWith('.md'))) {
    const { data } = matter(readFileSync(join(articlesRoot, file), 'utf8'))
    if (!data.project) continue
    // 对已声明归属的文章及时报错，避免标识、标题或顺序填写错误后静默遗漏。
    if (!projects.has(data.project)) throw new Error(`文章 ${file} 的项目标识不存在：${data.project}`)
    if (!data.title) throw new Error(`文章 ${file} 缺少标题`)
    if (data.order != null && !Number.isFinite(data.order)) throw new Error(`文章 ${file} 的阅读顺序必须是数字`)
    projects.get(data.project).push({
      text: data.title,
      // 统一 Windows 路径分隔符，并保留目录首页的尾斜杠，沿用现有文章地址。
      link: `/articles/${file.replace(/\\/g, '/').replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`,
      order: data.order ?? Number.MAX_SAFE_INTEGER
    })
  }

  return projectIds.map(id => {
    const { data } = matter(readFileSync(join(docsRoot, 'projects', `${id}.md`), 'utf8'))
    // 未设置顺序的文章排在末尾，同序时按链接排序，保证构建结果稳定。
    const articles = projects.get(id).sort((a, b) => a.order - b.order || a.link.localeCompare(b.link))
    // 项目标题只切换折叠，介绍作为首个子项；链接从站点根路径解析，供两类页面共用。
    return {
      text: data.title,
      // 初始收起，当前文章所属分组由 VitePress 原生导航自动展开。
      collapsed: true,
      items: [
        { text: '项目介绍', link: `/projects/${id}` },
        ...articles.map(({ text, link }) => ({ text, link }))
      ]
    }
  })
}
