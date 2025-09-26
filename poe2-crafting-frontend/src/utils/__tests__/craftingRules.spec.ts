import { describe, expect, it } from 'vitest'

import {
  canAddModifier,
  canUseCurrencyOnRarity,
  getCurrencyMetadata,
  getResultingRarity,
  requiresOpenAffix,
  type ItemRarity,
} from '../craftingRules'

describe('craftingRules', () => {
  const rarities: ItemRarity[] = ['normal', 'magic', 'rare', 'unique', 'corrupted']

  it('validates rarity gating for common currencies', () => {
    expect(canUseCurrencyOnRarity('transmute', 'normal')).toBe(true)
    expect(canUseCurrencyOnRarity('transmute', 'rare')).toBe(false)
    expect(canUseCurrencyOnRarity('exalted', 'rare')).toBe(true)
    expect(canUseCurrencyOnRarity('exalted', 'magic')).toBe(false)
  })

  it('returns metadata when available', () => {
    const entry = getCurrencyMetadata('divine')
    expect(entry?.name).toBeDefined()
    expect(entry?.allowedItemRarities).toContain('unique')
  })

  it('computes resulting rarity transformations', () => {
    expect(getResultingRarity('transmute', 'normal')).toBe('magic')
    expect(getResultingRarity('chance', 'normal')).toBe('random')
    expect(getResultingRarity('divine', 'rare')).toBe('same')
    expect(getResultingRarity('unknown', 'rare')).toBe('rare')
  })

  it('detects currencies that require open affixes', () => {
    expect(requiresOpenAffix('exalted')).toBe(true)
    expect(requiresOpenAffix('divine')).toBe(false)
  })

  it('flags add-mod currencies correctly', () => {
    expect(canAddModifier('exalted')).toBe(true)
    expect(canAddModifier('chaos')).toBe(false)
  })

  it('rejects unknown currency ids', () => {
    rarities.forEach(r => {
      expect(canUseCurrencyOnRarity('definitely-not-real', r)).toBe(false)
    })
  })
})
