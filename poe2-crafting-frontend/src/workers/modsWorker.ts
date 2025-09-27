import modsData from '../assets/data/poe2_mods_normalized.json'

type TierEntry = { tier: number; ilvl: number | null; weighting: number | null; values: any }
type Mod = { id: number; name: string; affix: string; groupNames: string[]; groupId: number | null; source: string; mtypeIds: number[]; mtypeNames: string[]; tiers: TierEntry[] }
type Base = { id: number; baseId: number | null; baseName: string | null; groupId: number | null; name: string; dropLevel: number | null; tags: string[] }
type ModsPayload = { meta?: any; bases: Base[]; mods: Mod[] }

let data: ModsPayload | null = null

async function loadMods(url?: string) {
  console.log('modsWorker: loadMods called')
  if (data) {
    console.log('modsWorker: data already loaded, returning cached')
    return { ok: true, cached: true, counts: data.meta?.counts }
  }
  console.log('modsWorker: loading data from import')
  console.log('modsData type:', typeof modsData, 'isArray:', Array.isArray(modsData))
  // The JSON is the full ModsPayload object
  data = modsData as ModsPayload
  console.log('modsWorker: data set, mods count:', data.mods.length, 'bases count:', data.bases.length)
  return { ok: true, cached: false, counts: data?.meta?.counts }
}

function searchMods(query: string) {
  if (!data) return []
  const q = query.trim().toLowerCase()
  if (!q) return []
  return data.mods.filter(m => m.name.toLowerCase().includes(q)).slice(0, 200)
}

function getApplicableMods(baseName: string, opts?: { affix?: 'prefix' | 'suffix'; mtypeId?: number; ilvl?: number; source?: 'base' | 'desecrated' | 'essence' }) {
  console.log('modsWorker: getApplicableMods called with baseName:', baseName, 'opts:', opts)
  if (!data) {
    console.log('modsWorker: data not loaded')
    return []
  }
  // Find the base item to get its type ID
  const base = data.bases.find(b => b.name === baseName)
  console.log('modsWorker: found base:', base ? base.name : 'not found')
  if (!base) return []
  const mtypeId = base.groupId
  console.log('modsWorker: mtypeId:', mtypeId)
  if (mtypeId == null) return []

  let list = data.mods.filter(m => m.mtypeIds.includes(mtypeId))
  console.log('modsWorker: initial list length after mtypeId filter:', list.length)
  if (opts?.affix) {
    list = list.filter(m => m.affix === opts.affix)
    console.log('modsWorker: after affix filter:', list.length)
  }
  if (opts?.source) {
    const s = (opts.source || '').toLowerCase()
    if (s === 'base') list = list.filter(m => (m.source || '').toLowerCase() === 'base')
    else if (s === 'desecrated') list = list.filter(m => ['base','desecrated'].includes((m.source || '').toLowerCase()))
    else if (s === 'essence') list = list.filter(m => (m.source || '').toLowerCase() === 'essence')
    console.log('modsWorker: after source filter:', list.length)
  }
  if (opts?.ilvl != null) {
    list = list.filter(m => (m.tiers?.some(t => (t.ilvl ?? 0) <= (opts.ilvl as number))) )
    console.log('modsWorker: after ilvl filter:', list.length)
  }
  console.log('modsWorker: final list length:', list.length)
  return list.slice(0, 500)
}

// Simple EV (MVP) per attempt
function computeEV(payload: { successRate: number; attemptCost: number; targetSellPrice: number; attempts?: number }) {
  const p = Math.max(0, Math.min(1, (payload?.successRate ?? 0) / 100))
  const cost = Math.max(0, payload?.attemptCost ?? 0)
  const price = Math.max(0, payload?.targetSellPrice ?? 0)
  const evPerAttempt = p * price - cost
  const attempts = Math.max(1, Math.floor(payload?.attempts ?? 1))
  const totalEV = evPerAttempt * attempts
  return { evPerAttempt, attempts, totalEV }
}

// Tier statistics for a specific mod
function tierStats(payload: { modId: number; ilvl: number; method: 'base'|'desecrated'|'essence'; attemptCost: number }) {
  if (!data) return [] as any[]
  const target = data.mods.find(m => m.id === payload.modId)
  if (!target) return [] as any[]

  // Build pool based on method (coarse)
  const method = (payload.method || 'base').toLowerCase()
  let pool = data.mods
  if (method === 'base') pool = pool.filter(m => (m.source || '').toLowerCase() === 'base')
  else if (method === 'desecrated') pool = pool.filter(m => ['base','desecrated'].includes((m.source || '').toLowerCase()))
  else if (method === 'essence') pool = pool.filter(m => (m.source || '').toLowerCase() === 'essence')

  // Sum of weights for all available tiers at ilvl
  let W = 0
  for (const m of pool) {
    const tiers = (m.tiers || []).filter(t => (t.ilvl ?? 0) <= payload.ilvl)
    for (const t of tiers) W += Math.max(0, t.weighting ?? 0)
  }
  if (W <= 0) return [] as any[]

  const res: any[] = []
  const tTiers = (target.tiers || []).filter(t => (t.ilvl ?? 0) <= payload.ilvl)
  for (const t of tTiers) {
    const w = Math.max(0, t.weighting ?? 0)
    const p = w / W
    const attempts = p > 0 ? 1 / p : Infinity
    const cost = attempts * Math.max(0, payload.attemptCost ?? 0)
    res.push({ tier: t.tier, p, attempts, cost })
  }
  res.sort((a,b)=> a.tier - b.tier)
  return res
}

self.onmessage = async (ev: MessageEvent) => {
  const { id, type, payload } = (ev.data || {}) as { id: number; type: string; payload?: any }
  console.log('modsWorker: received message type:', type, 'id:', id)
  try {
    let result: any
    if (type === 'load') result = await loadMods()
    else if (type === 'search') result = searchMods(payload?.query || '')
    else if (type === 'applicable') result = getApplicableMods(payload?.baseName || '', payload?.opts)
    else if (type === 'ev') result = computeEV(payload)
    else if (type === 'tierStats') result = tierStats(payload)
    else throw new Error(`Unknown worker action: ${type}`)
    console.log('modsWorker: sending result for type:', type, 'result length or ok:', result?.length || result?.ok)
    ;(self as any).postMessage({ id, ok: true, result })
  } catch (err: any) {
    console.error('modsWorker: error for type:', type, 'error:', err?.message || String(err))
    ;(self as any).postMessage({ id, ok: false, error: err?.message || String(err) })
  }
}
