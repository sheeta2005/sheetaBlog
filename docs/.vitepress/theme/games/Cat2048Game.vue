<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import GameFrame from './GameFrame.vue'
import CatFace from './CatFace.vue'
import { useGameSession } from './useGameSession.js'
import { create2048, move2048, restore2048 } from './cat2048.js'
import styles from './cat2048.css?inline'

const game = shallowRef(create2048()), frame = ref(null), merged = ref([])
const { phase, best, record, pause } = useGameSession('2048')
const tiles = computed(() => game.value.board.flatMap((tile, index) => tile ? [{ ...tile, row: Math.floor(index / 4), col: index % 4 }] : []))
const maximum = computed(() => Math.max(...tiles.value.map(tile => tile.value)))
const metrics = computed(() => [{ label: '本局得分', value: game.value.score }, { label: '最高分', value: best.value ?? '—' }, { label: '最大猫猫', value: maximum.value }])
const expressions = ['sleepy', 'curious', 'normal', 'happy', 'smug', 'delighted']
const level = value => Math.min(5, Math.log2(value) - 1)
let mergeTimer, pointer
async function start() {
  if (phase.value === 'lost' || phase.value === 'won' || game.value.over) game.value = create2048()
  // 未确认的胜利存档仍展示继续挑战，不在刷新后跳过获胜提示。
  phase.value = game.value.won && !game.value.acknowledged ? 'won' : 'running'
  await nextTick()
  frame.value.focus()
}
function restart() { game.value = create2048(); phase.value = 'ready'; start() }
function continueGame() { game.value = { ...game.value, acknowledged: true }; phase.value = 'running'; frame.value.focus() }
function move(direction) {
  if (phase.value !== 'running') return
  const moved = move2048(game.value, direction)
  if (moved === game.value) return
  game.value = moved
  merged.value = moved.merged
  clearTimeout(mergeTimer)
  mergeTimer = setTimeout(() => { merged.value = [] }, 160)
  record(moved.score)
  if (moved.won && !moved.acknowledged) phase.value = 'won'
  else if (moved.over) phase.value = 'lost'
}
function onKey(event) {
  if (event.target.tagName === 'BUTTON' && [' ', 'Enter'].includes(event.key)) return
  const direction = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' }[event.key]
  if (direction && phase.value === 'running') { event.preventDefault(); move(direction) }
  if (['p', 'P', ' '].includes(event.key)) { event.preventDefault(); phase.value === 'running' ? pause() : phase.value === 'paused' && start() }
}
// 滑动仅在棋盘内接管，不阻止玩家滚动说明和网站其它区域。
function swipeStart(event) {
  if (phase.value !== 'running') return
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function swipeEnd(event) {
  if (!pointer || pointer.id !== event.pointerId) return
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y
  pointer = undefined
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
  move(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'right' : 'left' : dy > 0 ? 'down' : 'up')
}
watch(game, value => {
  try { localStorage.setItem('sheeta-2048-board', JSON.stringify(value)) } catch { /* 存储受限时仍可正常游玩。 */ }
})
onMounted(() => {
  try {
    const saved = restore2048(JSON.parse(localStorage.getItem('sheeta-2048-board')))
    if (saved) game.value = saved
  } catch { /* 非法存档保持新局面，不阻止加载。 */ }
})
onUnmounted(() => { clearTimeout(mergeTimer) })
defineExpose({ start })
</script>

<template>
  <GameFrame ref="frame" title="猫猫 2048" subtitle="如果能算对每一步就好了。" :phase="phase" :metrics="metrics" :can-continue="!game.over" :message="phase === 'won' ? '合成 2048，猫猫开心极了！' : '小猫挤满了，换个思路再来吧。'" save-note="棋盘与最高分保存在当前浏览器，刷新后还能接着玩。" @start="start" @restart="restart" @pause="pause" @continue="continueGame" @key="onKey">
    <component :is="'style'" data-game-style="2048" v-html="styles" />
    <div class="cat2048-board" role="group" aria-label="猫猫 2048 棋盘" @pointerdown="swipeStart" @pointerup="swipeEnd" @pointercancel="pointer = undefined">
      <div class="cat2048-cells" aria-hidden="true"><i v-for="cell in 16" :key="cell" /></div>
      <div class="cat2048-tiles"><div v-for="tile in tiles" :key="tile.id" class="cat2048-tile" :class="{ 'is-merged': merged.includes(tile.id) }" :style="{ left: `${tile.col * 25}%`, top: `${tile.row * 25}%`, '--tile-color': `var(--tile-${level(tile.value) + 1})` }" :aria-label="`第${tile.row + 1}行第${tile.col + 1}列，${tile.value}`"><div><CatFace :expression="expressions[level(tile.value)]" /><strong>{{ tile.value }}</strong></div></div></div>
    </div>
    <template #controls><div class="direction-pad"><button aria-label="向上" @click="move('up')">↑</button><button aria-label="向左" @click="move('left')">←</button><button aria-label="向下" @click="move('down')">↓</button><button aria-label="向右" @click="move('right')">→</button></div></template>
    <template #instructions><p>相同数字的小猫相遇会合并，每次有效移动后出现一只新猫猫。</p><p>合并到 2048 就获胜，还可以继续挑战更大的数字。</p><p><kbd>方向键</kbd> / <kbd>W A S D</kbd> 移动<br><kbd>空格</kbd> / <kbd>P</kbd> 暂停</p><p>手机可在棋盘上滑动，或使用下方方向按钮。</p></template>
  </GameFrame>
</template>
