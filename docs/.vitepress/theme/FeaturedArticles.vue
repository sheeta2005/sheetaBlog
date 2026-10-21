<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as categories } from '../featured.data.js'

const props = defineProps({ category: { type: String, default: '' } })
// 首页与精选总览展示同一组分类卡片，分类页只展示当前大类的标精文章。
const current = computed(() => categories.find(category => category.id === props.category))
</script>

<template>
  <div v-if="!category" class="featured-category-grid" aria-label="精选文章分类">
    <a v-for="group in categories" :key="group.id" class="featured-category-card" :href="withBase(group.url)">
      <span class="featured-category-count">{{ group.articles.length }} 篇精选</span>
      <strong>{{ group.title }}</strong>
      <span class="featured-category-description">{{ group.description }}</span>
      <span class="featured-category-action">浏览精选 <span aria-hidden="true">→</span></span>
    </a>
  </div>
  <template v-else-if="current">
    <nav class="featured-category-links" aria-label="精选分类导航">
      <a :href="withBase('/articles/')">← 返回精选文章</a>
      <a :href="withBase(current.allUrl)">浏览{{ current.title }}全部内容 →</a>
    </nav>
    <p class="featured-category-summary">{{ current.description }}共 {{ current.articles.length }} 篇精选。</p>
    <div v-if="current.articles.length" class="article-reading-list">
      <a v-for="article in current.articles" :key="article.url" :href="withBase(article.url)">
        <span class="article-list-title">{{ article.title }}</span>
        <span v-if="article.description" class="article-list-description">{{ article.description }}</span>
        <span v-if="article.label" class="featured-article-label">{{ article.label }}</span>
        <span class="article-list-arrow" aria-hidden="true">→</span>
      </a>
    </div>
    <p v-else class="featured-empty">暂未收录精选文章，后续会持续补充。</p>
  </template>
</template>
