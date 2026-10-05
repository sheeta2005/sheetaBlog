<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const settings = ref(null)
const fontSize = ref('standard')
const storageKey = 'sheeta-reading-size'
const sizes = [
  { value: 'small', label: '偏小' },
  { value: 'standard', label: '标准' },
  { value: 'large', label: '偏大' },
  { value: 'extra-large', label: '特大' }
]

// 仅改变阅读文字的比例，图片、布局间距与导航尺寸保持独立。
function applySize(value) {
  fontSize.value = value
  document.documentElement.dataset.readingSize = value
  try {
    localStorage.setItem(storageKey, value)
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
  // 静态构建不读取浏览器偏好，挂载后恢复本站上次保存的字号。
  try {
    const saved = localStorage.getItem(storageKey)
    if (sizes.some(size => size.value === saved)) {
      fontSize.value = saved
      document.documentElement.dataset.readingSize = saved
    }
  } catch {
    // 无法读取偏好时使用标准字号。
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
        <legend>字体大小</legend>
        <div class="size-options">
          <label v-for="size in sizes" :key="size.value">
            <input type="radio" name="reading-size" :value="size.value" :checked="fontSize === size.value" @change="applySize(size.value)">
            <span>{{ size.label }}</span>
          </label>
        </div>
      </fieldset>
      <p>自动记住你的阅读偏好</p>
      <button type="button" @click="applySize('standard')">恢复默认</button>
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
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: var(--vp-shadow-3);
  white-space: normal;
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

.size-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

label {
  position: relative;
  cursor: pointer;
}

input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}

label span {
  display: block;
  padding: 8px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-align: center;
}

input:checked + span {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

input:focus-visible + span {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

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
