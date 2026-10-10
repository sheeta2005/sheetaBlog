<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const settings = ref(null)
const fontSize = ref(17)
const storageKey = 'sheeta-reading-size'
const defaultSize = ref(17)

// 只改变文章正文基准字号，首页、导航和侧栏维持原有尺寸。
function applySize(value) {
  const nextSize = Math.min(40, Math.max(10, Math.round(Number(value) || defaultSize.value)))
  fontSize.value = nextSize
  document.documentElement.style.setProperty('--reading-font-size', `${nextSize}px`)
  try {
    localStorage.setItem(storageKey, String(nextSize))
  } catch {
    // 浏览器禁止存储时，当前页面仍然可以正常调整字号。
  }
}

function closeOnOutsideClick(event) {
  if (settings.value && !settings.value.contains(event.target)) {
    settings.value.open = false
  }
}

function closeOnEscape() {
  settings.value.open = false
  settings.value.querySelector('summary').focus()
}

onMounted(() => {
  defaultSize.value = window.matchMedia('(max-width: 767px)').matches ? 16 : 17
  // 静态构建不读取浏览器偏好，挂载后恢复本站上次保存的字号。
  try {
    const saved = localStorage.getItem(storageKey)
    // 原四档偏好换算成像素，升级后继续保留用户之前的选择。
    const oldScale = { small: .9, standard: 1, large: 1.1, 'extra-large': 1.2 }[saved]
    const pixels = oldScale ? defaultSize.value * oldScale : Number(saved)
    applySize(pixels >= 10 && pixels <= 40 ? pixels : defaultSize.value)
  } catch {
    applySize(defaultSize.value)
  }
  document.addEventListener('pointerdown', closeOnOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', closeOnOutsideClick)
})
</script>

<template>
  <details ref="settings" class="reading-settings" @keydown.esc.prevent="closeOnEscape">
    <summary aria-label="阅读设置" title="阅读设置">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path d="M4 5h16M4 12h16M4 19h16" />
        <path d="M8 2v6M16 9v6M10 16v6" />
      </svg>
      <span class="settings-label">阅读设置</span>
    </summary>
    <div class="settings-panel">
      <fieldset>
        <legend>正文大小 <strong>{{ fontSize }}px</strong></legend>
        <div class="size-control">
          <span aria-hidden="true">10</span>
          <input
            v-model.number="fontSize"
            type="range"
            min="10"
            max="40"
            step="1"
            aria-label="正文大小"
            :aria-valuetext="`${fontSize} 像素`"
            @input="applySize(fontSize)"
          >
          <span aria-hidden="true">40</span>
        </div>
        <div class="size-scale" aria-hidden="true"><span>更小</span><span>更大</span></div>
      </fieldset>
      <p>文章页会记住你的字号偏好</p>
      <button type="button" @click="applySize(defaultSize)">恢复默认（{{ defaultSize }}px）</button>
    </div>
  </details>
</template>

<style scoped>
/* 同一入口同时服务桌面与手机，面板沿用本站双主题色。 */
.reading-settings {
  position: relative;
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 14px;
  line-height: 1.5;
}

summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 36px;
  min-height: 36px;
  border-radius: 8px;
  cursor: pointer;
  list-style: none;
  color: var(--vp-c-text-1);
}

summary::-webkit-details-marker {
  display: none;
}

summary:hover,
summary:focus-visible {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.settings-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 268px;
  max-width: calc(100vw - 48px);
  padding: 20px;
  border: 1px solid var(--summer-border);
  border-radius: 18px;
  background: var(--summer-settings-bg);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: var(--vp-c-text-1);
  box-shadow: var(--summer-shadow);
  white-space: normal;
}

/* 面板只在展开时轻柔入场，不影响正文的稳定阅读。 */
details[open] .settings-panel {
  animation: settings-unfold 180ms ease-out;
}

@keyframes settings-unfold {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  details[open] .settings-panel { animation: none; }
}

fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.size-control {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

input[type='range'] {
  width: 100%;
  height: 28px;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}

.size-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  color: var(--vp-c-text-3);
  font-size: 11px;
}

input[type='range']:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

legend strong { color: var(--vp-c-brand-1); font-variant-numeric: tabular-nums; }

p {
  margin: 14px 0 8px;
  color: var(--vp-c-text-2);
}

button {
  color: var(--vp-c-brand-1);
  cursor: pointer;
  padding: 4px 0;
}

@media (max-width: 1279px) {
  .settings-label {
    display: none;
  }
}

@media (max-width: 767px) {
  .reading-settings {
    margin-left: 0;
  }
}

/* 窄屏面板相对视口定位，避免被右侧导航按钮挤出左边界。 */
@media (max-width: 639px) {
  .settings-panel {
    position: fixed;
    top: calc(var(--vp-nav-height) + 8px);
    left: 16px;
    right: 16px;
    width: auto;
    max-width: none;
  }
}
</style>
