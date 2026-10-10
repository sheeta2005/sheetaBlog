import { createContentLoader } from 'vitepress'

// 新杂项文章和原有课程文章共用列表，旧文章地址保持可访问。
export default createContentLoader(['misc/**/*.md', 'posts/sundries/**/*.md'], {
  includeSrc: true,
  transform(pages) {
    return pages.filter(page => !page.url.endsWith('/') && !page.url.endsWith('/index.html') && page.frontmatter.layout !== 'page').map(page => ({
      url: page.url,
      title: page.frontmatter.title || page.src.match(/^#\s+(.+)$/m)?.[1] || decodeURIComponent(page.url.split('/').pop()).replace(/\.html$/, ''),
      category: page.url.startsWith('/posts/sundries/') ? '已有文章' : '杂项随记',
      date: page.frontmatter.date || '',
      description: page.frontmatter.description || ''
    })).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
  }
})
