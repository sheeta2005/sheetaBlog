// 纯规则只处理棋盘与分数，动画和浏览器存档由游戏界面负责。
function spawn(state, random) {
  const free = state.board.map((tile, index) => tile ? -1 : index).filter(index => index >= 0)
  if (!free.length) return state
  const board = [...state.board]
  board[free[Math.floor(random() * free.length)]] = { id: state.nextId, value: random() < .9 ? 2 : 4 }
  return { ...state, board, nextId: state.nextId + 1 }
}
export function canMove2048(board) {
  return board.some((tile, index) => !tile || (index % 4 < 3 && board[index + 1]?.value === tile.value) || (index < 12 && board[index + 4]?.value === tile.value))
}
export function create2048(random = Math.random) {
  return spawn(spawn({ board: Array(16).fill(null), nextId: 1, score: 0, won: false, acknowledged: false, over: false, merged: [] }, random), random)
}
export function move2048(state, direction, random = Math.random) {
  if (state.over || !['left', 'right', 'up', 'down'].includes(direction)) return state
  const board = Array(16).fill(null), merged = []
  let score = state.score
  for (let line = 0; line < 4; line++) {
    const indexes = Array.from({ length: 4 }, (_, offset) => direction === 'left' ? line * 4 + offset : direction === 'right' ? line * 4 + 3 - offset : direction === 'up' ? offset * 4 + line : (3 - offset) * 4 + line)
    const tiles = indexes.map(index => state.board[index]).filter(Boolean)
    const result = []
    for (let index = 0; index < tiles.length; index++) {
      const tile = tiles[index]
      // 一次移动中合并后跳过第二块，新方块不能在同一回合再次合并。
      if (tiles[index + 1]?.value === tile.value) {
        result.push({ id: tile.id, value: tile.value * 2 })
        score += tile.value * 2
        merged.push(tile.id)
        index++
      } else result.push(tile)
    }
    result.forEach((tile, offset) => { board[indexes[offset]] = tile })
  }
  // 无效方向不生成方块，也不改变分数或已有动画状态。
  if (board.every((tile, index) => tile?.id === state.board[index]?.id && tile?.value === state.board[index]?.value)) return state
  const moved = spawn({ ...state, board, score, merged, won: state.won || board.some(tile => tile?.value >= 2048) }, random)
  return { ...moved, over: !canMove2048(moved.board) }
}

// 只恢复本游戏的合法存档，损坏或旧格式存档不会影响开局。
export function restore2048(saved) {
  if (!saved || !Array.isArray(saved.board) || saved.board.length !== 16 || !Number.isSafeInteger(saved.score) || saved.score < 0) return null
  const tiles = saved.board.filter(Boolean)
  if (tiles.length < 2 || tiles.some(tile => !Number.isSafeInteger(tile.id) || tile.id < 1 || !Number.isSafeInteger(tile.value) || tile.value < 2 || !Number.isInteger(Math.log2(tile.value)))) return null
  if (new Set(tiles.map(tile => tile.id)).size !== tiles.length) return null
  return { board: saved.board, score: saved.score, nextId: Math.max(...tiles.map(tile => tile.id)) + 1, won: tiles.some(tile => tile.value >= 2048), acknowledged: saved.acknowledged === true, over: !canMove2048(saved.board), merged: [] }
}
