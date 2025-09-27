<template>
  <div class="profit-optimizer">


    <div class="controls-section">
      <div class="control-group">
        <label for="league-select">League:</label>
        <select id="league-select" v-model="selectedLeague" @change="onLeagueChange" class="league-select">
          <option v-for="league in allLeagues" :key="league.value" :value="league.value">
            {{ league.value === 'Rise of the Abyssal' ? 'Rise of the Abyssal (Current)' : league.value }}
          </option>
        </select>
      </div>
      <div class="control-group">
        <label for="success-rate-control">Success Rate:</label>
        <div class="success-rate-control">
          <input id="success-rate-control" type="range" v-model="globalSuccessRate" min="10" max="95" step="5" class="success-rate-slider" />
          <span class="success-rate-value">{{ globalSuccessRate }}%</span>
        </div>
      </div>
      <button @click="generateStrategies" :disabled="!selectedLeague || loading" class="generate-btn">
        <span v-if="loading" class="loading-spinner">Ã¢ÂÂ³</span>
        {{ loading ? 'Generatingâ€¦' : 'Generate' }}
      </button>
    </div>

    <div v-if="error" class="error-message">Error: {{ error }}</div>

    <div class="weapon-selection-section">
      <h3>Crafting Setup</h3>

      <!-- Simple Breadcrumb -->
      <div class="breadcrumb">
        <span :class="{ active: currentStep === 'category' }">{{ selectedItemCategory || 'Category' }}</span>
        <span class="arrow">→</span>
        <span :class="{ active: currentStep === 'type' }">{{ selectedWeaponType ? getTypeDisplayName(selectedWeaponType) : 'Type' }}</span>
        <span class="arrow">→</span>
        <span :class="{ active: currentStep === 'base' }">{{ selectedBaseItem || 'Base Item' }}</span>
        <span class="arrow">→</span>
        <span :class="{ active: currentStep === 'ilvl' }">{{ selectedIlvl ? `iLvl ${selectedIlvl}` : 'Level' }}</span>
        <span class="arrow">→</span>
        <span :class="{ active: currentStep === 'mods' }">Mods</span>
      </div>

      <!-- Step 1: Category -->
      <div v-if="currentStep === 'category'" class="step-section">
        <div class="step-header">
          <h4>Step 1: Choose Category</h4>
          <p class="step-description">Select the item category you want to craft.</p>
        </div>
        <div class="category-grid">
          <div v-for="category in itemCategories" :key="category.id" class="category-card" :class="{ selected: selectedItemCategory === category.id }" @click="selectWeaponCategory(category.id)">
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-info">
              <h5>{{ category.name }}</h5>
              <p>{{ category.count }} item types</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Type -->
      <div v-if="currentStep === 'type'" class="step-section">
        <div class="step-header">
          <button @click="goToStep('category')" class="back-btn">← Back</button>
          <h4>Step 2: Choose Type</h4>
          <p class="step-description">Select the specific item type within {{ selectedItemCategory }}.</p>
        </div>

        <template v-if="selectedItemCategory === 'armour'">
          <div class="weapon-type-grid">
            <div v-for="sub in armourSubcategories" :key="sub.id" class="weapon-type-card" :class="{ selected: selectedArmourSubcategory === sub.id }" @click="selectArmourSubcategory(sub.id)">
              <div class="weapon-type-icon">{{ sub.icon }}</div>
              <div class="weapon-type-info"><h5>{{ sub.name }}</h5></div>
            </div>
          </div>
          <div v-if="selectedArmourSubcategory" class="attribute-type-selection">
            <p class="section-subtitle">Pick attribute combination (STR / DEX / INT / Hybrids)</p>
            <div class="attribute-grid">
              <button v-for="attr in attributeTypes" :key="attr.id" type="button" :class="['attr-btn', { active: selectedArmourAttribute === attr.id }]" :aria-pressed="selectedArmourAttribute === attr.id" @click="selectArmourAttribute(attr.id)">
                {{ attr.name }}
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="weapon-type-grid">
            <div v-for="weaponType in availableWeaponTypes" :key="weaponType.id" class="weapon-type-card" :class="{ selected: selectedWeaponType === weaponType.id }" @click="selectWeaponType(weaponType.id)">
              <div class="weapon-type-icon">{{ weaponType.icon }}</div>
              <div class="weapon-type-info">
                <h5>{{ weaponType.name }}</h5>
                <p>{{ weaponType.items?.length || 0 }} base items</p>
              </div>
            </div>
          </div>
          <div v-if="selectedItemCategory === 'offHanded' && selectedWeaponType === 'shields'" class="attribute-type-selection">
            <p class="section-subtitle">Pick shield attribute group (STR / STR+DEX / STR+INT)</p>
            <div class="attribute-grid">
              <button v-for="attr in shieldAttributeTypes" :key="attr.id" type="button" :class="['attr-btn', { active: selectedShieldAttribute === attr.id }]" :aria-pressed="selectedShieldAttribute === attr.id" @click="selectShieldAttribute(attr.id)">
                {{ attr.name }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Step 3: Base item -->
      <div v-if="currentStep === 'base'" class="step-section">
        <div class="step-header">
          <button @click="goToStep('type')" class="back-btn">← Back</button>
          <h4>Step 3: Choose Base Item</h4>
          <p class="step-description">Select the base item you want to craft.</p>
        </div>

        <div v-if="showFilterRow" class="filter-row">
          <label class="filter-label">Filter</label>
          <div class="filter-options">
            <label class="filter-option">
              <input type="radio" name="base-filter" value="all" v-model="currentFilterMode" />
              <span>All</span>
            </label>
            <label class="filter-option">
              <input type="radio" name="base-filter" value="endgame" v-model="currentFilterMode" :disabled="!endgameFilterAllowed" />
              <span>End-game (Req Lvl >= 67)</span>
            </label>
          </div>
        </div>

        <div v-if="hasDetailedItemsForCategory" class="item-cards-grid">
          <ItemCard v-for="d in availableDetailedItems" :key="d.name" :item="d" :isSelected="selectedBaseItem === d.name" @select="selectDetailedItem" />
        </div>
        <div v-else class="base-item-dropdown">
          <select v-model="selectedBaseItem" class="base-item-select" @change="onBaseItemChange">
            <option value="">-- Select Base Item --</option>
            <option v-for="baseItem in availableBaseItems" :key="baseItem" :value="baseItem">{{ baseItem }}</option>
          </select>
        </div>
      </div>

      <!-- Step 4: Item Level -->
      <div v-if="currentStep === 'ilvl'" class="step-section">
        <div class="step-header">
          <button @click="goToStep('base')" class="back-btn">← Back</button>
          <h4>Step 4: Select Item Level</h4>
          <p class="step-description">Choose the item level for {{ selectedBaseItem }}.</p>
        </div>

        <div class="ilvl-picker">
          <div class="ilvl-grid">
            <button
              v-for="lvl in 84"
              :key="lvl"
              type="button"
              :class="['ilvl-btn', { active: selectedIlvl === lvl, disabled: lvl < minIlvl } ]"
              :disabled="lvl < minIlvl"
              @click="onSelectIlvl(lvl)"
            >
              {{ lvl }}
            </button>
          </div>
        </div>
      </div>

      <!-- Step 5: Mods Selector -->
      <div v-if="currentStep === 'mods'" class="step-section">
        <div class="step-header">
          <button @click="goToStep('ilvl')" class="back-btn">← Back</button>
          <h4>Step 5: Select Mods</h4>
          <p class="step-description">Choose the mods you want on this {{ selectedBaseItem }}.</p>
        </div>

        <ModsSelector :base="selectedBaseItem" :ilvl="selectedIlvl" :successRate="globalSuccessRate" @update:selected="mods => (void mods)" />

        <!-- Save Preset Button -->
        <div class="preset-actions">
          <button @click="savePreset" class="save-preset-btn">💾 Save as Preset</button>
        </div>
      </div>
    </div>

    <div v-if="!loading && strategies.length === 0" class="empty-state">
      <div class="empty-icon">⚙️</div>
      <h3>Select category, type and base</h3>
      <p>Choose a League and select an item category, type and base to start generating strategies.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePOE2Data } from '../composables/usePOE2'
import ItemCard from './ItemCard.vue'
import poe2BaseItems from '../assets/poe2_base_items.json'
import ModsSelector from './ModsSelector.vue'
import { getItemTypeIcon } from '../utils/itemIcons'

const poe2Data = usePOE2Data()
const { leagues } = poe2Data
import { useDetailedItems } from '../composables/useDetailedItems'
const { hasDetailedData, getItemsByCategory, getDetailedItem } = useDetailedItems()

const selectedLeague = ref('Rise of the Abyssal')
const globalSuccessRate = ref(80)
const loading = ref(false)
const error = ref<string | null>(null)
const strategies = ref<any[]>([])

const selectedItemCategory = ref<string | null>(null)
const selectedWeaponType = ref<string | null>(null)
const selectedBaseItem = ref<string | null>(null)
// Item level selection (default 81, clamped by min..84)
const selectedIlvl = ref<number | null>(81)
// Editing state for collapsible UI
const isEditingBaseItem = ref(false)

// Step management for wizard UI
const currentStep = computed<'category' | 'type' | 'base' | 'ilvl' | 'mods'>(() => {
  if (!selectedItemCategory.value) return 'category'
  if (!selectedWeaponType.value) return 'type'
  if (!selectedBaseItem.value) return 'base'
  if (selectedIlvl.value === null || selectedIlvl.value === undefined) return 'ilvl'
  return 'mods'
})

const goToStep = (step: 'category' | 'type' | 'base' | 'ilvl') => {
  console.log('goToStep called with:', step)
  if (step === 'category') {
    selectedItemCategory.value = null
    selectedWeaponType.value = null
    selectedArmourSubcategory.value = null
    selectedArmourAttribute.value = null
    selectedShieldAttribute.value = null
    selectedBaseItem.value = null
    selectedIlvl.value = null // Reset to null to go back to ilvl step
  } else if (step === 'type') {
    selectedWeaponType.value = null
    selectedArmourSubcategory.value = null
    selectedArmourAttribute.value = null
    selectedShieldAttribute.value = null
    selectedBaseItem.value = null
    selectedIlvl.value = null
  } else if (step === 'base') {
    selectedBaseItem.value = null
    selectedIlvl.value = null
  } else if (step === 'ilvl') {
    selectedIlvl.value = null // Reset to null to go back to ilvl step
  }
  console.log('State after goToStep:', {
    category: selectedItemCategory.value,
    type: selectedWeaponType.value,
    base: selectedBaseItem.value,
    ilvl: selectedIlvl.value
  })
}

const currentFilterMode = computed<'all' | 'endgame'>(
  {
    get: () => {
      const t = selectedWeaponType.value
      if (!t) return 'all'
      const stored = filterModeByType.value[t] ?? getDefaultFilterForCurrent()
      return (stored === 'endgame' && !endgameFilterAllowed.value) ? 'all' : stored
    },
    set: (val: 'all' | 'endgame') => {
      const t = selectedWeaponType.value
      if (!t) return
      if (val === 'endgame' && !endgameFilterAllowed.value) {
        filterModeByType.value[t] = 'all'
      } else {
        filterModeByType.value[t] = val
      }
    }
  }
)

// show/hide filter-row (hidden for quivers, shields, wands, sceptres) Ã Â¸ÂÃ Â¸Â³Ã Â¸Â«Ã Â¸â„¢Ã Â¸â€Ã Â¸Â§Ã Â¹Ë†Ã Â¸Â²Ã Â¸Ë†Ã Â¸Â°Ã Â¹Æ’Ã Â¸Â«Ã Â¹â€°Ã Â¹ÂÃ Â¸ÂªÃ Â¸â€Ã Â¸â€¡ ui Ã Â¸â€”Ã Â¸ÂµÃ Â¹Ë†Ã Â¹Æ’Ã Â¸Å Ã Â¹â€°Ã Â¸ÂªÃ Â¸Â³Ã Â¸Â«Ã Â¸Â£Ã Â¸Â±Ã Â¸Å¡Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£ filter Ã Â¹â€žÃ Â¸Â«Ã Â¸Â¡
const showFilterRow = computed(() => {
  return !(selectedWeaponType.value === 'quivers'|| selectedWeaponType.value === 'shields' || selectedWeaponType.value === 'wands' || selectedWeaponType.value === 'sceptres' || selectedItemCategory.value === 'jewellery')
})

// Per-type base item filter: 'all' | 'endgame' Ã Â¸ÂÃ Â¸Â³Ã Â¸Â«Ã Â¸â„¢Ã Â¸â€Ã Â¸â€žÃ Â¹Ë†Ã Â¸Â²Ã Â¹â‚¬Ã Â¸Â£Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¸â€¢Ã Â¹â€°Ã Â¸â„¢Ã Â¸â€šÃ Â¸Â­Ã Â¸â€¡Ã Â¸ÂÃ Â¸Â²Ã Â¸Â£ filter Ã Â¹ÂÃ Â¸Å¡Ã Â¸Å¡Ã Â¹â‚¬Ã Â¸Â£Ã Â¸ÂµÃ Â¸Â¢Ã Â¸Â¥Ã Â¹â€žÃ Â¸â€”Ã Â¸Â¡Ã Â¹Å’
const filterModeByType = ref<Record<string, 'all' | 'endgame'>>({})
const endgameFilterAllowed = computed(() => {
  if (selectedItemCategory.value === 'jewellery') return false
  if (selectedWeaponType.value === 'quivers') return false
  if (selectedWeaponType.value === 'shields') return false
  if (selectedWeaponType.value === 'wands') return false
  if (selectedWeaponType.value === 'sceptres') return false
  return true
})

//Ã Â¸ÂÃ Â¸Â³Ã Â¸Â«Ã Â¸Â£Ã Â¸â€Ã Â¸â€žÃ Â¹Ë†Ã Â¸Â²Ã Â¹â‚¬Ã Â¸Â£Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¸â€¢Ã Â¹â€°Ã Â¸â„¢Ã Â¸Â§Ã Â¹Ë†Ã Â¸Â² filter Ã Â¸Ë†Ã Â¸Â°Ã Â¹â‚¬Ã Â¸â€ºÃ Â¹â€¡Ã Â¸â„¢ all Ã Â¸Â«Ã Â¸Â£Ã Â¸Â·Ã Â¸Â­ endgame Ã Â¹Æ’Ã Â¸â„¢Ã Â¸Â­Ã Â¸â€¢Ã Â¸â„¢Ã Â¹â‚¬Ã Â¸Â£Ã Â¸Â´Ã Â¹Ë†Ã Â¸Â¡Ã Â¸â€¢Ã Â¹â€°Ã Â¸â„¢Ã Â¸â€žÃ Â¸Â£Ã Â¸Â±Ã Â¸â€¡Ã Â¹ÂÃ Â¸Â£Ã Â¸Â
const getDefaultFilterForCurrent = () =>{
  const t = selectedWeaponType.value ?? ''
  const isSpecial = selectedItemCategory.value === 'jewellery' || ['quivers', 'shields', 'wands', 'sceptres'].includes(t)
  return isSpecial ? 'all' : 'endgame'
}
const selectWeaponType = (typeId: string) => {
  selectedWeaponType.value = typeId
  selectedBaseItem.value = null

  const isSpecialType = ['quivers', 'shields'].includes(typeId)
  const isJewelleryCategory = selectedItemCategory.value === 'jewellery'
  const defaultMode = isSpecialType || isJewelleryCategory ? 'all' : getDefaultFilterForCurrent()

  if (filterModeByType.value[typeId] === undefined) {
    filterModeByType.value[typeId] = defaultMode
  }
}

//Ã Â¸ÂÃ Â¸Â³Ã Â¸Â«Ã Â¸â„¢Ã Â¸â€ Ã Â¸Â«Ã Â¸Â¡Ã Â¸Â§Ã Â¸â€Ã Â¸Â«Ã Â¸Â¡Ã Â¸Â¹Ã Â¹Ë†Ã Â¸Â£Ã Â¸Â­Ã Â¸â€¡Ã Â¹Æ’Ã Â¸Â«Ã Â¹â€° Armours
const armourSubcategories = [
  { id: 'gloves', name: 'Gloves', icon: '🧤' },
  { id: 'boots', name: 'Boots', icon: '🥾' },
  { id: 'bodyArmours', name: 'Body Armours', icon: '🥼' },
  { id: 'helmets', name: 'Helmets', icon: '⛑️' }
]

//Ã Â¸ÂÃ Â¸Â³Ã Â¸Â«Ã Â¸â„¢Ã Â¸â€Ã Â¸Â§Ã Â¹Ë†Ã Â¸Â²Ã Â¸Â¡Ã Â¸ÂµÃ Â¸Â«Ã Â¸Â¡Ã Â¸Â§Ã Â¸Â«Ã Â¸Â¡Ã Â¸Â¹Ã Â¹â‚¬Ã Â¸â€ºÃ Â¹â€¡Ã Â¸Â¯ Attribute Ã Â¹â€žÃ Â¸Â«Ã Â¸â„¢Ã Â¸Å¡Ã Â¹â€°Ã Â¸Â²Ã Â¸â€¡
const attributeTypes = [
  { id: 'str', name: 'str' },
  { id: 'dex', name: 'dex' },
  { id: 'int', name: 'int' },
  { id: 'str_dex', name: 'str/dex' },
  { id: 'str_int', name: 'str/int' },
  { id: 'dex_int', name: 'dex/int' }
]

const selectedArmourSubcategory = ref<string | null>(null)
// No default selection for armour attributes
const selectedArmourAttribute = ref<string | null>(null)
const selectArmourSubcategory = (id: string) => {
  selectedArmourSubcategory.value = id
  selectedWeaponType.value = null
  selectedBaseItem.value = null
  if (selectedArmourAttribute.value) {
    selectedWeaponType.value = `${id}_${selectedArmourAttribute.value}`
    const t = selectedWeaponType.value
    if (t && filterModeByType.value[t] === undefined) {
      filterModeByType.value[t] = getDefaultFilterForCurrent()
    }
  }
}
const selectArmourAttribute = (id: string) => {
  if (selectedArmourAttribute.value === id) return
  selectedArmourAttribute.value = id
  selectedBaseItem.value = null
  if (selectedArmourSubcategory.value) {
    selectedWeaponType.value = `${selectedArmourSubcategory.value}_${id}`
    const t = selectedWeaponType.value
    if (t && filterModeByType.value[t] === undefined) {
      filterModeByType.value[t] = getDefaultFilterForCurrent()
    }
  }
}

const shieldAttributeTypes = [
  { id: 'str', name: 'str' },
  { id: 'str_dex', name: 'str/dex' },
  { id: 'str_int', name: 'str/int' }
]
const selectedShieldAttribute = ref<string | null>(null)
const selectShieldAttribute = (id: string) => {
  if (selectedShieldAttribute.value === id) return
  selectedShieldAttribute.value = id
  selectedBaseItem.value = null
  selectedItemCategory.value = 'offHanded'
  selectedWeaponType.value = 'shields'

  // ensure filter mode exists for shields (force 'all')
  if (filterModeByType.value['shields'] === undefined) {
    filterModeByType.value['shields'] = 'all'
  }

  // debug logs ...
  console.log('selectShieldAttribute:', {
    selectedItemCategory: selectedItemCategory.value,
    selectedWeaponType: selectedWeaponType.value,
    selectedShieldAttribute: selectedShieldAttribute.value,
    hasDetailed: hasDetailedItemsForCategory.value,
    availableBase: availableBaseItems.value,
    availableDetailed: availableDetailedItems.value
  })
}

const allLeagues = computed(() => {
  const riseLeague = { value: 'Rise of the Abyssal' }
  const otherLeagues = leagues.leagues.value.filter(l => l.value !== 'Rise of the Abyssal')
  return [riseLeague, ...otherLeagues]
})

const itemCategories = ref([
  { id: 'oneHanded', name: 'One Handed Weapons', icon: '🗡️', count: 4 },
  { id: 'twoHanded', name: 'Two Handed Weapons', icon: '⚔️', count: 5 },
  { id: 'offHanded', name: 'Off Handed Items', icon: '🛡️', count: 4 },
  { id: 'jewellery', name: 'Jewellery', icon: '💎', count: 3 },
  { id: 'armour', name: 'Armour', icon: '🪖', count: 4 }
])

const availableWeaponTypes = computed(() => {
  if (!selectedItemCategory.value) return [] as any[]
  let itemData: any
  if (selectedItemCategory.value === 'oneHanded') itemData = (poe2BaseItems as any).weapons.oneHandedWeapons
  else if (selectedItemCategory.value === 'twoHanded') itemData = (poe2BaseItems as any).weapons.twoHandedWeapons
  else if (selectedItemCategory.value === 'offHanded') itemData = (poe2BaseItems as any).offHandedItems
  else if (selectedItemCategory.value === 'jewellery') itemData = (poe2BaseItems as any).jewellery
  else if (selectedItemCategory.value === 'armour') itemData = (poe2BaseItems as any).armour
  else return []
  return Object.entries(itemData).map(([key, items]) => ({ id: key, name: formatItemTypeName(key), icon: getItemTypeIcon(key), items }))
})

const availableBaseItems = computed(() => {
  if (!selectedItemCategory.value || !selectedWeaponType.value) return [] as string[]
  let itemData: any
  if (selectedItemCategory.value === 'oneHanded') itemData = (poe2BaseItems as any).weapons.oneHandedWeapons
  else if (selectedItemCategory.value === 'twoHanded') itemData = (poe2BaseItems as any).weapons.twoHandedWeapons
  else if (selectedItemCategory.value === 'offHanded') itemData = (poe2BaseItems as any).offHandedItems
  else if (selectedItemCategory.value === 'jewellery') itemData = (poe2BaseItems as any).jewellery
  else if (selectedItemCategory.value === 'armour') itemData = (poe2BaseItems as any).armour
  else return []
  let names = (itemData[selectedWeaponType.value] as string[]) || []
  if (currentFilterMode.value === 'endgame') {
    const typeId = selectedWeaponType.value
    names = names.filter(n => {
      const d = getDetailedItem(n, typeId!)
      const lvl = (d?.levelRequirement ?? 0)
      return !d || lvl >= 67
    })
  }
  return names
})

const hasDetailedItemsForCategory = computed(() => {
  const t = selectedWeaponType.value
  if (!t) return false
  return hasDetailedData(t)
})

const availableDetailedItems = computed(() => {
  if (!selectedWeaponType.value || !hasDetailedItemsForCategory.value) return []
  const detailed = getItemsByCategory(selectedWeaponType.value)
  const baseNames = availableBaseItems.value
  let items = Array.isArray(baseNames) && baseNames.length > 0 ? detailed.filter(item => baseNames.includes(item.name)) : detailed
  if (selectedItemCategory.value === 'offHanded' && selectedWeaponType.value === 'shields' && selectedShieldAttribute.value) {
    const attr = selectedShieldAttribute.value
    items = items.filter((item: any) => {
      const s = !!item?.statRequirements?.str
      const d = !!item?.statRequirements?.dex
      const i = !!item?.statRequirements?.int
      if (!s && !d && !i) return true
      if (attr === 'str') return s && !d && !i
      if (attr === 'str_dex') return s && d && !i
      if (attr === 'str_int') return s && i && !d
      return true
    })
  }
  if (currentFilterMode.value === 'endgame') {
    items = items.filter((it: any) => (it?.levelRequirement ?? 0) >= 67)
  }
  return [...items].sort((a, b) => ((a.levelRequirement ?? 0) - (b.levelRequirement ?? 0)) || a.name.localeCompare(b.name))
})

const formatItemTypeName = (key: string): string => {
  const nameMap: Record<string, string> = {
    wands: 'Wands', maces: 'Maces', sceptres: 'Sceptres', spears: 'Spears',
    twoHandMaces: 'Two Hand Maces', quarterstaves: 'Quarterstaves', crossbows: 'Crossbows', bows: 'Bows', staves: 'Staves',
    foci: 'Foci', quivers: 'Quivers', shields: 'Shields', bucklers: 'Bucklers',
    amulets: 'Amulets', rings: 'Rings', belts: 'Belts'
  }
  return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

const onLeagueChange = () => { strategies.value = []; error.value = null }
const generateStrategies = async () => {
  if (!selectedLeague.value) return
  loading.value = true; error.value = null
  try { await new Promise(r => setTimeout(r, 300)); strategies.value = [] } catch (e) { error.value = 'Ã Â¹â€šÃ Â¸Â«Ã Â¸Â¥Ã Â¸â€Ã Â¸â€šÃ Â¹â€°Ã Â¸Â­Ã Â¸Â¡Ã Â¸Â¹Ã Â¸Â¥/Ã Â¸â€žÃ Â¸Â³Ã Â¸â„¢Ã Â¸Â§Ã Â¸â€œÃ Â¹â€žÃ Â¸Â¡Ã Â¹Ë†Ã Â¸ÂªÃ Â¸Â³Ã Â¹â‚¬Ã Â¸Â£Ã Â¹â€¡Ã Â¸Ë† Ã Â¹â€šÃ Â¸â€ºÃ Â¸Â£Ã Â¸â€Ã Â¸Â¥Ã Â¸Â­Ã Â¸â€¡Ã Â¹Æ’Ã Â¸Â«Ã Â¸Â¡Ã Â¹Ë†' } finally { loading.value = false }
}

const selectWeaponCategory = (categoryId: string) => { selectedItemCategory.value = categoryId; selectedWeaponType.value = null; selectedBaseItem.value = null }
const selectDetailedItem = (item: any) => { selectedBaseItem.value = item.name }
const onBaseItemChange = () => {}

onMounted(async () => { try { await poe2Data.initializeData() } catch (e) { error.value = 'Ã Â¹â€šÃ Â¸Â«Ã Â¸Â¥Ã Â¸â€Ã Â¸â€šÃ Â¹â€°Ã Â¸Â­Ã Â¸Â¡Ã Â¸Â¹Ã Â¸Â¥Ã Â¹â‚¬Ã Â¸Å¡Ã Â¸Â·Ã Â¹â€°Ã Â¸Â­Ã Â¸â€¡Ã Â¸â€¢Ã Â¹â€°Ã Â¸â„¢Ã Â¹â€žÃ Â¸Â¡Ã Â¹Ë†Ã Â¸ÂªÃ Â¸Â³Ã Â¹â‚¬Ã Â¸Â£Ã Â¹â€¡Ã Â¸Ë† Ã Â¹â€šÃ Â¸â€ºÃ Â¸Â£Ã Â¸â€Ã Â¸Â¥Ã Â¸Â­Ã Â¸â€¡Ã Â¹Æ’Ã Â¸Â«Ã Â¸Â¡Ã Â¹Ë†' } })
// ========== iLvl picker logic ==========
const minIlvl = computed(() => {
  const base = selectedBaseItem.value
  const typeId = selectedWeaponType.value
  if (!base || !typeId) return 1
  const d = getDetailedItem(base, typeId)
  const req = (d?.levelRequirement ?? 1)
  const min = Math.max(1, Math.min(84, req))
  return min
})
const clampIlvl = (lvl: number) => Math.max(minIlvl.value, Math.min(84, lvl))
const onSelectIlvl = (lvl: number) => { selectedIlvl.value = clampIlvl(lvl); isEditingBaseItem.value = false }

// UI state management
const startEditingBaseItem = () => { isEditingBaseItem.value = true }

// Preset management
const savePreset = () => {
  const preset = {
    id: Date.now().toString(),
    name: `${selectedBaseItem.value} (iLvl ${selectedIlvl.value})`,
    category: selectedItemCategory.value,
    type: selectedWeaponType.value,
    baseItem: selectedBaseItem.value,
    ilvl: selectedIlvl.value,
    mods: [], // TODO: get from ModsSelector
    createdAt: new Date().toISOString()
  }
  // TODO: Save to localStorage or backend
  console.log('Saving preset:', preset)
  alert(`Preset "${preset.name}" saved!`)
}

watch([selectedBaseItem, selectedWeaponType], () => { selectedIlvl.value = clampIlvl(81) })

// Helper functions for display names
const getCategoryDisplayName = (categoryId: string) => {
  const category = itemCategories.value.find(c => c.id === categoryId)
  return category?.name || categoryId
}

const getTypeDisplayName = (typeId: string) => {
  if (typeId.includes('_')) {
    // Handle armour types like "gloves_str"
    const [sub, attr] = typeId.split('_')
    const subName = armourSubcategories.find(s => s.id === sub)?.name || sub
    const attrName = attributeTypes.find(a => a.id === attr)?.name || attr
    return `${subName} (${attrName})`
  }
  return formatItemTypeName(typeId)
}

</script>

<style scoped>
.profit-optimizer{max-width:1200px;margin:0 auto;padding:2rem}
.optimizer-header{text-align:center;margin-bottom:2rem}
.section-title{font-size:2.2rem;font-weight:700;color:#2c3e50;margin-bottom:.25rem}
.section-description{font-size:1rem;color:#7f8c8d;margin:0}
.controls-section{display:flex;gap:1rem;align-items:center;justify-content:center;margin-bottom:2rem;flex-wrap:wrap}
.control-group{display:flex;flex-direction:column;gap:.5rem}
.league-select{padding:.6rem 1rem;border:2px solid #e1e8ed;border-radius:8px;background:#fff;min-width:220px}
.success-rate-control{display:flex;align-items:center;gap:.5rem}
.success-rate-slider{width:150px}
.success-rate-value{font-weight:700;color:#2c3e50;min-width:50px;text-align:center}
.generate-btn{background-color: darkslateblue;color:#fff;border:none;padding:.7rem 1.4rem;border-radius:8px;font-weight:600;cursor:pointer;display:flex;gap:.5rem;align-items:center}
.error-message{background:#fee;border:1px solid #fcc;color:#a00;padding:1rem;border-radius:8px;margin-bottom:1rem;text-align:center}
.weapon-selection-section{background-color: darkslateblue;border-radius:12px;padding:1.5rem;margin-bottom:2rem;color:#fff}
.section-subtitle{text-align:center;margin:.25rem 0 1rem 0;opacity:.9}
.breadcrumb{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1.5rem;padding:.75rem;background:rgba(255,255,255,.05);border-radius:6px;font-size:.9rem}
.breadcrumb span{color:#fff;opacity:.7}
.breadcrumb span.active{color:#ffd700;font-weight:600}
/* Removed ::after for arrows */
.step-section{background:rgba(255,255,255,.05);border-radius:8px;padding:1.5rem;margin-bottom:1rem}
.step-header{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}
.back-btn{background:none;border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:.5rem 1rem;color:#fff;cursor:pointer}
.back-btn:hover{background:rgba(255,255,255,.1)}
.step-description{color:#fff;opacity:.8;font-size:.95rem}
.category-grid,.weapon-type-grid{display:grid;gap:1rem}
.category-grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.weapon-type-grid{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.category-card,.weapon-type-card{background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25);border-radius:10px;padding:1rem;display:flex;gap:.75rem;align-items:center;cursor:pointer}
.category-card.selected,.weapon-type-card.selected{border-color:#ffd700;box-shadow:0 0 0 2px rgba(255,215,0,.2) inset}
.category-icon,.weapon-type-icon{font-size:1.6rem}
.attribute-type-selection{margin-top:1rem}
.attribute-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:.5rem}
.attr-btn{padding:.6rem .8rem;border-radius:8px;border:2px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:#fff;font-weight:700;letter-spacing:.04em;cursor:pointer}
.attr-btn.active{border-color:#ffd700;background:rgba(255,215,0,.2)}
.base-item-selection{margin-top:1rem}
.filter-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.filter-label{font-weight:700;color:#fff;opacity:.9}
.filter-options{display:flex;gap:1rem}
.filter-option{display:flex;align-items:center;gap:.35rem}
.base-item-select{width:100%;padding:.8rem;border:2px solid rgba(255,255,255,.3);border-radius:8px;background:rgba(255,255,255,.1);color:#fff}
.item-cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1rem;margin-top:1rem}
.ilvl-picker{margin-top:1rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:.75rem}
.ilvl-label{font-weight:700;margin-bottom:.5rem;color:#fff;opacity:.95}
.ilvl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(34px,1fr));gap:.35rem}
.ilvl-btn{padding:.35rem;border-radius:6px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.2);color:#fff;cursor:pointer}
.ilvl-btn:hover{background:rgba(255,255,255,.2);transform:scale(1.05);box-shadow:0 2px 4px rgba(0,0,0,.2)}
.ilvl-btn.active{border-color:#ffd700;background:rgba(255,215,0,.2)}
.ilvl-btn.disabled{opacity:.35;cursor:not-allowed}
.selected-summary{margin-top:1rem}
.summary-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:1rem;display:flex;gap:1rem;align-items:center;cursor:pointer}
.summary-card:hover{background:rgba(255,255,255,.12)}
.summary-icon{font-size:2rem}
.summary-content{flex:1}
.summary-content h5{margin:0 0 .25rem 0;color:#fff}
.summary-content p{margin:.25rem 0;color:#fff;opacity:.9}
.summary-content small{color:#fff;opacity:.7}
.summary-arrow{font-size:1.5rem}
.mods-section{margin-top:1.5rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:1rem}
.preset-actions{margin-top:1rem;text-align:center}
.save-preset-btn{background:#28a745;color:#fff;border:none;padding:.6rem 1.2rem;border-radius:6px;font-weight:600;cursor:pointer}
.save-preset-btn:hover{background:#218838}
.empty-state{text-align:center;padding:3rem 1rem;color:#444}
.empty-icon{font-size:3rem;margin-bottom:.5rem}
@media (max-width:768px){.item-cards-grid{grid-template-columns:1fr}}
</style>
