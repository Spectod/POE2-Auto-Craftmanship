const fs = require("fs");

// โหลดไฟล์
const baseMods = JSON.parse(fs.readFileSync("../poe2-crafting-frontend/src/assets/data/base_mods_catalog.json", "utf8"));
const modsList = JSON.parse(fs.readFileSync("../poe2-crafting-frontend/src/assets/data/all_mods_prefix_suffix_in_base_items.json", "utf8")); 

function extractTiers(modName, catalog) {
  const modData = catalog.mods[modName];
  if (!modData) return null;

  return {
    name: modName,
    tiers: modData.canonical.map(t => ({
      tier: t.tier,
      ilvl: t.ilvl,
      rank: t.rank,
      score: t.score
    }))
  };
}

function processMods(modNames, catalog) {
  return modNames
    .map(name => extractTiers(name, catalog))
    .filter(Boolean); // กรองพวกที่หาไม่เจอ
}

// ดึง tier ของ prefix/suffix
const result = {
  prefix: processMods(modsList.prefix, baseMods),
  suffix: processMods(modsList.suffix, baseMods)
};

// บันทึกไฟล์ใหม่
fs.writeFileSync("all_modsTier_prefix_suffix.json", JSON.stringify(result, null, 2));

console.log("✅ เขียนไฟล์ all_modsTier_prefix_suffix.json เรียบร้อยแล้ว!");
