import { ref, computed, readonly } from 'vue'
import type { ItemCategory } from '@/types/itemTypes'
import type {
  NormalizedMod,
  SelectedMod,
  ModQueryOptions,
  ModCategory,
  ModCompatibilityResult
} from '@/types/mods'
import { ModService } from '@/services/ModService'

// Global service instance (singleton pattern)
let modServiceInstance: ModService | null = null

function getModService(): ModService {
  if (!modServiceInstance) {
    modServiceInstance = new ModService()
  }
  return modServiceInstance
}

/**
 * Composable for mod management with reactive state
 * Provides a clean interface for components to interact with mod data
 */
export function useMods(itemCategory?: ItemCategory) {
  const modService = getModService()

  // Reactive state
  const mods = ref<NormalizedMod[]>([])
  const modCategories = ref<ModCategory[]>([])
  const selectedMods = ref<SelectedMod[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Query options
  const queryOptions = ref<ModQueryOptions>({
    type: 'all',
    source: 'all',
    query: ''
  })

  // Computed properties
  const selectedPrefixCount = computed(() =>
    selectedMods.value.filter(mod => mod.type === 'prefix').length
  )

  const selectedSuffixCount = computed(() =>
    selectedMods.value.filter(mod => mod.type === 'suffix').length
  )

  const selectionLimits = computed(() => modService.getSelectionLimits())

  const isSelectionValid = computed(() => {
    const validation = modService.validateModSelection(selectedMods.value)
    return validation.isValid
  })

  const selectionErrors = computed(() => {
    const validation = modService.validateModSelection(selectedMods.value)
    return validation.errors
  })

  // Methods
  const loadMods = async (category: ItemCategory, options?: ModQueryOptions) => {
    if (!category) return

    isLoading.value = true
    error.value = null

    try {
      const opts = { ...queryOptions.value, ...options }
      const [allMods, categories] = await Promise.all([
        modService.getModsForItemType(category, opts),
        modService.getModCategories(category, selectedMods.value, opts)
      ])

      mods.value = allMods
      modCategories.value = categories
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load mods'
      console.error('Error loading mods:', err)
    } finally {
      isLoading.value = false
    }
  }

  const checkModCompatibility = (mod: NormalizedMod): ModCompatibilityResult => {
    return modService.checkModCompatibility(mod, selectedMods.value)
  }

  const canSelectMod = (mod: NormalizedMod): boolean => {
    return checkModCompatibility(mod).canSelect
  }

  const selectMod = (mod: NormalizedMod, tier?: number) => {
    if (!canSelectMod(mod)) return false

    // Find the best available tier if not specified
    const availableTiers = mod.tiers.filter(t => t.ilvl <= (queryOptions.value.ilvl || 100))
    const selectedTier = tier || availableTiers[availableTiers.length - 1]?.tier || 1

    const selectedMod: SelectedMod = {
      id: mod.id,
      selectedTier,
      name: mod.name,
      type: mod.type,
      source: mod.source,
      groupId: mod.groupId
    }

    selectedMods.value.push(selectedMod)

    // Reload categories to reflect compatibility changes
    if (itemCategory) {
      loadMods(itemCategory, queryOptions.value)
    }

    return true
  }

  const deselectMod = (modId: string) => {
    const index = selectedMods.value.findIndex(mod => mod.id === modId)
    if (index !== -1) {
      selectedMods.value.splice(index, 1)

      // Reload categories to reflect compatibility changes
      if (itemCategory) {
        loadMods(itemCategory, queryOptions.value)
      }
    }
  }

  const updateModTier = (modId: string, newTier: number) => {
    const mod = selectedMods.value.find(m => m.id === modId)
    if (mod) {
      mod.selectedTier = newTier
    }
  }

  const clearSelection = () => {
    selectedMods.value = []
    if (itemCategory) {
      loadMods(itemCategory, queryOptions.value)
    }
  }

  const setQueryOptions = (options: Partial<ModQueryOptions>) => {
    queryOptions.value = { ...queryOptions.value, ...options }
    if (itemCategory) {
      loadMods(itemCategory, queryOptions.value)
    }
  }

  const getCompatibleMods = async (limit?: number): Promise<NormalizedMod[]> => {
    if (!itemCategory) return []

    const compatibleMods = await modService.getCompatibleMods(
      itemCategory,
      selectedMods.value,
      queryOptions.value
    )

    return limit ? compatibleMods.slice(0, limit) : compatibleMods
  }

  const getSuggestedMods = async (limit: number = 5): Promise<NormalizedMod[]> => {
    if (!itemCategory) return []

    return await modService.getSuggestedMods(itemCategory, selectedMods.value, limit)
  }

  const getModStats = async () => {
    if (!itemCategory) return null

    return await modService.getModStats(itemCategory)
  }

  // Initialize if itemCategory is provided
  if (itemCategory) {
    loadMods(itemCategory)
  }

  return {
    // State
    mods: readonly(mods),
    modCategories: readonly(modCategories),
    selectedMods: readonly(selectedMods),
    isLoading: readonly(isLoading),
    error: readonly(error),
    queryOptions: readonly(queryOptions),

    // Computed
    selectedPrefixCount,
    selectedSuffixCount,
    selectionLimits,
    isSelectionValid,
    selectionErrors,

    // Methods
    loadMods,
    checkModCompatibility,
    canSelectMod,
    selectMod,
    deselectMod,
    updateModTier,
    clearSelection,
    setQueryOptions,
    getCompatibleMods,
    getSuggestedMods,
    getModStats
  }
}

/**
 * Composable for mod selection management (lighter version for components that only need selection)
 */
export function useModSelection(initialMods: SelectedMod[] = []) {
  const selectedMods = ref<SelectedMod[]>([...initialMods])

  const selectedPrefixCount = computed(() =>
    selectedMods.value.filter(mod => mod.type === 'prefix').length
  )

  const selectedSuffixCount = computed(() =>
    selectedMods.value.filter(mod => mod.type === 'suffix').length
  )

  const addMod = (mod: SelectedMod) => {
    // Check for duplicates
    if (selectedMods.value.some(existing => existing.id === mod.id)) {
      return false
    }

    selectedMods.value.push({ ...mod })
    return true
  }

  const removeMod = (modId: string) => {
    const index = selectedMods.value.findIndex(mod => mod.id === modId)
    if (index !== -1) {
      selectedMods.value.splice(index, 1)
      return true
    }
    return false
  }

  const updateModTier = (modId: string, newTier: number) => {
    const mod = selectedMods.value.find(m => m.id === modId)
    if (mod) {
      mod.selectedTier = newTier
      return true
    }
    return false
  }

  const clearMods = () => {
    selectedMods.value = []
  }

  const getSelectedModIds = (): string[] => {
    return selectedMods.value.map(mod => mod.id)
  }

  const getSelectedModTiers = (): Array<{ id: string; tier: number | null }> => {
    return selectedMods.value.map(mod => ({
      id: mod.id,
      tier: mod.selectedTier
    }))
  }

  return {
    selectedMods: readonly(selectedMods),
    selectedPrefixCount,
    selectedSuffixCount,
    addMod,
    removeMod,
    updateModTier,
    clearMods,
    getSelectedModIds,
    getSelectedModTiers
  }
}
