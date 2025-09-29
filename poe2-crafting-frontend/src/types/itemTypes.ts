// Item type definitions following the established categorization
export type ItemCategory =
  // One Hand Weapons
  | 'wands' | 'maces' | 'sceptres' | 'spears'
  // Two Hand Weapons
  | 'twoHandMaces' | 'quarterstaves' | 'crossbows' | 'bows' | 'staves'
  // Off Hand Items
  | 'foci' | 'quivers' | 'shields' | 'bucklers'
  // Jewellery
  | 'amulets' | 'rings' | 'belts'
  // Armour
  | 'gloves' | 'boots' | 'bodyArmours' | 'helmets'

export type ModSource = 'base' | 'essence' | 'desecrated' | 'corrupted'
export type ModType = 'prefix' | 'suffix'

export interface ItemTypeInfo {
  category: ItemCategory
  displayName: string
  icon: string
  description?: string
}

export const ITEM_TYPE_DISPLAY_NAMES: Record<ItemCategory, string> = {
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

export const ITEM_TYPE_ICONS: Record<ItemCategory, string> = {
  // One Hand Weapons
  wands: '🪄',
  maces: '🔨',
  sceptres: '⚚',
  spears: '🔱',
  // Two Hand Weapons
  twoHandMaces: '🪓',
  quarterstaves: '🪵',
  crossbows: '🏹',
  bows: '🏹',
  staves: '🪄',
  // Off Hand Items
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
