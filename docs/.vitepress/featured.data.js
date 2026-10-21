import { fileURLToPath } from 'node:url'
import { generateFeaturedCategories } from './featured.js'

// 监听原文元信息，修改标精状态或顺序后，开发预览中的列表同步刷新。
export default {
  watch: ['articles', 'projects', 'posts', 'misc'].map(root => fileURLToPath(new URL(`../${root}/**/*.md`, import.meta.url))),
  load() {
    return generateFeaturedCategories()
  }
}
