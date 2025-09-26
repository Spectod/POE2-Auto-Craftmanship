<template>
  <div class="profit-optimizer">
    <div class="optimizer-header">
      <h2 class="section-title">Profit Optimizer</h2>
      <p class="section-description">à¸•à¸±à¸§à¸Šà¹ˆà¸§à¸¢à¸§à¸²à¸‡à¹à¸œà¸™à¸à¸³à¹„à¸£à¸ˆà¸²à¸à¸à¸²à¸£à¸„à¸£à¸²à¸Ÿ à¹€à¸¥à¸·à¸­à¸à¸¥à¸µà¸ à¸à¸²à¸™à¹„à¸­à¹€à¸—à¹‡à¸¡ à¹à¸¥à¸°à¹ƒà¸«à¹‰à¸£à¸°à¸šà¸šà¸„à¸³à¸™à¸§à¸“à¸•à¹‰à¸™à¸—à¸¸à¸™/à¹‚à¸­à¸à¸²à¸ªà¸ªà¸³à¹€à¸£à¹‡à¸ˆ</p>
    </div>

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
        <span v-if="loading" class="loading-spinner">â³</span>
        {{ loading ? 'à¸à¸³à¸¥à¸±à¸‡à¸ªà¸£à¹‰à¸²à¸‡à¸à¸¥à¸¢à¸¸à¸—à¸˜à¹Œ...' : 'à¸ªà¸£à¹‰à¸²à¸‡à¸à¸¥à¸¢à¸¸à¸—à¸˜à¹Œ' }}
      </button>
    </div>

    <div v-if="error" class="error-message">à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”: {{ error }}</div>

    <div class="weapon-selection-section">
      <h3>à¹€à¸¥à¸·à¸­à¸à¸­à¸²à¸§à¸¸à¸˜à¸ªà¸³à¸«à¸£à¸±à¸šà¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¸à¸²à¸£à¸„à¸£à¸²à¸Ÿ</h3>
      <p class="section-subtitle">à¹€à¸¥à¸·à¸­à¸à¸«à¸¡à¸§à¸”à¹à¸¥à¸°à¸Šà¸™à¸´à¸”à¹„à¸­à¹€à¸—à¹‡à¸¡ à¹à¸¥à¹‰à¸§à¹€à¸¥à¸·à¸­à¸à¸à¸²à¸™à¸ªà¸³à¸«à¸£à¸±à¸šà¸„à¸³à¸™à¸§à¸“</p>

      <!-- Step 1: Category -->
      <div class="category-selection">
        <h4>Step 1: à¹€à¸¥à¸·à¸­à¸à¸«à¸¡à¸§à¸”à¹„à¸­à¹€à¸—à¹‡à¸¡</h4>
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
      <div v-if="selectedItemCategory" class="weapon-type-selection">
        <h4>Step 2: à¹€à¸¥à¸·à¸­à¸à¸Šà¸™à¸´à¸”à¹„à¸­à¹€à¸—à¹‡à¸¡</h4>

        <template v-if="selectedItemCategory === 'armour'">
          <div class="weapon-type-grid">
            <div v-for="sub in armourSubcategories" :key="sub.id" class="weapon-type-card" :class="{ selected: selectedArmourSubcategory === sub.id }" @click="selectArmourSubcategory(sub.id)">
              <div class="weapon-type-icon">{{ sub.icon }}</div>
              <div class="weapon-type-info"><h5>{{ sub.name }}</h5></div>
            </div>
          </div>
          <div v-if="selectedArmourSubcategory" class="attribute-type-selection">
            <p class="section-subtitle">à¹€à¸¥à¸·à¸­à¸à¸„à¹ˆà¸²à¸ªà¸–à¸²à¸™à¸° (STR/DEX/INT/à¹à¸šà¸šà¸œà¸ªà¸¡) à¸ªà¸³à¸«à¸£à¸±à¸šà¸Šà¸¸à¸”à¹€à¸à¸£à¸²à¸° à¹€à¸žà¸·à¹ˆà¸­à¸à¸£à¸­à¸‡à¸à¸²à¸™à¹„à¸­à¹€à¸—à¹‡à¸¡</p>
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
            <p class="section-subtitle">à¸à¸£à¸­à¸‡à¸•à¸²à¸¡à¸„à¹ˆà¸²à¸ªà¸–à¸²à¸™à¸°à¸‚à¸­à¸‡à¹‚à¸¥à¹ˆ (STR / STR+DEX / STR+INT)</p>
            <div class="attribute-grid">
              <button v-for="attr in shieldAttributeTypes" :key="attr.id" type="button" :class="['attr-btn', { active: selectedShieldAttribute === attr.id }]" :aria-pressed="selectedShieldAttribute === attr.id" @click="selectShieldAttribute(attr.id)">
                {{ attr.name }}
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Step 3: Base item -->
      <div v-if="selectedWeaponType" class="base-item-selection">
        <div v-if="showFilterRow" class="filter-row">
          <label class="filter-label">Filter</label>
          <div class="filter-options">
            <label class="filter-option">
              <input type="radio" name="base-filter" value="all" v-model="currentFilterMode" />
              <span>All</span>
            </label>
            <label class="filter-option">
              <input type="radio" name="base-filter" value="endgame" v-model="currentFilterMode" :disabled="!endgameFilterAllowed" />
              <span>End-game (Req Lvl â‰¥ 67)</span>
            </label>
          </div>
        </div>
        <h4>Step 3: à¹€à¸¥à¸·à¸­à¸à¸à¸²à¸™à¹„à¸­à¹€à¸—à¹‡à¸¡ (Base Item)</h4>
        <p class="section-subtitle">à¹€à¸¥à¸·à¸­à¸à¸à¸²à¸™à¹„à¸­à¹€à¸—à¹‡à¸¡à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸à¸²à¸£à¹€à¸žà¸·à¹ˆà¸­à¸”à¸¹à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¹à¸¥à¸°à¸§à¸´à¸˜à¸µà¸à¸²à¸£à¹„à¸”à¹‰à¸¡à¸²</p>
        <div v-if="hasDetailedItemsForCategory" class="item-cards-grid">
          <ItemCard v-for="d in availableDetailedItems" :key="d.name" :item="d" :isSelected="selectedBaseItem === d.name" @select="selectDetailedItem" />
        </div>
        <div v-else class="base-item-dropdown">
          <select v-model="selectedBaseItem" class="base-item-select" @change="onBaseItemChange">
            <option value="">-- Select Base Item --</option>
            <option v-for="baseItem in availableBaseItems" :key="baseItem" :value="baseItem">{{ baseItem }}</option>
          </select>
        </div>

        <!-- Item Level Picker -->
        <div v-if="selectedBaseItem" class="ilvl-picker">
          <div class="ilvl-label">Select item level</div>
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
          <div class="ilvl-help">Min iLvl: {{ minIlvl }} • Max: 84 • Current: {{ selectedIlvl }}</div>\n          <ModsSelector :base="selectedBaseItem" :ilvl="selectedIlvl" :successRate="globalSuccessRate" @update:selected="mods => (void mods)" />
        </div>
      </div>
    </div>

    <div v-if="!loading && strategies.length === 0" class="empty-state">
      <div class="empty-icon">ðŸ“­</div>
      <h3>à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥</h3>
      <p>à¹€à¸¥à¸·à¸­à¸ League à¹à¸¥à¸°à¸à¸” "à¸ªà¸£à¹‰à¸²à¸‡à¸à¸¥à¸¢à¸¸à¸—à¸˜à¹Œ" à¹€à¸žà¸·à¹ˆà¸­à¹€à¸£à¸´à¹ˆà¸¡à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œ</p>
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
const selectedIlvl = ref<number>(81)

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

// show/hide filter-row (hidden for quivers) à¸à¸³à¸«à¸™à¸”à¸§à¹ˆà¸²à¸ˆà¸°à¹ƒà¸«à¹‰à¹à¸ªà¸”à¸‡ ui à¸—à¸µà¹ˆà¹ƒà¸Šà¹‰à¸ªà¸³à¸«à¸£à¸±à¸šà¸à¸²à¸£ filter à¹„à¸«à¸¡
const showFilterRow = computed(() => {
  return !(selectedWeaponType.value === 'quivers'|| selectedWeaponType.value === 'shields' || selectedItemCategory.value === 'jewellery')
})

// Per-type base item filter: 'all' | 'endgame' à¸à¸³à¸«à¸™à¸”à¸„à¹ˆà¸²à¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™à¸‚à¸­à¸‡à¸à¸²à¸£ filter à¹à¸šà¸šà¹€à¸£à¸µà¸¢à¸¥à¹„à¸—à¸¡à¹Œ
const filterModeByType = ref<Record<string, 'all' | 'endgame'>>({})
const endgameFilterAllowed = computed(() => {
  if (selectedItemCategory.value === 'jewellery') return false
  if (selectedWeaponType.value === 'quivers') return false
  if (selectedWeaponType.value === 'shields') return false 
  return true
})

//à¸à¸³à¸«à¸£à¸”à¸„à¹ˆà¸²à¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™à¸§à¹ˆà¸² filter à¸ˆà¸°à¹€à¸›à¹‡à¸™ all à¸«à¸£à¸·à¸­ endgame à¹ƒà¸™à¸­à¸•à¸™à¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™à¸„à¸£à¸±à¸‡à¹à¸£à¸
const getDefaultFilterForCurrent = () =>{
  const t = selectedWeaponType.value ?? ''
  const isSpecial = selectedItemCategory.value === 'jewellery' || ['quivers', 'shields'].includes(t)
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

//à¸à¸³à¸«à¸™à¸” à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆà¸£à¸­à¸‡à¹ƒà¸«à¹‰ Armours
const armourSubcategories = [
  { id: 'gloves', name: 'Gloves', icon: 'ðŸ§¤' },
  { id: 'boots', name: 'Boots', icon: 'ðŸ¥¾' },
  { id: 'bodyArmours', name: 'Body Armours', icon: 'ðŸ¥‹' },
  { id: 'helmets', name: 'Helmets', icon: 'ðŸª–' }
]

//à¸à¸³à¸«à¸™à¸”à¸§à¹ˆà¸²à¸¡à¸µà¸«à¸¡à¸§à¸«à¸¡à¸¹à¹€à¸›à¹‡à¸¯ Attribute à¹„à¸«à¸™à¸šà¹‰à¸²à¸‡
const attributeTypes = [
  { id: 'str', name: 'str' },
  { id: 'dex', name: 'dex' },
  { id: 'int', name: 'int' },
  { id: 'str_dex', name: 'str/dex' },
  { id: 'str_int', name: 'str/int' },
  { id: 'dex_int', name: 'dex/int' }
]

const selectedArmourSubcategory = ref<string | null>(null)
// Default Armour attribute to 'int' so armour types start at INT by default
const selectedArmourAttribute = ref<string>('int')
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
  { id: 'oneHanded', name: 'One Handed Weapons', icon: 'ðŸ—¡ï¸', count: 4 },
  { id: 'twoHanded', name: 'Two Handed Weapons', icon: 'ðŸª“', count: 5 },
  { id: 'offHanded', name: 'Off Handed Items', icon: 'ðŸ›¡ï¸', count: 4 },
  { id: 'jewellery', name: 'Jewellery', icon: 'ðŸ’', count: 3 },
  { id: 'armour', name: 'Armour', icon: 'ðŸ¥‹', count: 4 }
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
  try { await new Promise(r => setTimeout(r, 300)); strategies.value = [] } catch (e) { error.value = 'à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥/à¸„à¸³à¸™à¸§à¸“à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ à¹‚à¸›à¸£à¸”à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ' } finally { loading.value = false }
}

const selectWeaponCategory = (categoryId: string) => { selectedItemCategory.value = categoryId; selectedWeaponType.value = null; selectedBaseItem.value = null }
const selectDetailedItem = (item: any) => { selectedBaseItem.value = item.name }
const onBaseItemChange = () => {}

onMounted(async () => { try { await poe2Data.initializeData() } catch (e) { error.value = 'à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸šà¸·à¹‰à¸­à¸‡à¸•à¹‰à¸™à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ à¹‚à¸›à¸£à¸”à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ' } })
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
const onSelectIlvl = (lvl: number) => { selectedIlvl.value = clampIlvl(lvl) }
watch([selectedBaseItem, selectedWeaponType], () => { selectedIlvl.value = clampIlvl(81) })

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
.ilvl-btn.active{border-color:#ffd700;background:rgba(255,215,0,.2)}
.ilvl-btn.disabled{opacity:.35;cursor:not-allowed}
.ilvl-help{margin-top:.4rem;font-size:.85rem;color:#eee;opacity:.85}
.empty-state{text-align:center;padding:3rem 1rem;color:#444}
.empty-icon{font-size:3rem;margin-bottom:.5rem}
@media (max-width:768px){.item-cards-grid{grid-template-columns:1fr}}
</style>



