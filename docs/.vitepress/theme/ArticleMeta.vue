<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()
const isArticle = computed(() => !frontmatter.value.layout || frontmatter.value.layout === 'doc')
// 归档日期、人工修订日期与 Git 更新时间分别展示，避免用提交时间覆盖笔记日期。
function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date)
}
const organized = computed(() => formatDate(frontmatter.value.date))
const revised = computed(() => formatDate(frontmatter.value.revised))
const updated = computed(() => formatDate(page.value.lastUpdated))
</script>

<template>
  <div v-if="isArticle" class="article-meta" aria-label="文章阅读信息">
    <span class="meta-star" aria-hidden="true">✧</span>
    <span>预计阅读 {{ frontmatter.readingMinutes || 1 }} 分钟</span>
    <span v-if="organized" class="meta-date">整理日期 {{ organized }}</span>
    <span v-if="revised" class="meta-date">修订于 {{ revised }}</span>
    <span v-if="updated" class="meta-date">更新于 {{ updated }}</span>
  </div>
</template>
