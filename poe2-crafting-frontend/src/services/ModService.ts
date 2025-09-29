import type { ItemCategory } from '@/types/itemTypes'
import type {
  NormalizedMod,
  SelectedMod,
  ModQueryOptions,
  ModCompatibilityResult,
  ModCategory
} from '@/types/mods'
import { ModRepository } from '@/repositories/ModRepository'

/**
 * Service class for mod-related business logic
 * Handles mod compatibility, selection limits, and caching
 */
export class ModService {
  private repository: ModRepository
  private modCache = new Map<string, NormalizedMod[]>()

  // Mod selection limits
  private static readonly MAX_PREFIXES = 3
  private static readonly MAX_SUFFIXES = 3

  constructor(repository?: ModRepository) {
    this.repository = repository || new ModRepository()
  }

  /**
   * Get all mods applicable to an item category with optional filters
   */
  async getModsForItemType(
    itemCategory: ItemCategory,
    options: ModQueryOptions = {}
  ): Promise<NormalizedMod[]> {
    const cacheKey = `mods_${itemCategory}_${JSON.stringify(options)}`

    if (this.modCache.has(cacheKey)) {
      return this.modCache.get(cacheKey)!
    }

    const mods = await this.repository.findByItemCategory(itemCategory, options)
    this.modCache.set(cacheKey, mods)

    return mods
  }

  /**
   * Get mods organized by categories for UI display
   */
  async getModCategories(
    itemCategory: ItemCategory,
    selectedMods: SelectedMod[],
    options: ModQueryOptions = {}
  ): Promise<ModCategory[]> {
    const allMods = await this.getModsForItemType(itemCategory, options)

    const categories: ModCategory[] = [
      { key: 'prefix', title: 'Prefix', mods: [], count: 0 },
      { key: 'suffix', title: 'Suffix', mods: [], count: 0 },
      { key: 'desecrated_prefix', title: 'Desecrated Modifiers Prefix', mods: [], count: 0 },
      { key: 'desecrated_suffix', title: 'Desecrated Modifiers Suffix', mods: [], count: 0 },
      { key: 'essence_prefix', title: 'Essence Prefix', mods: [], count: 0 },
      { key: 'essence_suffix', title: 'Essence Suffix', mods: [], count: 0 },
      { key: 'corrupted', title: 'Corrupted', mods: [], count: 0 }
    ]

    // Categorize mods
    allMods.forEach(mod => {
      let categoryKey: string

      if (mod.corrupted) {
        categoryKey = 'corrupted'
      } else if (mod.source === 'desecrated' && mod.type === 'prefix') {
        categoryKey = 'desecrated_prefix'
      } else if (mod.source === 'desecrated' && mod.type === 'suffix') {
        categoryKey = 'desecrated_suffix'
      } else if (mod.source === 'essence' && mod.type === 'prefix') {
        categoryKey = 'essence_prefix'
      } else if (mod.source === 'essence' && mod.type === 'suffix') {
        categoryKey = 'essence_suffix'
      } else if (mod.type === 'prefix') {
        categoryKey = 'prefix'
      } else if (mod.type === 'suffix') {
        categoryKey = 'suffix'
      } else {
        return // Skip unknown types
      }

      const category = categories.find(c => c.key === categoryKey)
      if (category) {
        category.mods.push(mod)
        category.count++
      }
    })

    // Filter out empty categories and sort mods within each category
    return categories
      .filter(cat => cat.count > 0)
      .map(cat => ({
        ...cat,
        mods: cat.mods.sort((a, b) => a.name.localeCompare(b.name))
      }))
  }

  /**
   * Check if a mod can be selected given current selections
   */
  checkModCompatibility(
    mod: NormalizedMod,
    selectedMods: SelectedMod[]
  ): ModCompatibilityResult {
    // Check if already selected
    if (selectedMods.some(s => s.id === mod.id)) {
      return {
        canSelect: false,
        reason: 'already_selected'
      }
    }

    // Check group conflicts
    if (mod.groupId !== undefined) {
      const conflictingMods = selectedMods.filter(s =>
        s.groupId !== undefined && s.groupId === mod.groupId
      )

      if (conflictingMods.length > 0) {
        return {
          canSelect: false,
          reason: 'group_conflict',
          conflictsWith: conflictingMods.map(m => m.id)
        }
      }
    }

    // Check type limits
    const prefixCount = selectedMods.filter(s => s.type === 'prefix').length
    const suffixCount = selectedMods.filter(s => s.type === 'suffix').length

    if (mod.type === 'prefix' && prefixCount >= ModService.MAX_PREFIXES) {
      return {
        canSelect: false,
        reason: 'type_limit'
      }
    }

    if (mod.type === 'suffix' && suffixCount >= ModService.MAX_SUFFIXES) {
      return {
        canSelect: false,
        reason: 'type_limit'
      }
    }

    return { canSelect: true }
  }

  /**
   * Get compatible mods that can be added to current selection
   */
  async getCompatibleMods(
    itemCategory: ItemCategory,
    selectedMods: SelectedMod[],
    options: ModQueryOptions = {}
  ): Promise<NormalizedMod[]> {
    const allMods = await this.getModsForItemType(itemCategory, options)

    return allMods.filter(mod => {
      const compatibility = this.checkModCompatibility(mod, selectedMods)
      return compatibility.canSelect
    })
  }

  /**
   * Validate entire mod selection
   */
  validateModSelection(selectedMods: SelectedMod[]): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check prefix limit
    const prefixCount = selectedMods.filter(s => s.type === 'prefix').length
    if (prefixCount > ModService.MAX_PREFIXES) {
      errors.push(`Too many prefixes selected (${prefixCount}/${ModService.MAX_PREFIXES})`)
    }

    // Check suffix limit
    const suffixCount = selectedMods.filter(s => s.type === 'suffix').length
    if (suffixCount > ModService.MAX_SUFFIXES) {
      errors.push(`Too many suffixes selected (${suffixCount}/${ModService.MAX_SUFFIXES})`)
    }

    // Check group conflicts
    const groupConflicts: Record<number, SelectedMod[]> = {}
    selectedMods.forEach(mod => {
      if (mod.groupId !== undefined) {
        if (!groupConflicts[mod.groupId]) {
          groupConflicts[mod.groupId] = []
        }
        groupConflicts[mod.groupId].push(mod)
      }
    })

    Object.entries(groupConflicts).forEach(([groupId, mods]) => {
      if (mods.length > 1) {
        errors.push(`Group conflict in group ${groupId}: ${mods.map(m => m.name).join(', ')}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get suggested mods based on current selection
   */
  async getSuggestedMods(
    itemCategory: ItemCategory,
    selectedMods: SelectedMod[],
    limit: number = 5
  ): Promise<NormalizedMod[]> {
    const compatibleMods = await this.getCompatibleMods(itemCategory, selectedMods)

    // Simple suggestion algorithm: prioritize by tags that complement existing mods
    const selectedTags = new Set<string>()
    selectedMods.forEach(mod => {
      // This would need access to mod tags, which we don't have in SelectedMod
      // In a real implementation, you'd store the full NormalizedMod or add tags to SelectedMod
    })

    // For now, just return the first N compatible mods
    return compatibleMods.slice(0, limit)
  }

  /**
   * Get mod statistics for an item category
   */
  async getModStats(itemCategory: ItemCategory): Promise<{
    totalMods: number
    byType: Record<string, number>
    bySource: Record<string, number>
    byTag: Record<string, number>
  }> {
    const mods = await this.getModsForItemType(itemCategory)

    const stats = {
      totalMods: mods.length,
      byType: {} as Record<string, number>,
      bySource: {} as Record<string, number>,
      byTag: {} as Record<string, number>
    }

    mods.forEach(mod => {
      // Count by type
      stats.byType[mod.type] = (stats.byType[mod.type] || 0) + 1

      // Count by source
      stats.bySource[mod.source] = (stats.bySource[mod.source] || 0) + 1

      // Count by tags
      mod.tags.forEach(tag => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1
      })
    })

    return stats
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.modCache.clear()
    this.repository.clearCache()
  }

  /**
   * Get mod selection limits
   */
  getSelectionLimits(): { maxPrefixes: number; maxSuffixes: number } {
    return {
      maxPrefixes: ModService.MAX_PREFIXES,
      maxSuffixes: ModService.MAX_SUFFIXES
    }
  }
}
