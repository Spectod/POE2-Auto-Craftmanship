import type { ItemCategory, ModSource, ModType } from './itemTypes'

export interface ModTier {
  /** Tier number (1-10, higher is better) */
  tier: number
  /** Minimum item level required */
  ilvl: number
  /** Mod values as arrays (e.g., [[10, 20], [5, 8]] for "Adds 10 to 20 Physical Damage, 5 to 8 Fire Damage") */
  values: number[][]
  /** Spawn weight for this tier */
  weights: number
}

export interface NormalizedMod {
  /** Unique identifier for the mod */
  id: string
  /** Human-readable name */
  name: string
  /** Whether this is a prefix or suffix */
  type: ModType
  /** Source of the mod (base crafting, essence, desecrated, corrupted) */
  source: ModSource
  /** Tags for categorization and filtering */
  tags: string[]
  /** Which item categories this mod can apply to */
  applicableTo: ItemCategory[]
  /** Available tiers for this mod */
  tiers: ModTier[]
  /** Group ID for mutually exclusive mods (optional) */
  groupId?: number
  /** Whether this mod is corrupted (affects mod limits) */
  corrupted?: boolean
}

export interface SelectedMod {
  /** Mod ID */
  id: string
  /** Selected tier number */
  selectedTier: number | null
  /** Mod name for display */
  name: string
  /** Mod type */
  type: ModType
  /** Mod source */
  source: ModSource
  /** Group ID if applicable */
  groupId?: number
}

export interface ModQueryOptions {
  /** Item level filter */
  ilvl?: number
  /** Mod type filter */
  type?: ModType | 'all'
  /** Mod source filter */
  source?: ModSource | 'all'
  /** Search query */
  query?: string
  /** Item category to filter applicable mods */
  itemCategory?: ItemCategory
}

export interface ModCompatibilityResult {
  /** Whether the mod can be selected */
  canSelect: boolean
  /** Reason why it cannot be selected (if applicable) */
  reason?: 'group_conflict' | 'type_limit' | 'already_selected'
  /** Conflicting mod IDs */
  conflictsWith?: string[]
}

export interface ModCategory {
  /** Category key for identification */
  key: string
  /** Display title */
  title: string
  /** Mods in this category */
  mods: NormalizedMod[]
  /** Number of mods in category */
  count: number
}

// Legacy interface for backward compatibility during migration
export interface LegacyMod {
  id: number
  name: string
  affix: string
  source: string
  groupId?: number
  tiers: any[]
  corrupted?: boolean
}
