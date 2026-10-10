<script setup>
import { computed } from 'vue'
import { data as articles } from '../../../misc/misc.data.js'
import GameArtwork from './GameArtwork.vue'

const games = [
  { kind: 'snake', title: '贪吃蛇', description: '吃一颗小莓果，长一点点。给薄荷小蛇留一条回头路。', url: '/misc/games/snake.html' },
  { kind: 'cat', title: '围堵猫猫', description: '一格叶片，一步猫爪。留住这位想从边缘溜走的小客人。', url: '/misc/games/cat.html' },
  { kind: 'tetris', title: '俄罗斯方块', description: '旋转、落下、消除。把零散的小色块安放成整齐的一行。', url: '/misc/games/tetris.html' }
]
const notes = computed(() => articles.filter(article => article.category === '杂项随记'))
const previous = computed(() => articles.filter(article => article.category === '已有文章'))
</script>

<template>
  <main class="misc-page">
    <header class="misc-hero"><p class="misc-eyebrow"><span aria-hidden="true">✧</span> 把日子放慢一点</p><h1>杂项</h1><p>写代码之外，也留一点空白。这里放小游戏、课程记录，以及偶尔想写下来的事。</p></header>
    <section aria-labelledby="misc-games-heading">
      <div class="misc-section-heading"><h2 id="misc-games-heading">玩一小会儿</h2><p>三种小乐趣，不必赶时间。</p></div>
      <div class="misc-games"><a v-for="game in games" :key="game.kind" :href="game.url" class="misc-game-card"><GameArtwork :kind="game.kind" /><div class="misc-game-info"><h3>{{ game.title }}</h3><p>{{ game.description }}</p><span class="misc-game-link">开始一局 <span aria-hidden="true">→</span></span></div></a></div>
    </section>
    <section aria-labelledby="misc-notes-heading">
      <div class="misc-section-heading"><h2 id="misc-notes-heading">文章与随记</h2><p>想到什么，就写一点什么。</p></div>
      <div v-if="notes.length" class="misc-article-list"><a v-for="article in notes" :key="article.url" :href="article.url"><div><h3>{{ article.title }}</h3><p v-if="article.description">{{ article.description }}</p></div><span aria-hidden="true">→</span></a></div>
      <p v-else class="misc-empty">新的随记，会慢慢写在这里。</p>
    </section>
    <section v-if="previous.length" aria-labelledby="misc-previous-heading">
      <div class="misc-section-heading"><h2 id="misc-previous-heading">已有文章</h2><p>过去留下的课程记录。</p></div>
      <div class="misc-article-list"><a v-for="article in previous" :key="article.url" :href="article.url"><div><h3>{{ article.title }}</h3></div><span aria-hidden="true">→</span></a></div>
    </section>
  </main>
</template>
