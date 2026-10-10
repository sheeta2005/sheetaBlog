<script setup>
import CatFace from './CatFace.vue'
defineProps({ kind: String })
</script>

<template>
  <!-- 三款游戏使用同一组柔和色块，插画与实际棋盘呼应。 -->
  <div class="game-art" aria-hidden="true">
    <svg v-if="kind === 'snake'" viewBox="0 0 180 140">
      <path d="M43 105H74Q89 105 89 90V65Q89 48 106 48H123" fill="none" stroke="var(--snake-body)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="111" y="35" width="30" height="27" rx="11" fill="var(--game-accent)" />
      <circle cx="130" cy="43" r="2" fill="var(--game-eye)" /><circle cx="130" cy="54" r="2" fill="var(--game-eye)" />
      <circle cx="46" cy="53" r="11" fill="var(--game-berry)" /><path d="M44 40Q50 28 59 35Q55 43 44 40" fill="var(--snake-body)" />
      <path d="M139 96v10m-5-5h10M48 19v6m-3-3h6" stroke="var(--game-accent)" stroke-width="1.5" opacity=".45" />
    </svg>
    <svg v-else-if="kind === 'cat'" viewBox="0 0 180 140">
      <g fill="none" stroke="var(--game-accent)" stroke-width="1" opacity=".18"><path d="M23 61 34 42h22l11 19-11 19H34Z" /><path d="m114 94 11-19h22l11 19-11 19h-22Z" /><path d="m106 28 7-12h14l7 12-7 12h-14Z" /></g>
      <CatFace x="45" y="24" width="90" height="90" happy />
      <path d="M35 108Q30 91 48 86Q53 104 35 108Zm0 0 9-15" fill="var(--snake-body)" stroke="var(--game-accent)" stroke-width="1" />
      <path d="M146 49v10m-5-5h10" stroke="var(--game-accent)" stroke-width="1.5" opacity=".45" />
    </svg>
    <svg v-else viewBox="0 0 180 140">
      <g fill="var(--tile-1)"><rect x="34" y="83" width="24" height="24" rx="5" /><rect x="60" y="83" width="24" height="24" rx="5" /><rect x="86" y="83" width="24" height="24" rx="5" /></g>
      <g fill="var(--tile-2)"><rect x="112" y="83" width="24" height="24" rx="5" /><rect x="112" y="57" width="24" height="24" rx="5" /></g>
      <g fill="var(--tile-3)"><rect x="34" y="57" width="24" height="24" rx="5" /><rect x="60" y="57" width="24" height="24" rx="5" /><rect x="60" y="31" width="24" height="24" rx="5" /></g>
      <rect x="86" y="57" width="24" height="24" rx="5" fill="var(--tile-5)" />
      <path d="M137 27v10m-5-5h10M28 27v6m-3-3h6" stroke="var(--game-accent)" stroke-width="1.5" opacity=".45" />
    </svg>
  </div>
</template>
