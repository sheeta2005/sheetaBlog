const key = point => `${point.row},${point.col}`
const atEdge = (point, size) => point.row === 0 || point.col === 0 || point.row === size - 1 || point.col === size - 1

// 奇数行向右错开半格，保证六个邻居的关系在两种行上互相对称。
export function catNeighbors(point, size) {
  const shift = point.row % 2 ? 1 : -1
  return [[0, -1], [0, 1], [-1, 0], [-1, shift], [1, 0], [1, shift]]
    .map(([row, col]) => ({ row: point.row + row, col: point.col + col }))
    .filter(cell => cell.row >= 0 && cell.col >= 0 && cell.row < size && cell.col < size)
}
export function escapePath(blocked, cat, size) {
  const queue = [[cat]], visited = new Set([key(cat)])
  for (let index = 0; index < queue.length; index++) {
    const path = queue[index], last = path[path.length - 1]
    if (atEdge(last, size)) return path
    catNeighbors(last, size).forEach(cell => {
      const id = key(cell)
      if (blocked.has(id) || visited.has(id)) return
      visited.add(id)
      queue.push([...path, cell])
    })
  }
  return null
}
export function createCatGame(random = Math.random) {
  const size = 9, cat = { row: 4, col: 4 }, blocked = new Set()
  const candidates = []
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
    if (row !== cat.row || col !== cat.col) candidates.push({ row, col })
  }
  for (let index = candidates.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[candidates[index], candidates[other]] = [candidates[other], candidates[index]]
  }
  // 初始障碍随机分布，但始终留一条逃离路线，避免开局直接获胜。
  for (const cell of candidates) {
    blocked.add(key(cell))
    if (!escapePath(blocked, cat, size)) blocked.delete(key(cell))
    if (blocked.size === 9) break
  }
  return { size, cat, blocked, moves: 0, result: '' }
}
export function blockCat(state, cell) {
  if (state.result || cell.row < 0 || cell.col < 0 || cell.row >= state.size || cell.col >= state.size || state.blocked.has(key(cell)) || key(cell) === key(state.cat)) return state
  const blocked = new Set(state.blocked)
  blocked.add(key(cell))
  const path = escapePath(blocked, state.cat, state.size)
  const moves = state.moves + 1
  if (!path) return { ...state, blocked, moves, result: 'won' }
  const cat = path[1] || state.cat
  return { ...state, blocked, moves, cat, result: atEdge(cat, state.size) ? 'lost' : '' }
}
