/*
  scripts/extract_mods_by_base.js

  Purpose: Extract valid mods for all base item types, including Spear.
  Uses mods_tiers_by_name.json to find mtypeNames (tags) for each mod.

  Input: mods_tiers_by_name.json
  Output: data/valid_mods_by_base.json with mods grouped by base item type.
*/
const fs = require('fs');
const path = require('path');

const modsFile = path.resolve(__dirname, '../poe2-crafting-frontend/src/assets/data/mods_tiers_by_name.json');
const outFile = path.resolve(__dirname, '../data/valid_mods_by_base.json');

// User-provided mod lists for all base item types
const baseMods = {
  Spear: {
    prefix: [
      { name: "Adds # to # Physical Damage", total_tier: 9, max_iLvl: 75, Weights: 6300, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 6615, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 8085, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "#% increased Physical Damage", total_tier: 8, max_iLvl: 82, Weights: 3775, tags: ["Damage", "Physical", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 5700, tags: ["Attack"] },
      { name: "#% increased Elemental Damage with Attacks", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Damage", "Elemental", "Attack"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 2000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 6000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 10, max_iLvl: 81, Weights: 2600, tags: ["Attack"] },
      { name: "# to Level of all Projectile Skills", total_tier: 10, max_iLvl: 81, Weights: 2600, tags: ["Attack"] },
      { name: "Leeches #% of Physical Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leeches #% of Physical Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Grants # Life per Enemy Hit", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 8, max_iLvl: 77, Weights: 5300, tags: ["Attack", "Speed"] },
      { name: "#% to Critical Hit Chance", total_tier: 6, max_iLvl: 77, Weights: 3875, tags: ["Attack", "Critical"] },
      { name: "#% to Critical Damage Bonus", total_tier: 6, max_iLvl: 77, Weights: 3875, tags: ["Damage", "Attack", "Critical"] },
      { name: "# to Accuracy Rating#% increased Light Radius", total_tier: 6, max_iLvl: 76, Weights: 3000, tags: ["Attack"] },
      { name: "#% increased Stun Duration", total_tier: 6, max_iLvl: 76, Weights: 3000, tags: null },
      { name: "Causes #% increased Stun Buildup", total_tier: 6, max_iLvl: 76, Weights: 6000, tags: null }
    ]
  },
  Desecrated: {
    prefix: [
      { name: "Companions deal (40-59)% increased Damage , (40–59)% increased Damage while your Companion is in your Presence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
      { name: "(12-23)% increased Area of Effect for Attacks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attack"] },
      { name: "Attacks with this Weapon Penetrate (15-25)% Fire Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Elemental", "Fire", "Attack"] },
      { name: "(60-79)% increased Melee Damage if you've dealt a Projectile Attack Hit in the past eight seconds", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Elemental", "Attack"] },
      { name: "Attacks with this Weapon Penetrate (15-25)% Cold Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Elemental", "Cold", "Attack"] },
      { name: "Projectiles have (25-35)% chance to Chain an additional time from terrain", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
      { name: "Projectiles deal (60-79)% increased Damage with Hits against Enemies further than 6m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
      { name: "Attacks with this Weapon Penetrate (15-25)% Lightning Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Elemental", "Lightning", "Attack"] }
    ],
    suffix: [
      { name: "(5-10)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
      { name: "(12-18)% increased Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
      { name: "Companions have (12-18)% increased Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
      { name: "(40-60)% chance to Pierce an Enemy", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
      { name: "(25-34)% increased Immobilisation buildup", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
      { name: "Projectiles have (25-34)% increased Critical Hit Chance against Enemies further than 6m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
      { name: "(8-15)% increased Cost Efficiency of Attacks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
      { name: "(8-13)% increased Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
      { name: "(8-13)% increased Attack Speed while your Companion is in your Presence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
      { name: "Projectile Attacks have a (10-18)% chance to fire two additional Projectiles while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
      { name: "(15-20)% of Skill Mana Costs Converted to Life Costs", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] }
    ]
  },
  Essence: {
    prefix: [
      { name: "Adds # to # Physical Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 4, max_iLvl: 58, Weights: 0, tags: ["Attack"] },
      { name: "Gain #% of Damage as Extra Physical Damage", total_tier: 4, max_iLvl: 72, Weights: 0, tags: ["Damage", "Physical"] },
      { name: "Gain #% of Damage as Extra Fire Damage", total_tier: 4, max_iLvl: 72, Weights: 0, tags: ["Damage", "Elemental", "Fire"] },
      { name: "Gain #% of Damage as Extra Cold Damage", total_tier: 4, max_iLvl: 72, Weights: 0, tags: ["Damage", "Elemental", "Cold"] },
      { name: "Gain #% of Damage as Extra Lightning Damage", total_tier: 4, max_iLvl: 72, Weights: 0, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
    ],
    suffix: [
      { name: "#% increased Attack Speed", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Attack", "Speed"] },
      { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
      { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
      { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
      { name: "+4 to Level of all Attack Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attack"] },
      { name: "(20-25)% chance to gain Onslaught on Killing Hits with this Weapon", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Speed"] },
      { name: "#% to Critical Hit Chance", total_tier: 3, max_iLvl: 44, Weights: 0, tags: ["Attack", "Critical"] },
      { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
    ]
  },
  Corrupted: {
    prefix: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: [""] },
      { name: "(15-25)% increased Physical Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds (9-14) to (15-22) Fire Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds (8-12) to (13-19) Cold Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds (1-2) to (29-43) Lightning Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Adds (7-11) to (12-18) Chaos damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Chaos", "Attack"] },
      { name: "(6-8)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "+(5-10)% to Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Attack", "Critical"] },
      { name: "(20-30)% increased Elemental Damage with Attacks", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Attack"] }
    ],
    suffix: []
  }
};

const main = () => {
  const modsData = JSON.parse(fs.readFileSync(modsFile, 'utf8'));
  const result = {};

  for (const base in baseMods) {
    result[base] = { prefix: [], suffix: [] };

    for (const affix of ['prefix', 'suffix']) {
      for (const mod of baseMods[base][affix]) {
        const modName = mod.name;
        const total_tier = mod.total_tier || null;
        const max_iLvl = mod.max_iLvl || null;
        const Weights = mod.Weights || null;
        const tags = mod.tags || null;

        if (!modsData[modName]) {
          console.warn(`Mod not found: ${modName}`);
          continue;
        }

        // Get unique mtypeNames from all tiers
        const mtypeNamesSet = new Set();
        modsData[modName].forEach(tier => {
          if (tier.mtypeNames) {
            tier.mtypeNames.forEach(tag => mtypeNamesSet.add(tag));
          }
        });
        const mtypeNames = Array.from(mtypeNamesSet);
        result[base][affix].push({ name: modName, total_tier, max_iLvl, Weights, tags, mtypeNames });
      }
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf8');
  console.log('WROTE', outFile);
  console.log('Base item types processed:', Object.keys(result).length);
};

main();
