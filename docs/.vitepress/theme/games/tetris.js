export const shapes = {
  1: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  2: [[2, 2], [2, 2]],
  3: [[0, 3, 0], [3, 3, 3], [0, 0, 0]],
  4: [[0, 4, 4], [4, 4, 0], [0, 0, 0]],
  5: [[5, 5, 0], [0, 5, 5], [0, 0, 0]],
  6: [[6, 0, 0], [6, 6, 6], [0, 0, 0]],
  7: [[0, 0, 7], [7, 7, 7], [0, 0, 0]]
}
function shuffledBag(random) {
  const bag = [1, 2, 3, 4, 5, 6, 7]
  for (let index = bag.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[bag[index], bag[other]] = [bag[other], bag[index]]
  }
  return bag
}
function piece(type) {
  const matrix = shapes[type].map(row => [...row])
  return { type, matrix, x: Math.floor((10 - matrix[0].length) / 2), y: -1 }
}
export function fits(board, current) {
  return current.matrix.every((row, y) => row.every((value, x) => {
    if (!value) return true
    const col = current.x + x, line = current.y + y
    return col >= 0 && col < 10 && line < 20 && (line < 0 || board[line][col] === 0)
  }))
}
export function createTetris(random = Math.random) {
  const bag = shuffledBag(random), current = piece(bag.shift()), next = bag.shift()
  return { board: Array.from({ length: 20 }, () => Array(10).fill(0)), current, next, bag, score: 0, lines: 0, over: false }
}
export function movePiece(state, dx, dy) {
  if (state.over) return state
  const current = { ...state.current, x: state.current.x + dx, y: state.current.y + dy }
  return fits(state.board, current) ? { ...state, current } : state
}
export function rotatePiece(state) {
  if (state.over || state.current.type === 2) return state
  const original = state.current.matrix
  const matrix = original[0].map((_, x) => original.map(row => row[x]).reverse())
  // 在墙边或底部尝试小幅移位，旋转始终通过同一碰撞检查。
  for (const dy of [0, -1, -2]) for (const dx of [0, -1, 1, -2, 2]) {
    const current = { ...state.current, matrix, x: state.current.x + dx, y: state.current.y + dy }
    if (fits(state.board, current)) return { ...state, current }
  }
  return state
}
export function landingY(state) {
  let y = state.current.y
  while (fits(state.board, { ...state.current, y: y + 1 })) y++
  return y
}
function lockPiece(state, random) {
  const board = state.board.map(row => [...row])
  let above = false
  state.current.matrix.forEach((row, y) => row.forEach((value, x) => {
    if (!value) return
    const line = state.current.y + y
    if (line < 0) above = true
    else board[line][state.current.x + x] = value
  }))
  if (above) return { ...state, over: true }
  const remaining = board.filter(row => row.some(value => value === 0))
  const cleared = 20 - remaining.length
  while (remaining.length < 20) remaining.unshift(Array(10).fill(0))
  const bag = state.bag.length ? [...state.bag] : shuffledBag(random)
  const current = piece(state.next), next = bag.shift()
  const score = state.score + [0, 100, 300, 500, 800][cleared] * (Math.floor(state.lines / 10) + 1)
  return { ...state, board: remaining, current, next, bag, score, lines: state.lines + cleared, over: !fits(remaining, current) }
}
export function stepTetris(state, random = Math.random) {
  if (state.over) return state
  const moved = movePiece(state, 0, 1)
  return moved === state ? lockPiece(state, random) : moved
}
export function dropPiece(state, random = Math.random) {
  if (state.over) return state
  const y = landingY(state)
  return lockPiece({ ...state, current: { ...state.current, y }, score: state.score + (y - state.current.y) * 2 }, random)
}
