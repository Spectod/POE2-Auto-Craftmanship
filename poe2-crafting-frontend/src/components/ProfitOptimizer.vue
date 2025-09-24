<template>
  <div class="profit-optimizer">
    <!-- Header Section -->
    <div class="optimizer-header">
      <h2 class="section-title">🎯 Profit Optimizer</h2>
      <p class="section-description">
        วิเคราะห์และหากลยุทธ์ที่จะให้กำไรสูงสุดในการคราฟ
      </p>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
      <div class="control-group">
        <label for="league-select">League:</label>
        <select 
          id="league-select" 
          v-model="selectedLeague" 
          @change="onLeagueChange"
          class="league-select"
        >
          <option 
            v-for="league in allLeagues" 
            :key="league.value" 
            :value="league.value"
          >
            {{ league.value === 'Rise of the Abyssal' ? 'Rise of the Abyssal (Current)' : league.value }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label for="success-rate-control">Success Rate:</label>
        <div class="success-rate-control">
          <input 
            id="success-rate-control"
            type="range" 
            v-model="globalSuccessRate" 
            min="10" 
            max="95" 
            step="5"
            class="success-rate-slider"
          />
          <span class="success-rate-value">{{ globalSuccessRate }}%</span>
        </div>
      </div>
      
      <button 
        @click="generateStrategies" 
        :disabled="!selectedLeague || loading" 
        class="generate-btn"
      >
        <span v-if="loading" class="loading-spinner">⟳</span>
        {{ loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์กลยุทธ์' }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      ❌ {{ error }}
    </div>

    <!-- Weapon Selection Section -->
    <div class="weapon-selection-section">
      <h3>⚔️ Select Weapon for Crafting Analysis</h3>
      <p class="section-subtitle">เลือกประเภทอาวุธเพื่อเริ่มการวิเคราะห์การคราฟ</p>
      
      <!-- Step 1: Category Selection -->
      <div class="category-selection">
        <h4>� Step 1: Choose Weapon Category</h4>
        <div class="category-grid">
          <div 
            v-for="category in weaponCategories" 
            :key="category.id"
            class="category-card"
            :class="{ selected: selectedWeaponCategory === category.id }"
            @click="selectWeaponCategory(category.id)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-info">
              <h5>{{ category.name }}</h5>
              <p>{{ category.count }} weapon types</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Weapon Type Selection -->
      <div v-if="selectedWeaponCategory" class="weapon-type-selection">
        <h4>🗡️ Step 2: Choose Weapon Type</h4>
        <div class="weapon-type-grid">
          <div 
            v-for="weaponType in availableWeaponTypes" 
            :key="weaponType.id"
            class="weapon-type-card"
            :class="{ selected: selectedWeaponType === weaponType.id }"
            @click="selectWeaponType(weaponType.id)"
          >
            <div class="weapon-type-icon">{{ weaponType.icon }}</div>
            <div class="weapon-type-info">
              <h5>{{ weaponType.name }}</h5>
              <p>{{ weaponType.items?.length || 0 }} base items</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Base Item Selection -->
      <div v-if="selectedWeaponType" class="base-item-selection">
        <h4>📦 Step 3: Choose Base Item</h4>
        <p class="section-subtitle">เลือก base item เพื่อเริ่มการวิเคราะห์การคราฟ</p>
        
        <!-- Check if we have detailed item data -->
        <div v-if="hasDetailedItemsForCategory" class="item-cards-grid">
          <ItemCard
            v-for="detailedItem in availableDetailedItems"
            :key="detailedItem.name"
            :item="detailedItem"
            :isSelected="selectedBaseItem === detailedItem.name"
            @select="selectDetailedItem"
          />
        </div>
        
        <!-- Fallback to simple dropdown if no detailed data -->
        <div v-else class="base-item-dropdown">
          <select 
            v-model="selectedBaseItem"
            class="base-item-select"
            @change="onBaseItemChange"
          >
            <option value="">-- Select Base Item --</option>
            <option 
              v-for="baseItem in availableBaseItems" 
              :key="baseItem"
              :value="baseItem"
            >
              {{ baseItem }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Method Cards Section - Only show after weapon selection -->
    <div v-if="showMethodCards" class="base-acquisition-section">
      <h3>🎯 Base Acquisition Methods</h3>
      <p class="section-subtitle">เลือกวิธีการหา {{ selectedBaseItem }} เพื่อเริ่มคราฟ</p>

      <div class="base-methods-grid">
        <div 
          v-for="method in baseAcquisitionMethods" 
          :key="method.id"
          class="base-method-card"
        >
          <div class="method-header">
            <div class="method-icon">{{ method.icon }}</div>
            <div class="method-info">
              <h4>{{ method.name }}</h4>
              <p class="method-desc">{{ method.description }}</p>
            </div>
          </div>
          
          <div class="method-metrics">
            <div class="metric-row">
              <span class="metric-label">Average Cost (Ex):</span>
              <span class="metric-value">{{ method.averageCostEx }} Ex</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Average Cost (Divine):</span>
              <span class="metric-value">{{ method.averageCostDivine }} Divine {{ method.averageCostEx }} Ex</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Success Rate:</span>
              <span class="metric-value success-rate">{{ globalSuccessRate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert System -->
      <div class="alert-system">
        <div class="alert-header">
          <h4>🔔 Base Value Alerts</h4>
          <div class="alert-controls">
            <label>
              Profit Threshold:
              <input 
                type="number" 
                v-model="alertThreshold" 
                min="0" 
                step="10"
                class="threshold-input"
              /> chaos
            </label>
            <button 
              @click="toggleAlerts" 
              class="alert-toggle"
              :class="{ active: alertsEnabled }"
            >
              {{ alertsEnabled ? '🔔 ON' : '🔕 OFF' }}
            </button>
          </div>
        </div>
        
        <div v-if="filteredHighValueBases.length > 0" class="alerts-list">
          <div 
            v-for="alert in filteredHighValueBases" 
            :key="alert.id"
            class="alert-item"
            :class="alert.priority"
          >
            <div class="alert-icon">{{ getPriorityIcon(alert.priority) }}</div>
            <div class="alert-content">
              <strong>{{ alert.itemName }}</strong>
              <p>{{ alert.description }}</p>
              <div class="alert-metrics">
                <span>Potential Profit: <strong>{{ alert.potentialProfit }}</strong> chaos</span>
                <span>Current Price: <strong>{{ alert.currentPrice }}</strong> chaos</span>
              </div>
            </div>
            <div class="alert-actions">
              <button class="view-btn" @click="viewBaseDetails(alert)">View</button>
              <button class="dismiss-btn" @click="dismissAlert(alert.id)">Dismiss</button>
            </div>
          </div>
        </div>
        
        <div v-else class="no-alerts">
          <span>{{ alertsEnabled ? 'ไม่มี base ที่เกินเกณฑ์ในขณะนี้' : 'เปิด alerts เพื่อดูโอกาสที่น่าสนใจ' }}</span>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="strategies.length > 0" class="results-section">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card best-strategy">
          <h3>🏆 กลยุทธ์ที่ดีที่สุด</h3>
          <div v-if="bestStrategy" class="strategy-preview">
            <div class="item-info">
              <strong>{{ bestStrategy.itemType }}</strong>
              <span class="method-badge" :class="bestStrategy.method">
                {{ bestStrategy.method.toUpperCase() }}
              </span>
            </div>
            <div class="profit-info">
              <span class="profit-amount" :class="{ positive: bestStrategy.expectedProfit > 0 }">
                {{ bestStrategy.expectedProfit.toFixed(1) }} chaos
              </span>
              <span class="roi-percentage">
                ROI: {{ bestStrategy.roi.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>

        <div class="summary-card total-profit">
          <h3>💰 กำไรรวมที่คาดว่าจะได้</h3>
          <div class="total-amount">
            {{ totalPotentialProfit.toFixed(1) }} chaos
          </div>
          <div class="strategies-count">
            {{ profitableStrategies.length }} กลยุทธ์ที่มีกำไร
          </div>
        </div>

        <div class="summary-card market-conditions">
          <h3>📊 สภาพตลาด</h3>
          <div class="market-info">
            <div class="market-metric">
              <span class="label">League:</span>
              <span class="value">{{ selectedLeague }}</span>
            </div>
            <div class="market-metric">
              <span class="label">Active Strategies:</span>
              <span class="value">{{ strategies.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Strategies List -->
      <div class="strategies-list">
        <h3>📊 รายละเอียดกลยุทธ์ทั้งหมด</h3>
        
        <div 
          v-for="(strategy, index) in strategies" 
          :key="index" 
          class="strategy-card"
          :class="strategy.riskLevel + '-risk'"
        >
          <!-- Strategy Header -->
          <div class="strategy-header">
            <div class="strategy-title">
              <h4>{{ strategy.itemType }}</h4>
              <span class="base-item">{{ strategy.baseItem }}</span>
              <span class="method-badge" :class="strategy.method">
                {{ strategy.method.toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Target Modifiers -->
          <div class="target-modifiers">
            <h5>🎯 Target Modifiers:</h5>
            <div class="modifiers-list">
              <span 
                v-for="mod in strategy.targetModifiers" 
                :key="mod"
                class="modifier-tag"
              >
                {{ mod }}
              </span>
            </div>
          </div>

          <!-- Financial Analysis -->
          <div class="financial-analysis">
            <div class="analysis-row">
              <div class="metric">
                <span class="metric-label">ต้นทุนรวม:</span>
                <span class="metric-value">{{ strategy.totalCost.toFixed(1) }} chaos</span>
              </div>
              <div class="metric">
                <span class="metric-label">ราคาขายคาดการณ์:</span>
                <span class="metric-value">{{ strategy.expectedSellPrice.toFixed(1) }} chaos</span>
              </div>
            </div>
            
            <div class="analysis-row">
              <div class="metric">
                <span class="metric-label">กำไรที่คาดว่าจะได้:</span>
                <span 
                  class="metric-value profit"
                  :class="{ 
                    positive: strategy.expectedProfit > 0,
                    negative: strategy.expectedProfit < 0 
                  }"
                >
                  {{ strategy.expectedProfit.toFixed(1) }} chaos
                </span>
              </div>
              <div class="metric">
                <span class="metric-label">ROI:</span>
                <span 
                  class="metric-value roi"
                  :class="{ 
                    positive: strategy.roi > 0,
                    negative: strategy.roi < 0 
                  }"
                >
                  {{ strategy.roi.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Probability & Risk Info -->
          <div class="probability-risk">
            <div class="prob-info">
              <span class="label">โอกาสสำเร็จ:</span>
              <span class="value">{{ (strategy.successRate * 100).toFixed(2) }}%</span>
            </div>
            <div class="attempts-info">
              <span class="label">จำนวนครั้งที่คาดว่าจะใช้:</span>
              <span class="value">{{ strategy.expectedAttempts }} ครั้ง</span>
            </div>
            <div class="risk-info">
              <span class="label">ระดับความเสี่ยง:</span>
              <span class="value risk-level" :class="strategy.riskLevel">
                {{ getRiskLevelText(strategy.riskLevel) }}
              </span>
            </div>
          </div>

          <!-- Market Data -->
          <div class="market-data">
            <div class="market-metric">
              <span class="label">Listings ในตลาด:</span>
              <span class="value">{{ strategy.listings }}</span>
            </div>
            <div class="market-metric">
              <span class="label">Demand:</span>
              <span class="value demand" :class="strategy.demand">
                {{ getDemandText(strategy.demand) }}
              </span>
            </div>
            <div class="market-metric">
              <span class="label">ความมั่นใจ:</span>
              <span class="value confidence">{{ strategy.confidence.toFixed(0) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && strategies.length === 0" class="empty-state">
      <div class="empty-icon">📈</div>
      <h3>เริ่มต้นวิเคราะห์กำไร</h3>
      <p>เลือก League และกดปุ่ม "วิเคราะห์กลยุทธ์" เพื่อหากลยุทธ์ที่ให้กำไรสูงสุด</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePOE2Data } from '../composables/usePOE2'
import { useDetailedItems } from '../composables/useDetailedItems'
import ItemCard from './ItemCard.vue'
import poe2BaseItems from '../assets/poe2_base_items.json'

// Composables
const poe2Data = usePOE2Data()
const { leagues } = poe2Data
const detailedItemsComposable = useDetailedItems()
const { hasDetailedData, getItemsByCategory, getDetailedItem } = detailedItemsComposable

// State
const selectedLeague = ref('Rise of the Abyssal')
const globalSuccessRate = ref(80)
const loading = ref(false)
const error = ref<string | null>(null)
const strategies = ref<any[]>([])

// Weapon Selection State
const selectedWeaponCategory = ref<string | null>(null)
const selectedWeaponType = ref<string | null>(null)
const selectedBaseItem = ref<string | null>(null)

// Base Acquisition System State
const alertThreshold = ref(100)
const alertsEnabled = ref(false)
const highValueBases = ref([
  {
    id: 1,
    itemName: 'Eclipse Staff Base',
    description: 'Perfect base for high-tier caster weapons with T1 spell damage potential',
    potentialProfit: 150,
    currentPrice: 45,
    priority: 'high'
  },
  {
    id: 2,
    itemName: 'Royal Burgonet',
    description: 'Excellent armor base with high life and resistance roll potential',
    potentialProfit: 89,
    currentPrice: 23,
    priority: 'medium'
  },
  {
    id: 3,
    itemName: 'Vaal Regalia Base',
    description: 'Premium energy shield base with potential for hybrid defensive rolls',
    potentialProfit: 120,
    currentPrice: 67,
    priority: 'high'
  },
  {
    id: 4,
    itemName: 'Titanium Spirit Shield',
    description: 'High-tier shield base perfect for spell critical builds',
    potentialProfit: 75,
    currentPrice: 34,
    priority: 'medium'
  }
])

const baseAcquisitionMethods = ref([
  {
    id: 'reforge-rare',
    name: 'Reforge from Rare Items',
    description: 'ซื้อ rare items แล้วใช้ Chaos Orb เพื่อ reroll modifiers',
    icon: '🔄',
    averageCostEx: 2.8,
    averageCostDivine: 1,
    successRate: 80
  },
  {
    id: 'purchase-normal',
    name: 'Purchase Normal/Magic Bases',
    description: 'ซื้อ normal/magic bases ที่มี modifiers เริ่มต้นดี',
    icon: '🛒',
    averageCostEx: 1.2,
    averageCostDivine: 0,
    successRate: 80
  },
  {
    id: 'fracturing-orb',
    name: 'Fracturing Orb Strategy',
    description: 'ซื้อ rare base แล้วใช้ Fracturing Orb เพื่อล็อค modifier ที่ดี',
    icon: '💎',
    averageCostEx: 6.5,
    averageCostDivine: 2,
    successRate: 80
  }
])

// Weapon Categories (POE2)
const weaponCategories = ref([
  {
    id: 'oneHanded',
    name: 'One Handed Weapons',
    icon: '⚔️',
    count: 4 // wands, maces, sceptres, spears
  },
  {
    id: 'twoHanded', 
    name: 'Two Handed Weapons',
    icon: '🗡️',
    count: 5 // twoHandMaces, quarterstaves, crossbows, bows, staves
  },
  {
    id: 'offHanded',
    name: 'Off Handed Items',
    icon: '🛡️',
    count: 4 // foci, quivers, shields, bucklers
  }
])

// Computed Properties
const allLeagues = computed(() => {
  const riseLeague = { value: 'Rise of the Abyssal' }
  const otherLeagues = leagues.leagues.value.filter(l => l.value !== 'Rise of the Abyssal')
  return [riseLeague, ...otherLeagues]
})

const bestStrategy = computed(() => {
  if (strategies.value.length === 0) return null
  return strategies.value.reduce((best, current) => 
    current.expectedProfit > best.expectedProfit ? current : best
  )
})

const totalPotentialProfit = computed(() => 
  strategies.value.reduce((total, strategy) => total + strategy.expectedProfit, 0)
)

const profitableStrategies = computed(() => 
  strategies.value.filter(strategy => strategy.expectedProfit > 0)
)

const filteredHighValueBases = computed(() => {
  if (!alertsEnabled.value) return []
  return highValueBases.value.filter(base => base.potentialProfit >= alertThreshold.value)
})

// Weapon Selection Computed Properties
const availableWeaponTypes = computed(() => {
  if (!selectedWeaponCategory.value) return []
  
  let weaponData
  if (selectedWeaponCategory.value === 'oneHanded') {
    weaponData = poe2BaseItems.weapons.oneHandedWeapons
  } else if (selectedWeaponCategory.value === 'twoHanded') {
    weaponData = poe2BaseItems.weapons.twoHandedWeapons
  } else if (selectedWeaponCategory.value === 'offHanded') {
    weaponData = poe2BaseItems.offHandedItems
  } else {
    return []
  }

  return Object.entries(weaponData).map(([key, items]) => ({
    id: key,
    name: formatWeaponTypeName(key),
    icon: getWeaponTypeIcon(key),
    items: items as string[]
  }))
})

const availableBaseItems = computed(() => {
  if (!selectedWeaponCategory.value || !selectedWeaponType.value) return []
  
  let weaponData
  if (selectedWeaponCategory.value === 'oneHanded') {
    weaponData = poe2BaseItems.weapons.oneHandedWeapons
  } else if (selectedWeaponCategory.value === 'twoHanded') {
    weaponData = poe2BaseItems.weapons.twoHandedWeapons
  } else if (selectedWeaponCategory.value === 'offHanded') {
    weaponData = poe2BaseItems.offHandedItems
  } else {
    return []
  }
    
  return weaponData[selectedWeaponType.value as keyof typeof weaponData] as string[] || []
})

// Check if we have detailed item data for current category
const hasDetailedItemsForCategory = computed(() => {
  if (!selectedWeaponType.value) return false
  return hasDetailedData(selectedWeaponType.value)
})

// Get detailed items for current category
const availableDetailedItems = computed(() => {
  if (!selectedWeaponType.value || !hasDetailedItemsForCategory.value) return []
  return getItemsByCategory(selectedWeaponType.value)
})

const showMethodCards = computed(() => {
  return selectedBaseItem.value !== null && selectedBaseItem.value !== ''
})

// Helper functions for POE2 0.3.1 weapons
const formatWeaponTypeName = (key: string): string => {
  const nameMap: { [key: string]: string } = {
    // One Handed Weapons (POE2 0.3.1)
    wands: 'Wands',
    maces: 'Maces',
    sceptres: 'Sceptres',
    spears: 'Spears',
    // Two Handed Weapons (POE2 0.3.1)
    twoHandMaces: 'Two Hand Maces',
    quarterstaves: 'Quarterstaves',
    crossbows: 'Crossbows',
    bows: 'Bows',
    staves: 'Staves',
    // Off Handed Items (POE2 0.3.1)
    foci: 'Foci',
    quivers: 'Quivers',
    shields: 'Shields',
    bucklers: 'Bucklers'
  }
  return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

const getWeaponTypeIcon = (key: string): string => {
  const iconMap: { [key: string]: string } = {
    // One Handed Weapons (POE2 0.3.1)
    wands: '🪄',
    maces: '🔨',
    sceptres: '🔮',
    spears: '🔱',
    // Two Handed Weapons (POE2 0.3.1)
    twoHandMaces: '🔨',
    quarterstaves: '🪶',
    crossbows: '🏹',
    bows: '🏹',
    staves: '🪶',
    // Off Handed Items (POE2 0.3.1)
    foci: '🔮',
    quivers: '🏹',
    shields: '🛡️',
    bucklers: '⚡'
  }
  return iconMap[key] || '⚔️'
}

// Methods
const onLeagueChange = () => {
  strategies.value = []
  error.value = null
}

const generateStrategies = async () => {
  if (!selectedLeague.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    strategies.value = [
      {
        itemType: 'Siege Axe',
        baseItem: 'Rare Siege Axe Base',
        method: 'chaos-reroll',
        recommendation: 'highly-recommended',
        targetModifiers: ['High Physical Damage', 'Critical Strike Multiplier', 'Added Fire Damage'],
        totalCost: 45.5,
        expectedSellPrice: 120.0,
        expectedProfit: 74.5,
        roi: 163.7,
        successRate: globalSuccessRate.value / 100,
        expectedAttempts: Math.ceil(100 / globalSuccessRate.value),
        riskLevel: 'medium',
        listings: 23,
        demand: 'high',
        confidence: 85
      },
      {
        itemType: 'Astral Plate',
        baseItem: 'Magic Astral Plate Base',
        method: 'fracturing',
        recommendation: 'recommended',
        targetModifiers: ['High Life Roll', 'Triple Resistances', 'Movement Speed'],
        totalCost: 95.0,
        expectedSellPrice: 180.0,
        expectedProfit: 85.0,
        roi: 89.5,
        successRate: globalSuccessRate.value / 100,
        expectedAttempts: Math.ceil(100 / globalSuccessRate.value),
        riskLevel: 'high',
        listings: 12,
        demand: 'medium',
        confidence: 72
      },
      {
        itemType: 'Vaal Regalia',
        baseItem: 'Normal Vaal Regalia Base',
        method: 'purchase-craft',
        recommendation: 'recommended',
        targetModifiers: ['High Energy Shield', 'Intelligence', 'Resistances'],
        totalCost: 32.5,
        expectedSellPrice: 89.0,
        expectedProfit: 56.5,
        roi: 173.8,
        successRate: globalSuccessRate.value / 100,
        expectedAttempts: Math.ceil(100 / globalSuccessRate.value),
        riskLevel: 'low',
        listings: 45,
        demand: 'high',
        confidence: 91
      }
    ]
    
  } catch (err) {
    error.value = 'ไม่สามารถสร้างกลยุทธ์ได้ กรุณาลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}

const getRiskLevelText = (riskLevel: string): string => {
  const texts = {
    'low': 'ต่ำ',
    'medium': 'ปานกลาง',
    'high': 'สูง'
  }
  return texts[riskLevel as keyof typeof texts] || riskLevel
}

const getDemandText = (demand: string): string => {
  const texts = {
    'high': 'สูง',
    'medium': 'ปานกลาง',
    'low': 'ต่ำ'
  }
  return texts[demand as keyof typeof texts] || demand
}

// Alert System Methods
const toggleAlerts = () => {
  alertsEnabled.value = !alertsEnabled.value
}

const getPriorityIcon = (priority: string): string => {
  const icons = {
    'high': '🔥',
    'medium': '⚡',
    'low': '💡'
  }
  return icons[priority as keyof typeof icons] || '💡'
}

const viewBaseDetails = (alert: any) => {
  console.log('Viewing base details:', alert)
  // TODO: Implement base details modal/page
}

const dismissAlert = (alertId: number) => {
  highValueBases.value = highValueBases.value.filter(alert => alert.id !== alertId)
}

// Weapon Selection Methods
const selectWeaponCategory = (categoryId: string) => {
  selectedWeaponCategory.value = categoryId
  selectedWeaponType.value = null
  selectedBaseItem.value = null
}

const selectWeaponType = (typeId: string) => {
  selectedWeaponType.value = typeId
  selectedBaseItem.value = null
}

const selectDetailedItem = (item: any) => {
  selectedBaseItem.value = item.name
  console.log('Selected detailed item:', item)
}

const onBaseItemChange = () => {
  // Method cards will show automatically via computed property
  console.log('Selected base item:', selectedBaseItem.value)
}

// Initialize
onMounted(async () => {
  try {
    await poe2Data.initializeData()
  } catch (err) {
    error.value = 'ไม่สามารถโหลดข้อมูลได้'
  }
})
</script>

<style scoped>
.profit-optimizer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.optimizer-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 0;
}

.controls-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 600;
  color: #34495e;
  font-size: 0.9rem;
}

.league-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  min-width: 250px;
  transition: all 0.3s ease;
}

.league-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.success-rate-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-rate-slider {
  width: 150px;
  height: 6px;
  border-radius: 3px;
  background: #e1e8ed;
  outline: none;
  -webkit-appearance: none;
}

.success-rate-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.success-rate-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.success-rate-value {
  font-weight: bold;
  color: #2c3e50;
  min-width: 50px;
  text-align: center;
}

.generate-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #a00;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

/* Base Acquisition Section */
.base-acquisition-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #dee2e6;
}

.base-acquisition-section h3 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.section-subtitle {
  color: #6c757d;
  text-align: center;
  margin-bottom: 2rem;
  font-style: italic;
}

.base-selection {
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.base-selection h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.base-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.base-type-card {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.base-type-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.base-type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.base-type-info h5 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.base-type-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

.base-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.base-method-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.base-method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.method-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.method-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.method-info {
  flex: 1;
}

.method-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: bold;
}

.method-desc {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.5;
}

.method-metrics {
  padding: 1.2rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.metric-row:last-child {
  margin-bottom: 0;
}

.metric-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.metric-value {
  font-weight: bold;
  color: #2c3e50;
}

.method-details {
  space-y: 1rem;
}

/* Alert System */
.alert-system {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.alert-header h4 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin: 0;
}

.alert-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.threshold-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  width: 80px;
  font-size: 0.9rem;
}

.alert-toggle {
  padding: 0.6rem 1.2rem;
  border: 2px solid #6c757d;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.alert-toggle:hover {
  background: #f8f9fa;
}

.alert-toggle.active {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.alerts-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.alert-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.alert-item.high {
  border-color: #dc3545;
  background: linear-gradient(135deg, #fff5f5 0%, #ffffff 100%);
}

.alert-item.medium {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fffef7 0%, #ffffff 100%);
}

.alert-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content strong {
  color: #2c3e50;
  font-size: 1.1rem;
}

.alert-content p {
  margin: 0.5rem 0;
  color: #6c757d;
  line-height: 1.4;
}

.alert-metrics {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.alert-metrics span {
  color: #495057;
  font-size: 0.9rem;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.view-btn, .dismiss-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn {
  background: #007bff;
  color: white;
  border: 1px solid #007bff;
}

.view-btn:hover {
  background: #0056b3;
}

.dismiss-btn {
  background: white;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.dismiss-btn:hover {
  background: #f8f9fa;
}

.no-alerts {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

/* Results Section */
.results-section {
  margin-top: 2rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.summary-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.best-strategy {
  border-left: 4px solid #28a745;
}

.total-profit {
  border-left: 4px solid #007bff;
}

.market-conditions {
  border-left: 4px solid #17a2b8;
}

.total-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #28a745;
  margin-bottom: 0.5rem;
}

.strategies-count {
  color: #6c757d;
  font-size: 0.9rem;
}

.market-info .market-metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.strategies-list h3 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.strategy-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.strategy-title h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.base-item {
  color: #6c757d;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.5rem;
}

.method-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #e9ecef;
  color: #495057;
}

.target-modifiers {
  margin-bottom: 1.5rem;
}

.target-modifiers h5 {
  color: #2c3e50;
  margin-bottom: 0.8rem;
  font-size: 1.1rem;
}

.modifiers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.modifier-tag {
  background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #495057;
  border: 1px solid #dee2e6;
}

.financial-analysis {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.analysis-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.analysis-row:last-child {
  margin-bottom: 0;
}

.metric {
  flex: 1;
}

.metric-label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

.positive {
  color: #28a745;
}

.negative {
  color: #dc3545;
}

.probability-risk, .market-data {
  display: flex;
  gap: 2rem;
  margin: 1.5rem 0;
  padding: 1.2rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.probability-risk > div, .market-data > div {
  flex: 1;
  min-width: 150px;
}

.label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.25rem;
}

.value {
  font-weight: bold;
  color: #2c3e50;
}

.risk-level.low {
  color: #28a745;
}

.risk-level.medium {
  color: #ffc107;
}

.risk-level.high {
  color: #dc3545;
}

.demand.high {
  color: #28a745;
}

.demand.medium {
  color: #ffc107;
}

.demand.low {
  color: #dc3545;
}

.medium-risk {
  border-left: 4px solid #ffc107;
}

.high-risk {
  border-left: 4px solid #dc3545;
}

.low-risk {
  border-left: 4px solid #28a745;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: #495057;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.empty-state p {
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Weapon Selection Styles */
.weapon-selection-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
}

.weapon-selection-section h3 {
  color: white;
  margin-bottom: 0.5rem;
}

.category-selection {
  margin-bottom: 2rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.category-card:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.category-card.selected {
  background: rgba(255, 255, 255, 0.25);
  border-color: #ffd700;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.category-icon {
  font-size: 2rem;
  line-height: 1;
}

.category-info h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.category-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.weapon-type-selection {
  margin-bottom: 2rem;
}

.weapon-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.weapon-type-card {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.weapon-type-card:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.weapon-type-card.selected {
  background: rgba(255, 255, 255, 0.25);
  border-color: #ffd700;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.weapon-type-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.weapon-type-info h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.weapon-type-info p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.8rem;
}

.base-item-selection {
  margin-bottom: 1rem;
}

.base-item-dropdown {
  margin-top: 1rem;
}

.base-item-select {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(10px);
}

.base-item-select:focus {
  outline: none;
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Item Cards Grid */
.item-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem 0;
}

.base-item-select option {
  background: #2c3e50;
  color: white;
  padding: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profit-optimizer {
    padding: 1rem;
  }
  
  .item-cards-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .base-methods-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .analysis-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .probability-risk, .market-data {
    flex-direction: column;
    gap: 1rem;
  }
  
  .alert-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .strategy-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
