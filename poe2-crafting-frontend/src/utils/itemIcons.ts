export function getCategoryDisplayName(key: string): string {
  const nameMap: Record<string, string> = {
    // One Hand Weapons
    wands: 'Wand',
    maces: 'Mace',
    sceptres: 'Sceptre',
    spears: 'Spear',
    // Two Hand Weapons
    twoHandMaces: 'Two Hand Mace',
    quarterstaves: 'Quarterstaff',
    crossbows: 'Crossbow',
    bows: 'Bow',
    staves: 'Staff',
    // Off Hand Items
    foci: 'Focus',
    quivers: 'Quiver',
    shields: 'Shield',
    bucklers: 'Buckler',
    // Jewellery
    amulets: 'Amulet',
    rings: 'Ring',
    belts: 'Belt',
    // Armour
    gloves: 'Gloves',
    boots: 'Boots',
    bodyArmours: 'Body Armour',
    helmets: 'Helmet',
  }
  return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

export function getItemTypeIcon(key: string): string {
  // Prefer a clear emoji for two-hand maces
  if (key === 'twoHandMaces') return String.fromCodePoint(0x1FA93) // 🪓
  const iconMap: Record<string, string> = {
    // One Handed Weapons
    wands: '🪄',
    maces: '🔨',
    sceptres: '⚚',
    spears: '🔱',
    // Two Handed Weapons
    twoHandMaces: '🪓',
    quarterstaves: '🪵',
    crossbows: '🏹',
    bows: '🏹',
    staves: '🪄',
    // Off Handed Items
    foci: '🔮',
    quivers: '🎯',
    shields: '🛡️',
    bucklers: '🛡️',
    // Jewellery
    amulets: '📿',
    rings: '💍',
    belts: '💎',
    // Armour
    gloves: '🧤',
    boots: '🥾',
    bodyArmours: '🦺',
    helmets: '🪖',
  }
  return iconMap[key] || '❔'
}





