<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const settings = ref(null)
const controls = ref([
  { key: 'body', label: '正文大小', min: 10, max: 40, unit: 'px', value: 17, default: 17, storage: 'sheeta-reading-size', property: '--reading-font-size' },
  { key: 'interface', label: '全站界面大小', min: 60, max: 120, unit: '%', value: 100, default: 100, storage: 'sheeta-interface-size', property: '--site-ui-scale' },
  { key: 'sidebar', label: '侧栏字号', min: 10, max: 40, unit: 'px', value: 15, default: 15, storage: 'sheeta-sidebar-size', property: '--sidebar-font-size' }
])
const presets = computed(() => [
  { label: '小', values: [14, 85, 13] },
  { label: '中', values: controls.value.map(control => control.default) },
  { label: '大', values: [20, 115, 18] },
  { label: '特大', values: [24, 120, 21] }
])
const activePreset = computed(() => presets.value.find(preset => preset.values.every((value, index) => value === controls.value[index].value))?.label)

// 导航高度随界面字号增加，进度线与手机菜单仍读取同一个像素值。
function updateNavHeight() {
  const base = window.matchMedia('(max-width: 767px)').matches ? 60 : 72
  const scale = controls.value[1].value / 100
  document.documentElement.style.setProperty('--vp-nav-height', `${Math.max(base, base * scale)}px`)
  document.documentElement.dataset.largeInterface = String(scale > 1.2 || (scale > 1 && window.innerWidth < 1280))
}

// 三类文字分别设置；侧栏使用实际像素值，覆盖全站界面的缩放比例。
function applySize(control, value) {
  const numeric = Number(value)
  const nextSize = value !== '' && Number.isFinite(numeric) ? Math.min(control.max, Math.max(control.min, Math.round(numeric))) : control.default
  control.value = nextSize
  document.documentElement.style.setProperty(control.property, control.unit === '%' ? nextSize / 100 : `${nextSize}px`)
  if (control.key === 'interface') {
    updateNavHeight()
    window.dispatchEvent(new Event('resize'))
  }
  try {
    localStorage.setItem(control.storage, String(nextSize))
  } catch {
    // 浏览器禁止存储时，当前页面仍然可以正常调整字号。
  }
}

// 组合预设仅提供快捷入口，手动改变任意一项后自然退出预设选中状态。
function applyPreset(preset) {
  controls.value.forEach((control, index) => applySize(control, preset.values[index]))
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
  controls.value[0].default = window.matchMedia('(max-width: 767px)').matches ? 16 : 17
  // 静态构建不读取浏览器偏好，挂载后恢复本站上次保存的字号。
  for (const control of controls.value) {
    let saved
    try {
      saved = localStorage.getItem(control.storage)
    } catch {
      // 禁用存储时继续使用本站默认字号。
    }
    // 旧版正文四档偏好迁移为像素，新组合预设不覆盖已有的单项选择。
    const oldScale = control.key === 'body' && { small: .9, standard: 1, large: 1.1, 'extra-large': 1.2 }[saved]
    const value = oldScale ? control.default * oldScale : Number(saved)
    // 界面上限缩小后，原有更大比例收回到上限，正文和侧栏仍沿用原来的恢复规则。
    const restored = control.key === 'interface' && Number.isFinite(value) && value > control.max ? control.max : value
    applySize(control, restored >= control.min && restored <= control.max ? restored : control.default)
  }
  document.addEventListener('pointerdown', closeOnOutsideClick)
  window.addEventListener('resize', updateNavHeight)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', closeOnOutsideClick)
  window.removeEventListener('resize', updateNavHeight)
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
      <div class="preset-control" role="group" aria-label="字号快捷预设">
        <button v-for="preset in presets" :key="preset.label" type="button" :aria-pressed="activePreset === preset.label" @click="applyPreset(preset)">{{ preset.label }}</button>
      </div>
      <fieldset v-for="control in controls" :key="control.key">
        <legend>{{ control.label }} <strong>{{ control.value }}{{ control.unit }}</strong></legend>
        <div class="size-control">
          <button type="button" :aria-label="`减小${control.label}`" :disabled="control.value === control.min" @click="applySize(control, control.value - 1)">−</button>
          <input
            :value="control.value"
            type="range"
            :min="control.min"
            :max="control.max"
            step="1"
            :aria-label="control.label"
            :aria-valuetext="`${control.value}${control.unit}`"
            @input="applySize(control, $event.target.value)"
          >
          <button type="button" :aria-label="`增大${control.label}`" :disabled="control.value === control.max" @click="applySize(control, control.value + 1)">＋</button>
        </div>
        <div class="size-values">
          <span>{{ control.min }}–{{ control.max }}{{ control.unit }}</span>
          <!-- 提交数值后同步显示限制后的结果，包括已处于边界时再次输入的越界值。 -->
          <label><span class="visually-hidden">{{ control.label }}数值</span><input type="number" :min="control.min" :max="control.max" step="1" :value="control.value" @change="applySize(control, $event.target.value); $event.target.value = control.value">{{ control.unit }}</label>
          <button type="button" :aria-label="`重置${control.label}`" @click="applySize(control, control.default)">重置</button>
        </div>
      </fieldset>
      <p>界面、侧栏和正文分别调整，自动保存。</p>
      <button class="reset-all" type="button" @click="applyPreset(presets[1])">恢复全部默认</button>
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
  width: 320px;
  max-width: calc(100vw - 48px);
  max-height: calc(100dvh - var(--vp-nav-height) - 32px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 20px;
  border: 1px solid var(--summer-border);
  border-radius: 18px;
  background: var(--summer-settings-bg);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  color: var(--vp-c-text-1);
  box-shadow: var(--summer-shadow);
  white-space: normal;
  scrollbar-width: thin;
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
  margin: 18px 0 0;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 8px;
  font-size: 15px;
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
  height: 36px;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}

.size-values {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.size-values label { display: flex; align-items: center; gap: 4px; }
.size-values input { width: 58px; min-height: 32px; padding: 4px; border: 1px solid var(--summer-border); border-radius: 6px; background: var(--reading-paper); color: var(--vp-c-text-1); text-align: center; font-size: 14px; }
.preset-control { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.preset-control button, .size-control button { min-height: 36px; border: 1px solid var(--summer-border); border-radius: 8px; background: var(--reading-paper); }
.preset-control button[aria-pressed='true'] { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.size-control button { width: 36px; font-size: 18px; }
button:disabled { opacity: .4; cursor: default; }
button:focus-visible, input[type='number']:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.reset-all { min-height: 36px; }

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
