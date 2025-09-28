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
  Spears: {
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
    ],
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
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: [""] },
      { name: "(15-25)% increased Physical Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds (9-14) to (15-22) Fire Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds (8-12) to (13-19) Cold Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds (1-2) to (29-43) Lightning Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Adds (7-11) to (12-18) Chaos damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Chaos", "Attack"] },
      { name: "(6-8)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "+(5-10)% to Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Attack", "Critical"] },
      { name: "(20-30)% increased Elemental Damage with Attacks", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Attack"] }
    ]
  },
  Wands: {
    prefix: [
      { name: "# to maximum Mana", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Mana"] },
      { name: "#% increased Spell Damage", total_tier: 8, max_iLvl: 80, Weights: 4350, tags: ["Damage", "Caster"] },
      { name: "#% increased Spell Damage# to maximum Mana", total_tier: 7, max_iLvl: 80, Weights: 4300, tags: ["Mana", "Damage", "Caster"] },
      { name: "#% increased Fire Damage", total_tier: 40, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Fire"] },
      { name: "#% increased Cold Damage", total_tier: 40, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Cold"] },
      { name: "#% increased Lightning Damage", total_tier: 40, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "#% increased Chaos Damage", total_tier: 40, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Chaos"] },
      { name: "#% increased Spell Physical Damage", total_tier: 40, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Physical"] },
      { name: "Gain #% of Damage as Extra Fire Damage", total_tier: 6, max_iLvl: 80, Weights: 3000, tags: ["Damage", "Elemental", "Fire"] },
      { name: "Gain #% of Damage as Extra Cold Damage", total_tier: 6, max_iLvl: 80, Weights: 3000, tags: ["Damage", "Elemental", "Cold"] },
      { name: "Gain #% of Damage as Extra Lightning Damage", total_tier: 6, max_iLvl: 80, Weights: 3000, tags: ["Damage", "Elemental", "Lightning"] }
    ],
    suffix: [
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Spell Skills", total_tier: 29, max_iLvl: 81, Weights: 13500, tags: ["Caster", "Gem"] },
      { name: "#% increased Mana Regeneration Rate", total_tier: 6, max_iLvl: 79, Weights: 6000, tags: ["Mana"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "#% increased Cast Speed", total_tier: 8, max_iLvl: 80, Weights: 5750, tags: ["Caster", "Speed"] },
      { name: "#% increased Critical Hit Chance for Spells", total_tier: 6, max_iLvl: 76, Weights: 3875, tags: ["Caster", "Critical"] },
      { name: "#% increased Critical Spell Damage Bonus", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Caster", "Critical"] },
      { name: "#% increased Mana Regeneration Rate#% increased Light Radius", total_tier: 3, max_iLvl: 30, Weights: 3000, tags: ["Mana"] },
      { name: "#% increased Flammability Magnitude", total_tier: 5, max_iLvl: 75, Weights: 4000, tags: null },
      { name: "#% increased Freeze Buildup", total_tier: 5, max_iLvl: 75, Weights: 4000, tags: null },
      { name: "#% increased chance to Shock", total_tier: 5, max_iLvl: 75, Weights: 4000, tags: null }
    ],
    Essence: {
      prefix: [
        { name: "#% increased Spell Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage", "Caster"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "+3 to Level of all Spell Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Caster", "Gem"] },
        { name: "#% increased Critical Hit Chance for Spells", total_tier: 3, max_iLvl: 41, Weights: 0, tags: ["Caster", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% increased Cast Speed", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Caster", "Speed"] },
        { name: "(18–20)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Mana"] }
      ]
    },
    Desecrated: {
      prefix: [
        { name: "(55-64)% increased Spell Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Mana"] },
        { name: "Minions deal (55-64)% increased Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Minion"] },
        { name: "(74-89)% increased Elemental Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Elemental"] },
        { name: "#% increased Spell Damage with Spells that cost Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life", "Caster"] },
        { name: "Invocated Spells deal #% increased Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana", "Caster", "Damage"] },
        { name: "(27-38)% increased Magnitude of Bleeding you inflict", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Physical", "Attack", "Ailment"] },
        { name: "Gain (21-25)% of Damage as Extra Physical Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Physical"] }
      ],
      suffix: [
        { name: "Enemies Hindered by you take #% increased Elemental Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Enemies Hindered by you take #% increased Chaos Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Enemies Hindered by you take #% increased Physical Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Spell Skills have (8–16)% increased Area of Effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(5-10)% increased Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life", "Caster"] },
        { name: "(15-25)% of Spell Mana Cost Converted to Life Cost", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life", "Caster"] },
        { name: "#% increased Cast Speed while on Full Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana", "Caster", "Speed"] },
        { name: "#% increased Cast Speed for each different Non-Instant Spell you've Cast Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana", "Caster", "Speed"] },
        { name: "Break #% increased Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Break Armour on Critical Hit with Spells equal to #% of Physical Damage dealt", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Corrupted: {
      prefix: [
        { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
        { name: "# to Level of all Fire Spell Skills", total_tier: 5, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Caster", "Gem"] },
        { name: "# to Level of all Cold Spell Skills", total_tier: 5, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Caster", "Gem"] },
        { name: "# to Level of all Lightning Spell Skills", total_tier: 5, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Caster", "Gem"] },
        { name: "# to Level of all Chaos Spell Skills", total_tier: 5, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Caster", "Gem"] },
        { name: "# to Level of all Physical Spell Skills", total_tier: 5, max_iLvl: 1, Weights: 1, tags: ["Physical", "Caster", "Gem"] },
        { name: "(20-30)% increased Spell Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Caster"] }
      ],
      suffix: [
        { name: "(20-30)% increased Flammability Magnitude", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
        { name: "(20-30)% increased Freeze Buildup", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
        { name: "(20-30)% increased chance to Shock", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
        { name: "(20-30)% increased Critical Hit Chance for Spells", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Caster", "Critical"] },
        { name: "Gain (20-25) Life per Enemy Killed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
        { name: "Gain (10-15) Mana per Enemy Killed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
        { name: "(10-15)% increased Cast Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Caster", "Speed"] }
      ]
    }
  },
  OneHandMaces: {
    prefix: [
      { name: "Adds # to # Physical Damage", total_tier: 9, max_iLvl: 75, Weights: 6300, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 8820, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "#% increased Physical Damage", total_tier: 8, max_iLvl: 82, Weights: 3775, tags: ["Damage", "Physical", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 5700, tags: ["Attack"] },
      { name: "#% increased Elemental Damage with Attacks", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Damage", "Elemental", "Attack"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 10, max_iLvl: 81, Weights: 2600, tags: ["Attack"] },
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
    ],
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
        { name: "+4 to Level of all Attack Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attack"] },
        { name: "(20-25)% chance to gain Onslaught on Killing Hits with this Weapon", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Speed"] },
        { name: "#% to Critical Hit Chance", total_tier: 3, max_iLvl: 44, Weights: 0, tags: ["Attack", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ]
    },
    Desecrated: {
      prefix: [
        { name: "(41-59)% increased Damage against Enemies with Fully Broken Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Fire Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Elemental", "Fire", "Attack"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Cold Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Elemental", "Cold", "Attack"] },
        { name: "Empowered Attacks deal (41-59)% increased Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Attack"] },
        { name: "(110-154)% increased Physical Damage, 15% reduced Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Attack", "Speed"] },
        { name: "(41-59)% increased Damage while you have a Totem", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage"] },
        { name: "Melee Attack Skills have +1 to maximum number of Summoned Totems", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Lightning Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Elemental", "Lightning", "Attack"] }
      ],
      suffix: [
        { name: "Fissure Skills have a (15-25)% chance to create an additional Fissure", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attack"] },
        { name: "(5-10)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(10-16)% chance for Mace Slam Skills you use yourself to cause Aftershocks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attack"] },
        { name: "Break Armour equal to (2-4)% of Physical Damage dealt", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Physical"] },
        { name: "#% increased Cost Efficiency of Attacks", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
        { name: "(17-25)% increased Warcry Cooldown Recovery Rate", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(17-25)% increased Totem Placement speed", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] },
        { name: "(15-20)% of Skill Mana Costs Converted to Life Costs", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] }
      ]
    },
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "(15-25)% increased Physical Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds (9-14) to (15-22) Fire Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds (8-12) to (13-19) Cold Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds (1-2) to (29-43) Lightning Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Adds (7-11) to (12-18) Chaos Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Chaos", "Attack"] },
      { name: "(6-8)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "+(5-10)% to Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Attack", "Critical"] },
      { name: "(20-30)% increased Stun Buildup", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(10-20)% increased Melee Strike Range with this weapon", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(10-15)% chance to cause Bleeding on Hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Physical", "Attack", "Ailment"] },
      { name: "Gain 1 Rage on Hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20-30)% increased Elemental Damage with Attacks", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Attack"] }
    ],
  },
  Sceptres: {
    prefix: [
      { name: "# to maximum Mana", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Mana"] },
      { name: "Allies in your Presence deal # to # added Attack Physical Damage", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Physical", "Attack"] },
      { name: "Allies in your Presence deal # to # added Attack Fire Damage", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Allies in your Presence deal # to # added Attack Cold Damage", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Allies in your Presence deal # to # added Attack Lightning Damage", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Allies in your Presence deal #% increased Damage", total_tier: 8, max_iLvl: 82, Weights: 4350, tags: ["Damage"] },
      { name: "#% increased Spirit", total_tier: 8, max_iLvl: 82, Weights: 4350, tags: ["Spirit"] },
      { name: "#% increased Spirit# to maximum Mana", total_tier: 7, max_iLvl: 80, Weights: 4300, tags: ["Spirit", "Mana"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 2000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 6000, tags: ["Attribute"] },
      { name: "Allies in your Presence have #% to all Elemental Resistances", total_tier: 6, max_iLvl: 80, Weights: 4800, tags: ["Elemental", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Minion Skills", total_tier: 8, max_iLvl: 74, Weights: 1600, tags: ["Minion", "Gem"] },
      { name: "Allies in your Presence Regenerate # Life per second", total_tier: 10, max_iLvl: 75, Weights: 10000, tags: ["Life"] },
      { name: "#% increased Mana Regeneration Rate", total_tier: 6, max_iLvl: 79, Weights: 6000, tags: ["Mana"] },
      { name: "Allies in your Presence have #% increased Attack Speed", total_tier: 4, max_iLvl: 56, Weights: 4000, tags: ["Attack", "Speed"] },
      { name: "Allies in your Presence have #% increased Cast Speed", total_tier: 4, max_iLvl: 56, Weights: 4000, tags: ["Caster", "Speed"] },
      { name: "Allies in your Presence have #% increased Critical Hit Chance", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Critical"] },
      { name: "Allies in your Presence have #% increased Critical Damage Bonus", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Damage", "Critical"] },
      { name: "#% increased Mana Regeneration Rate#% increased Light Radius", total_tier: 3, max_iLvl: 30, Weights: 3000, tags: ["Mana"] },
      { name: "#% increased Presence Area of Effect", total_tier: 4, max_iLvl: 72, Weights: 7200, tags: null },
      { name: "Minions have #% increased maximum Life", total_tier: 6, max_iLvl: 80, Weights: 6000, tags: ["Life", "Minion"] }
    ],
    Essence: {
      prefix: [
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Allies in your Presence deal #% increased Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage"] }
      ],
      suffix: [
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Aura Skills have (15-20)% increased Magnitudes", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Aura"] }
      ]
    },
    Desecrated: {
      prefix: null,
      suffix: null
    },
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null},
      { name: "(15-25)% increased Spirit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Allies in your Presence deal (20-30)% increased Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "Allies in your Presence have (5-10)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "Allies in your Presence have (5-10)% increased Cast Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Caster", "Speed"] },
      { name: "Allies in your Presence have (10-15)% increased Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Critical"] }
    ]
  },
  TwoHandMaces: {
    prefix: [
      { name: "Adds # to # Physical Damage", total_tier: 9, max_iLvl: 75, Weights: 6300, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 8820, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "#% increased Physical Damage", total_tier: 8, max_iLvl: 82, Weights: 3775, tags: ["Damage", "Physical", "Attack"] },
      { name: "#% increased Physical Damage# to Accuracy Rating", total_tier: 8, max_iLvl: 81, Weights: 5300, tags: ["Damage", "Physical", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 5700, tags: ["Attack"] },
      { name: "#% increased Elemental Damage with Attacks", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Damage", "Elemental", "Attack"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 5, max_iLvl: 81, Weights: 2600, tags: ["Attack"] },
      { name: "Leeches #% of Physical Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leeches #% of Physical Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Grants # Life per Enemy Hit", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 8, max_iLvl: 77, Weights: 5300, tags: ["Attack", "Speed"] },
      { name: "#% to Critical Hit Chance", total_tier: 6, max_iLvl: 77, Weights: 3875, tags: ["Attack", "Critical"] },
      { name: "#% to Critical Damage Bonus", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Damage", "Attack", "Critical"] },
      { name: "# to Accuracy Rating#% increased Light Radius", total_tier: 3, max_iLvl: 30, Weights: 3000, tags: ["Attack"] },
      { name: "#% increased Stun Duration", total_tier: 6, max_iLvl: 71, Weights: 6000, tags: null },
      { name: "Causes #% increased Stun Buildup", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: null }
    ],
    Desecrated: {
      prefix: [
        { name: "(86-99)% increased Damage against Enemies with Fully Broken Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Fire Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Elemental", "Fire", "Attack"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Cold Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Elemental", "Cold", "Attack"] },
        { name: "Empowered Attacks deal (86-99)% increased Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Attack"] },
        { name: "(110-154)% increased Physical Damage, 15% reduced Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Attack", "Speed"] },
        { name: "(86-99)% increased Damage while you have a Totem", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage"] },
        { name: "Melee Attack Skills have +1 to maximum number of Summoned Totems", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Lightning Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Elemental", "Lightning", "Attack"] }
      ],
      suffix: [
        { name: "Fissure Skills have a (25-31)% chance to create an additional Fissure", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attack"] },
        { name: "(5-10)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(16-23)% chance for Mace Slam Skills you use yourself to cause Aftershocks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attack"] },
        { name: "Break Armour equal to (4-7)% of Physical Damage dealt", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Physical"] },
        { name: "#% increased Cost Efficiency of Attacks", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
        { name: "(25-31)% increased Warcry Cooldown Recovery Rate", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(25-31)% increased Totem Placement speed", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] },
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
        { name: "+6 to Level of all Attack Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attack"] },
        { name: "(20-25)% chance to gain Onslaught on Killing Hits with this Weapon", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Speed"] },
        { name: "#% to Critical Hit Chance", total_tier: 3, max_iLvl: 44, Weights: 0, tags: ["Attack", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(15-25)% increased Physical Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds (13-20) to (21-31) Fire Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds (11-17) to (18-26) Cold Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds (1-3) to (41-61) Lightning Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Adds (10-16) to (17-25) Chaos Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Chaos", "Attack"] },
      { name: "(6-8)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "+(5-10)% to Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Attack", "Critical"] },
      { name: "Causes (20-30)% increased Stun Buildup", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(10-20)% increased Melee Strike Range with this weapon", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(10-15)% chance to cause Bleeding on Hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Physical", "Attack", "Ailment"] },
      { name: "Gain 1 Rage on Hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(40-50)% increased Elemental Damage with Attacks", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Attack"] }
    ]
  },
  Quarterstaves: {
    prefix: [
      { name: "Adds # to # Physical Damage", total_tier: 9, max_iLvl: 75, Weights: 6300, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 6615, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 8085, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "#% increased Physical Damage", total_tier: 8, max_iLvl: 82, Weights: 3775, tags: ["Damage", "Physical", "Attack"] },
      { name: "#% increased Physical Damage# to Accuracy Rating", total_tier: 8, max_iLvl: 81, Weights: 5300, tags: ["Damage", "Physical", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 5700, tags: ["Attack"] },
      { name: "#% increased Elemental Damage with Attacks", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Damage", "Elemental", "Attack"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 6000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 6000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 5, max_iLvl: 81, Weights: 2600, tags: ["Attack"] },
      { name: "Leeches #% of Physical Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leeches #% of Physical Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Grants # Life per Enemy Hit", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 8, max_iLvl: 77, Weights: 5300, tags: ["Attack", "Speed"] },
      { name: "#% to Critical Hit Chance", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Attack", "Critical"] },
      { name: "#% to Critical Damage Bonus", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Damage", "Attack", "Critical"] },
      { name: "# to Accuracy Rating#% increased Light Radius", total_tier: 3, max_iLvl: 30, Weights: 3000, tags: ["Attack"] },
      { name: "#% increased Stun Duration", total_tier: 6, max_iLvl: 71, Weights: 6000, tags: null },
      { name: "Causes #% increased Stun Buildup", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: null }
    ],
    Desecrated: {
      prefix: [
        { name: "Attacks with this Weapon Penetrate (15-25)% Fire Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Elemental", "Fire", "Attack"] },
        { name: "(86-99)% increased Fire Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Ailment"] },
        { name: "(14-23)% increased Ignite Magnitude", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Cold Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Elemental", "Cold", "Attack"] },
        { name: "(86-99)% increased Cold Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold"] },
        { name: "(14-23)% increased Freeze Buildup", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Lightning Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Elemental", "Lightning", "Attack"] },
        { name: "(86-99)% increased Lightning Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning"] },
        { name: "(14-23)% increased Magnitude of Shock you inflict", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ],
      suffix: [
        { name: "(5-10)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25-40)% chance to build an additional Combo on Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(8-15)% increased Cost Efficiency of Attacks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
        { name: "Recover #% of Maximum Mana when you expend at least # Combo", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "Recover #% of Maximum Life when you expend at least # Combo", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
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
        { name: "+6 to Level of all Attack Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attack"] },
        { name: "(20-25)% chance to gain Onslaught on Killing Hits with this Weapon", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Speed"] },
        { name: "#% to Critical Hit Chance", total_tier: 3, max_iLvl: 44, Weights: 0, tags: ["Attack", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(15-25)% increased Physical Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds (13-20) to (21-31) Fire Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds (11-17) to (18-26) Cold Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds (1-3) to (41-61) Lightning Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Adds (10-16) to (17-25) Chaos Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Chaos", "Attack"] },
      { name: "(6-8)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "+(5-10)% to Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Attack", "Critical"] },
      { name: "Causes (20-30)% increased Stun Buildup", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(10-20)% increased Melee Strike Range with this weapon", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(10-15)% chance to Poison on Hit with this weapon", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Attack", "Ailment"] },
      { name: "Gain 1 Rage on Hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(40-50)% increased Elemental Damage with Attacks", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Attack"] }
    ]
  },
  Crossbows: {
    prefix: [
      { name: "Adds # to # Physical Damage", total_tier: 9, max_iLvl: 75, Weights: 6300, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 7350, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 7350, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "#% increased Physical Damage", total_tier: 8, max_iLvl: 82, Weights: 3775, tags: ["Damage", "Physical", "Attack"] },
      { name: "#% increased Physical Damage# to Accuracy Rating", total_tier: 8, max_iLvl: 81, Weights: 5300, tags: ["Damage", "Physical", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 10, max_iLvl: 82, Weights: 5800, tags: ["Attack"] },
      { name: "#% increased Elemental Damage with Attacks", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Damage", "Elemental", "Attack"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Projectile Skills", total_tier: 5, max_iLvl: 81, Weights: 2600, tags: ["Attack"] },
      { name: "Leeches #% of Physical Damage as Life", total_tier: 4, max_iLvl: 68, Weights: 4000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leeches #% of Physical Damage as Mana", total_tier: 4, max_iLvl: 68, Weights: 4000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Grants # Life per Enemy Hit", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 5, max_iLvl: 77, Weights: 3900, tags: ["Attack", "Speed"] },
      { name: "#% to Critical Hit Chance", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Attack", "Critical"] },
      { name: "#% to Critical Damage Bonus", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Damage", "Attack", "Critical"] },
      { name: "# to Accuracy Rating#% increased Light Radius", total_tier: 3, max_iLvl: 30, Weights: 3000, tags: ["Attack"] },
      { name: "Loads an additional bolt", total_tier: 2, max_iLvl: 82, Weights: 375, tags: ["Attack"] },
      { name: "Loads # additional bolts", total_tier: 2, max_iLvl: 82, Weights: 375, tags: ["Attack"] }
    ],
    Desecrated: {
      prefix: [
        { name: "Grenade Skills have +1 Cooldown Use", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(101-121)% increased Grenade Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage"] },
        { name: "(20-30)% increased Grenade Duration", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Fire Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Elemental", "Fire", "Attack"] },
        { name: "Projectiles deal (85-109)% increased Damage with Hits against Enemies within 2m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Cold Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Elemental", "Cold", "Attack"] },
        { name: "+1 to Maximum number of Summoned Ballista Totems", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Lightning Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Elemental", "Lightning", "Attack"] }
      ],
      suffix: [
        { name: "Grenades have (15-25)% chance to activate a second time", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(5-10)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "#% chance when you Reload a Crossbow to be immediate", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "#% increased Reload Speed", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
        { name: "(8-15)% increased Cost Efficiency of Attacks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
        { name: "Attacks Chain an additional time", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Projectiles have (27-38)% increased Critical Damage Bonus against Enemies within 2m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
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
        { name: "+6 to Level of all Attack Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attack"] },
        { name: "(20-25)% chance to gain Onslaught on Killing Hits with this Weapon", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Speed"] },
        { name: "#% to Critical Hit Chance", total_tier: 3, max_iLvl: 44, Weights: 0, tags: ["Attack", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(15-25)% increased Physical Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds (13-20) to (21-31) Fire Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds (11-17) to (18-26) Cold Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds (1-3) to (41-61) Lightning Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Adds (10-16) to (17-25) Chaos Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Chaos", "Attack"] },
      { name: "(6-8)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "+(5-10)% to Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Attack", "Critical"] },
      { name: "(10-15)% chance to Maim on Hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(5-10)% chance to Blind Enemies on hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(40-50)% increased Elemental Damage with Attacks", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Attack"] },
      { name: "Loads an additional bolt", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] }
    ]
  },
  Bows: {
    prefix: [
      { name: "Adds # to # Physical Damage", total_tier: 9, max_iLvl: 75, Weights: 6300, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 7350, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 5880, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 8820, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "#% increased Physical Damage", total_tier: 8, max_iLvl: 82, Weights: 3775, tags: ["Damage", "Physical", "Attack"] },
      { name: "#% increased Physical Damage# to Accuracy Rating", total_tier: 8, max_iLvl: 81, Weights: 5300, tags: ["Damage", "Physical", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 10, max_iLvl: 82, Weights: 5800, tags: ["Attack"] },
      { name: "#% increased Elemental Damage with Attacks", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Damage", "Elemental", "Attack"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Projectile Skills", total_tier: 5, max_iLvl: 81, Weights: 2600, tags: ["Attack"] },
      { name: "Leeches #% of Physical Damage as Life", total_tier: 4, max_iLvl: 68, Weights: 4000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leeches #% of Physical Damage as Mana", total_tier: 4, max_iLvl: 68, Weights: 4000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Grants # Life per Enemy Hit", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 5, max_iLvl: 77, Weights: 3900, tags: ["Attack", "Speed"] },
      { name: "#% to Critical Hit Chance", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Attack", "Critical"] },
      { name: "#% to Critical Damage Bonus", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Damage", "Attack", "Critical"] },
      { name: "# to Accuracy Rating#% increased Light Radius", total_tier: 3, max_iLvl: 30, Weights: 3000, tags: ["Attack"] },
      { name: "Bow Attacks fire an additional Arrow", total_tier: 2, max_iLvl: 82, Weights: 375, tags: ["Attack"] },
      { name: "Bow Attacks fire # additional Arrows", total_tier: 2, max_iLvl: 82, Weights: 375, tags: ["Attack"] }
    ],
    Desecrated: {
      prefix: [
        { name: "(12-23)% increased Area of Effect for Attacks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attack"] },
        { name: "Companions deal (40-59)% increased Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(40-59)% increased Damage while your Companion is in your Presence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Fire Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Elemental", "Fire", "Attack"] },
        { name: "Projectiles have (25-35)% chance to Chain an additional time from terrain", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(30-40)% increased bonuses gained from Equipped Quiver", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Cold Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Elemental", "Cold", "Attack"] },
        { name: "Attacks with this Weapon Penetrate (15-25)% Lightning Resistance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Elemental", "Lightning", "Attack"] },
        { name: "Projectiles deal (60-79)% increased Damage with Hits against Enemies further than 6m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ],
      suffix: [
        { name: "(40-60)% Chance to Pierce an Enemy", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12-18)% increased Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Companions have (12-18)% increased Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(5-10)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25-34)% increased Immobilisation buildup", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "Projectiles have (25-34)% increased Critical Hit Chance against Enemies further than 6m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(8-15)% increased Cost Efficiency of Attacks", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attack"] },
        { name: "(15-20)% of Skill Mana Costs Converted to Life Costs", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] },
        { name: "Projectile Attacks have a (10-18)% chance to fire two additional Projectiles while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(8-13)% increased Attack Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(8-13)% increased Attack Speed while your Companion is in your Presence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
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
        { name: "+4 to Level of all Attack Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attack"] },
        { name: "(20-25)% chance to gain Onslaught on Killing Hits with this Weapon", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Speed"] },
        { name: "#% to Critical Hit Chance", total_tier: 3, max_iLvl: 44, Weights: 0, tags: ["Attack", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(15-25)% increased Physical Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds (9-14) to (15-22) Fire Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds (8-12) to (13-19) Cold Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds (1-2) to (29-43) Lightning Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "Adds (7-11) to (12-18) Chaos Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Chaos", "Attack"] },
      { name: "(6-8)% increased Attack Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] },
      { name: "+(5-10)% to Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Attack", "Critical"] },
      { name: "(10-15)% chance to Maim on Hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(5-10)% chance to Blind Enemies on hit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(20-30)% increased Elemental Damage with Attacks", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Attack"] },
      { name: "Bow Attacks fire an additional Arrow", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] }
    ]
  },
  Staves: {
    prefix: [
      { name: "# to maximum Mana", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Mana"] },
      { name: "#% increased Spell Damage", total_tier: 8, max_iLvl: 80, Weights: 4350, tags: ["Damage", "Caster"] },
      { name: "#% increased Spell Damage# to maximum Mana", total_tier: 7, max_iLvl: 79, Weights: 4300, tags: ["Mana", "Damage", "Caster"] },
      { name: "#% increased Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Fire"] },
      { name: "#% increased Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Cold"] },
      { name: "#% increased Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "#% increased Chaos Damage", total_tier: 8, max_iLvl: 80, Weights: 12750, tags: ["Damage", "Chaos"] },
      { name: "#% increased Spell Physical Damage", total_tier: 8, max_iLvl: 80, Weights: 12750, tags: ["Damage", "Physical"] },
      { name: "Gain #% of Damage as Extra Fire Damage", total_tier: 6, max_iLvl: 80, Weights: 6, tags: ["Damage", "Elemental", "Fire"] },
      { name: "Gain #% of Damage as Extra Cold Damage", total_tier: 6, max_iLvl: 80, Weights: 6, tags: ["Damage", "Elemental", "Cold"] },
      { name: "Gain #% of Damage as Extra Lightning Damage", total_tier: 6, max_iLvl: 80, Weights: 6, tags: ["Damage", "Elemental", "Lightning"] }
    ],
    suffix: [
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 5000, tags: null },
      { name: "# to Level of all Spell Skills", total_tier: 29, max_iLvl: 81, Weights: 13500, tags: ["Caster", "Gem"] },
      { name: "# to Level of all Fire Spell Skills", total_tier: 8, max_iLvl: 80, Weights: 0, tags: null },
      { name: "# to Level of all Cold Spell Skills", total_tier: 8, max_iLvl: 80, Weights: 0, tags: null },
      { name: "# to Level of all Lightning Spell Skills", total_tier: 8, max_iLvl: 80, Weights: 0, tags: null },
      { name: "# to Level of all Chaos Spell Skills", total_tier: 8, max_iLvl: 80, Weights: 0, tags: null },
      { name: "# to Level of all Physical Spell Skills", total_tier: 8, max_iLvl: 80, Weights: 0, tags: null },
      { name: "#% increased Mana Regeneration Rate", total_tier: 6, max_iLvl: 79, Weights: 6, tags: ["Mana"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "#% increased Cast Speed", total_tier: 7, max_iLvl: 81, Weights: 5750, tags: ["Caster", "Speed"] },
      { name: "#% increased Critical Hit Chance for Spells", total_tier: 6, max_iLvl: 76, Weights: 6, tags: ["Caster", "Critical"] },
      { name: "#% increased Critical Spell Damage Bonus", total_tier: 6, max_iLvl: 73, Weights: 6, tags: ["Caster", "Critical"] },
      { name: "#% increased Mana Regeneration Rate#% increased Light Radius", total_tier: 3, max_iLvl: 30, Weights: 3000, tags: ["Mana"] },
      { name: "#% increased Flammability Magnitude", total_tier: 5, max_iLvl: 75, Weights: 4000, tags: null },
      { name: "#% increased Freeze Buildup", total_tier: 5, max_iLvl: 75, Weights: 4000, tags: null },
      { name: "#% increased chance to Shock", total_tier: 5, max_iLvl: 75, Weights: 4000, tags: null }
    ],
    Desecrated: {
      prefix: [
        { name: "(35-50) to Spirit", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "#% increased Spell Damage with Spells that cost Life", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "#% increased Spell Damage per # Maximum Mana", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "#% increased Spell Damage per # Maximum Life", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(1-2) to maximum number of Elemental Infusions", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental"] },
        { name: "(31-49)% increased Magnitude of Damaging Ailments you inflict", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Ailment"] }
      ],
      suffix: [
        { name: "(25-35)% increased Archon Buff duration", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12-16)% to Block Chance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25-35)% of Spell Mana Cost Converted to Life Cost", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life", "Caster"] },
        { name: "Archon recovery period expires (25-35)% faster", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(30-40)% increased Cast Speed when on Low Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Caster", "Speed"] },
        { name: "(25-35)% chance for Spell Skills to fire 2 additional Projectiles", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Caster"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "#% increased Spell Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage", "Caster"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "+5 to Level of all Spell Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Caster", "Gem"] },
        { name: "#% increased Critical Hit Chance for Spells", total_tier: 3, max_iLvl: 41, Weights: 0, tags: ["Caster", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% increased Cast Speed", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Caster", "Speed"] },
        { name: "(28-32)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Mana"] }
      ]
    },
    Corrupted: [
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "# to Level of all Fire Spell Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Caster", "Gem"] },
      { name: "# to Level of all Cold Spell Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "# to Level of all Lightning Spell Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "# to Level of all Chaos Spell Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "# to Level of all Physical Spell Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(40-50)% increased Spell Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Caster"] },
      { name: "(20-30)% increased Flammability Magnitude", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20-30)% increased Freeze Buildup", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20-30)% increased chance to Shock", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20-30)% increased Critical Hit Chance for Spells", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Caster", "Critical"] },
      { name: "Gain (20-25) Life per Enemy Killed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "Gain (10-15) Mana per Enemy Killed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "(10-15)% increased Cast Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Caster", "Speed"] }
    ]
  },
  Foci: {
    prefix: [
      { name: "# to maximum Mana", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Mana"] },
      { name: "# to maximum Energy Shield", total_tier: 10, max_iLvl: 70, Weights: 10000, tags: ["Defences"] },
      { name: "#% increased Energy Shield", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% Increased Energy Shield# to maximum Mana", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Mana", "Defences"] },
      { name: "#% increased Spell Damage", total_tier: 8, max_iLvl: 80, Weights: 4350, tags: ["Damage", "Caster"] },
      { name: "#% increased Fire Damage", total_tier: 10, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Fire"] },
      { name: "#% increased Cold Damage", total_tier: 10, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Cold"] },
      { name: "#% increased Lightning Damage", total_tier: 10, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "#% increased Chaos Damage", total_tier: 8, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Chaos"] },
      { name: "#% increased Spell Physical Damage", total_tier: 8, max_iLvl: 81, Weights: 12750, tags: ["Damage", "Physical"] }
    ],
    suffix: [
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "# to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "# to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "# to Chaos Resistance", total_tier: 8, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: null },
      { name: "# to Level of all Spell Skills", total_tier: 4, max_iLvl: 71, Weights: 750, tags: ["Caster", "Gem"] },
      { name: "#% increased Mana Regeneration Rate", total_tier: 6, max_iLvl: 79, Weights: 6000, tags: ["Mana"] },
      { name: "#% increased Cast Speed", total_tier: 7, max_iLvl: 80, Weights: 5500, tags: ["Caster", "Speed"] },
      { name: "#% increased Critical Hit Chance for Spells", total_tier: 6, max_iLvl: 59, Weights: 3750, tags: ["Caster", "Critical"] },
      { name: "#% increased Critical Spell Damage Bonus", total_tier: 6, max_iLvl: 59, Weights: 3750, tags: ["Caster", "Critical"] },
      { name: "#% increased Energy Shield Recharge Rate", total_tier: 6, max_iLvl: 81, Weights: 6000, tags: ["Defences"] },
      { name: "#% faster start of Energy Shield Recharge", total_tier: 6, max_iLvl: 81, Weights: 6000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: [
        { name: "Offering Skills have (12-20)% increased Buff effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster"] },
        { name: "(8-16)% increased Curse Magnitudes", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "Spell Skills have (10-20)% increased Area of Effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Caster"] },
        { name: "Invocated Spells deal (61-79)% increased Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Caster"] },
        { name: "Spell Skills have +1 to maximum number of Summoned Totems", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Caster"] },
        { name: "(61-79)% increased Spell Damage while wielding a Melee Weapon", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Caster"] }
      ],
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Level of all Minion Skills", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Minion", "Gem"] },
        { name: "(10-20)% faster Curse Activation", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Curse"] },
        { name: "(13-17)% to Fire and Chaos Resistances", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Dexterity and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "# to Cold and Chaos Resistances", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "(15-25)% chance when collecting an Elemental Infusion to gain an additional Elemental Infusion of the same type", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(6-10)% increased Mana Cost Efficiency", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(13-17)% to Lightning and Chaos Resistances", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(10-16)% chance for Spell Skills to fire 2 additional Projectiles", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Caster"] },
        { name: "(10-20)% of Spell Mana Cost Converted to Life Cost", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life", "Caster"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "+(30-39) to maximum Life", total_tier: 1, max_iLvl: 16, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "#% increased Spell Damage", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Damage", "Caster"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "# to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "+5 to Level of all Spell Skills", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Caster", "Gem"] },
        { name: "#% increased Energy Shield Recharge Rate", total_tier: 3, max_iLvl: 45, Weights: 0, tags: ["Defences"] },
        { name: "#% increased Critical Hit Chance for Spells", total_tier: 3, max_iLvl: 41, Weights: 0, tags: ["Caster", "Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "# to Fire Resistance", total_tier: 3, max_iLvl: 51, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "# to Cold Resistance", total_tier: 3, max_iLvl: 51, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "# to Lightning Resistance", total_tier: 3, max_iLvl: 51, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% increased Cast Speed", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Caster", "Speed"] },
        { name: "(28-32)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Mana"] }
      ]
    },
    Corrupted: [
      { name: "(15-25)% Increased Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10-20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(20-25) to maximum Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "(20-30)% Increased Spell Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Caster"] },
      { name: "(20-30)% Faster start of Energy Shield Recharge", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] }
    ]
  },
  Quivers: {
    prefix: [
      { name: "Adds # to # Physical Damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 7800, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 6200, tags: ["Attack"] },
      { name: "#% increased Projectile Speed", total_tier: 8, max_iLvl: 81, Weights: 3900, tags: ["Speed"] },
      { name: "#% increased Damage with Bow Skills", total_tier: 6, max_iLvl: 81, Weights: 3900, tags: ["Damage"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Level of all Projectile Skills", total_tier: 2, max_iLvl: 41, Weights: 750, tags: ["Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 6, max_iLvl: 56, Weights: 4500, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 6, max_iLvl: 56, Weights: 4500, tags: ["Mana"] },
      { name: "#% increased Attack Speed", total_tier: 5, max_iLvl: 77, Weights: 2000, tags: ["Attack", "Speed"] },
      { name: "#% increased Critical Hit Chance for Attacks", total_tier: 6, max_iLvl: 73, Weights: 3875, tags: ["Attack", "Critical"] },
      { name: "#% increased Critical Damage Bonus for Attack Damage", total_tier: 6, max_iLvl: 74, Weights: 3875, tags: ["Attack", "Critical", "Damage"] },
      { name: "#% chance to Pierce an Enemy", total_tier: 5, max_iLvl: 77, Weights: 2500, tags: null }
    ],
    Desecrated: {
      prefix: [
        { name: "Projectiles deal #% increased Damage with Hits against Enemies within #m", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage"] },
        { name: "Projectiles deal #% increased Damage with Hits against Enemies further than #m", total_tier: 3, max_iLvl: 65, Weights: 0, tags: null },
        { name: "Increases and Reductions to Projectile Speed also apply to Damage with Bows", total_tier: 1, max_iLvl: 65, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "Projectiles have (18-26)% increased Critical Damage Bonus against Enemies within 2m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(6-10)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "Projectiles have (18-26)% increased Critical Hit Chance against Enemies further than 6m", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(10-14)% of Skill Mana Costs Converted to Life Costs", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] },
        { name: "Projectile Attacks have a (8-12)% chance to fire two additional Projectiles while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Accuracy Rating", total_tier: 2, max_iLvl: 58, Weights: 0, tags: ["Attack"] },
        { name: "(43-50)% increased Damage with Bow Skills", total_tier: 1, max_iLvl: 60, Weights: 0, tags: ["Damage"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(20-25) to Maximum Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+(50-100) to Accuracy Rating", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "(20-30)% Increased Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(4-6)% Increased Skill Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(15-20)% Increased Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Critical"] },
      { name: "Gain (20-25) Life per Enemy Killed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "Gain (10-15) Mana per Enemy Killed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "(20-30)% chance to Pierce an Enemy", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Projectiles have (10-20)% chance to Chain an additional time from terrain", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null }
    ]
  },
  Shield_STR: {
    prefix: [
      { name: "# to maximum Life", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Life"] },
      { name: "# to Armour", total_tier: 11, max_iLvl: 75, Weights: 10000, tags: ["Defences"] },
      { name: "#% increased Armour", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns damage", total_tier: 7, max_iLvl: 74, Weights: 3000, tags: ["Damage", "Physical"] },
      { name: "#% increased Block chance", total_tier: 3, max_iLvl: 65, Weights: 4500, tags: null }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "#% additional Physical Damage Reduction", total_tier: 5, max_iLvl: 77, Weights: 5000, tags: ["Physical"] },
      { name: "#% to Maximum Fire Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Maximum Cold Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Maximum Lightning Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Maximum Chaos Resistance", total_tier: 3, max_iLvl: 81, Weights: 375, tags: ["Chaos", "Resistance"] },
      { name: "#% to all Maximum Elemental Resistances", total_tier: 2, max_iLvl: 81, Weights: 250, tags: ["Elemental", "Resistance"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 6, max_iLvl: 81, Weights: 375, tags: ["Defences", "Elemental"] }
    ],
    Desecrated: {
      prefix: [null],
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "Hits with Shield Skills which Heavy Stun enemies break fully Break Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Your Heavy Stun buildup empties (30–40)% faster", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+1% to all maximum Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Resistance"] },
        { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life"] },
        { name: "(25–35)% reduced effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "(6–12) Mana gained when you Block", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(23–31)% of Armour also applies to Chaos Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "Hits have (17–25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "You take (8–15)% of damage from Blocked Hits while Active Blocking", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Elemental", "Lightning"] },
        { name: "(30–40)% of Physical Damage taken as Lightning while Active Blocking", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "+(1–2)% to maximum Block chance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: null },
        { name: "#% increased Parried Debuff Duration", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "#% increased Parried Debuff Magnitude", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(20–24)% increased Block chance", total_tier: 1, max_iLvl: 33, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(40–50)% increased Thorns damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(10–15)% increased Block chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+3% to maximum Block chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20–25) Life gained when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10–15) Mana gained when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] }
    ]
  },
  Shield_DEX: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Life"] },
      { name: "# to Armour# to Evasion Rating", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "#% increased Block chance", total_tier: 3, max_iLvl: 65, Weights: 3000, tags: null }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% Reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "Hits against you have #% reduced Critical Damage Bonus", total_tier: 5, max_iLvl: 81, Weights: 4000, tags: ["Damage", "Critical"] },
      { name: "#% to Maximum Fire Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Maximum Cold Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Maximum Lightning Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Maximum Chaos Resistance", total_tier: 3, max_iLvl: 81, Weights: 375, tags: ["Chaos", "Resistance"] },
      { name: "#% to all Maximum Elemental Resistances", total_tier: 2, max_iLvl: 81, Weights: 250, tags: ["Elemental", "Resistance"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 6, max_iLvl: 81, Weights: 6, tags: ["Defences", "Elemental"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 6, max_iLvl: 81, Weights: 6, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: [null],
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "Hits with Shield Skills which Heavy Stun enemies break fully", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Your Heavy Stun buildup empties (30-40)% faster", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+1% to all Maximum Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Resistance"] },
        { name: "(10-20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life"] },
        { name: "(25-35)% reduced Effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13-17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "(10-20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "(6-12) Mana gained when you Block", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(23-31)% of Armour also applies to Chaos Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "+(9-15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "+(13-17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "Hits have (17-25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] },
        { name: "+(13-17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "You take (8-15)% of Damage from Blocked Hits while Active Blocking", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Elemental", "Lightning"] },
        { name: "(30-40)% of Physical Damage taken as Lightning while Active Blocking", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "+(1-2)% to Maximum Block Chance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "#% increased Parried Debuff Duration", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "#% increased Parried Debuff Magnitude", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(20-24)% Increased Block chance", total_tier: 1, max_iLvl: 33, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15-25)% Increased Armour and Evasion", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10-20)% Reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(40-50)% Increased Thorns Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(10-15)% Increased Block Chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+3% to Maximum Block Chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Gain (20-25) Life when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "Gain (10-15) Mana when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] }
    ]
  },
  Shield_INT: {
    prefix: [
      { name: "# to maximum Life", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Life"] },
      { name: "# to Armour# to maximum Energy Shield", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour and Energy Shield", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour and Energy Shield# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "#% increased Block chance", total_tier: 3, max_iLvl: 65, Weights: 3000, tags: null }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to all Elemental Resistances", total_tier: 6, max_iLvl: 80, Weights: 4800, tags: ["Elemental", "Fire", "Cold", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "#% to Maximum Fire Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Maximum Cold Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Maximum Lightning Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Maximum Chaos Resistance", total_tier: 3, max_iLvl: 81, Weights: 375, tags: ["Chaos", "Resistance"] },
      { name: "#% to all Maximum Elemental Resistances", total_tier: 2, max_iLvl: 81, Weights: 250, tags: ["Elemental", "Resistance"] },
      { name: "#% increased Energy Shield Recharge Rate", total_tier: 6, max_iLvl: 81, Weights: 6, tags: ["Defences"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 6, max_iLvl: 81, Weights: 6, tags: ["Defences", "Elemental"] }
    ],
    Desecrated: {
      prefix: [null],
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life"] },
        { name: "(25–35)% reduced effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+1% to all Maximum Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Resistance"] },
        { name: "Your Heavy Stun buildup empties (30–40)% faster", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Hits with Shield Skills which Heavy Stun enemies break fully", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "+(23–31)% of Armour also applies to Chaos Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "(40–50)% Increased Energy Shield Recharge Rate if you’ve Blocked recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Defences"] },
        { name: "(6–12) Mana gained when you Block", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "#% increased Parried Debuff Magnitude", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "#% increased Parried Debuff Duration", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "+(1–2)% to maximum Block chance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "You take (8–15)% of damage from Blocked Hits while Active Blocking", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Elemental", "Lightning"] },
        { name: "(30–40)% of Physical Damage taken as Lightning while Active Blocking", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Hits Have (17–25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(20–24)% increased Block chance", total_tier: 1, max_iLvl: 33, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour and Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(40–50)% increased Thorns damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(10–15)% increased Block chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+3% to maximum Block chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20–25) Life gained when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10–15) Mana gained when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] }
    ]
  },
  Bucklers: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 11, max_iLvl: 70, Weights: 11000, tags: ["Life"] },
      { name: "# to Evasion Rating", total_tier: 10, max_iLvl: 75, Weights: 10000, tags: ["Defences"] },
      { name: "#% Increased Evasion Rating", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% Increased Evasion Rating# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns Damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "#% Increased Block Chance", total_tier: 3, max_iLvl: 65, Weights: 3000, tags: null }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% Reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "#% to Maximum Fire Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Maximum Cold Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Maximum Lightning Resistance", total_tier: 3, max_iLvl: 81, Weights: 750, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Maximum Chaos Resistance", total_tier: 3, max_iLvl: 81, Weights: 375, tags: ["Chaos", "Resistance"] },
      { name: "#% to All Maximum Elemental Resistances", total_tier: 2, max_iLvl: 81, Weights: 250, tags: ["Elemental", "Resistance"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 6, max_iLvl: 81, Weights: 6000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: [null],
      suffix: [
        { name: "+(13-17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(25-35)% Reduced Effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+1% to all Maximum Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Resistance"] },
        { name: "+(13-17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9-15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(10-20)% of Damage Taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "(6-12) Mana Gained when you Block", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13-17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Hits have (17-25)% Reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] },
        { name: "+(1-2)% to Maximum Block Chance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "#% Increased Parried Debuff Duration", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "#% Increased Parried Debuff Magnitude", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% Increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(20-24)% Increased Block Chance", total_tier: 1, max_iLvl: 33, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15-25)% Increased Evasion Rating", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10-20)% Reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(40-50)% Increased Thorns Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(10-15)% Increased Block Chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+3% to Maximum Block Chance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20-25) Life Gained when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10-15) Mana Gained when you Block", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] }
    ]
  },
  Amulets: {
    prefix: [
      { name: "# to maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "#% increased maximum Life", total_tier: 3, max_iLvl: 75, Weights: 9000, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 13, max_iLvl: 82, Weights: 13000, tags: ["Mana"] },
      { name: "#% increased maximum Mana", total_tier: 3, max_iLvl: 75, Weights: 9000, tags: ["Mana"] },
      { name: "# to maximum Energy Shield", total_tier: 10, max_iLvl: 80, Weights: 10000, tags: ["Defences"] },
      { name: "#% increased Armour", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Evasion Rating", total_tier: 7, max_iLvl: 75, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased maximum Energy Shield", total_tier: 7, max_iLvl: 75, Weights: 7000, tags: ["Defences"] },
      { name: "# to Accuracy Rating", total_tier: 8, max_iLvl: 67, Weights: 6000, tags: ["Attack"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 81, Weights: 1000, tags: null },
      { name: "# to Spirit", total_tier: 5, max_iLvl: 54, Weights: 2400, tags: null },
      { name: "#% increased Spell Damage", total_tier: 6, max_iLvl: 75, Weights: 6000, tags: ["Damage", "Caster"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to all Attributes", total_tier: 8, max_iLvl: 82, Weights: 7200, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to all Elemental Resistances", total_tier: 6, max_iLvl: 80, Weights: 4800, tags: ["Elemental", "Fire", "Cold", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "# to Level of all Spell Skills", total_tier: 12, max_iLvl: 75, Weights: 3400, tags: ["Caster", "Gem"] },
      { name: "# to Level of all Minion Skills", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
      { name: "# to Level of all Projectile Skills", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
      { name: "# Life Regeneration per second", total_tier: 10, max_iLvl: 75, Weights: 10000, tags: ["Life"] },
      { name: "#% increased Mana Regeneration Rate", total_tier: 6, max_iLvl: 79, Weights: 6000, tags: ["Mana"] },
      { name: "#% increased Cast Speed", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: ["Caster", "Speed"] },
      { name: "#% increased Critical Hit Chance", total_tier: 6, max_iLvl: 74, Weights: 3875, tags: ["Critical"] },
      { name: "#% increased Critical Damage Bonus", total_tier: 6, max_iLvl: 74, Weights: 3875, tags: ["Damage", "Critical"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% of Damage taken Recouped as Life", total_tier: 5, max_iLvl: 79, Weights: 2500, tags: ["Life"] },
      { name: "#% of Damage taken Recouped as Mana", total_tier: 5, max_iLvl: 80, Weights: 2500, tags: ["Life", "Mana"] }
    ],
    Desecrated: {
      prefix: [
        { name: "(15-25)% increased Global Defences", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Defences"] },
        { name: "Remnants have (8-15)% increased effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Minions deal (15-25)% increased Damage if you’ve Hit Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Minion"] },
        { name: "(35-50)% increased Armour from Equipped Body Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Defences"] },
        { name: "(15-25)% increased Spell Damage while on Full Energy Shield", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Caster"] },
        { name: "Invocated Spells have (10-20)% chance to consume half as much Energy", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Caster"] },
        { name: "(35-50)% increased Energy Shield from Equipped Body Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Defences"] },
        { name: "Skills have a (10-15)% chance to not consume Glory", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(35-50)% increased Evasion Rating from Equipped Body Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Defences"] },
        { name: "(15-25)% increased Attack Damage while on Low Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Attack"] },
        { name: "(10-20)% increased Deflection Rating", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Defences"] }
      ],
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(8-12)% Increased Skill Effect Duration", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Remnants can be collected from (15-25)% further away", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13-17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "Aura Skills have (8-16)% Increased Magnitudes", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Equipment and Skill Gems have (10-15)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Recover (2-3)% of maximum Mana on Kill", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(10-15)% Increased Exposure Effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(8-12)% Increased Cooldown Recovery Rate", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "+(13-17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9-15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "+(3-5)% to Quality of all Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Gem"] },
        { name: "(8-16)% of Damage is taken from Mana before Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "Minions have (12-20)% Increased Cooldown Recovery Rate", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Minion"] },
        { name: "(3-6)% Increased Skill Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] },
        { name: "Recover (2-3)% of maximum Life on Kill", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] },
        { name: "+(13-17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(10-20)% Increased Reservation Efficiency of Herald Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "+1 to Level of all Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Gem"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Mana"] },
        { name: "(20-30)% Increased Global Defences", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Defences"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(7-10)% Increased Strength, Dexterity or Intelligence", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attribute"] },
        { name: "(19-21)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 68, Weights: 0, tags: ["Life"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "Leech 3% of Physical Attack Damage as Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life", "Physical", "Attack"] },
      { name: "Leech 2% of Physical Attack Damage as Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana", "Physical", "Attack"] },
      { name: "+1% to all Maximum Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Resistance"] },
      { name: "+(5-10)% to all Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Cold", "Lightning", "Resistance"] },
      { name: "(10-15)% Increased Rarity of Items found", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Level of all Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Gem"] },
      { name: "+(10-15) to Strength", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "+(10-15) to Dexterity", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "+(10-15) to Intelligence", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "Life Flasks gain # charges per Second", total_tier: 1, max_iLvl: 1, Weights: 3, tags: ["Life"] },
      { name: "Mana Flasks gain # charges per Second", total_tier: 1, max_iLvl: 1, Weights: 3, tags: ["Mana"] },
      { name: "Charms gain # charges per Second", total_tier: 1, max_iLvl: 1, Weights: 3, tags: null }
    ]
  },
  Rings: {
    prefix: [
      { name: "# to maximum Life", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 12, max_iLvl: 82, Weights: 12000, tags: ["Mana"] },
      { name: "# to Evasion Rating", total_tier: 9, max_iLvl: 75, Weights: 9000, tags: ["Defences"] },
      { name: "Adds # to # Physical Damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 7800, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 8, max_iLvl: 67, Weights: 6000, tags: ["Attack"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: null },
      { name: "#% increased Fire Damage", total_tier: 6, max_iLvl: 75, Weights: 3000, tags: ["Damage", "Elemental", "Fire"] },
      { name: "#% increased Cold Damage", total_tier: 6, max_iLvl: 75, Weights: 3000, tags: ["Damage", "Elemental", "Cold"] },
      { name: "#% increased Lightning Damage", total_tier: 6, max_iLvl: 75, Weights: 3000, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "#% increased Chaos Damage", total_tier: 6, max_iLvl: 75, Weights: 3000, tags: ["Damage", "Chaos"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to all Attributes", total_tier: 4, max_iLvl: 33, Weights: 1600, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to all Elemental Resistances", total_tier: 5, max_iLvl: 68, Weights: 4000, tags: ["Elemental", "Fire", "Cold", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "# Life Regeneration per second", total_tier: 7, max_iLvl: 47, Weights: 7000, tags: ["Life"] },
      { name: "#% Increased Mana Regeneration Rate", total_tier: 6, max_iLvl: 79, Weights: 6000, tags: ["Mana"] },
      { name: "Leech #% of Physical Attack Damage as Life", total_tier: 3, max_iLvl: 54, Weights: 3000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leech #% of Physical Attack Damage as Mana", total_tier: 3, max_iLvl: 54, Weights: 3000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 6, max_iLvl: 56, Weights: 4500, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 6, max_iLvl: 56, Weights: 4500, tags: ["Mana"] },
      { name: "#% increased Cast Speed", total_tier: 4, max_iLvl: 45, Weights: 4000, tags: ["Caster", "Speed"] },
      { name: "#% increased Rarity of items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% Increased Mana Regeneration Rate#% increased Light Radius", total_tier: 3, max_iLvl: 55, Weights: 3000, tags: ["Mana"] }
    ],
    Desecrated: {
      prefix: [
        { name: "Remnants have (8-15)% increased effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "#% increased Magnitude of Ignite if you’ve consumed an Endurance Charge Recently", total_tier: 3, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Ailment"] },
        { name: "#% increased Freeze Buildup if you’ve consumed a Power Charge Recently", total_tier: 3, max_iLvl: 65, Weights: 0, tags: null },
        { name: "#% increased Magnitude of Shock if you’ve consumed a Frenzy Charge Recently", total_tier: 3, max_iLvl: 65, Weights: 0, tags: null },
        { name: "Minions deal (15-25)% increased Damage if you’ve Hit Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Minion"] },
        { name: "(15-25)% increased Spell Damage while on Full Energy Shield", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Caster"] },
        { name: "(15-25)% increased Attack Damage while on Low Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ],
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(8-12)% Increased Skill Effect Duration", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Remnants can be collected from (15-25)% further away", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12-20)% Increased amount of Life Leeched", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life"] },
        { name: "+(13-17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "+(9-15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "+(13-17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "(8-12)% Increased Cooldown Recovery Rate", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(10-15)% Increased Exposure Effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "Recover (2-3)% of Maximum Mana on Kill", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(12-20)% Increased amount of Mana Leeched", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13-17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Recover (2-3)% of Maximum Life on Kill", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] },
        { name: "(3-6)% Increased Skill Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 2, max_iLvl: 38, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Mana"] },
        { name: "(4-6)% increased maximum Mana", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Mana"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(50-59)% Increased Mana Regeneration Rate", total_tier: 1, max_iLvl: 55, Weights: 0, tags: ["Mana"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(20-25) to maximum Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+(13-19)% to Chaos Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Resistance"] },
      { name: "Regenerate (1-2)% of maximum Life per second", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(20-30)% increased Mana Regeneration Rate", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+(5-10)% to all Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Cold", "Lightning", "Resistance"] },
      { name: "(10-15)% Increased Rarity of Items found", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20-30)% Increased Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(4-6)% Increased Skill Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(15-20)% Increased Critical Damage Bonus", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Critical"] },
      { name: "+(10-15) to Strength", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "+(10-15) to Dexterity", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "+(10-15) to Intelligence", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] }
    ]
  },
  Belts: {
    prefix: [
      { name: "# to maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "#% increased maximum Life", total_tier: 3, max_iLvl: 75, Weights: 900, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 13, max_iLvl: 82, Weights: 13000, tags: ["Mana"] },
      { name: "#% increased maximum Mana", total_tier: 3, max_iLvl: 75, Weights: 900, tags: ["Mana"] },
      { name: "# to maximum Energy Shield", total_tier: 10, max_iLvl: 80, Weights: 10000, tags: ["Defences"] },
      { name: "#% increased Armour", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Evasion Rating", total_tier: 7, max_iLvl: 77, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased maximum Energy Shield", total_tier: 7, max_iLvl: 75, Weights: 7000, tags: ["Defences"] },
      { name: "# to Accuracy Rating", total_tier: 8, max_iLvl: 67, Weights: 6000, tags: ["Attack"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: null },
      { name: "# to Spirit", total_tier: 5, max_iLvl: 54, Weights: 2400, tags: null },
      { name: "#% increased Spell Damage", total_tier: 6, max_iLvl: 75, Weights: 6000, tags: ["Damage", "Caster"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to all Attributes", total_tier: 8, max_iLvl: 82, Weights: 7200, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to all Elemental Resistances", total_tier: 6, max_iLvl: 80, Weights: 4800, tags: ["Elemental", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "# to Level of all Spell Skills", total_tier: 12, max_iLvl: 75, Weights: 3400, tags: ["Caster", "Gem"] },
      { name: "# to Level of all Minion Skills", total_tier: 0, max_iLvl: 0, Weights: 0, tags: ["Minion"] },
      { name: "# to Level of all Melee Skills", total_tier: 0, max_iLvl: 0, Weights: 0, tags: ["Attack", "Melee"] },
      { name: "# to Level of all Projectile Skills", total_tier: 0, max_iLvl: 0, Weights: 0, tags: ["Attack", "Projectile"] },
      { name: "# Life Regeneration per second", total_tier: 10, max_iLvl: 75, Weights: 10000, tags: ["Life"] },
      { name: "#% increased Mana Regeneration Rate", total_tier: 6, max_iLvl: 79, Weights: 6000, tags: ["Mana"] },
      { name: "#% increased Cast Speed", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: ["Caster", "Speed"] },
      { name: "#% increased Critical Hit Chance", total_tier: 6, max_iLvl: 74, Weights: 3875, tags: ["Critical"] },
      { name: "#% increased Critical Damage Bonus", total_tier: 6, max_iLvl: 74, Weights: 3875, tags: ["Damage", "Critical"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% of Damage taken Recouped as Life", total_tier: 6, max_iLvl: 81, Weights: 2500, tags: ["Life"] },
      { name: "#% of Damage taken Recouped as Mana", total_tier: 5, max_iLvl: 80, Weights: 2500, tags: ["Life", "Mana"] }
    ],
    Desecrated: {
      prefix: [
        { name: "(15–25)% increased Global Defences", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Defences"] },
        { name: "Remnants have (8–15)% increased effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Minions deal (15–25)% increased Damage if you’ve Hit Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Damage", "Minion"] },
        { name: "(35–50)% increased Armour from Equipped Body Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Defences"] },
        { name: "(15–25)% increased Spell Damage while on Full Energy Shield", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Damage", "Caster"] },
        { name: "Invocated Spells have (10–20)% chance to consume half as much Energy", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Caster"] },
        { name: "(35–50)% increased Energy Shield from Equipped Body Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Defences"] },
        { name: "Skills have a (10–15)% chance to not consume Glory", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(35–50)% increased Evasion Rating from Equipped Body Armour", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Defences"] },
        { name: "(15–25)% increased Attack Damage while on Low Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Attack"] },
        { name: "(10–20)% increased Deflection Rating", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Defences"] }
      ],
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(8–12)% increased Skill Effect Duration", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Remnants can be collected from (15–25)% further away", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "Aura Skills have (8–16)% increased Magnitudes", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Equipment and Skill Gems have (10–15)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "Recover (2–3)% of maximum Mana on Kill", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(10–15)% increased Exposure Effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "(8–12)% increased Cooldown Recovery Rate", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "+(3–5)% to Quality of all Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Gem"] },
        { name: "(8–16)% of Damage is taken from Mana before Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "Minions have (12–20)% increased Cooldown Recovery Rate", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Minion"] },
        { name: "(3–6)% increased Skill Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] },
        { name: "Recover (2–3)% of maximum Life on Kill", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(10–20)% increased Reservation Efficiency of Herald Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "+1 to Level of all Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Gem"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Mana"] },
        { name: "(20–30)% increased Global Defences", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Defences"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(7–10)% increased Strength, Dexterity or Intelligence", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Attribute"] },
        { name: "(19–21)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 68, Weights: 0, tags: ["Life"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "Leech 3% of Physical Attack Damage as Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life", "Physical", "Attack"] },
      { name: "Leech 2% of Physical Attack Damage as Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana", "Physical", "Attack"] },
      { name: "+1% to all Maximum Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Resistance"] },
      { name: "+(5–10)% to all Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Cold", "Lightning", "Resistance"] },
      { name: "(10–15)% increased Rarity of Items found", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Level of all Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Gem"] },
      { name: "+(10–15) to Strength", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "+(10–15) to Dexterity", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "+(10–15) to Intelligence", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attribute"] },
      { name: "Life Flasks gain +# charges per Second", total_tier: 1, max_iLvl: 1, Weights: 3, tags: ["Life"] },
      { name: "Mana Flasks gain +# charges per Second", total_tier: 1, max_iLvl: 1, Weights: 3, tags: ["Mana"] },
      { name: "Charms gain +# charges per Second", total_tier: 1, max_iLvl: 1, Weights: 3, tags: ["Charm"] }
    ]
  },
  Gloves_STR: {
    prefix: [
      { name: "# to maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Armour", total_tier: 9, max_iLvl: 54, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour# to maximum Life", total_tier: 6, max_iLvl: 83, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "Adds # to # Physical Damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 7800, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 6200, tags: ["Attack"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 9, max_iLvl: 81, Weights: 9000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3500, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 2, max_iLvl: 41, Weights: 750, tags: ["Attack"] },
      { name: "Leech #% of Physical Attack Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leech #% of Physical Attack Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Gain # Life per Enemy Hit with Attacks", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 4, max_iLvl: 60, Weights: 2000, tags: ["Attack", "Speed"] },
      { name: "#% increased Critical Damage Bonus", total_tier: 5, max_iLvl: 59, Weights: 3750, tags: ["Damage", "Critical"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 5, max_iLvl: 66, Weights: 5000, tags: ["Defences", "Elemental"] }
    ],
    Desecrated: {
      prefix: null,
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(10–20)% Chance to Daze on Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(8–15)% of Leech is Instant", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(6–10)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(10–20)% increased Magnitude of Ailments you inflict", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Ailment"] },
        { name: "(20–30)% increased chance to Inflict Bleeding", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(20–30)% increased chance to Poison", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "# to Accuracy Rating", total_tier: 2, max_iLvl: 58, Weights: 0, tags: ["Attack"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(25–29)% increased Critical Damage Bonus", total_tier: 1, max_iLvl: 45, Weights: 0, tags: ["Damage", "Critical"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "(26–30)% of Lightning Damage taken Recouped as Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life", "Elemental", "Lightning"] },
        { name: "#% increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null },
        { name: "(10–15)% increased Quantity of Gold Dropped by Slain Enemies", total_tier: 1, max_iLvl: 72, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Damage Penetrates (10–15)% Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire"] },
      { name: "Damage Penetrates (10–15)% Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold"] },
      { name: "Damage Penetrates (10–15)% Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "Break (10–15)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "+1 to Maximum Frenzy Charges", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Level of all Melee Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "Debuffs you inflict have (20–30)% increased Slow Magnitude", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20–30)% increased Weapon Swap Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] }
    ]
  },
  Gloves_DEX: {
    "prefix": [
      "# to maximum Life",
      "# to maximum Mana",
      "# to Evasion Rating",
      "% increased Evasion Rating",
      "% increased Evasion Rating# to maximum Life",
      "Adds # to # Physical Damage to Attacks",
      "Adds # to # Fire damage to Attacks",
      "Adds # to # Cold damage to Attacks",
      "Adds # to # Lightning damage to Attacks",
      "# to Accuracy Rating"
    ],
    "suffix": [
      "# to Dexterity",
      "#% to Fire Resistance",
      "#% to Cold Resistance",
      "#% to Lightning Resistance",
      "#% to Chaos Resistance",
      "#% reduced Attribute Requirements",
      "+# to Level of all Melee Skills",
      "Leech #% of Physical Attack Damage as Life",
      "Leech #% of Physical Attack Damage as Mana",
      "Gain # Life per Enemy Killed",
      "Gain # Mana per Enemy Killed",
      "Gain # Life per Enemy Hit with Attacks",
      "#% increased Attack Speed",
      "#% increased Critical Damage Bonus",
      "#% increased Rarity of Items found",
      "Gain Deflection Rating equal to #% of Evasion Rating"
    ],
    "Desecrated": {
      "prefix": [null],
      "suffix": [
        "+(13–17)% to Fire and Chaos Resistances",
        "# to Strength and Intelligence",
        "# to Strength and Dexterity",
        "(12–20)% increased Area of Effect of Curses",
        "(10–20)% Chance to Daze on Hit",
        "(10–20)% increased Immobilisation buildup",
        "+(13–17)% to Cold and Chaos Resistances",
        "+(9–15) to Dexterity and Intelligence",
        "(6–10)% increased Mana Cost Efficiency",
        "+(13–17)% to Lightning and Chaos Resistances",
        "(10–20)% increased Magnitude of Ailments you Inflict",
        "(20–30)% increased Chance to Inflict Bleeding",
        "(20–30)% increased Chance to Poison"
      ]
    },
    "Essence": {
      "prefix": [
        "# to maximum Life",
        "# to maximum Mana",
        "% increased Armour, Evasion or Energy Shield",
        "# to Accuracy Rating",
        "Mark of the Abyssal Lord"
      ],
      "suffix": [
        "#% to Chaos Resistance",
        "# to Strength, Dexterity or Intelligence",
        "(25–29)% increased Critical Damage Bonus",
        "100% increased Effect of Socketed Items",
        "Mark of the Abyssal Lord",
        "#% to Fire Resistance",
        "#% to Cold Resistance",
        "#% to Lightning Resistance",
        "(26–30)% of Lightning Damage Taken Recouped as Life",
        "#% increased Rarity of Items Found",
        "(10–15)% increased Quantity of Gold Dropped by Slain Enemies"
      ]
    },
    "Corrupted": [
      "(15–25)% increased Evasion Rating",
      "(10–20)% reduced Attribute Requirements",
      "Damage Penetrates (10–15)% Fire Resistance",
      "Damage Penetrates (10–15)% Cold Resistance",
      "Damage Penetrates (10–15)% Lightning Resistance",
      "Break (10–15)% increased Armour",
      "+1 to Maximum Frenzy Charges",
      "+1 to Level of all Melee Skills",
      "Debuffs you inflict have (20–30)% increased Slow Magnitude",
      "(20–30)% increased Weapon Swap Speed"
    ]
  },
  Gloves_INT: {
    prefix: [
      { name: "# to maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to maximum Energy Shield", total_tier: 9, max_iLvl: 54, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Energy Shield", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Energy Shield# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "Adds # to # Physical Damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 7800, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 6200, tags: ["Attack"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 9, max_iLvl: 81, Weights: 9000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3500, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 2, max_iLvl: 41, Weights: 750, tags: ["Attack"] },
      { name: "Leech #% of Physical Attack Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leech #% of Physical Attack Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Gain # Life per Enemy Hit with Attacks", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 4, max_iLvl: 60, Weights: 2000, tags: ["Attack", "Speed"] },
      { name: "#% increased Critical Damage Bonus", total_tier: 5, max_iLvl: 59, Weights: 3750, tags: ["Damage", "Critical"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% increased Energy Shield Recharge Rate", total_tier: 4, max_iLvl: 48, Weights: 4000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: null,
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(10–20)% Chance to Daze on Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(6–10)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(10–15)% Chance to Gain Arcane Surge when you deal a Critical Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Critical"] },
        { name: "(8–15)% increased Cast Speed when on Full Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Caster", "Speed"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(10–20)% increased Magnitude of Ailments you inflict", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Ailment"] },
        { name: "(20–30)% increased chance to Inflict Bleeding", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(8–12)% increased Skill Speed if you’ve consumed a Frenzy Charge Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] },
        { name: "(15–25)% Chance for Attack Hits to apply Incision", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Physical", "Ailment"] },
        { name: "(20–30)% increased chance to Poison", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "# to Accuracy Rating", total_tier: 2, max_iLvl: 58, Weights: 0, tags: ["Attack"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(25–29)% increased Critical Damage Bonus", total_tier: 1, max_iLvl: 45, Weights: 0, tags: ["Damage", "Critical"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "(26–30)% of Lightning Damage taken Recouped as Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life", "Elemental", "Lightning"] },
        { name: "#% increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null },
        { name: "(10–15)% increased Quantity of Gold Dropped by Slain Enemies", total_tier: 1, max_iLvl: 72, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Damage Penetrates (10–15)% Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire"] },
      { name: "Damage Penetrates (10–15)% Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold"] },
      { name: "Damage Penetrates (10–15)% Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "Break (10–15)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "+1 to Maximum Frenzy Charges", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Level of all Melee Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "Debuffs you inflict have (20–30)% increased Slow Magnitude", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20–30)% increased Weapon Swap Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] }
    ]
  },
  Gloves_STR_DEX: {
    prefix: [
      { name: "# to maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Armour# to Evasion Rating", total_tier: 4, max_iLvl: 46, Weights: 4000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "Adds # to # Physical Damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 7800, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 6200, tags: ["Attack"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 9, max_iLvl: 81, Weights: 9000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3500, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 2, max_iLvl: 41, Weights: 750, tags: ["Attack"] },
      { name: "Leech #% of Physical Attack Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leech #% of Physical Attack Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Gain # Life per Enemy Hit with Attacks", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 4, max_iLvl: 60, Weights: 2000, tags: ["Attack", "Speed"] },
      { name: "#% increased Critical Damage Bonus", total_tier: 5, max_iLvl: 59, Weights: 3750, tags: ["Damage", "Critical"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences", "Elemental"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: null,
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(12–20)% increased Area of Effect of Curses", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "(10–20)% Chance to Daze on Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(10–20)% increased Immobilisation buildup", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(8–15)% of Leech is Instant", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(6–10)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(10–20)% increased Magnitude of Ailments you inflict", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Ailment"] },
        { name: "(20–30)% increased chance to Inflict Bleeding", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(20–30)% increased chance to Poison", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "# to Accuracy Rating", total_tier: 2, max_iLvl: 58, Weights: 0, tags: ["Attack"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(25–29)% increased Critical Damage Bonus", total_tier: 1, max_iLvl: 45, Weights: 0, tags: ["Damage", "Critical"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "(26–30)% of Lightning Damage taken Recouped as Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life", "Elemental", "Lightning"] },
        { name: "#% increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null },
        { name: "(10–15)% increased Quantity of Gold Dropped by Slain Enemies", total_tier: 1, max_iLvl: 72, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour and Evasion", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Damage Penetrates (10–15)% Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire"] },
      { name: "Damage Penetrates (10–15)% Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold"] },
      { name: "Damage Penetrates (10–15)% Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "Break (10–15)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "+1 to Maximum Frenzy Charges", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Level of all Melee Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "Debuffs you inflict have (20–30)% increased Slow Magnitude", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20–30)% increased Weapon Swap Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] }
    ]
  },
  Gloves_STR_INT: {
    prefix: [
      { name: "# to maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Armour# to maximum Energy Shield", total_tier: 4, max_iLvl: 46, Weights: 4000, tags: ["Defences"] },
      { name: "#% increased Armour and Energy Shield", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour and Energy Shield# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life","Defences"] },
      { name: "Adds # to # Physical Damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 7800, tags: ["Damage","Physical","Attack"] },
      { name: "Adds # to # Fire damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage","Elemental","Fire","Attack"] },
      { name: "Adds # to # Cold damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage","Elemental","Cold","Attack"] },
      { name: "Adds # to # Lightning damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage","Elemental","Lightning","Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 6200, tags: ["Attack"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 9, max_iLvl: 81, Weights: 9000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental","Fire","Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental","Cold","Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental","Lightning","Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos","Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3500, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 2, max_iLvl: 41, Weights: 750, tags: ["Attack"] },
      { name: "Leech #% of Physical Attack Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life","Physical","Attack"] },
      { name: "Leech #% of Physical Attack Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana","Physical","Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Gain # Life per Enemy Hit with Attacks", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life","Attack"] },
      { name: "#% increased Attack Speed", total_tier: 4, max_iLvl: 60, Weights: 2000, tags: ["Attack","Speed"] },
      { name: "#% increased Critical Damage Bonus", total_tier: 5, max_iLvl: 59, Weights: 3750, tags: ["Damage","Critical"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% increased Energy Shield Recharge Rate", total_tier: 4, max_iLvl: 48, Weights: 4000, tags: ["Defences"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences","Elemental"] }
    ],
    Desecrated: {
      prefix: null,
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu","Elemental","Fire","Chaos","Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu","Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu","Attribute"] },
        { name: "(10–20)% Chance to Daze on Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(8–15)% of Leech is Instant", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal","Elemental","Cold","Chaos","Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal","Attribute"] },
        { name: "(6–10)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal","Mana"] },
        { name: "(10–15)% Chance to Gain Arcane Surge when you deal a Critical Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal","Critical"] },
        { name: "(8–15)% Increased Cast Speed when on Full Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal","Caster","Speed"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman","Elemental","Lightning","Chaos","Resistance"] },
        { name: "(10–20)% increased Magnitude of Ailments you inflict", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman","Damage","Ailment"] },
        { name: "(20–30)% increased chance to Inflict Bleeding", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(8–12)% increased Skill Speed if you’ve consumed a Frenzy Charge Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman","Speed"] },
        { name: "(15–25)% Chance for Attack Hits to apply Incision", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman","Damage","Physical","Ailment"] },
        { name: "(20–30)% increased chance to Poison", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "# to Accuracy Rating", total_tier: 2, max_iLvl: 58, Weights: 0, tags: ["Attack"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos","Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(25–29)% increased Critical Damage Bonus", total_tier: 1, max_iLvl: 45, Weights: 0, tags: ["Damage","Critical"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental","Fire","Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental","Cold","Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental","Lightning","Resistance"] },
        { name: "(26–30)% of Lightning Damage taken Recouped as Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life","Elemental","Lightning"] },
        { name: "#% increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null },
        { name: "(10–15)% increased Quantity of Gold Dropped by Slain Enemies", total_tier: 1, max_iLvl: 72, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour and Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Damage Penetrates (10–15)% Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage","Elemental","Fire"] },
      { name: "Damage Penetrates (10–15)% Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage","Elemental","Cold"] },
      { name: "Damage Penetrates (10–15)% Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage","Elemental","Lightning"] },
      { name: "Break (10–15)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "+1 to Maximum Frenzy Charges", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Level of all Melee Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "Debuffs you inflict have (20–30)% increased Slow Magnitude", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20–30)% increased Weapon Swap Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack","Speed"] }
    ]
  },
  Gloves_DEX_INT: {
    prefix: [
      { name: "# to maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Evasion Rating# to maximum Energy Shield", total_tier: 9, max_iLvl: 46, Weights: 4000, tags: ["Defences"] },
      { name: "#% increased Evasion and Energy Shield", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Evasion and Energy Shield# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "Adds # to # Physical Damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 7800, tags: ["Damage", "Physical", "Attack"] },
      { name: "Adds # to # Fire damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Fire", "Attack"] },
      { name: "Adds # to # Cold damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Cold", "Attack"] },
      { name: "Adds # to # Lightning damage to Attacks", total_tier: 9, max_iLvl: 75, Weights: 3900, tags: ["Damage", "Elemental", "Lightning", "Attack"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 6200, tags: ["Attack"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 9, max_iLvl: 81, Weights: 9000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3500, tags: null },
      { name: "# to Level of all Melee Skills", total_tier: 2, max_iLvl: 41, Weights: 750, tags: ["Attack"] },
      { name: "Leech #% of Physical Attack Damage as Life", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Life", "Physical", "Attack"] },
      { name: "Leech #% of Physical Attack Damage as Mana", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: ["Mana", "Physical", "Attack"] },
      { name: "Gain # Life per Enemy Killed", total_tier: 8, max_iLvl: 77, Weights: 6000, tags: ["Life"] },
      { name: "Gain # Mana per Enemy Killed", total_tier: 8, max_iLvl: 78, Weights: 6000, tags: ["Mana"] },
      { name: "Gain # Life per Enemy Hit with Attacks", total_tier: 4, max_iLvl: 40, Weights: 4000, tags: ["Life", "Attack"] },
      { name: "#% increased Attack Speed", total_tier: 4, max_iLvl: 60, Weights: 2000, tags: ["Attack", "Speed"] },
      { name: "#% increased Critical Damage Bonus", total_tier: 5, max_iLvl: 59, Weights: 3750, tags: ["Damage", "Critical"] },
      { name: "#% increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% increased Energy Shield Recharge Rate", total_tier: 4, max_iLvl: 48, Weights: 2000, tags: ["Defences"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: null,
      suffix: [
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(10–20)% increased Immobilisation buildup", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(10–20)% Chance to Daze on Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12–20)% increased Area of Effect of Curses", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "(6–10)% increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "(10–15)% Chance to Gain Arcane Surge when you deal a Critical Hit", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Critical"] },
        { name: "(8–15)% increased Cast Speed when on Full Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Caster", "Speed"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(10–20)% increased Magnitude of Ailments you inflict", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Ailment"] },
        { name: "(20–30)% increased chance to Inflict Bleeding", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "(8–12)% increased Skill Speed if you’ve consumed a Frenzy Charge Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] },
        { name: "(15–25)% Chance for Attack Hits to apply Incision", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Damage", "Physical", "Ailment"] },
        { name: "(20–30)% increased chance to Poison", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "# to Accuracy Rating", total_tier: 2, max_iLvl: 58, Weights: 0, tags: ["Attack"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "(25–29)% increased Critical Damage Bonus", total_tier: 1, max_iLvl: 45, Weights: 0, tags: ["Damage", "Critical"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "(26–30)% of Lightning Damage taken Recouped as Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life", "Elemental", "Lightning"] },
        { name: "#% increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null },
        { name: "(10–15)% increased Quantity of Gold Dropped by Slain Enemies", total_tier: 1, max_iLvl: 72, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Evasion and Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "Damage Penetrates (10–15)% Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Fire"] },
      { name: "Damage Penetrates (10–15)% Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Cold"] },
      { name: "Damage Penetrates (10–15)% Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Elemental", "Lightning"] },
      { name: "Break (10–15)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "+1 to Maximum Frenzy Charges", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Level of all Melee Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "Debuffs you inflict have (20–30)% increased Slow Magnitude", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(20–30)% increased Weapon Swap Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack", "Speed"] }
    ]
  },
  BodyArmours_STR: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 13, max_iLvl: 80, Weights: 13000, tags: ["Life"] },
      { name: "# to Armour", total_tier: 11, max_iLvl: 79, Weights: 11000, tags: ["Defences"] },
      { name: "#% increased Armour", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "# to Armour#% increased Armour", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "# to Spirit", total_tier: 8, max_iLvl: 78, Weights: 3000, tags: ["Mana"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4500, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "# Life Regeneration per second", total_tier: 11, max_iLvl: 81, Weights: 11000, tags: ["Life"] },
      { name: "#% reduced Duration of Bleeding on You", total_tier: 15, max_iLvl: 76, Weights: 7500, tags: ["Physical", "Ailment"] },
      { name: "#% reduced Poison Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Chaos", "Ailment"] },
      { name: "#% reduced Ignite Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Elemental", "Fire", "Ailment"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 6, max_iLvl: 81, Weights: 6000, tags: ["Defences", "Elemental"] }
    ],
    Desecrated: {
      prefix: [
    ],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },        
        { name: "(6–12)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25–35)% reduced effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Hits have (17–25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(8–10)% increased maximum Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life"] },
        { name: "(10–15)% of Physical Damage from Hits taken as Chaos Damage", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Physical", "Chaos"] },
        { name: "(64–97) to (97–145) Physical Thorns damage", total_tier: 1, max_iLvl: 63, Weights: 0, tags: ["Damage", "Physical"] },
        { name: "Allocates a random Notable Passive Skill", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Hits against you have (40–50)% reduced Critical Damage Bonus", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(3–5)% additional Physical Damage Reduction", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Physical"] },
      { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+1% to all Maximum Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Resistance"] },
      { name: "+(30–40) to Maximum Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(40–50)% increased Thorns damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical"] },
      { name: "+(13–19)% to Chaos Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Resistance"] }
    ]
  },
  BodyArmours_DEX: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 13, max_iLvl: 80, Weights: 13000, tags: ["Life"] },
      { name: "# to Evasion Rating", total_tier: 11, max_iLvl: 79, Weights: 11000, tags: ["Defences"] },
      { name: "#% increased Evasion Rating", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Evasion Rating# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "# to Evasion Rating#% increased Evasion Rating", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "# to Spirit", total_tier: 8, max_iLvl: 78, Weights: 3000, tags: ["Mana"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4500, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "# Life Regeneration per second", total_tier: 11, max_iLvl: 81, Weights: 11000, tags: ["Life"] },
      { name: "#% reduced Duration of Bleeding on You", total_tier: 15, max_iLvl: 76, Weights: 7500, tags: ["Physical", "Ailment"] },
      { name: "#% reduced Poison Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Chaos", "Ailment"] },
      { name: "#% reduced Ignite Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Elemental", "Fire", "Ailment"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 6, max_iLvl: 81, Weights: 6000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: [
        ],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },        
        { name: "(6–12)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25–35)% reduced effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(12–18)% increased Reservation Efficiency of Companion Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Prevent +(3–5)% of Damage from Deflected Hits", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Hits have (17–25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(8–10)% increased maximum Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life"] },
        { name: "(10–15)% of Physical Damage from Hits taken as Chaos Damage", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Physical", "Chaos"] },
        { name: "(64–97) to (97–145) Physical Thorns damage", total_tier: 1, max_iLvl: 63, Weights: 0, tags: ["Damage", "Physical"] },
        { name: "Allocates a random Notable Passive Skill", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Hits against you have (40–50)% reduced Critical Damage Bonus", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Evasion Rating", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(3–5)% additional Physical Damage Reduction", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Physical"] },
      { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+1% to all Maximum Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Resistance"] },
      { name: "+(30–40) to Maximum Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(40–50)% increased Thorns damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical"] },
      { name: "+(13–19)% to Chaos Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Resistance"] }
    ]
  },
  BodyArmours_INT: {
    prefix: [
      { "name": "# to Maximum Life", "total_tier": 13, "max_iLvl": 80, "Weights": 13000, "tags": ["Life"] },
      { "name": "# to Maximum Energy Shield", "total_tier": 11, "max_iLvl": 79, "Weights": 11000, "tags": ["Defences"] },
      { "name": "#% increased Energy Shield", "total_tier": 8, "max_iLvl": 75, "Weights": 8000, "tags": ["Defences"] },
      { "name": "#% increased Energy Shield# to maximum Life", "total_tier": 6, "max_iLvl": 78, "Weights": 6000, "tags": ["Life", "Defences"] },
      { "name": "# to Maximum Energy Shield#% increased Energy Shield", "total_tier": 6, "max_iLvl": 78, "Weights": 6000, "tags": ["Defences"] },
      { "name": "# to # Physical Thorns damage", "total_tier": 7, "max_iLvl": 74, "Weights": 7000, "tags": ["Damage", "Physical"] },
      { "name": "# to Spirit", "total_tier": 8, "max_iLvl": 78, "Weights": 3000, "tags": ["Mana"] }
    ],
    suffix: [
      { "name": "# to Intelligence", "total_tier": 8, "max_iLvl": 74, "Weights": 8000, "tags": ["Attribute"] },
      { "name": "#% to Fire Resistance", "total_tier": 8, "max_iLvl": 82, "Weights": 8000, "tags": ["Elemental", "Fire", "Resistance"] },
      { "name": "#% to Cold Resistance", "total_tier": 8, "max_iLvl": 82, "Weights": 8000, "tags": ["Elemental", "Cold", "Resistance"] },
      { "name": "#% to Lightning Resistance", "total_tier": 8, "max_iLvl": 82, "Weights": 8000, "tags": ["Elemental", "Lightning", "Resistance"] },
      { "name": "#% to Chaos Resistance", "total_tier": 6, "max_iLvl": 81, "Weights": 1500, "tags": ["Chaos", "Resistance"] },
      { "name": "#% reduced Attribute Requirements", "total_tier": 5, "max_iLvl": 60, "Weights": 4500, "tags": null },
      { "name": "# to Stun Threshold", "total_tier": 10, "max_iLvl": 72, "Weights": 8000, "tags": null },
      { "name": "# Life Regeneration per second", "total_tier": 11, "max_iLvl": 81, "Weights": 11000, "tags": ["Life"] },
      { "name": "#% reduced Duration of Bleeding on You", "total_tier": 15, "max_iLvl": 76, "Weights": 7500, "tags": ["Physical", "Ailment"] },
      { "name": "#% reduced Poison Duration on you", "total_tier": 8, "max_iLvl": 76, "Weights": 7500, "tags": ["Chaos", "Ailment"] },
      { "name": "#% reduced Ignite Duration on you", "total_tier": 8, "max_iLvl": 76, "Weights": 7500, "tags": ["Elemental", "Fire", "Ailment"] },
      { "name": "#% faster start of Energy Shield Recharge", "total_tier": 6, "max_iLvl": 81, "Weights": 6000, "tags": ["Defences"] }
    ],
    Desecrated: {
      prefix: [
    ],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { "name": "(6–12)% increased Spirit Reservation Efficiency of Skills", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Amanamu"] },
        { "name": "(25–35)% reduced effect of Curses on you", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Amanamu", "Caster", "Curse"] },
        { "name": "+(13–17)% to Cold and Chaos Resistances", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { "name": "+(9–15) to Dexterity and Intelligence", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Kurgal", "Attribute"] },
        { "name": "(10–20)% of Damage is taken from Mana before Life", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Kurgal", "Life", "Mana"] },
        { "name": "(10–20)% of Damage taken Recouped as Mana", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Kurgal", "Life", "Mana"] },
        { "name": "+(13–17)% to Lightning and Chaos Resistances", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { "name": "Hits have (17–25)% reduced Critical Hit Chance against you", "total_tier": 1, "max_iLvl": 65, "Weights": 0, "tags": ["Ulaman", "Critical"] }
      ]
    },
    Essence: {
      prefix: [
        { "name": "# to Maximum Life", "total_tier": 3, "max_iLvl": 54, "Weights": 0, "tags": ["Life"] },
        { "name": "#% increased Armour, Evasion or Energy Shield", "total_tier": 18, "max_iLvl": 54, "Weights": 0, "tags": ["Defences"] },
        { "name": "(8–10)% increased maximum Life", "total_tier": 1, "max_iLvl": 72, "Weights": 0, "tags": ["Life"] },
        { "name": "(10–15)% of Physical Damage from Hits taken as Chaos Damage", "total_tier": 1, "max_iLvl": 72, "Weights": 0, "tags": ["Physical", "Chaos"] },
        { "name": "(64–97) to (97–145) Physical Thorns damage", "total_tier": 1, "max_iLvl": 63, "Weights": 0, "tags": ["Damage", "Physical"] },
        { "name": "Allocates a random Notable Passive Skill", "total_tier": 1, "max_iLvl": 1, "Weights": 0, "tags": null },
        { "name": "Mark of the Abyssal Lord", "total_tier": 1, "max_iLvl": 1, "Weights": 0, "tags": null }
      ],
      suffix: [
        { "name": "#% to Chaos Resistance", "total_tier": 3, "max_iLvl": 56, "Weights": 0, "tags": ["Chaos", "Resistance"] },
        { "name": "# to Strength, Dexterity or Intelligence", "total_tier": 3, "max_iLvl": 55, "Weights": 0, "tags": ["Attribute"] },
        { "name": "Hits against you have (40–50)% reduced Critical Damage Bonus", "total_tier": 1, "max_iLvl": 72, "Weights": 0, "tags": ["Critical"] },
        { "name": "Mark of the Abyssal Lord", "total_tier": 1, "max_iLvl": 1, "Weights": 0, "tags": null },
        { "name": "#% to Fire Resistance", "total_tier": 3, "max_iLvl": 60, "Weights": 0, "tags": ["Elemental", "Fire", "Resistance"] },
        { "name": "#% to Cold Resistance", "total_tier": 3, "max_iLvl": 60, "Weights": 0, "tags": ["Elemental", "Cold", "Resistance"] },
        { "name": "#% to Lightning Resistance", "total_tier": 3, "max_iLvl": 60, "Weights": 0, "tags": ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { "name": "(15–25)% increased Energy Shield", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Defences"] },
      { "name": "(10–20)% reduced Attribute Requirements", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": null },
      { "name": "(3–5)% additional Physical Damage Reduction", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Physical"] },
      { "name": "(10–20)% of Damage taken Recouped as Life", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Life"] },
      { "name": "(10–20)% of Damage taken Recouped as Mana", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Mana"] },
      { "name": "+1% to all Maximum Elemental Resistances", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Elemental", "Resistance"] },
      { "name": "+(30–40) to Maximum Life", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Life"] },
      { "name": "(40–50)% increased Thorns damage", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Damage", "Physical"] },
      { "name": "+(13–19)% to Chaos Resistance", "total_tier": 1, "max_iLvl": 1, "Weights": 1, "tags": ["Chaos", "Resistance"] }
    ]
  },
  BodyArmours_STR_DEX: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 13, max_iLvl: 80, Weights: 13000, tags: ["Life"] },
      { name: "# to Armour# to Evasion Rating", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "# to Armour# to Evasion Rating#% increased Armour and Evasion", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "# to Spirit", total_tier: 8, max_iLvl: 78, Weights: 3000, tags: ["Mana"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4500, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "# Life Regeneration per second", total_tier: 11, max_iLvl: 81, Weights: 11000, tags: ["Life"] },
      { name: "#% reduced Duration of Bleeding on You", total_tier: 15, max_iLvl: 76, Weights: 7500, tags: ["Physical", "Ailment"] },
      { name: "#% reduced Poison Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Chaos", "Ailment"] },
      { name: "#% reduced Ignite Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Elemental", "Fire", "Ailment"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Defences", "Elemental"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: [
      ],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(6–12)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25–35)% reduced effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(12–18)% increased Reservation Efficiency of Companion Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Prevent +(3–5)% of Damage from Deflected Hits", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Hits have (17–25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(8–10)% increased maximum Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life"] },
        { name: "(10–15)% of Physical Damage from Hits taken as Chaos Damage", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Physical", "Chaos"] },
        { name: "(64–97) to (97–145) Physical Thorns damage", total_tier: 1, max_iLvl: 63, Weights: 0, tags: ["Damage", "Physical"] },
        { name: "Allocates a random Notable Passive Skill", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Hits against you have (40–50)% reduced Critical Damage Bonus", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour and Evasion", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(3–5)% additional Physical Damage Reduction", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Physical"] },
      { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+1% to all Maximum Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Resistance"] },
      { name: "+(30–40) to Maximum Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(40–50)% increased Thorns damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical"] },
      { name: "+(13–19)% to Chaos Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Resistance"] }
    ]
  },
  BodyArmours_STR_INT: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 13, max_iLvl: 80, Weights: 13000, tags: ["Life"] },
      { name: "# to Armour# to Maximum Energy Shield", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour and Energy Shield", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Armour and Energy Shield# to Maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "# to Armour# to Maximum Energy Shield#% increased Armour and Energy Shield", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns Damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "# to Spirit", total_tier: 8, max_iLvl: 78, Weights: 3000, tags: ["Mana"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4500, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "# Life Regeneration per second", total_tier: 11, max_iLvl: 81, Weights: 11000, tags: ["Life"] },
      { name: "#% reduced Duration of Bleeding on You", total_tier: 15, max_iLvl: 76, Weights: 7500, tags: ["Physical", "Ailment"] },
      { name: "#% reduced Poison Duration on You", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Chaos", "Ailment"] },
      { name: "#% reduced Ignite Duration on You", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Elemental", "Fire", "Ailment"] },
      { name: "#% faster start of Energy Shield Recharge", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Defences"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Defences", "Elemental"] }
    ],
    Desecrated: {
      prefix: [null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(6–12)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25–35)% reduced effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(10–20)% of Damage is taken from Mana before Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Hits have (17–25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(8–10)% increased Maximum Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life"] },
        { name: "(10–15)% of Physical Damage from Hits taken as Chaos Damage", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Physical", "Chaos"] },
        { name: "(64–97) to (97–145) Physical Thorns Damage", total_tier: 1, max_iLvl: 63, Weights: 0, tags: ["Damage", "Physical"] },
        { name: "Allocates a Random Notable Passive Skill", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Hits against you have (40–50)% reduced Critical Damage Bonus", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour and Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(3–5)% additional Physical Damage Reduction", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Physical"] },
      { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+1% to all Maximum Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Resistance"] },
      { name: "+(30–40) to Maximum Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(40–50)% increased Thorns Damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical"] },
      { name: "+(13–19)% to Chaos Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Resistance"] }
    ]
  },
  BodyArmour_DEX_INT: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 13, max_iLvl: 80, Weights: 13000, tags: ["Life"] },
      { name: "# to Evasion Rating# to maximum Energy Shield", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Evasion and Energy Shield", total_tier: 8, max_iLvl: 75, Weights: 8000, tags: ["Defences"] },
      { name: "#% increased Evasion and Energy Shield# to maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "# to Evasion Rating# to maximum Energy Shield#% increased Evasion and Energy Shield", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Defences"] },
      { name: "# to # Physical Thorns damage", total_tier: 7, max_iLvl: 74, Weights: 7000, tags: ["Damage", "Physical"] },
      { name: "# to Spirit", total_tier: 8, max_iLvl: 78, Weights: 3000, tags: ["Mana"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4500, tags: null },
      { name: "# to Stun Threshold", total_tier: 10, max_iLvl: 72, Weights: 8000, tags: null },
      { name: "# Life Regeneration per second", total_tier: 11, max_iLvl: 81, Weights: 11000, tags: ["Life"] },
      { name: "#% reduced Duration of Bleeding on You", total_tier: 15, max_iLvl: 76, Weights: 7500, tags: ["Physical", "Ailment"] },
      { name: "#% reduced Poison Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Chaos", "Ailment"] },
      { name: "#% reduced Ignite Duration on you", total_tier: 8, max_iLvl: 76, Weights: 7500, tags: ["Elemental", "Fire", "Ailment"] },
      { name: "#% faster start of Energy Shield Recharge", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Defences"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 6, max_iLvl: 81, Weights: 3000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix: [null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(6–12)% increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25–35)% reduced effect of Curses on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Caster", "Curse"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(10–20)% of Damage is taken from Mana before Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Life", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(12–18)% increased Reservation Efficiency of Companion Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Prevent +(3–5)% of Damage from Deflected Hits", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman"] },
        { name: "Hits have (17–25)% reduced Critical Hit Chance against you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Critical"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "(8–10)% increased maximum Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life"] },
        { name: "(10–15)% of Physical Damage from Hits taken as Chaos Damage", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Physical", "Chaos"] },
        { name: "(64–97) to (97–145) Physical Thorns damage", total_tier: 1, max_iLvl: 63, Weights: 0, tags: ["Damage", "Physical"] },
        { name: "Allocates a random Notable Passive Skill", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "Hits against you have (40–50)% reduced Critical Damage Bonus", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Critical"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Evasion and Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(3–5)% additional Physical Damage Reduction", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Physical"] },
      { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(10–20)% of Damage taken Recouped as Mana", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+1% to all Maximum Elemental Resistances", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Resistance"] },
      { name: "+(30–40) to Maximum Life", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(40–50)% increased Thorns damage", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage", "Physical"] },
      { name: "+(13–19)% to Chaos Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Chaos", "Resistance"] }
    ]
  },
  Boots_STR: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to Maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Armour", total_tier: 7, max_iLvl: 54, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour", total_tier: 6, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "#% increased Movement Speed", total_tier: 6, max_iLvl: 82, Weights: 6000, tags: ["Speed"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3750, tags: null },
      { name: "# to Stun Threshold", total_tier: 11, max_iLvl: 80, Weights: 8000, tags: null },
      { name: "# Life Regeneration per second", total_tier: 8, max_iLvl: 58, Weights: 8000, tags: ["Life"] },
      { name: "#% Increased Rarity of Items found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% reduced Shock Duration on you", total_tier: 15, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Lightning", "Ailment"] },
      { name: "#% reduced Chill Duration on you", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% reduced Freeze Duration on you", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 5, max_iLvl: 66, Weights: 5000, tags: ["Defences", "Elemental"] }
    ],
    Desecrated: {
      prefix: [],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "+(0.1–0.2) metres to Dodge Roll distance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12–20)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(20–30)% reduced Ignite Duration on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Ailment"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "#% reduced Duration of Bleeding on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Ailment"] },
        { name: "#% reduced Poison Duration on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Chaos", "Ailment"] },
        { name: "(8–12)% increased Mana Cost Efficiency if you have Dodge Rolled Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(40–50)% increased Mana Regeneration Rate while stationary", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Corrupted Blood cannot be inflicted on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Ailment"] },
        { name: "(6–10)% reduced Movement Speed Penalty from using Skills while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to Maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "30% increased Movement Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Speed"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "100% increased Effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(20–25)% to Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "+(20–25)% to Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "+(20–25)% to Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "+(1–3)% to Maximum Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "(3–5)% increased Movement Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(20–30)% increased Stun Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(20–30)% increased Freeze Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold"] },
      { name: "(20–30)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null }
    ]
  },
  Boots_DEX: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to Maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Evasion Rating", total_tier: 7, max_iLvl: 54, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Evasion Rating", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Evasion Rating# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "#% increased Movement Speed", total_tier: 6, max_iLvl: 82, Weights: 6000, tags: ["Speed"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3750, tags: null },
      { name: "# to Stun Threshold", total_tier: 11, max_iLvl: 80, Weights: 8800, tags: null },
      { name: "# Life Regeneration per second", total_tier: 8, max_iLvl: 58, Weights: 8000, tags: ["Life"] },
      { name: "#% Increased Rarity of Items Found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% reduced Shock Duration on You", total_tier: 15, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Lightning", "Ailment"] },
      { name: "#% reduced Chill Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% reduced Freeze Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 5, max_iLvl: 66, Weights: 5000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix:[null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "+(0.1–0.2) metres to Dodge Roll Distance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12–20)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(20–30)% reduced Ignite Duration on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Ailment"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "#% reduced Duration of Bleeding on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Ailment"] },
        { name: "#% reduced Poison Duration on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Chaos", "Ailment"] },
        { name: "(8–12)% increased Mana Cost Efficiency if you have Dodge Rolled Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(40–50)% increased Mana Regeneration Rate while stationary", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Corrupted Blood cannot be inflicted on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Ailment"] },
        { name: "(6–10)% reduced Movement Speed Penalty from using Skills while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to Maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "30% increased Movement Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Speed"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items Found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Evasion Rating", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(20–25)% to Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "+(20–25)% to Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "+(20–25)% to Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "+(1–3)% to Maximum Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "(3–5)% increased Movement Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(20–30)% increased Stun Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(20–30)% increased Freeze Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold"] },
      { name: "(20–30)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null }
    ]
  },
  Boots_INT: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to Maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Maximum Energy Shield", total_tier: 7, max_iLvl: 54, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Energy Shield", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Energy Shield# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "#% increased Movement Speed", total_tier: 6, max_iLvl: 82, Weights: 6000, tags: ["Speed"] }
    ],
    suffix: [
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3750, tags: null },
      { name: "# to Stun Threshold", total_tier: 11, max_iLvl: 80, Weights: 8800, tags: null },
      { name: "# Life Regeneration per second", total_tier: 8, max_iLvl: 58, Weights: 8000, tags: ["Life"] },
      { name: "#% Increased Rarity of Items Found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% reduced Shock Duration on You", total_tier: 15, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Lightning", "Ailment"] },
      { name: "#% reduced Chill Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% reduced Freeze Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% Increased Energy Shield Recharge Rate", total_tier: 4, max_iLvl: 48, Weights: 4000, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix:[null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "+(0.1–0.2) metres to Dodge Roll Distance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12–20)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(20–30)% reduced Ignite Duration on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Ailment"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "#% reduced Duration of Bleeding on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Ailment"] },
        { name: "#% reduced Poison Duration on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Chaos", "Ailment"] },
        { name: "(8–12)% increased Mana Cost Efficiency if you have Dodge Rolled Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(40–50)% increased Mana Regeneration Rate while stationary", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Corrupted Blood cannot be inflicted on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Ailment"] },
        { name: "(6–10)% reduced Movement Speed Penalty from using Skills while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to Maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "30% increased Movement Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Speed"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items Found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(20–25)% to Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "+(20–25)% to Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "+(20–25)% to Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "+(1–3)% to Maximum Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "(3–5)% increased Movement Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(20–30)% increased Stun Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(20–30)% increased Freeze Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold"] },
      { name: "(20–30)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null }
    ]
  },
  Boots_STR_DEX: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to Maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Armour# to Evasion Rating", total_tier: 4, max_iLvl: 46, Weights: 4000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "#% increased Movement Speed", total_tier: 6, max_iLvl: 82, Weights: 6000, tags: ["Speed"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3750, tags: null },
      { name: "# to Stun Threshold", total_tier: 11, max_iLvl: 80, Weights: 8800, tags: null },
      { name: "# Life Regeneration per second", total_tier: 8, max_iLvl: 58, Weights: 8000, tags: ["Life"] },
      { name: "#% Increased Rarity of Items Found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% reduced Shock Duration on You", total_tier: 15, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Lightning", "Ailment"] },
      { name: "#% reduced Chill Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% reduced Freeze Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences", "Elemental"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix:[null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "+(0.1–0.2) metres to Dodge Roll Distance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12–20)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(20–30)% reduced Ignite Duration on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Ailment"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "#% reduced Duration of Bleeding on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Ailment"] },
        { name: "#% reduced Poison Duration on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Chaos", "Ailment"] },
        { name: "(8–12)% increased Mana Cost Efficiency if you have Dodge Rolled Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(40–50)% increased Mana Regeneration Rate while stationary", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Corrupted Blood cannot be inflicted on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Ailment"] },
        { name: "(6–10)% reduced Movement Speed Penalty from using Skills while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to Maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "30% increased Movement Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Speed"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items Found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour and Evasion", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(20–25)% to Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "+(20–25)% to Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "+(20–25)% to Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "+(1–3)% to Maximum Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "(3–5)% increased Movement Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(20–30)% increased Stun Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(20–30)% increased Freeze Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold"] },
      { name: "(20–30)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null }
    ]
  },
  Boots_STR_INT: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to Maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Armour# to Evasion Rating", total_tier: 4, max_iLvl: 46, Weights: 4000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% increased Armour and Evasion# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "#% increased Movement Speed", total_tier: 6, max_iLvl: 82, Weights: 6000, tags: ["Speed"] }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3750, tags: null },
      { name: "# to Stun Threshold", total_tier: 11, max_iLvl: 80, Weights: 8800, tags: null },
      { name: "# Life Regeneration per second", total_tier: 8, max_iLvl: 58, Weights: 8000, tags: ["Life"] },
      { name: "#% Increased Rarity of Items Found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% reduced Shock Duration on You", total_tier: 15, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Lightning", "Ailment"] },
      { name: "#% reduced Chill Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% reduced Freeze Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences", "Elemental"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix:[null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "+(0.1–0.2) metres to Dodge Roll Distance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12–20)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(20–30)% reduced Ignite Duration on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Ailment"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "#% reduced Duration of Bleeding on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Ailment"] },
        { name: "#% reduced Poison Duration on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Chaos", "Ailment"] },
        { name: "(8–12)% increased Mana Cost Efficiency if you have Dodge Rolled Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(40–50)% increased Mana Regeneration Rate while stationary", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Corrupted Blood cannot be inflicted on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Ailment"] },
        { name: "(6–10)% reduced Movement Speed Penalty from using Skills while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to Maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "30% increased Movement Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Speed"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items Found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Armour and Evasion", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(20–25)% to Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "+(20–25)% to Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "+(20–25)% to Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "+(1–3)% to Maximum Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "(3–5)% increased Movement Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(20–30)% increased Stun Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(20–30)% increased Freeze Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold"] },
      { name: "(20–30)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null }
    ]
  },
  Boots_DEX_INT: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Life"] },
      { name: "# to Maximum Mana", total_tier: 9, max_iLvl: 60, Weights: 9000, tags: ["Mana"] },
      { name: "# to Evasion Rating# to Maximum Energy Shield", total_tier: 4, max_iLvl: 46, Weights: 4000, tags: ["Defences"] },
      { name: "#% Increased Evasion and Energy Shield", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% Increased Evasion and Energy Shield# to Stun Threshold", total_tier: 6, max_iLvl: 74, Weights: 6000, tags: ["Defences"] },
      { name: "#% Increased Movement Speed", total_tier: 6, max_iLvl: 82, Weights: 6000, tags: ["Speed"] }
    ],
    suffix: [
      { name: "# to Dexterity", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 8, max_iLvl: 74, Weights: 4000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 3750, tags: null },
      { name: "# to Stun Threshold", total_tier: 11, max_iLvl: 80, Weights: 8800, tags: null },
      { name: "# Life Regeneration per second", total_tier: 8, max_iLvl: 58, Weights: 8000, tags: ["Life"] },
      { name: "#% Increased Rarity of Items Found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "#% reduced Shock Duration on You", total_tier: 15, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Lightning", "Ailment"] },
      { name: "#% reduced Chill Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% reduced Freeze Duration on You", total_tier: 8, max_iLvl: 75, Weights: 7500, tags: ["Elemental", "Cold", "Ailment"] },
      { name: "#% Increased Energy Shield Recharge Rate", total_tier: 4, max_iLvl: 48, Weights: 2000, tags: ["Defences"] },
      { name: "Gain Deflection Rating equal to #% of Evasion Rating", total_tier: 5, max_iLvl: 66, Weights: 2500, tags: ["Defences"] }
    ],
    Desecrated: {
      prefix:[null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "+(0.1–0.2) metres to Dodge Roll Distance", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(12–20)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(20–30)% reduced Ignite Duration on You", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Ailment"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "#% reduced Duration of Bleeding on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Physical", "Ailment"] },
        { name: "#% reduced Poison Duration on You", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Chaos", "Ailment"] },
        { name: "(8–12)% increased Mana Cost Efficiency if you have Dodge Rolled Recently", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "(40–50)% increased Mana Regeneration Rate while stationary", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "Corrupted Blood cannot be inflicted on you", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Physical", "Ailment"] },
        { name: "(6–10)% reduced Movement Speed Penalty from using Skills while moving", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Speed"] }
      ]
    },
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Life"] },
        { name: "# to Maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "30% increased Movement Speed", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Speed"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "100% increased effect of Socketed Items", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items Found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Corrupted: [
      { name: "(15–25)% increased Evasion and Energy Shield", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(20–25)% to Fire Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "+(20–25)% to Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "+(20–25)% to Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "+(1–3)% to Maximum Lightning Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "(3–5)% increased Movement Speed", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Speed"] },
      { name: "(20–30)% increased Stun Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Damage"] },
      { name: "(20–30)% increased Freeze Threshold", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold"] },
      { name: "(20–30)% reduced Slowing Potency of Debuffs on You", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null }
    ]
  },
  Helmets_STR: {
    prefix: [
      { name: "# to Maximum Life", total_tier: 10, max_iLvl: 65, Weights: 10000, tags: ["Life"] },
      { name: "# to Maximum Mana", total_tier: 10, max_iLvl: 65, Weights: 9000, tags: ["Mana"] },
      { name: "# to Armour", total_tier: 8, max_iLvl: 60, Weights: 8000, tags: ["Defences"] },
      { name: "#% Increased Armour", total_tier: 7, max_iLvl: 65, Weights: 7000, tags: ["Defences"] },
      { name: "#% Increased Armour# to Maximum Life", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Life", "Defences"] },
      { name: "#% Increased Armour# to Maximum Mana", total_tier: 6, max_iLvl: 78, Weights: 6000, tags: ["Mana", "Defences"] },
      { name: "# to Accuracy Rating", total_tier: 9, max_iLvl: 76, Weights: 6200, tags: ["Attack"] },
      { name: "#% Increased Rarity of Items Found", total_tier: 5, max_iLvl: 81, Weights: 5000, tags: null }
    ],
    suffix: [
      { name: "# to Strength", total_tier: 8, max_iLvl: 74, Weights: 8000, tags: ["Attribute"] },
      { name: "# to Intelligence", total_tier: 9, max_iLvl: 81, Weights: 9000, tags: ["Attribute"] },
      { name: "#% to Fire Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Fire", "Resistance"] },
      { name: "#% to Cold Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "#% to Lightning Resistance", total_tier: 8, max_iLvl: 82, Weights: 8000, tags: ["Elemental", "Lightning", "Resistance"] },
      { name: "#% to Chaos Resistance", total_tier: 6, max_iLvl: 81, Weights: 1500, tags: ["Chaos", "Resistance"] },
      { name: "#% Reduced Attribute Requirements", total_tier: 5, max_iLvl: 60, Weights: 4000, tags: null },
      { name: "+# to Level of all Minion Skills", total_tier: 2, max_iLvl: 41, Weights: 750, tags: ["Minion", "Gem"] },
      { name: "# Life Regeneration per Second", total_tier: 8, max_iLvl: 58, Weights: 8000, tags: ["Life"] },
      { name: "#% Increased Critical Hit Chance", total_tier: 5, max_iLvl: 58, Weights: 3750, tags: ["Critical"] },
      { name: "#% Increased Rarity of Items Found", total_tier: 5, max_iLvl: 75, Weights: 5000, tags: null },
      { name: "# to Accuracy Rating#% Increased Light Radius", total_tier: 3, max_iLvl: 80, Weights: 3000, tags: ["Attack"] },
      { name: "#% of Armour also applies to Elemental Damage", total_tier: 5, max_iLvl: 66, Weights: 5000, tags: ["Defences", "Elemental"] }
    ],
    Essence: {
      prefix: [
        { name: "# to Maximum Life", total_tier: 3, max_iLvl: 54, Weights: 0, tags: ["Life"] },
        { name: "# to Maximum Mana", total_tier: 3, max_iLvl: 46, Weights: 0, tags: ["Mana"] },
        { name: "#% Increased Armour, Evasion or Energy Shield", total_tier: 18, max_iLvl: 54, Weights: 0, tags: ["Defences"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null }
      ],
      suffix: [
        { name: "#% to Chaos Resistance", total_tier: 3, max_iLvl: 56, Weights: 0, tags: ["Chaos", "Resistance"] },
        { name: "# to Strength, Dexterity or Intelligence", total_tier: 3, max_iLvl: 55, Weights: 0, tags: ["Attribute"] },
        { name: "+1 to Level of all Minion Skills", total_tier: 1, max_iLvl: 1, Weights: 0, tags: ["Minion", "Gem"] },
        { name: "Mark of the Abyssal Lord", total_tier: 1, max_iLvl: 1, Weights: 0, tags: null },
        { name: "#% to Fire Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Fire", "Resistance"] },
        { name: "#% to Cold Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Cold", "Resistance"] },
        { name: "(25–30)% of Cold Damage taken Recouped as Life", total_tier: 1, max_iLvl: 72, Weights: 0, tags: ["Life", "Elemental", "Cold"] },
        { name: "#% to Lightning Resistance", total_tier: 3, max_iLvl: 60, Weights: 0, tags: ["Elemental", "Lightning", "Resistance"] },
        { name: "#% Increased Rarity of Items Found", total_tier: 3, max_iLvl: 63, Weights: 0, tags: null }
      ]
    },
    Desecrated: {
      prefix:[null],
      suffix: [
        { name: "+(13–17)% to Fire and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Elemental", "Fire", "Chaos", "Resistance"] },
        { name: "# to Strength and Intelligence", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "# to Strength and Dexterity", total_tier: 2, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Attribute"] },
        { name: "(10–20)% of Damage taken Recouped as Life", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu", "Life"] },
        { name: "(10–20)% Increased Glory Generation", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(25–35)% Increased Presence Area of Effect", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "(4–8)% Increased Spirit Reservation Efficiency of Skills", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Amanamu"] },
        { name: "+(13–17)% to Cold and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Cold", "Chaos", "Resistance"] },
        { name: "+(9–15) to Dexterity and Intelligence", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Attribute"] },
        { name: "(23–31)% of Armour also applies to Chaos Damage", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Defences", "Chaos"] },
        { name: "(20–30)% of Elemental Damage taken Recouped as Energy Shield", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Elemental", "Energy Shield"] },
        { name: "(6–10)% Increased Mana Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Kurgal", "Mana"] },
        { name: "+(13–17)% to Lightning and Chaos Resistances", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Elemental", "Lightning", "Chaos", "Resistance"] },
        { name: "(8–12)% Increased Life Cost Efficiency", total_tier: 1, max_iLvl: 65, Weights: 0, tags: ["Ulaman", "Life"] }
      ]
    },
    Corrupted: [
      { name: "(15–25)% Increased Armour", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Defences"] },
      { name: "(10–20)% Reduced Attribute Requirements", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+(1–3)% to Maximum Cold Resistance", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Elemental", "Cold", "Resistance"] },
      { name: "+(20–30) to Spirit", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "+1 to Maximum Power Charges", total_tier: 1, max_iLvl: 1, Weights: 1, tags: null },
      { name: "(+50–100) to Accuracy Rating", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Attack"] },
      { name: "Regenerate (1–2)% of Maximum Life per Second", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Life"] },
      { name: "(20–30)% Increased Mana Regeneration Rate", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Mana"] },
      { name: "+1 to Level of all Minion Skills", total_tier: 1, max_iLvl: 1, Weights: 1, tags: ["Minion", "Gem"] }
    ]
  }






};

// 🔧 ฟังก์ชันเอาชื่อ mod แบบ unique
function uniqueMods(mods) {
  if (!Array.isArray(mods)) return [];
  return [...new Set(mods.map(mod => mod.name))];
}

// 🔧 ฟังก์ชันรวม mods ของ Base Item
function collectModsFromBaseItem(baseItem) {
  return {
    prefix: uniqueMods(baseItem.prefix),
    suffix: uniqueMods(baseItem.suffix),
    Essence: {
      prefix: uniqueMods(baseItem.Essence?.prefix || []),
      suffix: uniqueMods(baseItem.Essence?.suffix || [])
    },
    Desecrated: {
      prefix: uniqueMods(baseItem.Desecrated?.prefix || []),
      suffix: uniqueMods(baseItem.Desecrated?.suffix || [])
    },
    Corrupted: uniqueMods(baseItem.Corrupted || [])
  };
}

// 🔧 ฟังก์ชันรวมจากหลาย base items
function mergeBaseItems(baseItems) {
  let result = {
    prefix: new Set(),
    suffix: new Set(),
    Essence: { prefix: new Set(), suffix: new Set() },
    Desecrated: { prefix: new Set(), suffix: new Set() },
    Corrupted: new Set()
  };

  baseItems.forEach(item => {
    let mods = collectModsFromBaseItem(item);

    mods.prefix.forEach(m => result.prefix.add(m));
    mods.suffix.forEach(m => result.suffix.add(m));
    mods.Essence.prefix.forEach(m => result.Essence.prefix.add(m));
    mods.Essence.suffix.forEach(m => result.Essence.suffix.add(m));
    mods.Desecrated.prefix.forEach(m => result.Desecrated.prefix.add(m));
    mods.Desecrated.suffix.forEach(m => result.Desecrated.suffix.add(m));
    mods.Corrupted.forEach(m => result.Corrupted.add(m));
  });

  // แปลง Set -> Array ก่อน return
  return {
    prefix: [...result.prefix],
    suffix: [...result.suffix],
    Essence: {
      prefix: [...result.Essence.prefix],
      suffix: [...result.Essence.suffix]
    },
    Desecrated: {
      prefix: [...result.Desecrated.prefix],
      suffix: [...result.Desecrated.suffix]
    },
    Corrupted: [...result.Corrupted]
  };
}
const main = () => {
  const modsInBaseItems = mergeBaseItems([baseMods.Spears, baseMods.Wands, baseMods.OneHandMaces, baseMods.Sceptres, //Base item of one hand weapons
    baseMods.TwoHandMaces, baseMods.Quarterstaves, baseMods.Crossbows, baseMods.Bows, baseMods.Staves, //Base item of two hand weapons
    baseMods.Foci, baseMods.Quivers, baseMods.Shield_STR, baseMods.Shield_DEX, baseMods.Shield_INT, baseMods.Bucklers, //Base item of off-hand
    baseMods.Amulets, baseMods.Rings, baseMods.Belts //Base item of accessories
  ]);

  console.log(JSON.stringify(modsInBaseItems, null, 2));
}
main();