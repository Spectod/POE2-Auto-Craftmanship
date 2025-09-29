<template>
  <div class="virtualized-mod-list" ref="container">
    <div
      class="virtualized-viewport"
      ref="viewport"
      @scroll="handleScroll"
    >
      <div
        class="virtualized-content"
        :style="{ height: `${totalHeight}px` }"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id"
          :style="{ transform: `translateY(${item.offset}px)` }"
          class="virtualized-item"
        >
          <slot :item="item.data" :index="item.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { NormalizedMod } from '@/types/mods'

interface Props {
  items: NormalizedMod[]
  itemHeight: number
  containerHeight: number
  buffer?: number
}

const props = withDefaults(defineProps<Props>(), {
  buffer: 5
})

const container = ref<HTMLElement>()
const viewport = ref<HTMLElement>()

const scrollTop = ref(0)
const totalHeight = computed(() => props.items.length * props.itemHeight)

const visibleRange = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer)
  const end = Math.min(
    props.items.length - 1,
    Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight) + props.buffer
  )
  return { start, end }
})

const visibleItems = computed(() => {
  const items: Array<{ id: string; data: NormalizedMod; index: number; offset: number }> = []

  for (let i = visibleRange.value.start; i <= visibleRange.value.end; i++) {
    const item = props.items[i]
    if (item) {
      items.push({
        id: item.id,
        data: item,
        index: i,
        offset: i * props.itemHeight
      })
    }
  }

  return items
})

const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement
  scrollTop.value = target.scrollTop
}

onMounted(() => {
  if (viewport.value) {
    viewport.value.style.height = `${props.containerHeight}px`
  }
})

watch(() => props.items, () => {
  // Reset scroll position when items change
  scrollTop.value = 0
  if (viewport.value) {
    viewport.value.scrollTop = 0
  }
})
</script>

<style scoped>
.virtualized-mod-list {
  height: 100%;
  overflow: hidden;
}

.virtualized-viewport {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.virtualized-content {
  position: relative;
}

.virtualized-item {
  position: absolute;
  width: 100%;
  will-change: transform;
}
</style>
