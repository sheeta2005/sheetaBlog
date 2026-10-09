<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import ReadingSettings from './ReadingSettings.vue'
import { playThemeScene } from './themeScene.js'

const { isDark } = useData()
const route = useRoute()
const effect = ref('')
const playIntro = ref(true)
const effectCanvas = ref(null)
let switching = false
let transition
let cancelScene
let targetDark
let introTimer
let motionPreference
let switchId = 0

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

onMounted(() => {
  introTimer = window.setTimeout(() => { playIntro.value = false }, 2400)
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', stopMotion)
  window.addEventListener('resize', stopOnResize)
  document.addEventListener('visibilitychange', stopWhenHidden)
  // 提前缓存另一张插画，主题切换时避免背景临时空白。
  const background = new Image()
  background.src = isDark.value ? '/background.webp' : '/background_night.webp'
})

onUnmounted(() => {
  clearTimeout(introTimer)
  transition?.skipTransition()
  motionPreference?.removeEventListener('change', stopMotion)
  window.removeEventListener('resize', stopOnResize)
  document.removeEventListener('visibilitychange', stopWhenHidden)
  finishSwitch()
})
</script>

<template>
  <DefaultTheme.Layout :class="{ 'home-intro-play': playIntro }">
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
  <Teleport to="body">
    <div v-if="effect" class="theme-effect" :class="`theme-effect-${effect}`" aria-hidden="true">
      <canvas ref="effectCanvas" />
    </div>
  </Teleport>
</template>
