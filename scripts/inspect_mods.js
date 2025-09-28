const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, '..', 'poe2-crafting-frontend', 'src', 'assets', 'data', 'poe2_mods_normalized.json')
let raw
try{
  raw = fs.readFileSync(file, 'utf8')
}catch(e){
  console.error('failed to read', file, e.message)
  process.exit(2)
}
let data
try{ data = JSON.parse(raw) }catch(e){ console.error('JSON parse error:', e.message); process.exit(2) }

const find = (name)=> data.filter(m => m.name && m.name.toLowerCase().includes(name.toLowerCase()))

const reportMods = (mods)=>{
  mods.forEach(m=>{
    const tiers = m.tiers || []
    const uniqueTiers = [...new Set(tiers.map(t=>t.tier))].sort((a,b)=>a-b)
    const uniqueIlvls = [...new Set(tiers.map(t=>t.ilvl))].sort((a,b)=>a-b)
    const outlierTiers = uniqueTiers.filter(t=>t>100)
    console.log('\n---')
    console.log('id:', m.id, 'name:', m.name, 'affix:', m.affix, 'source:', m.source)
    console.log('groupNames:', m.groupNames)
    console.log('mtypeNames:', m.mtypeNames)
    console.log('tiersCount:', tiers.length)
    console.log('uniqueTierIds:', uniqueTiers.join(', '))
    console.log('uniqueIlvls:', uniqueIlvls.join(', '))
    if(outlierTiers.length) console.log('OUTLIER TIERS (>100):', outlierTiers.join(', '))
    // show up to 20 tier entries
    tiers.slice(0, 20).forEach(t=> console.log('  tier', t.tier, 'ilvl', t.ilvl, 'weight', t.weighting, 'values', JSON.stringify(t.values)))
  })
}

const mods1 = find('to maximum life')
console.log('mods matching "to maximum life":', mods1.length)
reportMods(mods1)

const mods2 = find('to maximum mana')
console.log('\nmods matching "to maximum mana":', mods2.length)
reportMods(mods2)

// detect mods that contain tier ids > 100
const modsWithOutliers = data.filter(m => Array.isArray(m.tiers) && m.tiers.some(t=>t.tier>100))
console.log('\nMods with tier id > 100:', modsWithOutliers.length)
modsWithOutliers.slice(0,50).forEach(m=> console.log('  ', m.id, m.name, '->', [...new Set(m.tiers.map(t=>t.tier))].filter(t=>t>100).slice(0,10).join(',')))

console.log('\nDone')
