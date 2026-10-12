// 固定逻辑坐标与显示尺寸分离，扩大、全屏和屏幕旋转不会重置这一局。
export const breakoutSize = { width: 800, height: 500, radius: 20, paddleY: 458, paddleHeight: 14 }
const clamp = (value, low, high) => Math.max(low, Math.min(high, value))
const speed = level => 320 + (level - 1) * 40

function fishForLevel(level) {
  return Array.from({ length: (level + 2) * 8 }, (_, index) => ({ id: index, x: 42 + index % 8 * 90, y: 46 + Math.floor(index / 8) * 43, width: 76, height: 27, color: Math.floor(index / 8) % 4 }))
}
function restingBall(paddle) { return { x: paddle.x + paddle.width / 2, y: breakoutSize.paddleY - breakoutSize.radius - 2, vx: 0, vy: 0, launched: false } }
export function createBreakout() {
  const paddle = { x: 340, width: 120 }
  return { paddle, ball: restingBall(paddle), fish: fishForLevel(1), score: 0, lives: 3, level: 1, streak: 0, fed: 0, sad: 0, feedback: null, over: false, won: false }
}
export function movePaddle(state, x) {
  const paddle = { ...state.paddle, x: clamp(x - state.paddle.width / 2, 0, breakoutSize.width - state.paddle.width) }
  return { ...state, paddle, ball: state.ball.launched ? state.ball : restingBall(paddle) }
}
export function launchBall(state) {
  if (state.over || state.ball.launched) return state
  const vx = speed(state.level) * .38
  return { ...state, sad: 0, ball: { ...state.ball, launched: true, vx, vy: -Math.sqrt(speed(state.level) ** 2 - vx ** 2) } }
}
function touches(ball, rect) {
  const x = clamp(ball.x, rect.x, rect.x + rect.width), y = clamp(ball.y, rect.y, rect.y + rect.height)
  return (ball.x - x) ** 2 + (ball.y - y) ** 2 <= breakoutSize.radius ** 2
}
export function stepBreakout(state, elapsed) {
  if (state.over) return state
  const dt = clamp(elapsed, 0, .05)
  const next = { ...state, ball: { ...state.ball }, fed: Math.max(0, state.fed - dt), sad: Math.max(0, state.sad - dt), feedback: state.feedback && state.feedback.time > dt ? { ...state.feedback, time: state.feedback.time - dt } : null }
  if (!next.ball.launched) return next
  const { width, height, radius, paddleY, paddleHeight } = breakoutSize
  // 每帧分成短步，速度提高后也不会穿过薄鱼干或挡板。
  const steps = Math.max(1, Math.ceil(dt * 180)), slice = dt / steps
  for (let index = 0; index < steps; index++) {
    const ball = next.ball, previous = { x: ball.x, y: ball.y }
    ball.x += ball.vx * slice
    ball.y += ball.vy * slice
    if (ball.x < radius) { ball.x = radius; ball.vx = Math.abs(ball.vx) }
    if (ball.x > width - radius) { ball.x = width - radius; ball.vx = -Math.abs(ball.vx) }
    if (ball.y < radius) { ball.y = radius; ball.vy = Math.abs(ball.vy) }
    const paddleRect = { ...next.paddle, y: paddleY, height: paddleHeight }
    if (ball.vy > 0 && previous.y + radius <= paddleY + 2 && touches(ball, paddleRect)) {
      const offset = clamp((ball.x - (next.paddle.x + next.paddle.width / 2)) / (next.paddle.width / 2), -1, 1)
      const angle = offset * Math.PI / 3
      ball.y = paddleY - radius - .1
      ball.vx = speed(next.level) * Math.sin(angle)
      ball.vy = -speed(next.level) * Math.cos(angle)
    }
    const fish = next.fish.find(item => touches(ball, item))
    if (fish) {
      // 根据碰撞前的位置判定反弹边，避免同一条鱼重复计分。
      if (previous.y + radius <= fish.y || previous.y - radius >= fish.y + fish.height) ball.vy = -ball.vy
      else ball.vx = -ball.vx
      next.fish = next.fish.filter(item => item.id !== fish.id)
      next.score += 10
      next.streak = next.fed > 0 ? next.streak + 1 : 1
      next.fed = .9
      next.feedback = { x: fish.x + fish.width / 2, y: fish.y, time: .65 }
      if (!next.fish.length) {
        if (next.level === 3) { next.over = true; next.won = true }
        else { next.level++; next.fish = fishForLevel(next.level); next.ball = restingBall(next.paddle) }
        break
      }
    }
    if (ball.y - radius > height) {
      next.lives--
      next.sad = 1
      next.fed = 0
      next.streak = 0
      next.ball = restingBall(next.paddle)
      next.over = next.lives === 0
      break
    }
  }
  return next
}
