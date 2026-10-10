const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }

// 从实际空格中选食物，避免蛇身占满棋盘时陷入随机重试。
function foodFor(body, size, random) {
  const occupied = new Set(body.map(point => `${point.x},${point.y}`))
  const free = []
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (!occupied.has(`${x},${y}`)) free.push({ x, y })
  }
  return free[Math.floor(random() * free.length)] || null
}
export function createSnake(random = Math.random) {
  const body = [{ x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 }]
  return { size: 20, body, direction: 'right', nextDirection: 'right', food: foodFor(body, 20, random), score: 0, over: false, won: false }
}
export function turnSnake(state, direction) {
  if (state.over || !directions[direction]) return state
  const current = directions[state.direction], next = directions[direction]
  if (current[0] + next[0] === 0 && current[1] + next[1] === 0) return state
  return { ...state, nextDirection: direction }
}
export function stepSnake(state, random = Math.random) {
  if (state.over) return state
  const [dx, dy] = directions[state.nextDirection]
  const head = { x: state.body[0].x + dx, y: state.body[0].y + dy }
  const eating = state.food && head.x === state.food.x && head.y === state.food.y
  const occupied = eating ? state.body : state.body.slice(0, -1)
  if (head.x < 0 || head.y < 0 || head.x >= state.size || head.y >= state.size || occupied.some(point => point.x === head.x && point.y === head.y)) {
    return { ...state, over: true }
  }
  const body = [head, ...state.body]
  if (!eating) body.pop()
  const food = eating ? foodFor(body, state.size, random) : state.food
  return { ...state, body, food, direction: state.nextDirection, score: state.score + (eating ? 10 : 0), over: !food, won: !food }
}
