<template>
  <div class="mods-selector" v-if="base">
    <div class="mods-filters">
      <div class="affix-filter">
        <label><input type="radio" value="all" v-model="affix" @change="refresh" /> All</label>
        <label><input type="radio" value="prefix" v-model="affix" @change="refresh" /> Prefix</label>
        <label><input type="radio" value="suffix" v-model="affix" @change="refresh" /> Suffix</label>
      </div>
      <div class="source-filter">
        <label><input type="radio" value="all" v-model="source" @change="refresh" /> All</label>
        <label><input type="radio" value="base" v-model="source" @change="refresh" /> Base</label>
        <label><input type="radio" value="desecrated" v-model="source" @change="refresh" /> Desecrated</label>
        <label><input type="radio" value="essence" v-model="source" @change="refresh" /> Essence</label>
      </div>
      <input class="mods-search" v-model="query" placeholder="Search mods..." @input="refresh" />
    </div>

    <div class="mods-cards">
      <div v-for="category in modCategories" :key="category.key" class="mod-category-card">
        
        <div class="category-header">
          <h4 class="category-title">{{ category.title }}</h4>
          <span class="category-count">{{ category.mods.length }}</span>
        </div>
        <div class="mods-grid">
          <div v-for="m in category.mods" :key="m.id" :class="['mod-card', { 'mod-selected': isSelected(m) }]" @click="onModClick(m)">
            <div class="mod-name">
              {{ m.name }}
              <div class="mod-meta">
                <span class="tag">{{ m.type }}</span>
                <span v-if="m.source !== 'base'" class="source-tag">{{ m.source }}</span>
                <span class="tag" v-if="m.groupId">G{{ m.groupId }}</span>
                <span class="tier-count">{{ (m.tiers||[]).length }} tiers</span>
              </div>
              <div v-if="isSelected(m)" class="selected-badge">Selected T{{ getSelected(m)?.selectedTier }}</div>
              <div class="mod-tiers" v-if="getTiersForDisplay(m).length > 0">
                <div class="tier-preview" v-for="tier in getTiersForDisplay(m)" :key="tier.tier">
                  <span class="tier-label">T{{ tier.tier }}</span>
                  <span class="tier-values">{{ formatTierValues(tier.values) }}</span>
                </div>
              </div>
            </div>
            <div class="mod-actions">
              <button class="add-btn" :disabled="(!canSelectMod(m) && !isSelected(m))" @click.stop="openTierSelector(m)">
                {{ isSelected(m) ? 'Edit' : (canSelectMod(m) ? 'Add' : 'Conflict') }}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <div class="mods-selected">
      <div class="mods-title">Selected Mods</div>
      <div v-if="selected.length === 0" class="empty-hint">No mods selected</div>
      <div v-for="sm in selected" :key="sm.id" class="mod-row selected">
        <div class="mod-name">{{ sm.name }} <span class="tag">{{ sm.affix }}</span></div>
        <select v-model.number="sm.selectedTier" class="tier-select">
          <option v-for="t in sm.tiers" :key="t.tier" :value="t.tier">T{{ t.tier }}</option>
        </select>
        <button type="button" class="remove-btn" @click="deselectMod(String(sm.id))">Remove</button>
      </div>
    </div>

    <div class="ev-box">
      <div class="ev-row">
        <label>Attempt Cost (div):</label>
        <input type="number" step="0.01" v-model.number="attemptCost" />
      </div>
      <div class="ev-row">
        <label>Target Sell Price (div):</label>
        <input type="number" step="0.01" v-model.number="targetSellPrice" />
      </div>
      <div class="ev-row">
        <label>Attempts:</label>
        <input type="number" step="1" min="1" v-model.number="attempts" />
      </div>
      <button type="button" class="compute-btn" @click="compute">Compute EV</button>
      <div class="ev-summary" v-if="ev">
        <div>EV/Attempt: {{ ev.evPerAttempt.toFixed(3) }} div</div>
        <div>Attempts: {{ ev.attempts }}</div>
        <div>Total EV: {{ ev.totalEV.toFixed(3) }} div</div>
      </div>
    </div>

    <TierSelector
      :visible="tierSelectorVisible"
      :tiers="currentTiers"
      :mod-name="currentMod?.name || ''"
      @select="onTierSelect"
      @cancel="closeTierSelector"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useModsWorker } from '@/composables/useModsWorker'
import { useMods } from '@/composables/useMods'
import type { ItemCategory } from '@/types/itemTypes'
import type { NormalizedMod } from '@/types/mods'
import TierSelector from './TierSelector.vue'

interface Props { base: string | null; ilvl: number | null; successRate: number }
const props = defineProps<Props>()
const emit = defineEmits<{ (e:'update:selected', value:{ id:number; tier:number|null }[]): void }>()

// Legacy worker for EV calculations (keep for now)
const { load, ev: workerEV } = useModsWorker()

// New composable for mod management
const itemCategory = computed<ItemCategory | undefined>(() => {
  // Map legacy base string to new ItemCategory
  // This is a temporary mapping - ideally props.base should be ItemCategory
  const mapping: Record<string, ItemCategory> = {
    'Spears': 'spears',
    'Wands': 'wands',
    'OneHandMaces': 'maces',
    'Sceptres': 'sceptres',
    'TwoHandMaces': 'twoHandMaces',
    'Quarterstaves': 'quarterstaves',
    'Crossbows': 'crossbows',
    'Bows': 'bows',
    'Staves': 'staves',
    'Foci': 'foci',
    'Quivers': 'quivers',
    'Shield_STR': 'shields',
    'Shield_DEX': 'shields',
    'Shield_INT': 'shields',
    'Bucklers': 'bucklers',
    'Amulets': 'amulets',
    'Rings': 'rings',
    'Belts': 'belts',
    'Gloves_STR': 'gloves',
    'Gloves_DEX': 'gloves',
    'Gloves_INT': 'gloves',
    'Gloves_STR_DEX': 'gloves',
    'Gloves_STR_INT': 'gloves',
    'Gloves_DEX_INT': 'gloves',
    'Boots_STR': 'boots',
    'Boots_DEX': 'boots',
    'Boots_INT': 'boots',
    'Boots_STR_DEX': 'boots',
    'Boots_STR_INT': 'boots',
    'Boots_DEX_INT': 'boots',
    'BodyArmours_STR': 'bodyArmours',
    'BodyArmours_DEX': 'bodyArmours',
    'BodyArmours_INT': 'bodyArmours',
    'BodyArmours_STR_DEX': 'bodyArmours',
    'BodyArmours_STR_INT': 'bodyArmours',
    'BodyArmours_DEX_INT': 'bodyArmours',
    'Helmets_STR': 'helmets'
  }
  return props.base ? mapping[props.base] : undefined
})

const {
  modCategories,
  selectedMods,
  isLoading,
  error,
  selectedPrefixCount,
  selectedSuffixCount,
  selectionLimits,
  loadMods,
  canSelectMod,
  selectMod,
  deselectMod,
  updateModTier,
  setQueryOptions
} = useMods(itemCategory.value)

// Filter state
const affix = ref<'all'|'prefix'|'suffix'>('all')
const source = ref<'all'|'base'|'desecrated'|'essence'>('all')
const query = ref('')

// EV calculation state
const attemptCost = ref(0.2)
const targetSellPrice = ref(1.0)
const attempts = ref(1)
const ev = ref<{ evPerAttempt:number; attempts:number; totalEV:number } | null>(null)

// Tier selector state
const tierSelectorVisible = ref(false)
const currentMod = ref<NormalizedMod | null>(null)
const currentTiers = ref<any[]>([])

// Computed properties for backward compatibility
const applicable = computed(() =>
  modCategories.value.flatMap(cat => cat.mods)
)

const selected = computed(() =>
  selectedMods.value.map(mod => ({
    id: parseInt(mod.id.split('_').pop() || '0'), // Extract legacy ID
    name: mod.name,
    affix: mod.type,
    groupId: mod.groupId,
    selectedTier: mod.selectedTier,
    tiers: [] // Will be populated when needed
  }))
)

// Helper functions
const getTiersForDisplay = (mod: NormalizedMod) => {
  const availableTiers = mod.tiers.filter(t =>
    t.ilvl <= (props.ilvl || 100)
  )
  // Show only the top 2 tiers for display to avoid clutter
  return availableTiers.slice(-2)
}

const formatTierValues = (values: number[][]) => {
  if (!values || !Array.isArray(values)) return ''
  return values.map(val => {
    if (Array.isArray(val)) {
      return val.join('-')
    }
    return String(val)
  }).join(', ')
}

const isSelected = (mod: NormalizedMod) => {
  return selectedMods.value.some(s => s.id === mod.id)
}

const getSelected = (mod: NormalizedMod) => {
  return selectedMods.value.find(s => s.id === mod.id) || null
}

// Event handlers
const refresh = async () => {
  if (!itemCategory.value || props.ilvl === null) return

  setQueryOptions({
    ilvl: props.ilvl,
    type: affix.value === 'all' ? 'all' : affix.value,
    source: source.value === 'all' ? 'all' : source.value,
    query: query.value.trim()
  })
}

const pushSelection = () => {
  emit('update:selected', selected.value.map(s => ({
    id: s.id,
    tier: s.selectedTier
  })))
}

const compute = async () => {
  ev.value = await workerEV({
    successRate: props.successRate,
    attemptCost: attemptCost.value,
    targetSellPrice: targetSellPrice.value,
    attempts: attempts.value
  })
}

// Tier selector functions
const openTierSelector = (mod: NormalizedMod) => {
  console.log('openTierSelector called for mod:', mod.id, mod.name)
  currentMod.value = mod
  currentTiers.value = mod.tiers.filter(t => t.ilvl <= (props.ilvl || 100))
  tierSelectorVisible.value = true
}

const onModClick = (mod: NormalizedMod) => {
  console.log('mod card clicked:', mod.id, mod.name, 'canSelect=', canSelectMod(mod), 'isSelected=', isSelected(mod))
  // allow opening the tier selector for adding or editing a selection
  if (!canSelectMod(mod) && !isSelected(mod)) return // conflict: neither selectable nor editable
  openTierSelector(mod)
}

const onTierSelect = (tier: any) => {
  console.log('onTierSelect:', tier)
  if (!currentMod.value) { closeTierSelector(); return }

  const mod = currentMod.value
  const existing = getSelected(mod)

  if (existing) {
    // Update existing selection
    updateModTier(mod.id, tier.tier)
    console.log('updated existing selection', existing)
  } else {
    // Add new selection
    selectMod(mod, tier.tier)
    console.log('added new selection', mod.id, tier.tier)
  }

  pushSelection()
  closeTierSelector()
}

const closeTierSelector = () => {
  tierSelectorVisible.value = false
  currentMod.value = null
  currentTiers.value = []
}

// Watchers
watch([itemCategory, () => props.ilvl, affix, source], refresh)
watch(selectedMods, pushSelection, { deep: true })

// Initialize
onMounted(async () => {
  try {
    await load() // Legacy worker
    if (itemCategory.value) {
      await loadMods(itemCategory.value)
    }
  } catch (err) {
    console.error('Failed to initialize:', err)
  }
})
</script>

<style scoped>
.mods-selector{margin-top:1rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:.75rem}
.mods-filters{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;justify-content:space-between;margin-bottom:.5rem}
.mods-search{flex:1;min-width:220px;max-width:320px;padding:.4rem .6rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff}
.mods-cards{display:grid;grid-template-columns:repeat(2, 1fr);gap:2rem 1rem;margin-bottom:1rem;}
.mod-category-card{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:1rem;box-shadow:0 2px 4px rgba(0,0,0,.1);}
.category-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}
.category-title{font-size:1.1rem;font-weight:700;color:#fff;margin:0}
.category-count{background:rgba(255,215,0,.2);color:#ffd700;padding:.2rem .5rem;border-radius:12px;font-size:.8rem;font-weight:600}
.mods-grid{display:flex; gap: 0.25rem; flex-direction: column;}
.mod-card{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:.5rem;cursor:pointer;transition:background .2s}
.mod-card:hover{background:rgba(255,255,255,.15);transform:translateY(-1px)}
.mod-card.mod-selected{box-shadow:0 0 12px rgba(124,252,0,.25), inset 0 0 8px rgba(124,252,0,.05);border-color:rgba(124,252,0,.45);background:linear-gradient(90deg, rgba(124,252,0,.03), rgba(255,255,255,0));}
.mod-name{display: flex; font-size:.9rem;color:#fff;margin-bottom:.25rem;line-height:1.3}
.mod-meta{display:flex;gap:.5rem;align-items:center}
.tag{font-size:.7rem;background:rgba(255,215,0,.2);color:#ffd700;padding:.15rem .4rem;border-radius:10px;font-weight:600}
.source-tag{font-size:.7rem;background:rgba(138,43,226,.2);color:#ba55d3;padding:.15rem .4rem;border-radius:10px;font-weight:600}
.mod-tiers{margin-top:.25rem}
.tier-preview{font-size:.7rem;color:#ccc;margin-top:.15rem}
.tier-label{font-weight:600;color:#ffd700}
.tier-values{color:#aaa;margin-left:.25rem}
.selected-badge{display:inline-block;margin-top:.4rem;background:rgba(34,139,34,.18);color:#7CFC00;padding:.15rem .4rem;border-radius:8px;font-weight:700;font-size:.75rem}
.mods-selected{margin-top:1rem;border-top:1px solid rgba(255,255,255,.15);padding-top:1rem}
.mods-title{font-weight:700;margin-bottom:.25rem}
.mod-row{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem .4rem;border-bottom:1px dashed rgba(255,255,255,.1);cursor:pointer}
.mod-row:hover{background:rgba(255,255,255,.08)}
.mod-row.selected{background:rgba(255,255,255,.04)}
.add-btn,.remove-btn,.compute-btn{padding:.35rem .6rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;cursor:pointer}
.tier-select{padding:.25rem .4rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff}
.empty-hint{opacity:.7;font-size:.9rem}
.ev-box{margin-top:.75rem;border-top:1px solid rgba(255,255,255,.15);padding-top:.5rem}
.ev-row{display:flex;gap:.5rem;align-items:center;margin:.25rem 0}
.ev-row input{width:120px;padding:.25rem .4rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff}
.ev-summary{margin-top:.4rem;opacity:.95}
</style>
