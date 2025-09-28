const fs = require('fs');
const path = 'C:\\Users\\jaija\\OneDrive\\เดสก์ท็อป\\POE2-Auto-Craftmanship\\poe2-crafting-frontend\\src\\assets\\data\\poe2_mods_normalized.json';
function maxOfValues(values){
  if(!values) return -Infinity;
  let mx = -Infinity;
  function visit(v){
    if(Array.isArray(v)) v.forEach(visit);
    else if(typeof v === 'number') if(v>mx) mx=v;
  }
  visit(values);
  return mx;
}
function canonicalRange(values){
  if(!values) return '[]';
  // make each element an array [min,max]   
  const norm = values.map(p => Array.isArray(p) ? [p[0], p[1]] : [p, p]);
  return JSON.stringify(norm);
}
try{
  const j = JSON.parse(fs.readFileSync(path,'utf8'));
  const mods = j.mods || [];
  const q = 'to maximum life';
  const matches = mods.filter(m => (m.name && m.name.toLowerCase().includes(q)) || (m.affix && m.affix.toLowerCase().includes(q)));
  if(!matches.length){
    console.log('No matches for',q); process.exit(0);
  }
  console.log('Found matches:', matches.length);
  for(const m of matches){
    console.log('\n--- MOD', m.id, '|', m.name || m.affix, '| source=', m.source||'');
    const tiers = m.tiers || [];
    const groups = new Map();
    tiers.forEach(t => {
      const key = canonicalRange(t.values || t.value || []);
      const maxv = maxOfValues(t.values || t.value || []);
      if(!groups.has(key)) groups.set(key, { key, maxv, count:0, ilvls: new Set(), examples: [] });
      const g = groups.get(key);
      g.count++;
      if(t.ilvl) g.ilvls.add(t.ilvl);
      g.examples.push({ tier: t.tier, ilvl: t.ilvl, values: t.values, weighting: t.weighting });
    });
    const groupList = Array.from(groups.values()).map(g => ({ key: g.key, maxv: g.maxv, count: g.count, ilvls: Array.from(g.ilvls).sort((a,b)=>(a||0)-(b||0)), examples: g.examples.slice(0,3) }));
    groupList.sort((a,b) => b.maxv - a.maxv);
    console.log('Distinct display-tier groups:', groupList.length);
    groupList.forEach((g,i) => {
      // print a simple human readable range
      let rangeStr = g.key;
      try{ const parsed = JSON.parse(g.key); rangeStr = parsed.map(p=>p[0]===p[1]?`${p[0]}`:`${p[0]}–${p[1]}`).join(', '); }catch(e){}
      console.log(` DisplayTier ${i+1} => max ${g.maxv} | count ${g.count} | ilvls ${g.ilvls.join(',') || '-'} | values ${rangeStr}`);
    });
  }
}catch(e){
  console.error('Error:', e && e.message);
  process.exit(1);
}
