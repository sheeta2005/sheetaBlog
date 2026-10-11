<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const scrollArea = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const overflowing = computed(() => canScrollLeft.value || canScrollRight.value)
let observer

// 仅在对应方向还有内容时显示渐隐，字号与侧栏宽度变化后重新判断。
function updateEdges() {
  const area = scrollArea.value
  canScrollLeft.value = area.scrollLeft > 1
  canScrollRight.value = area.scrollWidth - area.clientWidth - area.scrollLeft > 1
}

onMounted(() => {
  observer = new ResizeObserver(updateEdges)
  observer.observe(scrollArea.value)
  observer.observe(scrollArea.value.querySelector('table'))
  updateEdges()
})

onUnmounted(() => observer.disconnect())
</script>

<template>
  <div class="reading-table" :class="{ 'can-scroll-left': canScrollLeft, 'can-scroll-right': canScrollRight }">
    <div
      ref="scrollArea"
      class="reading-table-scroll"
      :tabindex="overflowing ? 0 : undefined"
      :role="overflowing ? 'region' : undefined"
      :aria-label="overflowing ? '表格，可左右滚动查看' : undefined"
      @scroll.passive="updateEdges"
    ><slot /></div>
  </div>
</template>
