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

    <div class="mods-pane">
      <div class="mods-list">
        <div class="mods-title">Applicable Mods</div>
        <div v-if="applicable.length === 0" class="empty-hint">No mods found</div>
        <div v-for="m in applicable" :key="m.id" class="mod-row">
          <div class="mod-name">{{ m.name }} <span class="tag">{{ m.affix }}</span></div>
          <button type="button" class="add-btn" @click="add(m)">Add</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useModsWorker } from '@/composables/useModsWorker'

interface Props { base: string | null; ilvl: number; successRate: number }
const props = defineProps<Props>()
const emit = defineEmits<{ (e:'update:selected', value:{ id:number; tier:number|null }[]): void }>()

const { load, applicable: workerApplicable, ev: workerEV } = useModsWorker()

const affix = ref<'all'|'prefix'|'suffix'>('all')
const source = ref<'all'|'base'|'desecrated'|'essence'>('all')
const query = ref('')
const applicable = ref<any[]>([])
const selected = ref<{ id:number; name:string; affix:string; selectedTier:number|null; tiers:any[] }[]>([])

const attemptCost = ref(0.2)
const targetSellPrice = ref(1.0)
const attempts = ref(1)
const ev = ref<{ evPerAttempt:number; attempts:number; totalEV:number } | null>(null)

const refresh = async () => {
  if (!props.base) { applicable.value = []; return }
  const opts: any = { ilvl: props.ilvl }
  if (affix.value !== 'all') opts.affix = affix.value
  if (source.value !== 'all') opts.source = source.value
  let list = await workerApplicable(props.base, opts)
  const q = query.value.trim().toLowerCase()
  if (q) list = list.filter((m:any) => (m?.name||'').toLowerCase().includes(q))
  applicable.value = list
}

const tiersForIlvl = (mod:any) => (mod?.tiers||[]).filter((t:any)=> (t?.ilvl??0) <= props.ilvl)
const add = (mod:any) => {
  if (!mod) return
  if (selected.value.some(m=>m.id===mod.id)) return
  const tiers = tiersForIlvl(mod)
  const best = tiers.length ? tiers[tiers.length-1].tier : null
  selected.value.push({ id:mod.id, name:mod.name, affix:mod.affix, selectedTier:best, tiers })
  pushSelection()
}
const remove = (id:number) => { selected.value = selected.value.filter(m=>m.id!==id); pushSelection() }
const pushSelection = () => { emit('update:selected', selected.value.map(s=>({ id:s.id, tier:s.selectedTier }))) }

const compute = async () => { ev.value = await workerEV({ successRate: props.successRate, attemptCost: attemptCost.value, targetSellPrice: targetSellPrice.value, attempts: attempts.value }) }

onMounted(async ()=>{ try{ await load('/data/poe2_mods_normalized.json') }catch{}; await refresh() })
watch(()=>[props.base, props.ilvl, affix.value, source.value], ()=>{ refresh() })
watch(selected, ()=>pushSelection(), { deep:true })
</script>

<style scoped>
.mods-selector{margin-top:1rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:.75rem}
.mods-filters{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;justify-content:space-between;margin-bottom:.5rem}
.mods-search{flex:1;min-width:220px;max-width:320px;padding:.4rem .6rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff}
.mods-pane{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
.mods-title{font-weight:700;margin-bottom:.25rem}
.mod-row{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem .4rem;border-bottom:1px dashed rgba(255,255,255,.1)}
.mod-row.selected{background:rgba(255,255,255,.04)}
.mod-name{color:#fff;opacity:.95}
.tag{font-size:.8rem;opacity:.7;margin-left:.35rem}
.add-btn,.remove-btn,.compute-btn{padding:.35rem .6rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;cursor:pointer}
.tier-select{padding:.25rem .4rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff}
.empty-hint{opacity:.7;font-size:.9rem}
.ev-box{margin-top:.75rem;border-top:1px solid rgba(255,255,255,.15);padding-top:.5rem}
.ev-row{display:flex;gap:.5rem;align-items:center;margin:.25rem 0}
.ev-row input{width:120px;padding:.25rem .4rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff}
.ev-summary{margin-top:.4rem;opacity:.95}
</style>
