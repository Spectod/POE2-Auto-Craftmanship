import rawCurrencyMetadata from '../../../shared/crafting_currency_metadata.json'

export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique' | 'corrupted'

export interface CurrencyRule {
  name: string
  rarityRequirement: ItemRarity
  allowedItemRarities: ItemRarity[]
  resultingRarity?: ItemRarity | 'random' | 'same'
  category: string
  tags?: string[]
  description?: string
  defaultCostRef?: string
  notes?: string
}

const currencyMetadata = rawCurrencyMetadata as Record<string, CurrencyRule>

export const getCurrencyMetadata = (currencyId: string): CurrencyRule | undefined => {
  return currencyMetadata[currencyId]
}

export const canUseCurrencyOnRarity = (currencyId: string, rarity: ItemRarity): boolean => {
  const entry = getCurrencyMetadata(currencyId)
  if (!entry) return false
  return entry.allowedItemRarities.includes(rarity)
}

export const getResultingRarity = (currencyId: string, current: ItemRarity): ItemRarity | 'random' | 'same' => {
  const entry = getCurrencyMetadata(currencyId)
  if (!entry) return current
  if (entry.resultingRarity) {
    if (entry.resultingRarity === 'same' || entry.resultingRarity === 'random') {
      return entry.resultingRarity
    }
    return entry.resultingRarity
  }
  return current
}

export const requiresOpenAffix = (currencyId: string): boolean => {
  const entry = getCurrencyMetadata(currencyId)
  if (!entry) return false
  return entry.tags?.includes('prefix') || entry.tags?.includes('suffix') ? entry.category === 'add-mod' : false
}

export const canAddModifier = (currencyId: string): boolean => {
  const entry = getCurrencyMetadata(currencyId)
  if (!entry) return false
  return entry.category === 'add-mod'
}

export default {
  canUseCurrencyOnRarity,
  getCurrencyMetadata,
  getResultingRarity,
  requiresOpenAffix,
  canAddModifier,
}
