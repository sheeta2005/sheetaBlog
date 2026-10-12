<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { games } from './catalog.js'
import GameArtwork from './GameArtwork.vue'
import CatFace from './CatFace.vue'

const props = defineProps({ id: String })
const info = computed(() => games.find(game => game.id === props.id))
const game = shallowRef(null), instance = ref(null), status = ref('idle')
let active = true

// 用户开始时才执行动态导入，加载失败可重试；离开页面后不挂载迟到的游戏。
async function load() {
  if (status.value === 'loading') return
  status.value = 'loading'
  try {
    const module = await info.value.load()
    if (!active) return
    game.value = module.default
    await nextTick()
    // 准备页换成棋盘后对齐页面顶部，避免浏览器保留按钮位置而裁掉游戏标题。
    window.scrollTo({ top: 0, behavior: 'instant' })
    await instance.value?.start()
  } catch {
    if (active) status.value = 'error'
  }
}
// 浏览器会记住失败的模块请求；重试刷新当前游戏入口，避免反复使用失败缓存。
function retry() { location.replace(`${info.value.url}?play=1`) }
onMounted(() => {
  // 列表的“开始一局”承接明确的游玩意图，直接访问地址则先展示准备页。
  if (new URLSearchParams(location.search).get('play') === '1') load()
})
onUnmounted(() => { active = false })
</script>

<template>
  <component v-if="game" :is="game" ref="instance" />
  <main v-else class="game-portal">
    <a class="misc-back" href="/misc/">← 返回杂项</a>
    <section class="game-preparation" :aria-busy="status === 'loading'">
      <p class="misc-eyebrow"><span aria-hidden="true">✧</span> 留一点时间，玩一会儿。</p>
      <h1>{{ info.title }}</h1>
      <p class="game-preparation-description">{{ info.description }}</p>
      <GameArtwork v-if="status === 'idle'" :kind="id" />
      <div v-else class="game-loading-art" :class="{ 'is-loading': status === 'loading' }" aria-hidden="true">
        <CatFace class="loading-cat" happy />
        <div class="loading-fishes"><svg v-for="fish in 3" :key="fish" viewBox="0 0 50 24"><path d="M10 12C18-1 34-1 43 12C34 25 18 25 10 12L2 4v16Z" fill="currentColor" /><circle cx="35" cy="10" r="1.4" fill="var(--cat-line)" /></svg></div>
      </div>
      <p class="game-load-status" role="status">{{ status === 'loading' ? '正在准备游戏…' : status === 'error' ? '这次没能准备好，再试一次吧。' : info.controls }}</p>
      <button v-if="status !== 'loading'" class="game-button primary" @click="status === 'error' ? retry() : load()">{{ status === 'error' ? '重试' : '开始游戏' }}</button>
      <a v-if="status === 'error'" class="game-load-back" href="/misc/">返回杂项</a>
    </section>
  </main>
</template>
