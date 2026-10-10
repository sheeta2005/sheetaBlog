import test from 'node:test'
import assert from 'node:assert/strict'
import { createSnake, turnSnake, stepSnake } from '../docs/.vitepress/theme/games/snake.js'
import { createCatGame, catNeighbors, escapePath, blockCat } from '../docs/.vitepress/theme/games/cat.js'
import { createTetris, movePiece, rotatePiece, dropPiece, stepTetris } from '../docs/.vitepress/theme/games/tetris.js'

// 用固定局面验证规则边界，避免随机游戏只能靠手动试出偶发问题。
test('蛇不能反向，单步前的多次输入也不能绕过反向保护', () => {
  const state = createSnake(() => .5)
  const up = turnSnake(state, 'up')
  assert.equal(turnSnake(up, 'left').nextDirection, 'up')
  assert.equal(turnSnake(state, 'left').nextDirection, 'right')
  assert.equal(stepSnake(up).direction, 'up')
})
test('蛇吃食物增长，食物不生成在蛇身上，碰墙结束', () => {
  const state = createSnake(() => .5)
  state.food = { x: state.body[0].x + 1, y: state.body[0].y }
  const grown = stepSnake(state, () => 0)
  assert.equal(grown.body.length, state.body.length + 1)
  assert.equal(grown.score, 10)
  assert(!grown.body.some(point => point.x === grown.food.x && point.y === grown.food.y))
  grown.body[0] = { x: grown.size - 1, y: 0 }
  assert.equal(stepSnake(grown).over, true)
})
test('蛇能进入即将移开的尾格，但不能撞仍然占据的身体', () => {
  const state = { ...createSnake(), body: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 1, y: 3 }, { x: 1, y: 2 }], direction: 'up', nextDirection: 'left', food: { x: 8, y: 8 } }
  assert.equal(stepSnake(state).over, false)
  state.body[3] = { x: 0, y: 2 }
  state.body[2] = { x: 1, y: 2 }
  assert.equal(stepSnake(state).over, true)
})
test('交错棋盘相邻关系对称，初始猫猫有逃离路线', () => {
  for (let row = 0; row < 9; row++) for (let col = 0; col < 9; col++) {
    const cell = { row, col }
    catNeighbors(cell, 9).forEach(other => assert(catNeighbors(other, 9).some(point => point.row === row && point.col === col)))
  }
  const game = createCatGame(() => .37)
  assert(escapePath(game.blocked, game.cat, game.size))
  assert.equal(game.blocked.size, 9)
})
test('猫猫不会走过封闭格子，边缘逃离与围住获胜可区分', () => {
  const game = { size: 9, blocked: new Set(), cat: { row: 1, col: 4 }, moves: 0, result: '' }
  const escaped = blockCat(game, { row: 8, col: 8 })
  assert.equal(escaped.result, 'lost')
  const trapped = { ...game, cat: { row: 4, col: 4 } }
  const ring = catNeighbors(trapped.cat, 9)
  trapped.blocked = new Set(ring.slice(1).map(point => `${point.row},${point.col}`))
  const won = blockCat(trapped, ring[0])
  assert.equal(won.result, 'won')
  assert.equal(won.moves, 1)
  assert.equal(blockCat(won, { row: 0, col: 0 }), won)
})
test('方块在边界旋转可调整位置，四次旋转保持形状', () => {
  const state = createTetris(() => .5)
  state.current = { type: 3, matrix: [[0, 3, 0], [3, 3, 3], [0, 0, 0]], x: 3, y: 2 }
  let rotated = state
  for (let i = 0; i < 4; i++) rotated = rotatePiece(rotated)
  assert.deepEqual(rotated.current.matrix, state.current.matrix)
  const edge = { ...state, current: { type: 1, matrix: [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]], x: -2, y: 2 } }
  assert.notEqual(rotatePiece(edge), edge)
  assert.equal(movePiece(state, -9, 0), state)
})
test('硬降填满一行会消行计分；锁定在顶部之外结束', () => {
  const state = createTetris(() => .5)
  state.board[19] = [0, 0, 0, 0, 2, 2, 2, 2, 2, 2]
  state.current = { type: 1, matrix: [[1, 1, 1, 1]], x: 0, y: 0 }
  const cleared = dropPiece(state)
  assert.equal(cleared.lines, 1)
  assert(cleared.score >= 100)
  assert.equal(cleared.board.length, 20)
  assert(cleared.board[19].every(value => value === 0))
  state.current = { type: 2, matrix: [[2, 2], [2, 2]], x: 3, y: -1 }
  state.board[1][3] = 4
  assert.equal(stepTetris(state).over, true)
})
test('一袋方块包含七种，游戏结束后不会继续移动', () => {
  const state = createTetris(() => .5)
  assert.equal(new Set([state.current.type, state.next, ...state.bag]).size, 7)
  const ended = { ...state, over: true }
  assert.equal(stepTetris(ended), ended)
  assert.equal(dropPiece(ended), ended)
})
