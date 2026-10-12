<script setup>
import { computed, ref } from 'vue'
import { data as notes } from '../../../misc/misc.data.js'
import GameArtwork from './GameArtwork.vue'
import { games } from './catalog.js'

// 分类仅筛选轻量介绍，卡片与游戏本体保持独立。
const category = ref('全部')
const visibleGames = computed(() => games.filter(game => category.value === '全部' || game.category === category.value))
</script>

<template>
  <main class="misc-page">
    <header class="misc-hero"><p class="misc-eyebrow"><span aria-hidden="true">✧</span> 日子要是可以慢一点就好了。</p><h1>杂项</h1><p>小游戏与感想。</p></header>
    <section aria-labelledby="misc-games-heading">
      <div class="misc-section-heading"><h2 id="misc-games-heading">game!</h2><p>摸鱼。</p></div>
      <div class="game-categories" role="group" aria-label="游戏分类"><button v-for="name in ['全部', '益智', '街机']" :key="name" type="button" :aria-pressed="category === name" @click="category = name">{{ name }}</button><span>{{ visibleGames.length }} 款小乐趣</span></div>
      <div class="misc-games"><a v-for="game in visibleGames" :key="game.id" :href="`${game.url}?play=1`" class="misc-game-card"><GameArtwork :kind="game.id" /><div class="misc-game-info"><span class="game-category">{{ game.category }}</span><h3>{{ game.title }}</h3><p>{{ game.description }}</p><small class="game-card-controls">{{ game.controls }}</small><span class="misc-game-link">开始一局 <span aria-hidden="true">→</span></span></div></a></div>
    </section>
    <section aria-labelledby="misc-notes-heading">
      <div class="misc-section-heading"><h2 id="misc-notes-heading">随笔</h2><p>已然越过深邃悠远的夏日。</p></div>
      <div v-if="notes.length" class="misc-article-list"><a v-for="article in notes" :key="article.url" :href="article.url"><div><h3>{{ article.title }}</h3><p v-if="article.description">{{ article.description }}</p></div><span aria-hidden="true">→</span></a></div>
      <p v-else class="misc-empty">会更新的，大概。</p>
    </section>
  </main>
</template>
