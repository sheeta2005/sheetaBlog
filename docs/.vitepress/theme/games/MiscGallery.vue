<script setup>
import { computed } from 'vue'
import { data as articles } from '../../../misc/misc.data.js'
import GameArtwork from './GameArtwork.vue'

const games = [
  { kind: 'snake', title: '贪吃蛇', description: '前进的时候，也要给自己留一条回头路。', url: '/misc/games/snake.html' },
  { kind: 'cat', title: '围堵猫猫', description: '幸福来时不会自己敲门，走时又难以留住。', url: '/misc/games/cat.html' },
  { kind: 'tetris', title: '俄罗斯方块', description: '追求完美。', url: '/misc/games/tetris.html' }
]
const notes = computed(() => articles.filter(article => article.category === '杂项随记'))
const previous = computed(() => articles.filter(article => article.category === '已有文章'))
</script>

<template>
  <main class="misc-page">
    <header class="misc-hero"><p class="misc-eyebrow"><span aria-hidden="true">✧</span> 日子要是可以慢一点就好了。</p><h1>杂项</h1><p>小游戏与感想。</p></header>
    <section aria-labelledby="misc-games-heading">
      <div class="misc-section-heading"><h2 id="misc-games-heading">game!</h2><p>摸鱼。</p></div>
      <div class="misc-games"><a v-for="game in games" :key="game.kind" :href="game.url" class="misc-game-card"><GameArtwork :kind="game.kind" /><div class="misc-game-info"><h3>{{ game.title }}</h3><p>{{ game.description }}</p><span class="misc-game-link">开始一局 <span aria-hidden="true">→</span></span></div></a></div>
    </section>
    <section aria-labelledby="misc-notes-heading">
      <div class="misc-section-heading"><h2 id="misc-notes-heading">文章与随记</h2><p>已然越过深邃悠远的夏日。</p></div>
      <div v-if="notes.length" class="misc-article-list"><a v-for="article in notes" :key="article.url" :href="article.url"><div><h3>{{ article.title }}</h3><p v-if="article.description">{{ article.description }}</p></div><span aria-hidden="true">→</span></a></div>
      <p v-else class="misc-empty">会更新的，大概。</p>
    </section>
    <section v-if="previous.length" aria-labelledby="misc-previous-heading">
      <div class="misc-section-heading"><h2 id="misc-previous-heading">已有文章</h2></div>
      <div class="misc-article-list"><a v-for="article in previous" :key="article.url" :href="article.url"><div><h3>{{ article.title }}</h3></div><span aria-hidden="true">→</span></a></div>
    </section>
  </main>
</template>
