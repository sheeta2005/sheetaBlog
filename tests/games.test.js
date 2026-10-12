import test from 'node:test'
import assert from 'node:assert/strict'
import { createSnake, turnSnake, stepSnake } from '../docs/.vitepress/theme/games/snake.js'
import { createCatGame, catNeighbors, escapePath, blockCat } from '../docs/.vitepress/theme/games/cat.js'
import { createTetris, movePiece, rotatePiece, dropPiece, stepTetris } from '../docs/.vitepress/theme/games/tetris.js'

import { canMove2048, create2048, move2048, restore2048 } from '../docs/.vitepress/theme/games/cat2048.js'
import { createBreakout, launchBall, movePaddle, stepBreakout, breakoutSize } from '../docs/.vitepress/theme/games/breakout.js'

// 用固定局面验证规则边界，避免随机游戏只能靠手动试出偶发问题。
test('蛇不能反向，单步前的多次输入也不能绕过反向保护', () => {
  const state = createSnake(() => .5)
  const up = turnSnake(state, 'up')
  assert.equal(turnSnake(up, 'left').nextDirection, 'up')
  assert.equal(turnSnake(state, 'left').nextDirection, 'right')
  assert.equal(stepSnake(up).direction, 'up')
})
test('蛇吃食物增长，食物不生成在蛇身上，边界可以穿越', () => {
  const state = createSnake(() => .5)
  state.food = { x: state.body[0].x + 1, y: state.body[0].y }
  const grown = stepSnake(state, () => 0)
  assert.equal(grown.body.length, state.body.length + 1)
  assert.equal(grown.score, 10)
  assert(!grown.body.some(point => point.x === grown.food.x && point.y === grown.food.y))
  grown.body[0] = { x: grown.size - 1, y: 0 }
  const crossed = stepSnake(grown)
  assert.equal(crossed.over, false)
  assert.deepEqual(crossed.body[0], { x: 0, y: 0 })
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

const zero = () => 0
const values = state => state.board.map(tile => tile?.value || 0)
function board2048(numbers) {
  return { ...create2048(zero), board: Array.from({ length: 16 }, (_, index) => numbers[index] ? { id: index + 1, value: numbers[index] } : null), nextId: 17 }
}

test('2048 一次移动只合并一次，不把新方块继续合并', () => {
  const state = board2048([2, 2, 4, 4])
  const moved = move2048(state, 'left', zero)
  assert.deepEqual(values(moved).slice(0, 4), [4, 8, 2, 0])
  assert.equal(moved.score, 12)
  assert.equal(state.score, 0)
  assert.deepEqual(values(state).slice(0, 4), [2, 2, 4, 4])
  assert.deepEqual(values(move2048(board2048([2, 2, 2, 2]), 'left', zero)).slice(0, 4), [4, 4, 2, 0])
})
for (const [direction, numbers, target] of [
  ['left', [0, 2, 0, 2], 0], ['right', [2, 0, 2, 0], 3],
  ['up', [2, 0, 0, 0, 0, 0, 0, 0, 2], 0], ['down', [2, 0, 0, 0, 2], 12]
]) test(`2048 向${direction}移动正确归并，且只补充一个方块`, () => {
  const moved = move2048(board2048(numbers), direction, zero)
  assert.equal(moved.board[target].value, 4)
  assert.equal(moved.board.filter(Boolean).length, 2)
  assert.equal(moved.score, 4)
})
test('2048 无效移动不生成方块、不改变分数', () => {
  const state = board2048([2, 4])
  assert.equal(move2048(state, 'left', () => { throw new Error('不应抽取新方块') }), state)
})
test('2048 胜利后可以继续合并，存档恢复分数和唯一标识', () => {
  const won = move2048(board2048([1024, 1024]), 'left', zero)
  assert.equal(won.won, true)
  assert.equal(won.score, 2048)
  const continued = move2048({ ...won, acknowledged: true }, 'down', zero)
  const restored = restore2048(JSON.parse(JSON.stringify(continued)))
  assert.equal(restored.acknowledged, true)
  assert.equal(restored.score, 2048)
  assert.deepEqual(values(restored), values(continued))
  assert.equal(new Set(restored.board.filter(Boolean).map(tile => tile.id)).size, restored.board.filter(Boolean).length)
})
test('2048 满盘但能合并仍可玩，无合法移动才结束', () => {
  const checker = board2048([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2])
  assert.equal(canMove2048(checker.board), false)
  assert.equal(restore2048(checker).over, true)
  checker.board[1] = { id: 2, value: 2 }
  assert.equal(canMove2048(checker.board), true)
  assert.equal(restore2048(checker).over, false)
})
test('2048 损坏和重复标识的存档不能恢复', () => {
  assert.equal(restore2048(null), null)
  const state = board2048([2, 4])
  assert.equal(restore2048({ ...state, score: -1 }), null)
  state.board[1].id = state.board[0].id
  assert.equal(restore2048(state), null)
  state.board[1] = { id: 2, value: 3 }
  assert.equal(restore2048(state), null)
})

test('打砖块未发球时不会自动掉落，挡板边界受约束', () => {
  const state = createBreakout()
  assert.deepEqual(stepBreakout(state, .05).ball, state.ball)
  const left = movePaddle(state, -100), right = movePaddle(state, 900)
  assert.equal(left.paddle.x, 0)
  assert.equal(right.paddle.x + right.paddle.width, 800)
  assert.equal(left.ball.x, left.paddle.width / 2)
  assert.equal(launchBall(state).ball.launched, true)
  assert.equal(launchBall(launchBall(state)).ball.launched, true)
})
for (const [edge, ball] of [
  ['左', { x: 21, y: 300, vx: -320, vy: 0 }],
  ['右', { x: 779, y: 300, vx: 320, vy: 0 }],
  ['顶', { x: 400, y: 21, vx: 0, vy: -320 }]
]) test(`打砖块${edge}边界反弹且不越界`, () => {
  const moved = stepBreakout({ ...createBreakout(), fish: [{ id: 99, x: 650, y: 100, width: 50, height: 20 }], ball: { ...ball, launched: true } }, .04)
  assert.ok(moved.ball.x >= 20 && moved.ball.x <= 780 && moved.ball.y >= 20)
  assert.ok(edge === '顶' ? moved.ball.vy > 0 : edge === '左' ? moved.ball.vx > 0 : moved.ball.vx < 0)
})
test('打砖块挡板反弹角度取决于接球位置，速度保持一致', () => {
  const state = createBreakout()
  const at = x => stepBreakout({ ...state, ball: { x, y: breakoutSize.paddleY - 21, vx: 0, vy: 320, launched: true } }, .02).ball
  const left = at(360), middle = at(400), right = at(440)
  assert.ok(left.vx < 0 && right.vx > 0 && middle.vx === 0)
  assert.ok(left.vy < 0 && right.vy < 0)
  assert.ok(Math.abs(Math.hypot(left.vx, left.vy) - 320) < .001)
})
function eat(state) {
  const fish = state.fish[0]
  return stepBreakout({ ...state, ball: { x: fish.x + fish.width / 2, y: fish.y + fish.height + 21, vx: 0, vy: -400, launched: true } }, .02)
}
test('打砖块鱼干只计分一次，碰撞触发表情，连续吃鱼增加连击', () => {
  const state = { ...createBreakout(), fish: Array.from({ length: 4 }, (_, index) => ({ id: index, x: 50 + index * 170, y: 100, width: 76, height: 27 })) }, first = eat(state)
  assert.equal(first.score, 10)
  assert.equal(first.fish.length, state.fish.length - 1)
  assert.ok(first.ball.vy > 0)
  assert.equal(first.streak, 1)
  assert.ok(first.fed > 0)
  assert.equal(stepBreakout(first, .03).score, 10)
  const third = eat(eat(first))
  assert.equal(third.streak, 3)
  assert.equal(third.score, 30)
})
test('打砖块三条命用完结束，中途掉落后等待玩家重新发球', () => {
  let state = createBreakout()
  for (let remaining = 2; remaining >= 0; remaining--) {
    state = stepBreakout({ ...state, ball: { x: 100, y: 530, vx: 0, vy: 320, launched: true } }, .01)
    assert.equal(state.lives, remaining)
    assert.equal(state.ball.launched, false)
    assert.equal(state.over, remaining === 0)
    assert.equal(state.sad, 1)
  }
  assert.equal(state.won, false)
  assert.equal(launchBall(state), state)
})
test('打砖块清盘进入下一关，第三关清盘才获胜', () => {
  let state = createBreakout()
  for (let level = 1; level <= 3; level++) {
    state = eat({ ...state, fish: [state.fish[0]] })
    assert.equal(state.score, level * 10)
    assert.equal(state.lives, 3)
    if (level < 3) { assert.equal(state.level, level + 1); assert.equal(state.ball.launched, false); assert.equal(state.over, false) }
    else { assert.equal(state.won, true); assert.equal(state.over, true) }
  }
})
test('打砖块后台长帧不产生跨屏跳跃，更新不改动旧状态', () => {
  const state = { ...createBreakout(), ball: { x: 400, y: 300, vx: 320, vy: 0, launched: true } }
  const moved = stepBreakout(state, 3)
  assert.ok(Math.abs(moved.ball.x - 416) < .001)
  assert.equal(state.ball.x, 400)
})

// 统一外壳不改变原有三款游戏的基本规则。
test('贪吃蛇穿过四边，不会因越界结束，撞身子仍结束', () => {
  for (const [direction, head, expected] of [
    ['left', { x: 0, y: 10 }, { x: 19, y: 10 }], ['right', { x: 19, y: 10 }, { x: 0, y: 10 }],
    ['up', { x: 10, y: 0 }, { x: 10, y: 19 }], ['down', { x: 10, y: 19 }, { x: 10, y: 0 }]
  ]) {
    const state = { ...createSnake(zero), body: [head], direction, nextDirection: direction, food: { x: 5, y: 5 } }
    const moved = stepSnake(state, zero)
    assert.deepEqual(moved.body[0], expected)
    assert.equal(moved.over, false)
  }
  const initial = createSnake(zero)
  assert.equal(turnSnake(initial, 'left'), initial)
  const collision = { ...initial, body: [{ x: 19, y: 10 }, { x: 0, y: 10 }, { x: 1, y: 10 }] }
  assert.equal(stepSnake(collision).over, true)
})
