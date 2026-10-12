<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useData } from 'vitepress'
import GameFrame from './GameFrame.vue'
import { catOutline } from './catShape.js'
import { useGameSession } from './useGameSession.js'
import { breakoutSize, createBreakout, launchBall, movePaddle, stepBreakout } from './breakout.js'
import styles from './breakout.css?inline'

const game = shallowRef(createBreakout()), canvas = ref(null), frame = ref(null)
const { isDark } = useData()
const { phase, best, record, pause } = useGameSession('breakout')
const metrics = computed(() => [{ label: '本局得分', value: game.value.score }, { label: '最高分', value: best.value ?? '—' }, { label: '剩余机会', value: game.value.lives }, { label: '关卡', value: `${game.value.level} / 3` }])
const expression = computed(() => game.value.sad > 0 ? 'sad' : game.value.fed > 0 ? game.value.streak >= 3 ? 'delighted' : 'happy' : 'normal')
const expressionLabel = computed(() => ({ normal: '期待', happy: '开心', delighted: '满足', sad: '委屈' })[expression.value])
let observer, animation, lastTime, context, outline, palette, keys = new Set()

// 只在尺寸或主题改变时读取色值，逐帧绘画复用缓存。
function resize() {
  if (!canvas.value) return
  const width = canvas.value.clientWidth
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvas.value.width = Math.max(1, Math.round(width * ratio))
  canvas.value.height = Math.max(1, Math.round(width / 1.6 * ratio))
  context = canvas.value.getContext('2d')
  context.setTransform(canvas.value.width / 800, 0, 0, canvas.value.height / 500, 0, 0)
  const style = getComputedStyle(canvas.value)
  const color = name => style.getPropertyValue(name).trim()
  palette = { board: color('--game-board'), grid: color('--game-grid'), accent: color('--game-accent'), fur: color('--cat-fur'), line: color('--cat-line'), blush: color('--cat-blush'), fish: [1, 2, 3, 4].map(index => color(`--tile-${index}`)) }
  draw()
}
function fish(item) {
  const { x, y, width, height } = item
  context.fillStyle = palette.fish[item.color]
  context.beginPath(); context.ellipse(x + width * .62, y + height / 2, width * .36, height * .42, 0, 0, Math.PI * 2); context.fill()
  context.beginPath(); context.moveTo(x + width * .3, y + height / 2); context.lineTo(x + 3, y + 2); context.lineTo(x + 3, y + height - 2); context.closePath(); context.fill()
  context.strokeStyle = palette.line; context.lineWidth = 1.2; context.globalAlpha = .55
  context.beginPath(); context.moveTo(x + width * .34, y + height / 2); context.lineTo(x + width * .76, y + height / 2)
  for (let index = 0; index < 3; index++) { const bone = x + width * (.42 + index * .1); context.moveTo(bone - 2, y + 7); context.lineTo(bone + 4, y + height / 2); context.lineTo(bone - 2, y + height - 7) }
  context.stroke(); context.globalAlpha = 1
  context.fillStyle = palette.line; context.beginPath(); context.arc(x + width * .84, y + height * .4, 1.8, 0, Math.PI * 2); context.fill()
}
function cat() {
  const ball = game.value.ball
  context.save(); context.translate(ball.x - 26, ball.y - 26); context.scale(.52, .52)
  context.fillStyle = palette.fur; context.strokeStyle = palette.line; context.lineWidth = 2.5; context.fill(outline); context.stroke(outline)
  context.fillStyle = palette.blush
  context.beginPath(); context.moveTo(22, 19); context.lineTo(25, 38); context.lineTo(35, 29); context.closePath(); context.fill()
  context.beginPath(); context.moveTo(77, 19); context.lineTo(74, 38); context.lineTo(64, 29); context.closePath(); context.fill()
  for (const x of [25, 75]) { context.beginPath(); context.ellipse(x, 68, 8, 3.5, 0, 0, Math.PI * 2); context.fill() }
  context.strokeStyle = palette.line; context.lineWidth = 3; context.lineCap = 'round'
  for (const x of [35, 65]) {
    context.beginPath()
    if (expression.value === 'normal') { context.ellipse(x, 55, 3, 4, 0, 0, Math.PI * 2); context.fillStyle = palette.line; context.fill() }
    else { context.moveTo(x - 6, expression.value === 'sad' ? 54 : 57); context.quadraticCurveTo(x, expression.value === 'sad' ? 62 : 47, x + 6, expression.value === 'sad' ? 54 : 57); context.stroke() }
  }
  context.fillStyle = palette.blush; context.beginPath(); context.moveTo(46, 64); context.lineTo(54, 64); context.lineTo(50, 68); context.closePath(); context.fill()
  context.beginPath(); context.moveTo(50, 68); context.lineTo(50, 72); context.quadraticCurveTo(44, 80, 40, 73); context.moveTo(50, 72); context.quadraticCurveTo(56, 80, 60, 73); context.stroke()
  if (expression.value === 'delighted') { context.fillStyle = palette.blush; context.beginPath(); context.ellipse(50, 78, 5, 5, 0, 0, Math.PI * 2); context.fill() }
  context.restore()
}
function draw() {
  if (!context || !outline) return
  context.fillStyle = palette.board; context.fillRect(0, 0, 800, 500)
  context.strokeStyle = palette.grid; context.lineWidth = 1
  // 稀疏点阵给鱼干和小猫留出清楚的活动空间。
  context.fillStyle = palette.grid
  for (let x = 22; x < 800; x += 32) for (let y = 25; y < 500; y += 32) { context.beginPath(); context.arc(x, y, 1, 0, Math.PI * 2); context.fill() }
  game.value.fish.forEach(fish)
  context.fillStyle = palette.accent
  context.beginPath(); context.roundRect(game.value.paddle.x, breakoutSize.paddleY, game.value.paddle.width, breakoutSize.paddleHeight, 7); context.fill()
  cat()
  if (game.value.feedback) {
    const feedback = game.value.feedback
    context.globalAlpha = feedback.time / .65; context.fillStyle = palette.accent; context.font = '600 18px sans-serif'; context.textAlign = 'center'
    context.fillText('+10', feedback.x, feedback.y - 8 - (1 - feedback.time / .65) * 20); context.globalAlpha = 1
  }
}
function tick(time) {
  if (phase.value !== 'running') return
  const elapsed = lastTime === undefined ? 0 : Math.min(.05, (time - lastTime) / 1000)
  lastTime = time
  if (keys.size) game.value = movePaddle(game.value, game.value.paddle.x + game.value.paddle.width / 2 + (keys.has('right') ? 1 : -1) * 570 * elapsed)
  game.value = stepBreakout(game.value, elapsed)
  record(game.value.score)
  draw()
  if (game.value.over) phase.value = game.value.won ? 'won' : 'lost'
  else animation = requestAnimationFrame(tick)
}
async function start() {
  if (phase.value === 'won' || phase.value === 'lost') game.value = createBreakout()
  phase.value = 'running'
  await nextTick(); frame.value.focus()
}
function restart() { game.value = createBreakout(); phase.value = 'ready'; start() }
function launch() { if (phase.value === 'running') { game.value = launchBall(game.value); frame.value.focus() } }
function direction(key) { return ['ArrowLeft', 'a', 'A'].includes(key) ? 'left' : ['ArrowRight', 'd', 'D'].includes(key) ? 'right' : null }
function onKey(event) {
  if (event.target.tagName === 'BUTTON' && [' ', 'Enter'].includes(event.key)) return
  const move = direction(event.key)
  if (move && phase.value === 'running') { event.preventDefault(); keys.add(move) }
  if (event.key === ' ' && phase.value === 'running') { event.preventDefault(); launch() }
  if (['p', 'P'].includes(event.key)) { event.preventDefault(); phase.value === 'running' ? pause() : phase.value === 'paused' && start() }
}
function point(event) {
  if (phase.value !== 'running' || (event.pointerType === 'touch' && !event.buttons)) return
  const rect = canvas.value.getBoundingClientRect()
  game.value = movePaddle(game.value, (event.clientX - rect.left) / rect.width * 800)
  draw()
}
function press(event) { event.currentTarget.setPointerCapture(event.pointerId); point(event); frame.value.focus() }
watch(phase, value => {
  cancelAnimationFrame(animation); keys.clear(); lastTime = undefined
  if (value === 'running') animation = requestAnimationFrame(tick)
}, { flush: 'sync' })
watch(isDark, resize, { flush: 'post' })
onMounted(() => { outline = new Path2D(catOutline); observer = new ResizeObserver(resize); observer.observe(canvas.value); resize() })
onUnmounted(() => { cancelAnimationFrame(animation); observer?.disconnect(); keys.clear() })

// 动态入口只开始游戏界面，发球必须由玩家明确点击或按空格。
defineExpose({ start })
</script>

<template>
  <GameFrame ref="frame" title="猫猫吃鱼干" subtitle="弹起来的小猫，和一整盘小鱼干。" :phase="phase" :metrics="metrics" :aspect="1.6" :message="game.won ? '三盘鱼干都吃光啦，猫猫很满足！' : '猫猫吃饱了，歇一会儿再来吧。'" @start="start" @restart="restart" @pause="pause" @key="onKey" @keyup="keys.delete(direction($event.key))">
    <component :is="'style'" data-game-style="breakout" v-html="styles" />
    <canvas ref="canvas" class="breakout-board" role="img" :aria-label="`猫猫吃鱼干棋盘，猫猫表情：${expressionLabel}，还剩${game.fish.length}条鱼干`" @pointerdown="press" @pointermove="point" />
    <template #controls><div class="breakout-controls"><button :disabled="game.ball.launched || phase !== 'running'" @click="launch">{{ game.ball.launched ? '猫猫出发啦' : '发球 · 空格' }}</button><span>{{ game.ball.launched ? '接住小猫，继续吃鱼干。' : '准备好后发球，每盘鱼干都不赶时间。' }}</span></div></template>
    <template #instructions><p>移动挡板接住猫猫头，让它弹起吃掉小鱼干。刚吃到鱼干会眯眼笑，连续吃到会露出满足的表情。</p><p>共有三盘鱼干，后面的猫猫会跑快一点。一局有三次机会。</p><p>鼠标在棋盘内移动 / <kbd>← →</kbd> / <kbd>A D</kbd> 控制挡板。手机可在棋盘内左右拖动。</p><p><kbd>空格</kbd> 发球，<kbd>P</kbd> 暂停；挡板不同位置会改变弹出的方向。</p></template>
  </GameFrame>
</template>
