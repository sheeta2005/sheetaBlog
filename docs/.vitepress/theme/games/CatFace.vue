<script setup>
import { computed } from 'vue'
import { catOutline } from './catShape.js'
const props = defineProps({ happy: Boolean, expression: { type: String, default: 'normal' } })
const joyful = computed(() => props.happy || ['happy', 'smug', 'delighted'].includes(props.expression))
</script>

<template>
  <!-- 猫猫头使用同一套矢量轮廓，游戏卡片和棋盘不会出现不同风格的猫。 -->
  <svg class="cat-face" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path :d="catOutline" fill="var(--cat-fur)" stroke="var(--cat-line)" stroke-width="3" stroke-linejoin="round" />
    <path d="m22 20 4 20 10-9M78 20l-4 20-10-9" fill="var(--cat-blush)" opacity=".6" />
    <!-- 合并等级用表情区分，数字仍保留，避免只凭颜色认方块。 -->
    <path v-if="expression === 'sleepy'" d="M29 56h12m18 0h12" stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round" />
    <path v-else-if="expression === 'smug'" d="m29 52 12 4-12 3m42-7-12 4 12 3" stroke="var(--cat-line)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <path v-else-if="joyful" d="M29 55q6-8 12 0M59 55q6-8 12 0" stroke="var(--cat-line)" stroke-width="3.5" stroke-linecap="round" />
    <g v-else-if="expression === 'curious'" fill="var(--cat-line)"><circle cx="35" cy="54" r="5" /><circle cx="65" cy="54" r="5" /><circle cx="36" cy="53" r="1.5" fill="var(--cat-fur)" /><circle cx="66" cy="53" r="1.5" fill="var(--cat-fur)" /></g>
    <g v-else fill="var(--cat-line)"><ellipse cx="35" cy="55" rx="3" ry="5" /><ellipse cx="65" cy="55" rx="3" ry="5" /></g>
    <ellipse cx="24" cy="67" rx="8" ry="4" fill="var(--cat-blush)" opacity=".55" /><ellipse cx="76" cy="67" rx="8" ry="4" fill="var(--cat-blush)" opacity=".55" />
    <path d="m46 64 4 4 4-4" fill="var(--cat-blush)" stroke="var(--cat-blush)" stroke-linejoin="round" stroke-width="2" />
    <path v-if="expression === 'delighted'" d="M40 73q10 17 20 0Z" fill="var(--cat-blush)" stroke="var(--cat-line)" stroke-width="2" />
    <path v-else d="M50 68v4q-5 6-10 0m10 0q5 6 10 0" stroke="var(--cat-line)" stroke-width="2" stroke-linecap="round" />
    <path d="m21 62-11-3m11 9-12 2m70-8 11-3m-11 9 12 2" stroke="var(--cat-line)" stroke-width="1.7" stroke-linecap="round" opacity=".45" />
  </svg>
</template>
