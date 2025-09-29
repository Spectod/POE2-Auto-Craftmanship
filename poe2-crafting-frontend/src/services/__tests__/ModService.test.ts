import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ModService } from '../ModService'
import { ModRepository } from '../../repositories/ModRepository'
import type { ItemCategory, ModSource, ModType } from '../../types/itemTypes'
import type { NormalizedMod, SelectedMod } from '../../types/mods'

describe('ModService', () => {
  let modService: ModService
  let mockRepository: ModRepository

  const mockMods: NormalizedMod[] = [
    {
      id: 'base_prefix_physical_damage',
      name: 'Adds # to # Physical Damage',
      type: 'prefix' as ModType,
      source: 'base' as ModSource,
      tags: ['physical', 'damage', 'attack'],
      applicableTo: ['spears', 'maces'] as ItemCategory[],
      tiers: [{
        tier: 9,
        ilvl: 75,
        values: [[10, 20]],
        weights: 6300
      }],
      groupId: undefined,
      corrupted: undefined
    },
    {
      id: 'base_suffix_strength',
      name: '# to Strength',
      type: 'suffix' as ModType,
      source: 'base' as ModSource,
      tags: ['strength', 'attribute'],
      applicableTo: ['spears', 'maces'] as ItemCategory[],
      tiers: [{
        tier: 8,
        ilvl: 74,
        values: [[10, 20]],
        weights: 2000
      }],
      groupId: undefined,
      corrupted: undefined
    }
  ]

  beforeEach(() => {
    mockRepository = {
      findByItemCategory: vi.fn(),
      findAll: vi.fn(),
      clearCache: vi.fn()
    } as unknown as ModRepository

    modService = new ModService(mockRepository)
  })

  describe('getModsForItemType', () => {
    it('should return mods for specified item category', async () => {
      mockRepository.findByItemCategory = vi.fn().mockResolvedValue(mockMods)

      const result = await modService.getModsForItemType('spears')

      expect(mockRepository.findByItemCategory).toHaveBeenCalledWith('spears', {})
      expect(result).toEqual(mockMods)
    })

    it('should apply query options', async () => {
      const options = { ilvl: 75, type: 'prefix' as ModType }
      mockRepository.findByItemCategory = vi.fn().mockResolvedValue([mockMods[0]])

      const result = await modService.getModsForItemType('spears', options)

      expect(mockRepository.findByItemCategory).toHaveBeenCalledWith('spears', options)
      expect(result).toEqual([mockMods[0]])
    })
  })

  describe('checkModCompatibility', () => {
    const selectedMods: SelectedMod[] = [{
      id: 'base_prefix_physical_damage',
      selectedTier: 9,
      name: 'Adds # to # Physical Damage',
      type: 'prefix',
      source: 'base',
      groupId: undefined
    }]

    it('should return false for already selected mod', () => {
      const result = modService.checkModCompatibility(mockMods[0], selectedMods)

      expect(result.canSelect).toBe(false)
      expect(result.reason).toBe('already_selected')
    })

    it('should return false when prefix limit exceeded', () => {
      const manyPrefixes: SelectedMod[] = Array(3).fill(null).map((_, i) => ({
        id: `prefix_${i}`,
        selectedTier: 1,
        name: `Prefix ${i}`,
        type: 'prefix' as ModType,
        source: 'base' as ModSource,
        groupId: undefined
      }))

      const result = modService.checkModCompatibility(mockMods[0], manyPrefixes)

      expect(result.canSelect).toBe(false)
      expect(result.reason).toBe('type_limit')
    })

    it('should return false when suffix limit exceeded', () => {
      const manySuffixes: SelectedMod[] = Array(3).fill(null).map((_, i) => ({
        id: `suffix_${i}`,
        selectedTier: 1,
        name: `Suffix ${i}`,
        type: 'suffix' as ModType,
        source: 'base' as ModSource,
        groupId: undefined
      }))

      const result = modService.checkModCompatibility(mockMods[1], manySuffixes)

      expect(result.canSelect).toBe(false)
      expect(result.reason).toBe('type_limit')
    })

    it('should return true for compatible mod', () => {
      const result = modService.checkModCompatibility(mockMods[1], selectedMods)

      expect(result.canSelect).toBe(true)
      expect(result.reason).toBeUndefined()
    })
  })

  describe('validateModSelection', () => {
    it('should return valid for correct selection', () => {
      const validSelection: SelectedMod[] = [
        {
          id: 'prefix_1',
          selectedTier: 1,
          name: 'Prefix 1',
          type: 'prefix',
          source: 'base',
          groupId: undefined
        },
        {
          id: 'suffix_1',
          selectedTier: 1,
          name: 'Suffix 1',
          type: 'suffix',
          source: 'base',
          groupId: undefined
        }
      ]

      const result = modService.validateModSelection(validSelection)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return invalid for too many prefixes', () => {
      const invalidSelection: SelectedMod[] = Array(4).fill(null).map((_, i) => ({
        id: `prefix_${i}`,
        selectedTier: 1,
        name: `Prefix ${i}`,
        type: 'prefix' as ModType,
        source: 'base' as ModSource,
        groupId: undefined
      }))

      const result = modService.validateModSelection(invalidSelection)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Too many prefixes selected (4/3)')
    })

    it('should return invalid for too many suffixes', () => {
      const invalidSelection: SelectedMod[] = Array(4).fill(null).map((_, i) => ({
        id: `suffix_${i}`,
        selectedTier: 1,
        name: `Suffix ${i}`,
        type: 'suffix' as ModType,
        source: 'base' as ModSource,
        groupId: undefined
      }))

      const result = modService.validateModSelection(invalidSelection)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Too many suffixes selected (4/3)')
    })
  })

  describe('getSelectionLimits', () => {
    it('should return correct limits', () => {
      const limits = modService.getSelectionLimits()

      expect(limits).toEqual({
        maxPrefixes: 3,
        maxSuffixes: 3
      })
    })
  })

  describe('getModCategories', () => {
    it('should organize mods into categories', async () => {
      mockRepository.findByItemCategory = vi.fn().mockResolvedValue(mockMods)

      const result = await modService.getModCategories('spears', [])

      expect(result).toHaveLength(2) // prefix and suffix categories
      expect(result[0].key).toBe('prefix')
      expect(result[0].mods).toHaveLength(1)
      expect(result[1].key).toBe('suffix')
      expect(result[1].mods).toHaveLength(1)
    })

    it('should filter out empty categories', async () => {
      const prefixOnlyMods = mockMods.filter(mod => mod.type === 'prefix')
      mockRepository.findByItemCategory = vi.fn().mockResolvedValue(prefixOnlyMods)

      const result = await modService.getModCategories('spears', [])

      expect(result).toHaveLength(1)
      expect(result[0].key).toBe('prefix')
    })
  })
})
