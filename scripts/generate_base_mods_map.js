const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const modsPath = path.join(root, 'poe2-crafting-frontend', 'src', 'assets', 'data', 'poe2_mods_normalized.json')
const basesPath = path.join(root, 'poe2-crafting-frontend', 'src', 'assets', 'poe2_base_items.json')
const outPath = path.join(root, 'poe2-crafting-frontend', 'src', 'assets', 'data', 'base_mods_map.json')

function loadJson(p) {
  if (!fs.existsSync(p)) throw new Error('Not found: ' + p)
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function buildMap(modsPayload, basesPayload) {
  const mods = modsPayload.mods || []
  // Prefer the normalized modsPayload.bases (contains groupId, ids, names)
  let bases = modsPayload.bases || null
  if (!bases) {
    bases = basesPayload
  }
  // Build map by base name and by groupId
  const mapByBase = {}
  const mapByGroup = {}

  // index mods by mtypeId membership
  // mtypeId -> mods[]
  const modsByMtype = new Map()
  for (const m of mods) {
    const mcopy = Object.assign({}, m)
    // keep tiers as-is
    for (const mt of (m.mtypeIds || [])) {
      if (!modsByMtype.has(mt)) modsByMtype.set(mt, [])
      modsByMtype.get(mt).push(mcopy)
    }
  }

  // For each base, find its groupId and find mods
  const baseList = Array.isArray(bases) ? bases : (bases.bases || Object.values(bases))
  for (const b of baseList) {
    const baseName = b.name
    const groupId = b.groupId
    const entry = { baseId: b.id ?? null, baseName, groupId: groupId ?? null, mods: [] }
    if (groupId != null && modsByMtype.has(groupId)) {
      const list = modsByMtype.get(groupId)
      // For each mod, include only relevant fields to keep file size manageable
      const raw = list.map(m => ({ id: m.id, name: m.name, affix: m.affix, groupNames: m.groupNames, groupId: m.groupId ?? null, source: m.source || 'base', mtypeIds: m.mtypeIds || [], mtypeNames: m.mtypeNames || [], tiers: (m.tiers||[]).map(t=>({ tier: t.tier, ilvl: t.ilvl, weighting: t.weighting, values: t.values })) }))
      // Merge mods that have same name+source+groupId to avoid duplicate-name rows (but preserve variant ids)
      const merged = []
      const idx = new Map()
      for (const m of raw) {
        const key = `${m.name}||${m.source||'base'}||${m.groupId||''}`
        if (!idx.has(key)) {
          const copy = Object.assign({}, m)
          copy.variantIds = [m.id]
          idx.set(key, copy)
          merged.push(copy)
        } else {
          const existing = idx.get(key)
          existing.variantIds.push(m.id)
          // merge tiers arrays
          existing.tiers = (existing.tiers || []).concat(m.tiers || [])
        }
      }
      // normalize tiers per merged mod: dedupe by tier number and sort
      for (const m of merged) {
        const map = new Map()
        for (const t of (m.tiers||[])) {
          if (!map.has(t.tier)) map.set(t.tier, t)
        }
        m.tiers = Array.from(map.values()).sort((a,b)=>a.tier-b.tier)
      }
      entry.mods = merged
    }
    mapByBase[baseName] = entry
    if (groupId != null) {
      if (!mapByGroup[groupId]) mapByGroup[groupId] = { groupId, mods: mapByGroup[groupId]?.mods || [] }
      // ensure unique mods in group map
      const existing = new Set((mapByGroup[groupId].mods||[]).map(m=>m.id))
      const list = modsByMtype.get(groupId) || []
      for (const m of list) {
        if (!existing.has(m.id)) {
          mapByGroup[groupId].mods.push({ id: m.id, name: m.name, affix: m.affix, source: m.source || 'base', mtypeIds: m.mtypeIds || [], tiers: (m.tiers||[]).map(t=>({ tier: t.tier, ilvl: t.ilvl, weighting: t.weighting })) })
          existing.add(m.id)
        }
      }
    }
  }

  return { meta: { generatedOn: new Date().toISOString(), baseCount: Object.keys(mapByBase).length }, byBase: mapByBase, byGroup: mapByGroup }
}

function main(){
  console.log('Loading data...')
  const modsPayload = loadJson(modsPath)
  const basesPayload = loadJson(basesPath)
  console.log('Building map...')
  const map = buildMap(modsPayload, basesPayload)
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2), 'utf8')
  console.log('Wrote', outPath)
}

main()
