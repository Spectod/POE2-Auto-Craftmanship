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
  physicalDamage?: string
  fireDamage?: string
  lightningDamage?: string
  criticalHitChance?: string
  attacksPerSecond?: string
  weaponRange?: string
  reloadTime?: string
  armour?: number
  evasionRating?: number
  energyShield?: number
  // Jewellery specific properties
  lifeRegeneration?: string
  manaRegeneration?: string
  maximumLife?: string
  maximumMana?: string
  maximumEnergyShield?: string
  attributeBonus?: string
  spiritBonus?: string
  resistances?: {
    fire?: string
    cold?: string
    lightning?: string
    chaos?: string
    elemental?: string
  }
  accuracyRating?: string
  castSpeed?: string
  rarityBonus?: string
  charmSlots?: string
  flaskEffects?: string
  modifierLimits?: {
    prefixModifier?: string
    suffixModifier?: string
  }
  maximumQuality?: string
  physicalDamageToAttacks?: string
  levelRequirement?: number | null
  statRequirements: ItemRequirements
  grantedSkills?: GrantedSkill[]
  special?: string
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

  const resolveCategory = (category: string): string | null => {
    if (!category) return null
    if (detailedItems.value.detailedItems[category]) {
      return category
    }
    if (category.startsWith('gloves')) return 'gloves'
    if (category.startsWith('boots')) return 'boots'
    if (category.startsWith('bodyArmours')) return 'bodyArmours'
    if (category.startsWith('helmets')) return 'helmets'
    return null
  }

  // Get detailed item by name and category
  const getDetailedItem = (itemName: string, category: string): DetailedItem | null => {
    const resolved = resolveCategory(category)
    if (!resolved) return null
    const categoryItems = detailedItems.value.detailedItems[resolved]
    return categoryItems ? categoryItems[itemName] || null : null
  }

  // Get all items from a category
  const getItemsByCategory = (category: string): DetailedItem[] => {
    const resolved = resolveCategory(category)
    if (!resolved) return []
    const categoryItems = detailedItems.value.detailedItems[resolved]
    if (!categoryItems) return []
    return Object.values(categoryItems)
  }

  // Get all available categories with detailed items
  const getAvailableCategories = computed(() => {
    return Object.keys(detailedItems.value.detailedItems)
  })

  // Check if detailed data exists for a category
  const hasDetailedData = (category: string): boolean => {
    const resolved = resolveCategory(category)
    if (!resolved) return false
    return resolved in detailedItems.value.detailedItems
  }

  // Check if detailed data exists for a specific item
  const hasDetailedItem = (itemName: string, category: string): boolean => {
    const resolved = resolveCategory(category)
    if (!resolved) return false
    const categoryItems = detailedItems.value.detailedItems[resolved]
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
