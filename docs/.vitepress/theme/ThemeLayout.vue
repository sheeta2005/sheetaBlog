<script setup>
import DefaultTheme, { useLocalNav, useSidebar } from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import ReadingSettings from './ReadingSettings.vue'
import ReadingProgress from './ReadingProgress.vue'
import { playThemeScene } from './themeScene.js'

const { isDark, frontmatter, page } = useData()
const { hasSidebar } = useSidebar()
const { headers } = useLocalNav()
const isHome = computed(() => frontmatter.value.layout === 'home')
const isReading = computed(() => !page.value.isNotFound && (!frontmatter.value.layout || frontmatter.value.layout === 'doc'))
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
  <DefaultTheme.Layout :class="{ 'home-intro-play': playIntro, 'home-intro-waiting': introWaiting, 'home-background-pending': backgroundPending, 'reading-layout': isReading, 'reading-nav-collapsed': isReading && navCollapsed, 'reading-outline-collapsed': isReading && outlineCollapsed }">
    <template #layout-top>
      <div v-if="isReading && hasSidebar" class="reading-nav-control">
        <button class="reading-sidebar-toggle" type="button" :aria-label="navCollapsed ? '展开文章导航' : '收起文章导航'" :title="navCollapsed ? '展开文章导航' : '收起文章导航'" :aria-expanded="!navCollapsed" aria-controls="VPSidebarNav" @click="navCollapsed = !navCollapsed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /><path :d="navCollapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'" /></svg>
        </button>
      </div>
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
      <img class="image-src" src="/avatar.jpg" alt="sheeta1998 的二次元头像" width="250" height="250">
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
