/*
  Normalize CraftOfExile POE2 data into a compact schema for the frontend.
  Input:  poe2-crafting-backend/data/poe2_coe_raw.json (snapshot you already have)
  Output: poe2-crafting-frontend/public/data/poe2_mods_normalized.json

  Usage:
    node scripts/normalize_coe_poe2_mods.js
*/

const fs = require('fs')
const path = require('path')

const RAW = path.join('poe2-crafting-backend', 'data', 'poe2_coe_raw.json')
const OUT = path.join('poe2-crafting-frontend', 'public', 'data', 'poe2_mods_normalized.json')

function parseMaybeJSON(str) {
  if (!str || typeof str !== 'string') return null
  try { return JSON.parse(str) } catch { return null }
}

function parseMtypesPipe(s) {
  if (!s || typeof s !== 'string') return []
  return s.split('|').map(x => x.trim()).filter(Boolean).map(x => parseInt(x, 10)).filter(n => !isNaN(n))
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function main() {
  if (!fs.existsSync(RAW)) {
    console.error('Raw file not found:', RAW)
    process.exit(1)
  }
  let rawContent = fs.readFileSync(RAW, 'utf8')
  // Remove BOM if present
  if (rawContent.charCodeAt(0) === 0xFEFF) {
    rawContent = rawContent.slice(1)
  }
  const raw = JSON.parse(rawContent)

  const mtypesById = new Map()
  if (raw.mtypes?.seq) {
    for (const mt of raw.mtypes.seq) {
      mtypesById.set(parseInt(mt.id_mtype, 10), { id: parseInt(mt.id_mtype, 10), name: mt.name_mtype, code: mt.poedb_id || null })
    }
  }

  const mgroupsById = new Map()
  if (raw.mgroups?.seq) {
    for (const g of raw.mgroups.seq) {
      mgroupsById.set(parseInt(g.id_mgroup, 10), { id: parseInt(g.id_mgroup, 10), name: g.name_mgroup, isMain: g.is_main === '1' })
    }
  }

  const basesMeta = new Map()
  if (raw.bases?.seq) {
    for (const b of raw.bases.seq) {
      basesMeta.set(String(b.id_base), {
        id: parseInt(b.id_base, 10),
        groupId: parseInt(b.id_bgroup, 10),
        name: b.name_base,
        isJewellery: b.is_jewellery === '1',
        isMartial: b.is_martial === '1'
      })
    }
  }

  // Normalize base items with lightweight tags
  const bases = []
  if (raw.bitems?.seq) {
    for (const bi of raw.bitems.seq) {
      let props = null
      if (bi.properties) props = parseMaybeJSON(bi.properties)
      const meta = basesMeta.get(String(bi.id_base)) || null
      const tags = []
      if (meta?.name?.includes('Shield')) tags.push('shield')
      if (meta?.name?.includes('Quiver')) tags.push('quiver')
      if (meta?.name?.includes('Focus')) tags.push('focus')
      if (meta?.name?.includes('Buckler')) tags.push('buckler')
      if (props?.armour > 0) tags.push('armour')
      if (props?.energyshield > 0) tags.push('energy_shield')
      if (props?.evasion > 0) tags.push('evasion')

      bases.push({
        id: parseInt(bi.id_bitem, 10),
        baseId: meta?.id ?? null,
        baseName: meta?.name ?? null,
        groupId: meta?.groupId ?? null,
        name: bi.name_bitem,
        dropLevel: bi.drop_level ? parseInt(bi.drop_level, 10) : null,
        tags
      })
    }
  }

  // Normalize mods with tiers
  const tiersObj = raw.tiers || {}
  const mods = []
  if (raw.modifiers?.seq) {
    for (const m of raw.modifiers.seq) {
      const id = parseInt(m.id_modifier, 10)
      const groupNames = parseMaybeJSON(m.modgroups) || []
      const mtypeIds = parseMtypesPipe(m.mtypes)
      const mtypeNames = mtypeIds.map(i => mtypesById.get(i)?.name).filter(Boolean)
      const mgroup = mgroupsById.get(parseInt(m.id_mgroup || '0', 10)) || null
      const source = (mgroup?.name || '').toLowerCase() // base / desecrated / essence / etc.

      const tObj = tiersObj[String(id)] || null
      const tiers = []
      if (tObj && typeof tObj === 'object') {
        for (const [tierKey, entries] of Object.entries(tObj)) {
          const tierNo = parseInt(tierKey, 10)
          if (!Array.isArray(entries)) continue
          for (const e of entries) {
            let values = null
            if (e?.nvalues) values = parseMaybeJSON(e.nvalues)
            tiers.push({
              tier: tierNo,
              ilvl: e?.ilvl ? parseInt(e.ilvl, 10) : null,
              weighting: e?.weighting ? parseInt(e.weighting, 10) : null,
              values
            })
          }
        }
        tiers.sort((a, b) => (a.tier - b.tier) || ((a.ilvl || 0) - (b.ilvl || 0)))
      }

      mods.push({ id, name: m.name_modifier, affix: m.affix, groupNames, groupId: m.id_mgroup ? parseInt(m.id_mgroup, 10) : null, source, mtypeIds, mtypeNames, tiers })
    }
  }

  const out = {
    meta: {
      createdAt: new Date().toISOString(),
      counts: { bases: bases.length, mods: mods.length }
    },
    bases,
    mods
  }

  ensureDir(path.dirname(OUT))
  fs.writeFileSync(OUT, JSON.stringify(out))
  console.log('Wrote', OUT, JSON.stringify(out.meta))
}

main()
