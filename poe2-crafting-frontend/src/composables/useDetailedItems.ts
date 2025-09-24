import { ref, computed } from 'vue'
import detailedItemsData from '@/assets/poe2_detailed_items.json'

interface ItemRequirements {
  str?: number
  dex?: number
  int?: number
}

interface GrantedSkill {
  name: string
  level?: number | null
  color: string
}

interface DetailedItem {
  name: string
  category: string
  spirit?: number
  levelRequirement?: number | null
  statRequirements: ItemRequirements
  grantedSkills?: GrantedSkill[]
  rarity: string
}

interface DetailedItemsData {
  metadata: {
    createdOn: string
    source: string
    version: string
    note: string
  }
  detailedItems: {
    [category: string]: {
      [itemName: string]: DetailedItem
    }
  }
}

const typedDetailedItemsData = detailedItemsData as DetailedItemsData

export function useDetailedItems() {
  const detailedItems = ref<DetailedItemsData>(typedDetailedItemsData)

  // Get detailed item by name and category
  const getDetailedItem = (itemName: string, category: string): DetailedItem | null => {
    const categoryItems = detailedItems.value.detailedItems[category]
    if (!categoryItems) return null
    return categoryItems[itemName] || null
  }

  // Get all items from a category
  const getItemsByCategory = (category: string): DetailedItem[] => {
    const categoryItems = detailedItems.value.detailedItems[category]
    if (!categoryItems) return []
    return Object.values(categoryItems)
  }

  // Get all available categories with detailed items
  const getAvailableCategories = computed(() => {
    return Object.keys(detailedItems.value.detailedItems)
  })

  // Check if detailed data exists for a category
  const hasDetailedData = (category: string): boolean => {
    return category in detailedItems.value.detailedItems
  }

  // Check if detailed data exists for a specific item
  const hasDetailedItem = (itemName: string, category: string): boolean => {
    const categoryItems = detailedItems.value.detailedItems[category]
    if (!categoryItems) return false
    return itemName in categoryItems
  }

  return {
    detailedItems: computed(() => detailedItems.value),
    getDetailedItem,
    getItemsByCategory,
    getAvailableCategories,
    hasDetailedData,
    hasDetailedItem
  }
}