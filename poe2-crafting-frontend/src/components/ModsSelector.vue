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
                <span class="tag">{{ m.affix }}</span>
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
              <button class="add-btn" :disabled="(!canSelect(m) && !isSelected(m))" @click.stop="openTierSelector(m)">
                {{ isSelected(m) ? 'Edit' : (canSelect(m) ? 'Add' : 'Conflict') }}
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
        <button type="button" class="remove-btn" @click="remove(sm.id)">Remove</button>
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
import TierSelector from './TierSelector.vue'

interface Props { base: string | null; ilvl: number | null; successRate: number }
const props = defineProps<Props>()
const emit = defineEmits<{ (e:'update:selected', value:{ id:number; tier:number|null }[]): void }>()

const { load, applicable: workerApplicable, ev: workerEV } = useModsWorker()

const affix = ref<'all'|'prefix'|'suffix'>('all')
const source = ref<'all'|'base'|'desecrated'|'essence'>('all')
const query = ref('')
const applicable = ref<any[]>([])
const selected = ref<{ id:number; name:string; affix:string; groupId?:number; selectedTier:number|null; tiers:any[] }[]>([])

const attemptCost = ref(0.2)
const targetSellPrice = ref(1.0)
const attempts = ref(1)
const ev = ref<{ evPerAttempt:number; attempts:number; totalEV:number } | null>(null)

// Tier selector state
const tierSelectorVisible = ref(false)
const currentMod = ref<any>(null)
const currentTiers = ref<any[]>([])

const modCategories = computed(() => {
  const categories = [
    { key: 'prefix', title: 'Prefix', mods: [] as any[] },
    { key: 'suffix', title: 'Suffix', mods: [] as any[] },
    { key: 'desecrated_prefix', title: 'Desecrated Modifiers Prefix', mods: [] as any[] },
    { key: 'desecrated_suffix', title: 'Desecrated Modifiers Suffix', mods: [] as any[] },
    { key: 'essence_prefix', title: 'Essence Prefix', mods: [] as any[] },
    { key: 'essence_suffix', title: 'Essence Suffix', mods: [] as any[] },
    { key: 'corrupted', title: 'Corrupted', mods: [] as any[] }
  ]

  applicable.value.forEach(mod => {
    if (mod.corrupted) {
      categories.find(c => c.key === 'corrupted')?.mods.push(mod)
    } else if (mod.source === 'desecrated' && mod.affix === 'prefix') {
      categories.find(c => c.key === 'desecrated_prefix')?.mods.push(mod)
    } else if (mod.source === 'desecrated' && mod.affix === 'suffix') {
      categories.find(c => c.key === 'desecrated_suffix')?.mods.push(mod)
    } else if (mod.source === 'essence' && mod.affix === 'prefix') {
      categories.find(c => c.key === 'essence_prefix')?.mods.push(mod)
    } else if (mod.source === 'essence' && mod.affix === 'suffix') {
      categories.find(c => c.key === 'essence_suffix')?.mods.push(mod)
    } else if (mod.affix === 'prefix') {
      categories.find(c => c.key === 'prefix')?.mods.push(mod)
    } else if (mod.affix === 'suffix') {
      categories.find(c => c.key === 'suffix')?.mods.push(mod)
    }
  })

  // เพิ่มใน computed modCategories
  console.log('modCategories debug:', {
    applicableLength: applicable.value.length,
    base: props.base,
    ilvl: props.ilvl,
    categories: categories.map(c => ({ key: c.key, modsCount: c.mods.length }))
  })

  return categories.filter(cat => cat.mods.length > 0)
})

const refresh = async () => {
  if (!props.base || props.ilvl === null) { applicable.value = []; return }
  const opts: any = { ilvl: props.ilvl }
  if (affix.value !== 'all') opts.affix = affix.value
  if (source.value !== 'all') opts.source = source.value
  let list = await workerApplicable(props.base, opts)
  const q = query.value.trim().toLowerCase()
  if (q) list = list.filter((m:any) => (m?.name||'').toLowerCase().includes(q))
  applicable.value = list
}

const tiersForIlvl = (mod:any) => (mod?.tiers||[]).filter((t:any)=> (t?.ilvl??0) <= (props.ilvl ?? 0))

const getTiersForDisplay = (mod: any) => {
  const tiers = tiersForIlvl(mod)
  // Show only the top 2 tiers for display to avoid clutter
  return tiers.slice(-2)
}

const formatTierValues = (values: any) => {
  if (!values || !Array.isArray(values)) return ''
  // Format the values array into a readable string
  // For example, if values is [[1,2]], show "1-2"
  return values.map((val: any) => {
    if (Array.isArray(val)) {
      return val.join('-')
    }
    return String(val)
  }).join(', ')
}

// Determine if the mod can be added (not considering editing an already-selected mod)
const canSelect = (mod:any) => {
  if (!mod) return false
  // if already selected (we still allow opening modal to edit via isSelected)
  if (selected.value.some(s => s.id === mod.id)) return false
  // group conflict exists
  if (mod.groupId != null) {
    if (selected.value.some(s => s.groupId != null && s.groupId === mod.groupId)) return false
  }
  // enforce prefix/suffix caps: allow up to 3 prefixes and 3 suffixes
  const prefixCount = selected.value.filter(s => s.affix === 'prefix').length
  const suffixCount = selected.value.filter(s => s.affix === 'suffix').length
  if (mod.affix === 'prefix' && prefixCount >= 3) return false
  if (mod.affix === 'suffix' && suffixCount >= 3) return false
  return true
}

const isSelected = (mod:any) => {
  if (!mod) return false
  return selected.value.some(s => s.id === mod.id)
}

const getSelected = (mod:any) => {
  if (!mod) return null
  return selected.value.find(s => s.id === mod.id) || null
}

const add = (mod:any) => {
  if (!mod) return
  if (!canSelect(mod)) return
  const tiers = tiersForIlvl(mod)
  const best = tiers.length ? tiers[tiers.length-1].tier : null
  selected.value.push({ id:mod.id, name:mod.name, affix:mod.affix, groupId:mod.groupId, selectedTier:best, tiers })
  pushSelection()
}
const remove = (id:number) => { selected.value = selected.value.filter(m=>m.id!==id); pushSelection() }
const pushSelection = () => { emit('update:selected', selected.value.map(s=>({ id:s.id, tier:s.selectedTier }))) }

const compute = async () => { ev.value = await workerEV({ successRate: props.successRate, attemptCost: attemptCost.value, targetSellPrice: targetSellPrice.value, attempts: attempts.value }) }

// Tier selector functions
  const openTierSelector = (mod: any) => {
  console.log('openTierSelector called for mod:', mod?.id, mod?.name)
  currentMod.value = mod
  currentTiers.value = tiersForIlvl(mod)
  tierSelectorVisible.value = true
}

const onModClick = (mod: any) => {
  console.log('mod card clicked:', mod?.id, mod?.name, 'canSelect=', canSelect(mod), 'isSelected=', isSelected(mod))
  // allow opening the tier selector for adding or editing a selection
  if (!mod) return
  if (!canSelect(mod) && !isSelected(mod)) return // conflict: neither selectable nor editable
  openTierSelector(mod)
}

const onTierSelect = (tier: any) => {
  console.log('onTierSelect:', tier)
  if (!currentMod.value) { closeTierSelector(); return }
  const mod = currentMod.value
  const existing = getSelected(mod)
  if (existing) {
    // update selected tier and ensure tiers list is current
    existing.selectedTier = tier.tier
    existing.tiers = tiersForIlvl(mod)
    console.log('updated existing selection', existing)
  } else {
    // add new selection with the chosen tier
    const tiers = tiersForIlvl(mod)
    selected.value.push({ id:mod.id, name:mod.name, affix:mod.affix, groupId:mod.groupId, selectedTier:tier.tier, tiers })
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

onMounted(async ()=>{ try{ await load() }catch{}; await refresh() })
watch(()=>[props.base, props.ilvl, affix.value, source.value], ()=>{ refresh() })
watch(selected, ()=>pushSelection(), { deep:true })
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
