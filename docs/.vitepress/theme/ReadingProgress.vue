<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, page } = useData()
const isArticle = computed(() => !frontmatter.value.layout || frontmatter.value.layout === 'doc')
const progress = ref(0)
let article
let observer
let frame = 0

// 以正文起止位置计算进度，字号改变或图片加载后重新测量。
function updateProgress() {
  frame = 0
  if (!article) return
  const rect = article.getBoundingClientRect()
  const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height'))
  const start = rect.top + window.scrollY - navHeight
  const distance = Math.max(1, rect.height - window.innerHeight + navHeight)
  progress.value = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
}

function scheduleUpdate() {
  if (!frame) frame = requestAnimationFrame(updateProgress)
}

function observeArticle() {
  observer?.disconnect()
  article = isArticle.value ? document.querySelector('.VPDoc .main') : null
  if (article) observer.observe(article)
  progress.value = 0
  scheduleUpdate()
}

watch(() => page.value.relativePath, async () => {
  await nextTick()
  if (observer) observeArticle()
})

onMounted(() => {
  observer = new ResizeObserver(scheduleUpdate)
  observeArticle()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
})

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
})
</script>

<template>
  <div v-if="isArticle" class="reading-progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true" />
</template>
