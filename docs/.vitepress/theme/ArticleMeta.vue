<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()
const isArticle = computed(() => !frontmatter.value.layout || frontmatter.value.layout === 'doc')
// 固定日期格式与时区，静态构建和浏览器显示相同的真实更新时间。
const updated = computed(() => {
  const value = page.value.lastUpdated || frontmatter.value.date
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date)
})
</script>

<template>
  <div v-if="isArticle" class="article-meta" aria-label="文章阅读信息">
    <span class="meta-star" aria-hidden="true">✧</span>
    <span>预计阅读 {{ frontmatter.readingMinutes || 1 }} 分钟</span>
    <span v-if="updated" class="meta-date">更新于 {{ updated }}</span>
  </div>
</template>
