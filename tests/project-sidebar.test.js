import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { generateProjectSidebar } from '../docs/.vitepress/projectSidebar.js'

// 用独立内容目录验证归属和排序，不依赖当前文章恰好按文件名排列。
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'sheeta-project-sidebar-'))
  t.after(() => {
    // 清理前确认绝对路径仍位于本用例创建的临时目录范围内。
    assert.equal(dirname(root), tmpdir())
    assert(basename(root).startsWith('sheeta-project-sidebar-'))
    rmSync(root, { recursive: true, force: true })
  })
  mkdirSync(join(root, 'projects'))
  mkdirSync(join(root, 'articles', 'nested'), { recursive: true })
  for (const id of ['rate-limiter', 'skytakeout', 'takeme', 'tlias', 'xu-speak-to-me']) {
    writeFileSync(join(root, 'projects', `${id}.md`), `---\ntitle: ${id}\n---\n`)
  }
  return root
}

test('只按明确归属聚合，支持子目录并按阅读顺序排列', t => {
  const root = fixture(t)
  writeFileSync(join(root, 'articles', 'a.md'), '---\ntitle: 后读\nproject: takeme\norder: 20\n---\n')
  writeFileSync(join(root, 'articles', 'nested', 'z.md'), '---\ntitle: 先读\nproject: takeme\norder: 10\n---\n')
  writeFileSync(join(root, 'articles', 'redis.md'), '---\ntitle: takeMe Redis 限流\nproject: rate-limiter\n---\n')
  writeFileSync(join(root, 'articles', 'general.md'), '---\ntitle: takeMe 与 Redis 通用知识\n---\n')
  writeFileSync(join(root, 'articles', 'nested', 'index.md'), '---\ntitle: 子目录文章\nproject: tlias\n---\n')
  const sidebar = generateProjectSidebar(root)
  assert.deepEqual(sidebar[2].items.map(item => item.link), ['/projects/takeme', '/articles/nested/z', '/articles/a'])
  assert.equal(sidebar[0].items[1].text, 'takeMe Redis 限流')
  assert.equal(sidebar[1].items.length, 1)
  assert.equal(sidebar[3].items[1].link, '/articles/nested/')
  assert(sidebar.every(group => group.collapsed === true && !group.link))
})

test('未知项目标识会报出文章位置，避免静默遗漏', t => {
  const root = fixture(t)
  writeFileSync(join(root, 'articles', 'typo.md'), '---\ntitle: 错误归属\nproject: take-me\n---\n')
  assert.throws(() => generateProjectSidebar(root), /typo\.md.*take-me/)
})

test('现有精选文章完整归属，保留原有项目顺序与所有链接', () => {
  const sidebar = generateProjectSidebar()
  assert.deepEqual(sidebar.map(group => group.items[0].link), [
    '/projects/rate-limiter', '/projects/skytakeout', '/projects/takeme', '/projects/tlias', '/projects/xu-speak-to-me'
  ])
  assert.equal(sidebar[0].items.length - 1, 4)
  assert.equal(sidebar[2].items.length - 1, 8)
  const articles = sidebar.flatMap(group => group.items.slice(1))
  assert.equal(new Set(articles.map(item => item.link)).size, 12)
  for (const item of sidebar.flatMap(group => group.items)) {
    assert(readFileSync(new URL(`../docs${item.link}.md`, import.meta.url), 'utf8').length > 0)
  }
})
