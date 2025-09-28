const fs = require('fs');
const inputPath = 'C:\\Users\\jaija\\OneDrive\\เดสก์ท็อป\\POE2-Auto-Craftmanship\\poe2-crafting-frontend\\src\\assets\\data\\poe2_mods_normalized.json';
const outputPath = 'C:\\Users\\jaija\\OneDrive\\เดสก์ท็อป\\POE2-Auto-Craftmanship\\poe2-crafting-frontend\\src\\assets\\data\\mods_tiers_by_name.json';
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
try {
  const j = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const mods = j.mods || [];
  const result = {};
  mods.forEach(m => {
    const name = m.name || m.affix || 'unknown';
    if (!result[name]) result[name] = [];
    (m.tiers || []).forEach(t => {
      result[name].push({
        tier: t.tier,
        ilvl: t.ilvl,
        values: t.values,
        maxValue: maxOfValues(t.values),
        weighting: t.weighting,
        source: m.source || '',
        mtypeNames: m.mtypeNames || [],
        groupNames: m.groupNames || [],
        modId: m.id
      });
    });
  });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log('Extracted mod tiers by name to', outputPath);
} catch (e) {
  console.error('Error:', e && e.message);
  process.exit(1);
}
