<script setup>
import { computed, nextTick, ref, shallowRef } from 'vue'
import GameFrame from './GameFrame.vue'
import CatFace from './CatFace.vue'
import { useGameSession } from './useGameSession.js'
import { createCatGame, blockCat } from './cat.js'

// 预览使用固定局面，首次静态渲染和浏览器挂载一致；开始时才随机开局。
const game = shallowRef(createCatGame(() => .42)), frame = ref(null), cursor = ref({ row: 4, col: 3 })
const { phase, best, record, pause } = useGameSession('cat', true)
const metrics = computed(() => [{ label: '本局步数', value: game.value.moves }, { label: '最少获胜步数', value: best.value ?? '—' }, { label: '棋盘大小', value: '9 × 9' }])
const cells = Array.from({ length: 81 }, (_, index) => ({ row: Math.floor(index / 9), col: index % 9 }))
const blocked = cell => game.value.blocked.has(`${cell.row},${cell.col}`)
const isCat = cell => game.value.cat.row === cell.row && game.value.cat.col === cell.col
function point(cell) { return { x: 24 + cell.col * 40 + cell.row % 2 * 20, y: 24 + cell.row * 36 } }
function seal(cell) {
  if (phase.value !== 'running') return
  cursor.value = cell
  game.value = blockCat(game.value, cell)
  if (game.value.result) {
    phase.value = game.value.result
    if (phase.value === 'won') record(game.value.moves)
  }
}
async function start() {
  if (phase.value !== 'paused') game.value = createCatGame()
  phase.value = 'running'
  await nextTick(); frame.value.focus()
}
function restart() { phase.value = 'ready'; start() }
function onKey(event) {
  if (event.target.tagName === 'BUTTON' && [' ', 'Enter'].includes(event.key)) return
  const delta = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[event.key]
  if (phase.value === 'running' && delta) {
    event.preventDefault()
    cursor.value = { row: Math.max(0, Math.min(8, cursor.value.row + delta[0])), col: Math.max(0, Math.min(8, cursor.value.col + delta[1])) }
  }
  if (phase.value === 'running' && ['Enter', ' '].includes(event.key)) { event.preventDefault(); seal(cursor.value) }
  if (['p', 'P'].includes(event.key)) { event.preventDefault(); phase.value === 'running' ? pause() : phase.value === 'paused' && start() }
}
</script>

<template>
  <GameFrame ref="frame" title="围堵猫猫" subtitle="封住一格，猫猫走一步。把这位想溜走的小客人留下来。" :phase="phase" :metrics="metrics" :message="phase === 'won' ? '抓住这只小猫啦！' : '猫猫从边缘溜走啦'" @start="start" @restart="restart" @pause="pause" @key="onKey">
    <svg class="cat-board" viewBox="0 0 388 340" role="group" aria-label="围堵猫猫蜂窝棋盘">
      <g v-for="cell in cells" :key="`${cell.row},${cell.col}`" :transform="`translate(${point(cell).x} ${point(cell).y})`" role="button" :aria-label="`第${cell.row + 1}行第${cell.col + 1}格${isCat(cell) ? '，猫猫所在' : blocked(cell) ? '，已封闭' : '，可封闭'}`" :aria-disabled="phase !== 'running' || blocked(cell) || isCat(cell)" :tabindex="phase === 'running' && cursor.row === cell.row && cursor.col === cell.col ? 0 : -1" @click="seal(cell)">
        <path class="cat-cell" :class="{ blocked: blocked(cell), chosen: cursor.row === cell.row && cursor.col === cell.col }" d="M-9-16Q-6-18-3-18H7Q10-18 12-15L20-3Q22 0 20 3L12 15Q10 18 7 18H-7Q-10 18-12 15L-20 3Q-22 0-20-3L-12-15Q-11-16-9-16Z" />
        <path v-if="blocked(cell)" class="cat-cell-leaf" d="M-7 6Q-7-6 8-8Q10 6-7 6Zm0 0 13-11" />
      </g>
      <g :transform="`translate(${point(game.cat).x - 23} ${point(game.cat).y - 29})`" class="cat-token" pointer-events="none"><CatFace :happy="phase === 'won'" width="46" height="46" /></g>
    </svg>
    <template #instructions><p>点击空格放下叶片，猫猫随即移动一步。</p><p>封住所有逃离路线就获胜；猫猫到达边缘则失败。</p><p>封闭格子和猫猫所在格不能点击。</p><p><kbd>方向键</kbd> 选择格子<br><kbd>回车</kbd> / <kbd>空格</kbd> 封格<br><kbd>P</kbd> 暂停</p></template>
  </GameFrame>
</template>
