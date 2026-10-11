import { createContentLoader } from 'vitepress'

// 杂项列表只收录随笔内容；学校课程改从学习笔记进入，原课程地址保留。
export default createContentLoader('misc/**/*.md', {
  includeSrc: true,
  transform(pages) {
    return pages.filter(page => !page.url.endsWith('/') && !page.url.endsWith('/index.html') && page.frontmatter.layout !== 'page').map(page => ({
      url: page.url,
      title: page.frontmatter.title || page.src.match(/^#\s+(.+)$/m)?.[1] || decodeURIComponent(page.url.split('/').pop()).replace(/\.html$/, ''),
      date: page.frontmatter.date || '',
      description: page.frontmatter.description || ''
    })).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
  }
})
