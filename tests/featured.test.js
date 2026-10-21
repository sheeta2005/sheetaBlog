import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { generateFeaturedCategories, generateFeaturedSidebar } from '../docs/.vitepress/featured.js'

// 隔离内容目录，验证筛选不会依赖当前文章的文件名或历史精选名单。
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'sheeta-featured-'))
  t.after(() => {
    assert.equal(dirname(root), tmpdir())
    assert(basename(root).startsWith('sheeta-featured-'))
    rmSync(root, { recursive: true, force: true })
  })
  for (const path of ['articles', 'projects', 'posts/backend', 'posts/algorithm', 'posts/frontend', 'posts/sundries', 'misc/essays', 'misc/games']) {
    mkdirSync(join(root, path), { recursive: true })
  }
  return root
}

test('按目录分为六类，只收录明确标精的正文，小游戏即使误标也不收录', t => {
  const root = fixture(t)
  writeFileSync(join(root, 'articles/plain.md'), '---\ntitle: 普通文章\n---\n')
  writeFileSync(join(root, 'articles/false.md'), '---\ntitle: 取消精选\nfeatured: false\n---\n')
  writeFileSync(join(root, 'articles/string.md'), '---\ntitle: 字符串标记\nfeatured: "true"\n---\n')
  writeFileSync(join(root, 'posts/backend/index.md'), '---\ntitle: 导航页\nfeatured: true\n---\n')
  writeFileSync(join(root, 'misc/games/cat.md'), '---\ntitle: 小游戏\nfeatured: true\nlayout: page\n---\n')
  writeFileSync(join(root, 'misc/games/guide.md'), '---\ntitle: 游戏页面误设正文布局\nfeatured: true\nlayout: doc\n---\n')
  for (const path of ['articles/project', 'posts/backend/后端', 'posts/algorithm/算法', 'posts/frontend/前端', 'posts/sundries/课程', 'misc/essays/随笔']) {
    writeFileSync(join(root, `${path}.md`), '---\nfeatured: true\ndescription: 精选摘要\n---\n# 正文标题\n')
  }
  const categories = generateFeaturedCategories(root)
  assert.deepEqual(categories.map(category => category.id), ['projects', 'backend', 'algorithm', 'frontend', 'school', 'misc'])
  assert(categories.every(category => category.articles.length === 1))
  assert(categories.every(category => category.articles[0].title === '正文标题'))
  assert.equal(categories[1].articles[0].url, '/posts/backend/后端.html')
  assert.equal(categories[1].articles[0].description, '精选摘要')
})

test('精选顺序独立于项目阅读顺序，取消标精后数量、列表和侧栏同步移除', t => {
  const root = fixture(t)
  const article = join(root, 'articles/z.md')
  writeFileSync(article, '---\ntitle: 先读精选\nfeatured: true\nfeaturedOrder: 10\norder: 100\n---\n')
  writeFileSync(join(root, 'articles/a.md'), '---\ntitle: 后读精选\nfeatured: true\nfeaturedOrder: 20\norder: 1\n---\n')
  let categories = generateFeaturedCategories(root)
  assert.deepEqual(categories[0].articles.map(item => item.title), ['先读精选', '后读精选'])
  let sidebar = generateFeaturedSidebar(categories)
  assert.equal(sidebar.length, 7)
  assert.deepEqual(sidebar[1].items.map(item => item.text), ['先读精选', '后读精选'])
  assert(sidebar.slice(1).every(group => group.link.startsWith('/articles/featured/')))
  writeFileSync(article, '---\ntitle: 已取消精选\nfeatured: false\n---\n')
  categories = generateFeaturedCategories(root)
  sidebar = generateFeaturedSidebar(categories)
  assert.equal(categories[0].articles.length, 1)
  assert.equal(sidebar[1].items.length, 1)
  assert.equal(categories[1].articles.length, 0)
})

test('首批精选为 6 / 3 / 3 / 2 / 2 / 1 篇，原文地址存在且项目文章仍完整保留', () => {
  const categories = generateFeaturedCategories()
  assert.deepEqual(categories.map(category => category.articles.length), [6, 3, 3, 2, 2, 1])
  const articles = categories.flatMap(category => category.articles)
  assert.equal(new Set(articles.map(article => article.url)).size, 17)
  for (const article of articles) {
    assert(readFileSync(new URL(`../docs/${article.relativePath}`, import.meta.url), 'utf8').length > 0)
  }
  assert.equal(categories[5].articles[0].title, '雪')
  assert(categories[0].articles.some(article => article.label === 'takeMe 社区助老平台'))
})
