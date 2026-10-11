<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()
const isArticle = computed(() => !frontmatter.value.layout || frontmatter.value.layout === 'doc')
// 日期集中在标题下，统一为年-月-日，归档日期仍保留原有含义。
function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date).replace(/\//g, '-')
}
const organized = computed(() => formatDate(frontmatter.value.date))
const revised = computed(() => formatDate(frontmatter.value.revised))
const updated = computed(() => formatDate(page.value.lastUpdated))
</script>

<template>
  <div v-if="isArticle" class="article-meta" aria-label="文章阅读信息">
    <span class="meta-star" aria-hidden="true">✧</span>
    <span>预计阅读 {{ frontmatter.readingMinutes || 1 }} 分钟</span>
    <span v-if="organized" class="meta-date">整理日期 <time :datetime="organized">{{ organized }}</time></span>
    <span v-if="revised && revised !== updated" class="meta-date">修订于 <time :datetime="revised">{{ revised }}</time></span>
    <span v-if="updated" class="meta-date">更新于 <time :datetime="updated">{{ updated }}</time></span>
  </div>
</template>
