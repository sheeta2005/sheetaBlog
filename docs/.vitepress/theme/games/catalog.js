// 游戏入口只维护介绍与动态导入函数；浏览卡片不会下载任何游戏运行代码。
export const games = [
  { id: 'snake', title: '贪吃蛇', description: '还要编织多久，才能织成美丽的形状呢。', category: '街机', controls: '方向键 / 方向按钮', load: () => import('./SnakeGame.vue') },
  { id: 'cat', title: '围堵猫猫', description: '幸福来时不会自己敲门，走时又难以留住。', category: '益智', controls: '点击 / 触摸', load: () => import('./CatGame.vue') },
  { id: 'tetris', title: '俄罗斯方块', description: '走错一步就会倒霉的游戏。', category: '街机', controls: '方向键 / 方向按钮', load: () => import('./TetrisGame.vue') },
  { id: '2048', title: '猫猫 2048', description: '两只一样的小猫，会变成怎样的新表情呢。', category: '益智', controls: '方向键 / 滑动', load: () => import('./Cat2048Game.vue') },
  { id: 'breakout', title: '猫猫吃鱼干', description: '弹起来的小猫，和一整盘小鱼干。', category: '街机', controls: '鼠标 / 方向键 / 拖动', load: () => import('./BreakoutGame.vue') }
].map(game => ({ ...game, url: `/misc/games/${game.id}.html` }))
