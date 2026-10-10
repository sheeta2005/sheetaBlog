<script setup>
defineProps({ happy: Boolean })
</script>

<template>
  <!-- 猫猫头使用同一套矢量轮廓，游戏卡片和棋盘不会出现不同风格的猫。 -->
  <svg class="cat-face" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path d="M18 42 14 12Q14 8 21 12L39 26Q50 20 61 26L79 12Q86 8 86 14L82 43Q90 55 86 70Q82 90 50 91Q18 90 14 70Q10 54 18 42Z" fill="var(--cat-fur)" stroke="var(--cat-line)" stroke-width="3" stroke-linejoin="round" />
    <path d="m22 20 4 20 10-9M78 20l-4 20-10-9" fill="var(--cat-blush)" opacity=".6" />
    <path v-if="happy" d="M29 55q6-8 12 0M59 55q6-8 12 0" stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round" />
    <g v-else fill="var(--cat-line)"><ellipse cx="35" cy="55" rx="3" ry="5" /><ellipse cx="65" cy="55" rx="3" ry="5" /></g>
    <ellipse cx="24" cy="67" rx="8" ry="4" fill="var(--cat-blush)" opacity=".55" /><ellipse cx="76" cy="67" rx="8" ry="4" fill="var(--cat-blush)" opacity=".55" />
    <path d="m46 64 4 4 4-4" fill="var(--cat-blush)" stroke="var(--cat-blush)" stroke-linejoin="round" stroke-width="2" />
    <path d="M50 68v4q-5 6-10 0m10 0q5 6 10 0" stroke="var(--cat-line)" stroke-width="2" stroke-linecap="round" />
    <path d="m21 62-11-3m11 9-12 2m70-8 11-3m-11 9 12 2" stroke="var(--cat-line)" stroke-width="1.7" stroke-linecap="round" opacity=".45" />
  </svg>
</template>
