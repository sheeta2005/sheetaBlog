<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useData } from 'vitepress'
import GameFrame from './GameFrame.vue'
import { useGameSession } from './useGameSession.js'
import { createTetris, movePiece, rotatePiece, dropPiece, stepTetris, landingY, shapes } from './tetris.js'
import { boardCanvas, roundCell } from './paint.js'

const game = shallowRef(createTetris(() => .5)), canvas = ref(null), frame = ref(null)
const { isDark } = useData()
const { phase, best, record, pause } = useGameSession('tetris')
const metrics = computed(() => [{ label: '本局得分', value: game.value.score }, { label: '最高分', value: best.value ?? '—' }, { label: '消除行数', value: game.value.lines }, { label: '当前等级', value: Math.floor(game.value.lines / 10) + 1 }])
const preview = computed(() => shapes[game.value.next].flatMap((row, y) => row.map((value, x) => ({ value, x, y }))).filter(cell => cell.value))
let timer, observer
function draw() {
  const board = boardCanvas(canvas.value, 10, 20)
  if (!board) return
  const { context, cell, color } = board
  function tile(x, y, type) {
    if (y < 0) return
    roundCell(context, x, y, cell, color(`--tile-${type}`))
    context.fillStyle = 'rgba(255,255,255,.18)'
    context.fillRect(x * cell + 5, y * cell + 4, Math.max(0, cell - 10), 1)
  }
  game.value.board.forEach((row, y) => row.forEach((value, x) => { if (value) tile(x, y, value) }))
  if (game.value.over) return
  const current = game.value.current, landing = landingY(game.value)
  context.globalAlpha = .18
  current.matrix.forEach((row, y) => row.forEach((value, x) => { if (value) tile(current.x + x, landing + y, value) }))
  context.globalAlpha = 1
  current.matrix.forEach((row, y) => row.forEach((value, x) => { if (value) tile(current.x + x, current.y + y, value) }))
}
function accept(state) {
  game.value = state
  record(state.score)
  if (state.over) phase.value = 'lost'
}
function schedule() {
  clearTimeout(timer)
  if (phase.value === 'running') timer = setTimeout(tick, Math.max(100, 720 * .83 ** Math.floor(game.value.lines / 10)))
}
function tick() { accept(stepTetris(game.value)); schedule() }
async function start() {
  if (phase.value !== 'paused') game.value = createTetris()
  phase.value = 'running'
  await nextTick(); frame.value.focus()
}
function restart() { phase.value = 'ready'; start() }
function action(name) {
  if (phase.value !== 'running') return
  const state = game.value
  if (name === 'left' || name === 'right') accept(movePiece(state, name === 'left' ? -1 : 1, 0))
  if (name === 'rotate') accept(rotatePiece(state))
  if (name === 'drop') accept(dropPiece(state))
  if (name === 'down') {
    const moved = movePiece(state, 0, 1)
    accept(moved === state ? stepTetris(state) : { ...moved, score: moved.score + 1 })
  }
}
function onKey(event) {
  if (event.target.tagName === 'BUTTON' && [' ', 'Enter'].includes(event.key)) return
  const name = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down', ArrowUp: 'rotate', x: 'rotate', X: 'rotate', ' ': 'drop' }[event.key]
  if (name && phase.value === 'running') { event.preventDefault(); action(name) }
  if (['p', 'P'].includes(event.key)) { event.preventDefault(); phase.value === 'running' ? pause() : phase.value === 'paused' && start() }
}
watch([game, isDark], draw, { flush: 'post' })
watch(phase, schedule, { flush: 'sync' })
onMounted(() => { observer = new ResizeObserver(draw); observer.observe(canvas.value); draw() })
onUnmounted(() => { clearTimeout(timer); observer?.disconnect() })
</script>

<template>
  <GameFrame ref="frame" class="tetris-page" title="俄罗斯方块" subtitle="把零散的小色块，安放成整齐的一行。" :phase="phase" :metrics="metrics" message="方块已经堆到顶啦" @start="start" @restart="restart" @pause="pause" @key="onKey">
    <canvas ref="canvas" class="tetris-board" role="img" :aria-label="`俄罗斯方块棋盘，得分 ${game.score}，已消除 ${game.lines} 行`" />
    <template #controls><div class="tetris-controls"><button aria-label="左移" @click="action('left')">←</button><button aria-label="旋转" @click="action('rotate')">↻</button><button aria-label="右移" @click="action('right')">→</button><button aria-label="向下落一格" @click="action('down')">↓</button><button aria-label="直接落到底" @click="action('drop')">落下</button></div></template>
    <template #preview><section class="next-piece"><h2>下一个</h2><svg viewBox="0 0 120 88" role="img" aria-label="下一个方块预览"><rect v-for="cell in preview" :key="`${cell.x},${cell.y}`" :x="14 + cell.x * 23" :y="8 + cell.y * 23" width="20" height="20" rx="4" :fill="`var(--tile-${cell.value})`" /></svg></section></template>
    <template #instructions><p>填满一整行即可消除；连续消除多行得分更高。</p><p><kbd>← →</kbd> 移动 · <kbd>↑</kbd> 旋转<br><kbd>↓</kbd> 加速 · <kbd>空格</kbd> 直接落下<br><kbd>P</kbd> 暂停</p><p>淡色方块提示当前落点，手机可用下方按钮操作。</p></template>
  </GameFrame>
</template>
