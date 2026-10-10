import { onMounted, onUnmounted, ref } from 'vue'

// 三个游戏共用暂停与本地记录；计时和规则仍由各自的游戏负责。
export function useGameSession(name, smallest = false) {
  const phase = ref('ready'), best = ref(null)
  const storageKey = `sheeta-game-${name}`
  function record(value) {
    if (best.value !== null && (smallest ? value >= best.value : value <= best.value)) return
    best.value = value
    try { localStorage.setItem(storageKey, String(value)) } catch { /* 无法存储时仍保留本局记录。 */ }
  }
  function pause() { if (phase.value === 'running') phase.value = 'paused' }
  function onVisibility() { if (document.hidden) pause() }
  onMounted(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved !== null && Number.isFinite(Number(saved)) && Number(saved) >= 0) best.value = Number(saved)
    } catch { /* 存储被禁用时正常开始游戏。 */ }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', pause)
  })
  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('blur', pause)
  })
  return { phase, best, record, pause }
}
