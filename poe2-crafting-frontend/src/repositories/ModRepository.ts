import type {
  ItemCategory,
  ModSource,
  ModType
} from '@/types/itemTypes'
import type {
  NormalizedMod,
  ModQueryOptions,
  ModTier,
  LegacyMod
} from '@/types/mods'

// Mapping from old base item names to new categories
const BASE_ITEM_MAPPING: Record<string, ItemCategory[]> = {
  Spears: ['spears'],
  Wands: ['wands'],
  OneHandMaces: ['maces'],
  Sceptres: ['sceptres'],
  TwoHandMaces: ['twoHandMaces'],
  Quarterstaves: ['quarterstaves'],
  Crossbows: ['crossbows'],
  Bows: ['bows'],
  Staves: ['staves'],
  Foci: ['foci'],
  Quivers: ['quivers'],
  Shield_STR: ['shields'],
  Shield_DEX: ['shields'],
  Shield_INT: ['shields'],
  Bucklers: ['bucklers'],
  Amulets: ['amulets'],
  Rings: ['rings'],
  Belts: ['belts'],
  Gloves_STR: ['gloves'],
  Gloves_DEX: ['gloves'],
  Gloves_INT: ['gloves'],
  Gloves_STR_DEX: ['gloves'],
  Gloves_STR_INT: ['gloves'],
  Gloves_DEX_INT: ['gloves'],
  Boots_STR: ['boots'],
  Boots_DEX: ['boots'],
  Boots_INT: ['boots'],
  Boots_STR_DEX: ['boots'],
  Boots_STR_INT: ['boots'],
  Boots_DEX_INT: ['boots'],
  BodyArmours_STR: ['bodyArmours'],
  BodyArmours_DEX: ['bodyArmours'],
  BodyArmours_INT: ['bodyArmours'],
  BodyArmours_STR_DEX: ['bodyArmours'],
  BodyArmours_STR_INT: ['bodyArmours'],
  BodyArmours_DEX_INT: ['bodyArmours'],
  Helmets_STR: ['helmets']
}

export class ModRepository {
  private normalizedMods: NormalizedMod[] = []
  private modCache = new Map<string, NormalizedMod[]>()

  constructor() {
    this.initializeData()
  }

  /**
   * Initialize and normalize mod data from legacy format
   */
  private async initializeData(): Promise<void> {
    try {
      // Load legacy data
      const [allModsResponse, prefixSuffixResponse] = await Promise.all([
        fetch('/data/all_mods_in_base_items.json'),
        fetch('/data/all_mods_prefix_suffix_in_base_items.json')
      ])

      const allModsData = await allModsResponse.json()
      const prefixSuffixData = await prefixSuffixResponse.json()

      // Normalize the data
      this.normalizedMods = this.normalizeLegacyData(allModsData, prefixSuffixData)
    } catch (error) {
      console.error('Failed to initialize mod data:', error)
      this.normalizedMods = []
    }
  }

  /**
   * Convert legacy mod data to normalized format
   */
  private normalizeLegacyData(
    allModsData: any,
    prefixSuffixData: any
  ): NormalizedMod[] {
    const normalized: NormalizedMod[] = []

    // Process each base item type
    Object.entries(BASE_ITEM_MAPPING).forEach(([oldBaseName, newCategories]) => {
      const baseData = allModsData[oldBaseName]
      if (!baseData) return

      // Process each mod type (prefix, suffix, etc.)
      this.processModType(normalized, baseData, 'prefix', 'base', newCategories)
      this.processModType(normalized, baseData, 'suffix', 'base', newCategories)

      // Process special mod types
      if (baseData.Essence) {
        this.processModType(normalized, baseData.Essence, 'prefix', 'essence', newCategories)
        this.processModType(normalized, baseData.Essence, 'suffix', 'essence', newCategories)
      }

      if (baseData.Desecrated) {
        this.processModType(normalized, baseData.Desecrated, 'prefix', 'desecrated', newCategories)
        this.processModType(normalized, baseData.Desecrated, 'suffix', 'desecrated', newCategories)
      }

      if (baseData.Corrupted) {
        this.processCorruptedMods(normalized, baseData.Corrupted, newCategories)
      }
    })

    return normalized
  }

  /**
   * Process mods of a specific type
   */
  private processModType(
    normalized: NormalizedMod[],
    modData: any,
    type: ModType,
    source: ModSource,
    categories: ItemCategory[]
  ): void {
    const mods = modData[type]
    if (!Array.isArray(mods)) return

    mods.forEach((mod: any, index: number) => {
      const modId = this.generateModId(mod.name, type, source, categories[0])

      // Check if mod already exists
      let existingMod = normalized.find(m => m.id === modId)
      if (!existingMod) {
        existingMod = {
          id: modId,
          name: mod.name,
          type,
          source,
          tags: this.extractTags(mod.name),
          applicableTo: [...categories],
          tiers: []
        }
        normalized.push(existingMod)
      } else {
        // Add categories if not already present
        categories.forEach(cat => {
          if (!existingMod!.applicableTo.includes(cat)) {
            existingMod!.applicableTo.push(cat)
          }
        })
      }

      // Add tier information
      if (mod.total_tier && mod.max_iLvl) {
        const tier: ModTier = {
          tier: mod.total_tier,
          ilvl: mod.max_iLvl,
          values: this.parseModValues(mod.name),
          weights: mod.Weights || 0
        }
        existingMod.tiers.push(tier)
      }
    })
  }

  /**
   * Process corrupted mods
   */
  private processCorruptedMods(
    normalized: NormalizedMod[],
    corruptedMods: any[],
    categories: ItemCategory[]
  ): void {
    corruptedMods.forEach((mod: any, index: number) => {
      const modId = this.generateModId(mod.name, 'prefix', 'corrupted', categories[0])

      const normalizedMod: NormalizedMod = {
        id: modId,
        name: mod.name,
        type: 'prefix', // Corrupted mods are typically prefix-like
        source: 'corrupted',
        tags: this.extractTags(mod.name),
        applicableTo: [...categories],
        tiers: [{
          tier: 1,
          ilvl: 1,
          values: this.parseModValues(mod.name),
          weights: mod.Weights || 1
        }],
        corrupted: true
      }

      normalized.push(normalizedMod)
    })
  }

  /**
   * Generate unique mod ID
   */
  private generateModId(name: string, type: ModType, source: ModSource, category: ItemCategory): string {
    return `${source}_${type}_${name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`
  }

  /**
   * Extract tags from mod name for categorization
   */
  private extractTags(modName: string): string[] {
    const tags: string[] = []
    const name = modName.toLowerCase()

    // Damage types
    if (name.includes('physical')) tags.push('physical')
    if (name.includes('fire')) tags.push('fire', 'elemental')
    if (name.includes('cold')) tags.push('cold', 'elemental')
    if (name.includes('lightning')) tags.push('lightning', 'elemental')
    if (name.includes('chaos')) tags.push('chaos')

    // Attribute types
    if (name.includes('strength')) tags.push('strength', 'attribute')
    if (name.includes('dexterity')) tags.push('dexterity', 'attribute')
    if (name.includes('intelligence')) tags.push('intelligence', 'attribute')

    // Other categories
    if (name.includes('life')) tags.push('life')
    if (name.includes('mana')) tags.push('mana')
    if (name.includes('attack speed')) tags.push('attack_speed', 'speed')
    if (name.includes('cast speed')) tags.push('cast_speed', 'speed')
    if (name.includes('critical')) tags.push('critical')

    return tags
  }

  /**
   * Parse mod values from name (simplified implementation)
   */
  private parseModValues(modName: string): number[][] {
    // This is a simplified implementation
    // In a real scenario, you'd need more sophisticated parsing
    const matches = modName.match(/(\d+)(?:\s*to\s*(\d+))?/g)
    if (!matches) return [[0]]

    return matches.map(match => {
      const parts = match.split(/\s*to\s*/).map(Number)
      return parts.length === 2 ? parts : [parts[0], parts[0]]
    })
  }

  /**
   * Find mods applicable to specific item category with optional filters
   */
  async findByItemCategory(
    itemCategory: ItemCategory,
    options: ModQueryOptions = {}
  ): Promise<NormalizedMod[]> {
    const cacheKey = `category_${itemCategory}_${JSON.stringify(options)}`

    if (this.modCache.has(cacheKey)) {
      return this.modCache.get(cacheKey)!
    }

    let mods = this.normalizedMods.filter(mod =>
      mod.applicableTo.includes(itemCategory)
    )

    // Apply filters
    if (options.ilvl) {
      mods = mods.filter(mod =>
        mod.tiers.some(tier => tier.ilvl <= options.ilvl!)
      )
    }

    if (options.type && options.type !== 'all') {
      mods = mods.filter(mod => mod.type === options.type)
    }

    if (options.source && options.source !== 'all') {
      mods = mods.filter(mod => mod.source === options.source)
    }

    if (options.query) {
      const query = options.query.toLowerCase()
      mods = mods.filter(mod =>
        mod.name.toLowerCase().includes(query) ||
        mod.tags.some(tag => tag.includes(query))
      )
    }

    // Sort by relevance (you could implement more sophisticated sorting)
    mods.sort((a, b) => a.name.localeCompare(b.name))

    this.modCache.set(cacheKey, mods)
    return mods
  }

  /**
   * Get all available mods (for admin/debugging purposes)
   */
  async findAll(): Promise<NormalizedMod[]> {
    return this.normalizedMods
  }

  /**
   * Clear cache (useful when data is updated)
   */
  clearCache(): void {
    this.modCache.clear()
  }
}
