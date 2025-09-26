type TierEntry = { tier: number; ilvl: number | null; weighting: number | null; values: any }
type Mod = { id: number; name: string; affix: string; groupNames: string[]; groupId: number | null; source: string; mtypeIds: number[]; mtypeNames: string[]; tiers: TierEntry[] }
type Base = { id: number; baseId: number | null; baseName: string | null; groupId: number | null; name: string; dropLevel: number | null; tags: string[] }
type ModsPayload = { meta?: any; bases: Base[]; mods: Mod[] }

let data: ModsPayload | null = null

async function loadMods(url = '/data/poe2_mods_normalized.json') {
  if (data) return { ok: true, cached: true, counts: data.meta?.counts }
  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) throw new Error(`Failed to fetch mods json: ${res.status}`)
  data = await res.json()
  return { ok: true, cached: false, counts: data?.meta?.counts }
}

function searchMods(query: string) {
  if (!data) return []
  const q = query.trim().toLowerCase()
  if (!q) return []
  return data.mods.filter(m => m.name.toLowerCase().includes(q)).slice(0, 200)
}

function getApplicableMods(baseName: string, opts?: { affix?: 'prefix' | 'suffix'; mtypeId?: number; ilvl?: number; source?: 'base' | 'desecrated' | 'essence' }) {
  if (!data) return []
  let list = data.mods
  if (opts?.affix) list = list.filter(m => m.affix === opts.affix)
  if (opts?.mtypeId) list = list.filter(m => m.mtypeIds.includes(opts.mtypeId))
  if (opts?.source) list = list.filter(m => (m.source || '').toLowerCase() === opts.source)
  if (opts?.ilvl != null) list = list.filter(m => (m.tiers?.some(t => (t.ilvl ?? 0) <= (opts.ilvl as number))) )
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

self.onmessage = async (ev: MessageEvent) => {
  const { id, type, payload } = (ev.data || {}) as { id: number; type: string; payload?: any }
  try {
    let result: any
    if (type === 'load') result = await loadMods(payload?.url)
    else if (type === 'search') result = searchMods(payload?.query || '')
    else if (type === 'applicable') result = getApplicableMods(payload?.baseName || '', payload?.opts)
    else if (type === 'ev') result = computeEV(payload)
    else throw new Error(`Unknown worker action: ${type}`)
    ;(self as any).postMessage({ id, ok: true, result })
  } catch (err: any) {
    ;(self as any).postMessage({ id, ok: false, error: err?.message || String(err) })
  }
}
