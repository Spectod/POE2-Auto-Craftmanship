<template>
  <div v-if="visible" class="tier-selector-overlay" @click="cancel">
    <div class="tier-selector" @click.stop>
      <div class="tier-title">{{ modName }}</div>
  <div class="tier-list" ref="tierList" @wheel="handleWheel" tabindex="0">
        <div
          v-for="(tier, index) in tiers"
          :key="tier.tier"
          class="tier-item"
          :class="{ selected: index === selectedIndex }"
          @click="selectTier(tier)"
        >
          <span class="tier-label">T{{ tier.tier }}</span>
          <span class="tier-text">{{ tier.text }}</span>
        </div>
      </div>
      <div class="tier-actions">
        <button @click="cancel" class="cancel-btn">Cancel</button>
        <button @click="confirm" class="confirm-btn">Select</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Tier {
  tier: number
  text: string
  ilvl?: number
}

interface Props {
  visible: boolean
  tiers: Tier[]
  modName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [tier: Tier]
  cancel: []
}>()

const selectedIndex = ref(0)
const tierList = ref<HTMLElement>()

const selectTier = (tier: Tier) => {
  emit('select', tier)
}

const confirm = () => {
  if (props.tiers[selectedIndex.value]) {
    emit('select', props.tiers[selectedIndex.value])
  }
}

const cancel = () => {
  emit('cancel')
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 1 : -1
  selectedIndex.value = Math.max(0, Math.min(props.tiers.length - 1, selectedIndex.value + delta))
  scrollToSelected()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return

  switch (e.code) {
    case 'Space':
      e.preventDefault()
      confirm()
      break
    case 'Escape':
      e.preventDefault()
      cancel()
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(0, selectedIndex.value - 1)
      scrollToSelected()
      break
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(props.tiers.length - 1, selectedIndex.value + 1)
      scrollToSelected()
      break
  }
}

const scrollToSelected = () => {
  if (!tierList.value) return
  const selectedElement = tierList.value.children[selectedIndex.value] as HTMLElement
  if (selectedElement) {
    selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    selectedIndex.value = 0
    nextTick(() => scrollToSelected())
    nextTick(() => {
      try { if (tierList.value && (tierList.value as HTMLElement).focus) (tierList.value as HTMLElement).focus() } catch (e) {}
      scrollToSelected()
    })
  }
})

watch(() => props.tiers, () => {
  selectedIndex.value = 0
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.tier-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tier-selector {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  max-width: 400px;
  width: 90%;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.tier-title {
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
  text-align: center;
}

.tier-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
  margin-bottom: 1rem;
}

.tier-item {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.tier-item:hover,
.tier-item.selected {
  background: rgba(255, 255, 255, 0.1);
}

.tier-label {
  font-weight: 600;
  color: #ffd700;
  min-width: 40px;
}

.tier-text {
  color: #fff;
  flex: 1;
  font-size: 0.9rem;
}

.tier-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background: rgba(255, 0, 0, 0.2);
}

.confirm-btn:hover {
  background: rgba(0, 255, 0, 0.2);
}
</style>
