<script setup>
import DefaultTheme, { useLocalNav, useSidebar } from 'vitepress/theme'
import { useData, useRoute, withBase } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import ReadingSettings from './ReadingSettings.vue'
import ReadingProgress from './ReadingProgress.vue'
import { playThemeScene } from './themeScene.js'
import { data as featuredCategories } from '../featured.data.js'

const { isDark, frontmatter, page } = useData()
// 入选原文保留所属专栏导航，同时提供返回对应精选分类的入口。
const featuredCategory = computed(() => featuredCategories.find(category => category.articles.some(article => article.relativePath === page.value.relativePath)))
const { hasSidebar } = useSidebar()
const { headers } = useLocalNav()
const isHome = computed(() => frontmatter.value.layout === 'home')
const isReading = computed(() => !page.value.isNotFound && (!frontmatter.value.layout || frontmatter.value.layout === 'doc'))
// 项目与精选聚合导航增加层级样式，学习笔记继续使用原来的侧栏外观。
const isProjectReading = computed(() => /^(projects|articles)\//.test(page.value.relativePath))
// 两侧仅收起展示，不卸载导航和目录，保留滚动位置、分组与章节状态。
const navCollapsed = ref(false)
const outlineCollapsed = ref(false)
const route = useRoute()
const effect = ref('')
const playIntro = ref(true)
const introWaiting = ref(false)
const backgroundStarted = ref(false)
const backgroundLoaded = ref({ day: false, night: false })
const backgroundPending = computed(() => isHome.value && backgroundStarted.value && !backgroundLoaded.value[isDark.value ? 'night' : 'day'])
const effectCanvas = ref(null)
const avatarImage = ref(null)
const avatarReady = ref(false)
const avatarCached = ref(false)
// 从当前头像生成的 40px 微型预览内嵌到首页，慢网时不需要额外请求占位图片。
const avatarPreview = 'data:image/webp;base64,UklGRjABAABXRUJQVlA4ICQBAAAwCQCdASooACgAPu1iqk6ppaQiNVgNUTAdiWQAxy2/gdZF0KPot3YAqX+JlfBQRSSVb9DjhH4ztnlmI6YW0lQLpSlWyP5zyR5FWwnwdo4ghgfwAP73CEB4aJDgzneYVg73hHarWpIHI0LWSm54vtBpxQxHEZSs2z0bEOMVFraX26/74U34m4dljJdnLgjTvVL6mGOqOyQ56yf9o6/iTLhm00jvTBwUvUlHY0k7DZ/8ory4T39vaJHCL71T7GdeDDDg3CIjDFclgMraWyQz/rZdzId/EgGO6LJLrxJwndsPiMQkCGjAJfxu//1PNPjSKZouDHoHwTXH92oczsqmn9tkJjJF4f9rdofCsT69dYRHyMu1cacYT98zquN3YmXiLw+LAAAA'
const backgroundRequests = new Map()
let switching = false
let transition
let cancelScene
let targetDark
let introTimer
let backgroundWaitTimer
let mounted = false
let motionPreference
let switchId = 0

// 高清头像解码成功后才淡入；失败时继续显示预览，不阻塞介绍和背景入场。
async function revealAvatar(image, cached = false) {
  if (!image || avatarReady.value) return
  if (cached) avatarCached.value = true
  try {
    await image.decode()
  } catch {
    return
  }
  if (image === avatarImage.value) avatarReady.value = true
}

// 首屏缓存和返回首页时可能错过 load 事件，检查已完成的图片并直接显示。
watch(avatarImage, image => {
  avatarReady.value = false
  avatarCached.value = false
  if (image?.complete && image.naturalWidth > 0) revealAvatar(image, true)
}, { flush: 'post' })

// 背景成功、失败或等待超过 1.2 秒时，都释放内容；入场动画继续沿用原有节奏。
function showHomeContent() {
  clearTimeout(backgroundWaitTimer)
  backgroundWaitTimer = undefined
  introWaiting.value = false
  if (playIntro.value && !introTimer) {
    introTimer = window.setTimeout(() => { playIntro.value = false }, 2400)
  }
}

function loadHomeBackground(dark) {
  const key = dark ? 'night' : 'day'
  if (backgroundRequests.has(key)) return backgroundRequests.get(key)
  const background = new Image()
  background.decoding = 'async'
  background.fetchPriority = dark === isDark.value ? 'high' : 'low'
  background.src = dark ? '/background_night.webp' : '/background.webp'
  // 已完成的图片缓存保持清晰显示，避免脚本较晚到达时先退回占位再重新淡入。
  if (background.complete && background.naturalWidth > 0) backgroundLoaded.value[key] = true
  // 等待图片解码后再露出高清层；失败时保留占位插画，下次进入或切换可重新请求。
  const request = background.decode().then(() => {
    if (mounted) backgroundLoaded.value[key] = true
  }, () => { backgroundRequests.delete(key) })
  backgroundRequests.set(key, request)
  return request
}

function prepareHomeBackground() {
  backgroundStarted.value = true
  if (playIntro.value && !introTimer && !backgroundWaitTimer) {
    introWaiting.value = true
    backgroundWaitTimer = window.setTimeout(showHomeContent, 1200)
  }
  const dark = isDark.value
  loadHomeBackground(dark).then(() => {
    if (!mounted || !isHome.value || dark !== isDark.value) return
    showHomeContent()
    // 当前主题完成后才低优先级缓存另一张插画，避免争抢首屏带宽。
    loadHomeBackground(!dark)
  })
}

function finishSwitch() {
  switchId++
  cancelScene?.()
  cancelScene = undefined
  effect.value = ''
  switching = false
  delete document.documentElement.dataset.themeTransition
}

async function toggleAppearance(event) {
  if (switching) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isDark.value = !isDark.value
    return
  }

  switching = true
  const id = ++switchId
  const direction = isDark.value ? 'dawn' : 'spark'
  const nextDark = !isDark.value
  targetDark = nextDark
  const button = event?.currentTarget?.getBoundingClientRect()
  const origin = button ? { x: button.left + button.width / 2, y: button.top + button.height / 2 } : { x: window.innerWidth * .85, y: 32 }
  document.documentElement.dataset.themeTransition = direction
  function startScene(fallback = false) {
    cancelScene = playThemeScene(effectCanvas.value, direction, origin,
      () => { if (fallback) isDark.value = nextDark },
      () => { if (fallback) finishSwitch() })
  }

  // 页面快照柔和交接日夜，独立画布只负责细光与火星。
  if (document.startViewTransition) {
    transition = document.startViewTransition(async () => {
      if (id !== switchId) return
      effect.value = direction
      isDark.value = nextDark
      await nextTick()
    })
    transition.ready.then(() => {
      if (id === switchId) startScene()
    }, () => { if (id === switchId) finishSwitch() })
    transition.finished.then(() => { if (id === switchId) finishSwitch() }, () => { if (id === switchId) finishSwitch() })
  } else {
    // 无页面快照时仍保留晨光动作，在光线掠过中央时交接主题。
    effect.value = direction
    await nextTick()
    if (id === switchId) startScene(true)
  }
}

provide('toggle-appearance', toggleAppearance)

function stopMotion(event) {
  if (!event.matches) return
  transition?.skipTransition()
  if (switching) isDark.value = targetDark
  finishSwitch()
}

function stopOnResize() {
  // 旋转手机时直接完成切换，避免沿用旧画幅绘制拉伸的光影。
  if (switching) stopMotion({ matches: true })
}

function stopWhenHidden() {
  if (document.hidden && switching) stopMotion({ matches: true })
}

watch(() => route.path, () => {
  if (switching) stopMotion({ matches: true })
})

// 路由返回与日夜切换共用加载状态，旧请求不会释放另一套主题的入场等待。
watch([isHome, isDark], ([home]) => {
  if (!mounted) return
  if (home) prepareHomeBackground()
  else showHomeContent()
})

onMounted(() => {
  mounted = true
  if (isHome.value) prepareHomeBackground()
  else showHomeContent()
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', stopMotion)
  window.addEventListener('resize', stopOnResize)
  document.addEventListener('visibilitychange', stopWhenHidden)
})

onUnmounted(() => {
  mounted = false
  clearTimeout(introTimer)
  clearTimeout(backgroundWaitTimer)
  transition?.skipTransition()
  motionPreference?.removeEventListener('change', stopMotion)
  window.removeEventListener('resize', stopOnResize)
  document.removeEventListener('visibilitychange', stopWhenHidden)
  finishSwitch()
})
</script>

<template>
  <DefaultTheme.Layout :class="{ 'home-intro-play': playIntro, 'home-intro-waiting': introWaiting, 'home-background-pending': backgroundPending, 'reading-layout': isReading, 'project-reading-layout': isProjectReading, 'reading-nav-collapsed': isReading && navCollapsed, 'reading-outline-collapsed': isReading && outlineCollapsed }">
    <template #layout-top>
      <div v-if="isReading && hasSidebar" class="reading-nav-control">
        <button class="reading-sidebar-toggle" type="button" :aria-label="navCollapsed ? '展开文章导航' : '收起文章导航'" :title="navCollapsed ? '展开文章导航' : '收起文章导航'" :aria-expanded="!navCollapsed" aria-controls="VPSidebarNav" @click="navCollapsed = !navCollapsed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /><path :d="navCollapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'" /></svg>
        </button>
      </div>
    </template>
    <template #doc-before>
      <nav v-if="featuredCategory" class="featured-breadcrumb" aria-label="精选文章导航">
        <a :href="withBase('/articles/')">精选文章</a>
        <span aria-hidden="true">/</span>
        <a :href="withBase(featuredCategory.url)">{{ featuredCategory.title }}</a>
      </nav>
    </template>
    <template #sidebar-nav-before><p v-if="isReading" class="reading-sidebar-heading">文章导航</p></template>
    <template #aside-outline-before>
      <div v-if="isReading && headers.length" class="reading-outline-control">
        <button class="reading-sidebar-toggle" type="button" :aria-label="outlineCollapsed ? '展开文章目录' : '收起文章目录'" :title="outlineCollapsed ? '展开文章目录' : '收起文章目录'" :aria-expanded="!outlineCollapsed" @click="outlineCollapsed = !outlineCollapsed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M15 4v16" /><path :d="outlineCollapsed ? 'm11 9-3 3 3 3' : 'm8 9 3 3-3 3'" /></svg>
        </button>
      </div>
    </template>
    <template #nav-bar-content-after><ReadingSettings /></template>
    <template #home-hero-before>
      <!-- 背景与光尘随首页挂载，阅读页不保留持续漂浮的装饰。 -->
      <div class="parallax-bg" aria-hidden="true" />
      <div class="home-light-dust" aria-hidden="true">
        <i v-for="dot in 9" :key="dot" :style="{ '--i': dot }" />
      </div>
    </template>
    <template #home-hero-image>
      <span class="image-src hero-avatar" :class="{ 'is-ready': avatarReady, 'is-cached': avatarCached }" :style="{ backgroundImage: `url(${avatarPreview})` }">
        <img ref="avatarImage" class="hero-avatar-full" src="/avatar.jpg" alt="sheeta1998 的二次元头像" width="250" height="250" loading="eager" fetchpriority="high" decoding="async" @load="revealAvatar($event.target)" @error="avatarReady = false">
      </span>
      <span class="avatar-stars" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i></span>
    </template>
    <template #home-features-before>
      <!-- 项目区块复用默认卡片，只补充统一的标题与总览入口。 -->
      <div class="home-section-heading">
        <h2>项目实践</h2>
        <a href="/projects/">全部项目 →</a>
      </div>
    </template>
  </DefaultTheme.Layout>
  <ReadingProgress />
  <Teleport to="body">
    <div v-if="effect" class="theme-effect" :class="`theme-effect-${effect}`" aria-hidden="true">
      <canvas ref="effectCanvas" />
    </div>
  </Teleport>
</template>
