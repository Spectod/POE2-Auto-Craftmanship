const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const mapPath = path.join(root, 'poe2-crafting-frontend', 'src', 'assets', 'data', 'base_mods_map.normalized.json')
const modsPath = path.join(root, 'poe2-crafting-frontend', 'src', 'assets', 'data', 'poe2_mods_normalized.json')
const outPath = path.join(root, 'poe2-crafting-frontend', 'src', 'assets', 'data', 'base_mods_catalog.json')

function load(p){ if(!fs.existsSync(p)) throw new Error('missing '+p); return JSON.parse(fs.readFileSync(p,'utf8')) }

function tierScore(t){
  if(!t || !t.values) return 0
  let s = 0, count = 0
  for(const v of t.values){
    if(Array.isArray(v)){
      const num = (Number(v[0]) + Number(v[v.length-1]))/2
      if(!Number.isNaN(num)){ s += num; count++ }
    } else if(typeof v === 'number'){
      s += v; count++
    }
  }
  return count? s/count : 0
}

function build(){
  const map = load(mapPath)
  const modsPayload = load(modsPath)
  const modsByName = new Map()

  for(const baseName of Object.keys(map.byBase||{})){
    const entry = map.byBase[baseName]
    for(const mod of (entry.mods||[])){
      const key = mod.name
      if(!modsByName.has(key)) modsByName.set(key, { name: key, occurrences: [] })
      modsByName.get(key).occurrences.push({ base: baseName, id: mod.id, source: mod.source, groupId: mod.groupId, tiers: mod.tiers||[] })
    }
  }

  const result = { meta: { generatedOn: new Date().toISOString(), modNames: modsByName.size, baseCount: Object.keys(map.byBase||{}).length }, mods: {} }

  for(const [name, rec] of modsByName.entries()){
    const allTiers = []
    for(const occ of rec.occurrences){
      for(const t of occ.tiers || []){
        allTiers.push({ tier: t.tier, ilvl: t.ilvl, weighting: t.weighting, values: t.values, score: tierScore(t) })
      }
    }
    const tierMap = new Map()
    for(const t of allTiers){
      if(!tierMap.has(t.tier) || (t.score > tierMap.get(t.tier).score)) tierMap.set(t.tier, t)
    }
    const canonical = Array.from(tierMap.values()).sort((a,b)=>b.score - a.score).map((t,idx)=>({ rank: idx+1, tier: t.tier, ilvl: t.ilvl, score: t.score }))

    const occurrences = rec.occurrences.map(o=>{
      const tierNumbers = (o.tiers||[]).map(x=>x.tier)
      const ranks = tierNumbers.map(num => { const found = canonical.find(c=>c.tier===num); return found? found.rank : null }).filter(x=>x!=null)
      return { base: o.base, id: o.id, source: o.source, groupId: o.groupId, tierNumbers, ranks }
    })

    result.mods[name] = { name, canonical, occurrences }
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8')
  console.log('WROTE', outPath, 'mods:', Object.keys(result.mods).length)
}

build()
