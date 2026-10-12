<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
// VitePress 默认把 CSS 汇总到全站文件，改为随动态游戏模块插入，离开时自动移除。
import styles from './gameplay.css?inline'

const props = defineProps({ title: String, subtitle: String, phase: String, message: String, metrics: Array, aspect: { type: Number, default: 1 }, canContinue: Boolean, saveNote: String })
const emit = defineEmits(['start', 'restart', 'pause', 'key', 'keyup', 'continue'])
const root = ref(null), playArea = ref(null), stage = ref(null), controls = ref(null)
const expanded = ref(false), fullscreen = ref(false), stageWidth = ref(0), displayNotice = ref('')
const immersive = computed(() => expanded.value || fullscreen.value)
const { isDark } = useData()
const label = computed(() => ({ ready: '开始游戏', paused: '继续游戏', running: '暂停', won: '再来一局', lost: '再来一局' })[props.phase])
let observer, resizeFrame, viewport
function act() { emit(props.phase === 'running' ? 'pause' : 'start') }
// 焦点离开游戏区域时暂停，打开搜索或操作导航不会继续消耗游戏时间。
function leave(event) { if (!root.value.contains(event.relatedTarget)) emit('pause') }

// 同时受宽度和剩余屏幕高度约束，竖长棋盘不会因放大而裁掉底部。
function measure() {
  if (!stage.value) return
  const top = Math.max(12, stage.value.getBoundingClientRect().top)
  const height = Math.max(100, window.innerHeight - top - (controls.value?.offsetHeight || 0) - 40)
  stageWidth.value = Math.floor(Math.min(playArea.value.clientWidth, height * props.aspect))
}
function fit() { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(measure) }
// 窗口旋转或界面缩放时先暂停，让玩家确认新尺寸后继续。
function viewportKey() { return [innerWidth, innerHeight, getComputedStyle(document.documentElement).getPropertyValue('--site-ui-scale').trim()].join(',') }
function resize() {
  const next = viewportKey()
  if (next !== viewport) emit('pause')
  viewport = next
  fit()
}
function toggleExpanded() {
  emit('pause')
  expanded.value = !expanded.value
  displayNotice.value = ''
}
async function toggleFullscreen() {
  emit('pause')
  displayNotice.value = ''
  try {
    if (document.fullscreenElement === root.value) await document.exitFullscreen()
    else {
      if (!root.value.requestFullscreen) throw new Error('全屏不可用')
      await root.value.requestFullscreen()
    }
  } catch {
    expanded.value = true
    displayNotice.value = '已使用扩大模式，点击右上方可恢复。'
  }
}
function fullscreenChanged() {
  fullscreen.value = document.fullscreenElement === root.value
  emit('pause')
  fit()
}
function onKey(event) {
  if (event.key === 'Escape' && expanded.value && !fullscreen.value) {
    event.preventDefault()
    expanded.value = false
    emit('pause')
    return
  }
  emit('key', event)
}
watch(immersive, async value => {
  document.documentElement.classList.toggle('game-immersive-open', value)
  await nextTick()
  measure()
})
onMounted(() => {
  observer = new ResizeObserver(fit)
  observer.observe(playArea.value)
  observer.observe(root.value.querySelector('.game-heading'))
  viewport = viewportKey()
  window.addEventListener('resize', resize)
  document.addEventListener('fullscreenchange', fullscreenChanged)
  measure()
})
onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(resizeFrame)
  window.removeEventListener('resize', resize)
  document.removeEventListener('fullscreenchange', fullscreenChanged)
  document.documentElement.classList.remove('game-immersive-open')
  if (document.fullscreenElement === root.value) document.exitFullscreen().catch(() => {})
})
defineExpose({ focus: () => root.value?.focus({ preventScroll: true }) })
</script>

<template>
  <main ref="root" class="game-page" :class="{ 'is-immersive': immersive }" :style="{ '--stage-width': stageWidth ? `${stageWidth}px` : '100%', '--board-aspect': aspect }" tabindex="0" :aria-label="`${title}游戏区域`" @keydown="onKey" @keyup="$emit('keyup', $event)" @focusout="leave">
    <component :is="'style'" data-game-style="runtime" v-html="styles" />
    <a class="misc-back" href="/misc/">← 返回杂项</a>
    <header class="game-heading">
      <div><p class="misc-eyebrow"><span aria-hidden="true">✧</span> {{ isDark ? '花火夏夜' : '薄荷晴昼' }} · 休闲时刻</p><h1>{{ title }}</h1><p class="game-subtitle">{{ subtitle }}</p></div>
      <div class="game-actions">
        <button class="game-button primary" @click="act">{{ label }}</button>
        <button class="game-button" @click="$emit('restart')">重开</button>
        <button class="game-button" :aria-pressed="expanded" :disabled="fullscreen" @click="toggleExpanded">{{ expanded ? '恢复' : '扩大' }}</button>
        <button class="game-button" :aria-pressed="fullscreen" @click="toggleFullscreen">{{ fullscreen ? '退出全屏' : '全屏' }}</button>
      </div>
    </header>
    <div class="game-status-row">
      <dl class="game-metrics"><div v-for="metric in metrics" :key="metric.label"><dt>{{ metric.label }}</dt><dd>{{ metric.value }}</dd></div></dl>
      <p class="game-state" role="status">{{ { ready: '等待开始', running: '正在游戏', paused: '已暂停', won: '本局获胜', lost: '本局结束' }[phase] }}</p>
    </div>
    <p v-if="displayNotice" class="game-display-notice" role="status">{{ displayNotice }}</p>
    <div class="game-workspace">
      <div ref="playArea" class="game-play-area">
        <div ref="stage" class="game-stage" :class="{ 'is-paused': phase === 'paused' }">
          <slot />
          <div v-if="phase !== 'running'" class="game-overlay">
            <button class="game-overlay-card" :aria-label="phase === 'paused' ? '点击棋盘继续游戏' : '点击棋盘开始一局'" @click="act"><span class="overlay-star" aria-hidden="true">✧</span><strong>{{ phase === 'ready' ? '准备好了吗？' : phase === 'paused' ? '歇一会儿也很好' : message }}</strong><span>{{ phase === 'ready' ? '点击开始，享受这一小段闲暇。' : phase === 'paused' ? '点击继续，接着刚才的游戏。' : '点击这里，再来一局。' }}</span></button>
            <button v-if="phase === 'won' && canContinue" class="game-button primary" @click="$emit('continue')">继续挑战</button>
          </div>
        </div>
        <div ref="controls" class="game-touch-controls"><slot name="controls" /></div>
      </div>
      <aside class="game-aside">
        <slot name="preview" />
        <details class="game-instructions"><summary>怎么玩 <span aria-hidden="true">＋</span></summary><slot name="instructions" /></details>
        <p class="game-save-note">{{ saveNote || '最高记录保存在当前浏览器，离开游戏会自动暂停。' }}</p>
      </aside>
    </div>
  </main>
</template>
