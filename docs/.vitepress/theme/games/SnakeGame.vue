<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useData } from 'vitepress'
import GameFrame from './GameFrame.vue'
import { useGameSession } from './useGameSession.js'
import { createSnake, turnSnake, stepSnake } from './snake.js'
import { boardCanvas, roundCell } from './paint.js'

const game = shallowRef(createSnake(() => .5)), canvas = ref(null), frame = ref(null)
const { isDark } = useData()
const { phase, best, record, pause } = useGameSession('snake')
const metrics = computed(() => [{ label: '本局得分', value: game.value.score }, { label: '最高分', value: best.value ?? '—' }, { label: '小蛇长度', value: game.value.body.length }])
let timer, observer
function draw() {
  const board = boardCanvas(canvas.value, 20, 20)
  if (!board) return
  const { context, cell, color } = board
  game.value.body.forEach((point, index) => roundCell(context, point.x, point.y, cell, color(index === 0 ? '--game-accent' : '--snake-body'), 1))
  const head = game.value.body[0]
  const offset = { right: [cell * .65, cell * .28, cell * .65, cell * .72], left: [cell * .35, cell * .28, cell * .35, cell * .72], up: [cell * .28, cell * .35, cell * .72, cell * .35], down: [cell * .28, cell * .65, cell * .72, cell * .65] }[game.value.direction]
  context.fillStyle = color('--game-eye')
  for (let index = 0; index < 4; index += 2) {
    context.beginPath(); context.arc(head.x * cell + offset[index], head.y * cell + offset[index + 1], cell * .08, 0, Math.PI * 2); context.fill()
  }
  if (game.value.food) {
    const food = game.value.food
    context.fillStyle = color('--game-berry')
    context.beginPath(); context.arc((food.x + .5) * cell, (food.y + .56) * cell, cell * .31, 0, Math.PI * 2); context.fill()
    context.fillStyle = color('--snake-body')
    context.beginPath(); context.ellipse((food.x + .59) * cell, (food.y + .23) * cell, cell * .18, cell * .08, -.5, 0, Math.PI * 2); context.fill()
  }
}
function schedule() {
  clearTimeout(timer)
  if (phase.value === 'running') timer = setTimeout(tick, Math.max(95, 210 - game.value.score * .55))
}
function tick() {
  game.value = stepSnake(game.value)
  record(game.value.score)
  if (game.value.over) phase.value = game.value.won ? 'won' : 'lost'
  schedule()
}
async function start() {
  if (phase.value !== 'paused') game.value = createSnake()
  phase.value = 'running'
  await nextTick(); frame.value.focus()
}
function restart() { phase.value = 'ready'; start() }
function turn(direction) { if (phase.value === 'running') game.value = turnSnake(game.value, direction) }
function onKey(event) {
  // 按钮保留回车与空格的原生点击，其余按键在整个游戏区域内可用。
  if (event.target.tagName === 'BUTTON' && [' ', 'Enter'].includes(event.key)) return
  const direction = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' }[event.key]
  if (direction && phase.value === 'running') { event.preventDefault(); turn(direction) }
  if ([' ', 'p', 'P'].includes(event.key)) { event.preventDefault(); phase.value === 'running' ? pause() : phase.value === 'paused' && start() }
}
watch([game, isDark], draw, { flush: 'post' })
// 同步停止计时，重开一局时也从完整的移动间隔开始。
watch(phase, schedule, { flush: 'sync' })
onMounted(() => { observer = new ResizeObserver(draw); observer.observe(canvas.value); draw() })
onUnmounted(() => { clearTimeout(timer); observer?.disconnect() })
</script>

<template>
  <GameFrame ref="frame" title="贪吃蛇" subtitle="让薄荷小蛇慢慢长大，记得给自己留一条回头路。" :phase="phase" :metrics="metrics" :message="game.won ? '小蛇填满了整个花园！' : '小蛇需要歇一会儿啦'" @start="start" @restart="restart" @pause="pause" @key="onKey">
    <canvas ref="canvas" class="snake-board" role="img" :aria-label="`贪吃蛇棋盘，当前得分 ${game.score}`" />
    <template #controls>
      <div class="direction-pad"><button aria-label="向上" @click="turn('up')">↑</button><button aria-label="向左" @click="turn('left')">←</button><button aria-label="向下" @click="turn('down')">↓</button><button aria-label="向右" @click="turn('right')">→</button></div>
    </template>
    <template #instructions><p>吃到小莓果，身体就会变长。</p><p>碰墙或撞到自己，本局结束。</p><p><kbd>方向键</kbd> / <kbd>W A S D</kbd> 转向<br><kbd>空格</kbd> / <kbd>P</kbd> 暂停</p><p>手机可使用棋盘下方的方向按钮。</p></template>
  </GameFrame>
</template>
