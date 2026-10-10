<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({ title: String, subtitle: String, phase: String, message: String, metrics: Array })
const emit = defineEmits(['start', 'restart', 'pause', 'key'])
const root = ref(null)
const { isDark } = useData()
const label = computed(() => ({ ready: '开始游戏', paused: '继续游戏', running: '暂停', won: '再来一局', lost: '再来一局' })[props.phase])
function act() { emit(props.phase === 'running' ? 'pause' : 'start') }
// 焦点离开游戏区域时暂停，打开搜索或操作导航不会继续消耗游戏时间。
function leave(event) { if (!root.value.contains(event.relatedTarget)) emit('pause') }
defineExpose({ focus: () => root.value?.focus({ preventScroll: true }) })
</script>

<template>
  <main ref="root" class="game-page" tabindex="0" :aria-label="`${title}游戏区域`" @keydown="$emit('key', $event)" @focusout="leave">
    <a class="misc-back" href="/misc/">← 返回杂项</a>
    <header class="game-heading">
      <div>
        <p class="misc-eyebrow"><span aria-hidden="true">✧</span> {{ isDark ? '花火夏夜' : '薄荷晴昼' }} · 休闲时刻</p>
        <h1>{{ title }}</h1>
        <p class="game-subtitle">{{ subtitle }}</p>
      </div>
      <div class="game-actions">
        <button class="game-button primary" @click="act">{{ label }}</button>
        <button class="game-button" @click="$emit('restart')">重开</button>
      </div>
    </header>
    <div class="game-workspace">
      <div class="game-play-area">
        <div class="game-stage" :class="{ 'is-paused': phase === 'paused' }">
          <slot />
          <button v-if="phase !== 'running'" class="game-overlay" :aria-label="phase === 'paused' ? '点击棋盘继续游戏' : '点击棋盘开始一局'" @click="act">
            <span class="overlay-star" aria-hidden="true">✧</span>
            <strong>{{ phase === 'ready' ? '准备好了吗？' : phase === 'paused' ? '歇一会儿也很好' : message }}</strong>
            <span>{{ phase === 'ready' ? '点击开始，享受这一小段闲暇。' : phase === 'paused' ? '点击继续，接着刚才的游戏。' : '点击这里，再来一局。' }}</span>
          </button>
        </div>
        <div class="game-touch-controls"><slot name="controls" /></div>
      </div>
      <aside class="game-aside">
        <dl class="game-metrics">
          <div v-for="metric in metrics" :key="metric.label"><dt>{{ metric.label }}</dt><dd>{{ metric.value }}</dd></div>
        </dl>
        <slot name="preview" />
        <section class="game-instructions"><h2>怎么玩</h2><slot name="instructions" /></section>
        <p class="game-save-note">记录保存在当前浏览器，离开游戏会自动暂停。</p>
        <p class="game-state" role="status">{{ { ready: '等待开始', running: '正在游戏', paused: '已暂停', won: '本局获胜', lost: '本局结束' }[phase] }}</p>
      </aside>
    </div>
  </main>
</template>
