<template>
  <div class="poe2-dashboard">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="currentTab = tab.id"
        class="tab-button"
        :class="{ active: currentTab === tab.id }"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Connection Status -->
    <div class="connection-status" :class="{ 'connected': connection.isConnected.value, 'disconnected': !connection.isConnected.value }">
      <div class="status-indicator">
        <div class="dot"></div>
        <span>{{ connection.isConnected.value ? 'Connected' : 'Disconnected' }}</span>
      </div>
      <div class="actions">
        <button @click="connection.checkConnection()" :disabled="connection.loading.value">
          {{ connection.loading.value ? 'Checking...' : 'Check Connection' }}
        </button>
        <button @click="initializeData" :disabled="!connection.isConnected.value" class="primary">
          Load Data
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Market Overview Tab -->
      <div v-if="currentTab === 'market'" class="tab-panel">
        <!-- Error Display -->
        <div v-if="hasErrors" class="error-panel">
          <h3>Errors:</h3>
          <ul>
            <li v-if="connection.error.value">Connection: {{ connection.error.value }}</li>
            <li v-if="leagues.error.value">Leagues: {{ leagues.error.value }}</li>
            <li v-if="currency.error.value">Currency: {{ currency.error.value }}</li>
            <li v-if="items.error.value">Items: {{ items.error.value }}</li>
          </ul>
        </div>

        <!-- Loading States -->
        <div v-if="isLoading" class="loading-panel">
          <div class="loading-spinner"></div>
          <p>Loading POE2 data...</p>
        </div>

        <!-- Data Display -->
        <div v-else class="data-grid">
          <!-- Leagues Section -->
          <div class="data-section league-section">
            <h2>Leagues</h2>
            <div v-if="leagues.leagues.value.length > 0" class="leagues-list">
              <div 
                v-for="league in leagues.leagues.value" 
                :key="league.value"
                class="league-card"
                :class="{ 'current': league.value === leagues.currentLeague.value?.value }"
                @click="selectLeague(league)"
              >
                <h3>{{ league.value }}</h3>
              </div>
            </div>
            <p v-else class="no-data">No leagues data available</p>
          </div>

          <!-- Currency Section -->
          <div class="data-section">
            <div class="section-header">
              <h2>Top Currencies</h2>
              <div class="currency-controls">
                <button 
                  @click="currency.toggleSortOrder()"
                  class="sort-button"
                  :class="{ 'desc': currency.sortOrder.value === 'desc' }"
                >
                  {{ currency.sortOrder.value === 'asc' ? '🔼 Low to High' : '🔽 High to Low' }}
                </button>
                <button 
                  @click="currency.toggleExtendedList()"
                  class="toggle-button"
                  :class="{ 'active': currency.showExtended.value }"
                >
                  {{ currency.showExtended.value ? 'Show Less' : 'Show More' }}
                </button>
              </div>
            </div>
            
            <div v-if="currency.currencies.value.length > 0" class="currency-list">
              <div 
                v-for="curr in currency.topCurrencies.value" 
                :key="curr.apiId"
                class="currency-card"
              >
                <img v-if="curr.iconUrl" :src="curr.iconUrl" :alt="curr.name" class="currency-icon">
                <div class="currency-info">
                  <h4>{{ curr.name }}</h4>
                  <div class="prices">
                    <div class="comparison-values">
                      <!-- Use generalized price calculation -->
                      <template v-if="calculatePrice(curr).type === 'error'">
                        <span class="error-price">{{ calculatePrice(curr).error }}</span>
                      </template>
                      <template v-else-if="calculatePrice(curr).type === 'divine'">
                        <span class="divine-cost">{{ calculatePrice(curr).divine }} Divine per 1 item</span>
                        <span class="exalt-equivalent">{{ calculatePrice(curr).exalt }} Exalt per 1 item</span>
                      </template>
                      <template v-else>
                        <span class="exalt-cost">{{ calculatePrice(curr).exalt }} Exalt per 1 item</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="no-data">No currency data available</p>
            
            <div class="currency-note">
              <small v-if="getDivineToExaltRate() > 0">
                Current Exchange Rates: {{ getDivineToExaltRate().toFixed(0) }} Exalt = 1 Divine
              </small>
              <small v-else class="error-rate">
                Exchange Rate: Error loading rate data
              </small>
            </div>
          </div>
          <!-- Omens (Ritual) Section -->
          <div class="data-section">
            <div class="section-header">
              <h2>Ritual Omens</h2>
              <div class="currency-controls">
                <button @click="toggleSort('omens')" class="sort-button" :class="{ 'desc': sortOrder.omens === 'desc' }">
                  {{ sortOrder.omens === 'asc' ? '🔼 Low to High' : '🔽 High to Low' }}
                </button>
                <button @click="toggleShowMore('omens')" class="toggle-button" :class="{ 'active': showMore.omens }">
                  {{ showMore.omens ? 'Show Less' : 'Show More' }}
                </button>
              </div>
            </div>
            <div v-if="omenList.length > 0" class="currency-list">
              <div v-for="o in displayedOmenList" :key="o.name" class="currency-card">
                <img v-if="o.iconUrl" :src="o.iconUrl" :alt="o.name" class="currency-icon"/>
                <div class="currency-info">
                  <h4>{{ o.name }}</h4>
                  <div class="prices">
                    <div class="comparison-values">
                      <template v-if="getDivineToExaltRate() <= 0">
                        <span class="error-price">Rate Error</span>
                      </template>
                      <template v-else>
                        <template v-if="o.divineValue >= 1">
                          <span class="divine-cost">{{ o.divineValue.toFixed(3) }} Divine per 1 item</span>
                          <span class="exalt-equivalent">{{ (o.divineValue * getDivineToExaltRate()).toFixed(3) }} Exalt per 1 item</span>
                        </template>
                        <template v-else>
                          <span class="exalt-cost">{{ (o.divineValue * getDivineToExaltRate()).toFixed(3) }} Exalt per 1 item</span>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="no-data">No omen data available</p>
            <div class="currency-note">
              <small v-if="getDivineToExaltRate() > 0">
                Current Exchange Rates: {{ getDivineToExaltRate().toFixed(0) }} Exalt = 1 Divine
              </small>
              <small v-else class="error-rate">
                Exchange Rate: Error loading rate data
              </small>
            </div>
          </div>

          <!-- Abyss Section -->
          <div class="data-section">
            <div class="section-header">
              <h2>Abyssal Bones</h2>
              <div class="currency-controls">
                <button @click="toggleSort('abyss')" class="sort-button" :class="{ 'desc': sortOrder.abyss === 'desc' }">
                  {{ sortOrder.abyss === 'asc' ? '🔼 Low to High' : '🔽 High to Low' }}
                </button>
                <button @click="toggleShowMore('abyss')" class="toggle-button" :class="{ 'active': showMore.abyss }">
                  {{ showMore.abyss ? 'Show Less' : 'Show More' }}
                </button>
              </div>
            </div>
            <div v-if="abyssList.length > 0" class="currency-list">
              <div v-for="a in displayedAbyssList" :key="a.name" class="currency-card">
                <img v-if="a.iconUrl" :src="a.iconUrl" :alt="a.name" class="currency-icon"/>
                <div class="currency-info">
                  <h4>{{ a.name }}</h4>
                  <div class="prices">
                    <div class="comparison-values">
                      <template v-if="getDivineToExaltRate() <= 0">
                        <span class="error-price">Rate Error</span>
                      </template>
                      <template v-else>
                        <template v-if="a.divineValue >= 1">
                          <span class="divine-cost">{{ a.divineValue.toFixed(3) }} Divine per 1 item</span>
                          <span class="exalt-equivalent">{{ (a.divineValue * getDivineToExaltRate()).toFixed(3) }} Exalt per 1 item</span>
                        </template>
                        <template v-else>
                          <span class="exalt-cost">{{ (a.divineValue * getDivineToExaltRate()).toFixed(3) }} Exalt per 1 item</span>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="no-data">No abyss data available</p>
            <div class="currency-note">
              <small v-if="getDivineToExaltRate() > 0">
                Current Exchange Rates: {{ getDivineToExaltRate().toFixed(0) }} Exalt = 1 Divine
              </small>
              <small v-else class="error-rate">
                Exchange Rate: Error loading rate data
              </small>
            </div>
          </div>
        </div>
      </div>
          
      <!-- Profit Optimizer Tab -->
      <div v-if="currentTab === 'profit'" class="tab-panel">
        <ProfitOptimizer />
      </div>

      <!-- Debug Tab (Development Only) -->
      <div v-if="currentTab === 'debug' && isDevelopment" class="tab-panel">
        <div class="debug-panel">
          <h3>Debug Info</h3>
          <pre>{{ debugInfo }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePOE2Data } from '../composables/usePOE2'
import ProfitOptimizer from './ProfitOptimizer.vue'
import { poe2Api } from "../services/api"

// Tab management
const currentTab = ref('market')
const tabs = [
  { id: 'market', label: '🛍️ Market Overview' },
  { id: 'profit', label: '💵 Profit Optimizer' },
  ...(import.meta.env.VITE_ENABLE_DEBUG === 'true' ? [{ id: 'debug', label: '🐞 Debug' }] : [])
]

// Use the POE2 data composable
const { leagues, currency, items, connection, initializeData } = usePOE2Data()

// Function to get actual Divine to Exalt rate from API
const getDivineToExaltRate = () => {
  // Check if currencies are loaded
  if (!currency.currencies.value || currency.currencies.value.length === 0) {
    return -1
  }

  const divineCurrency = currency.currencies.value.find(c => c.apiId === 'divine')
  const exaltCurrency = currency.currencies.value.find(c => c.apiId === 'exalted')
  
  if (divineCurrency && exaltCurrency && exaltCurrency.divineValue > 0) {
    const rate = 1 / exaltCurrency.divineValue
    return rate
  }
  return -1
}

// Generalized price calculation function
const calculatePrice = (curr: any) => {
  const divineToExaltRate = getDivineToExaltRate()
  
  if (divineToExaltRate <= 0) {
    return {
      type: 'error',
      error: 'Rate Error'
    }
  }
  
  if (curr.divineValue >= 1) {
    const exaltEquivalent = curr.divineValue * divineToExaltRate
    return {
      type: 'divine',
      divine: curr.divineValue.toFixed(2),
      exalt: exaltEquivalent.toFixed(1)
    }
  } else {
    const exaltValue = curr.divineValue * divineToExaltRate
    return {
      type: 'exalt',
      exalt: exaltValue.toFixed(3)
    }
  }
}

// Function to select a league and update currency data
const selectLeague = async (league: any) => {
  leagues.changeLeague(league)
  await currency.fetchCraftingCurrency(league.value)
}

// Computed properties
const hasErrors = computed(() => 
  connection.error.value || leagues.error.value || currency.error.value || items.error.value
)

const isLoading = computed(() => 
  connection.loading.value || leagues.loading.value || currency.loading.value || items.loading.value
)

const isDevelopment = computed(() => 
  import.meta.env.VITE_ENABLE_DEBUG === 'true'
)

// Market overview: Omens & Abyss lists
const omenList = ref<{ name:string; iconUrl:string|null; divineValue:number }[]>([])
const abyssList = ref<{ name:string; iconUrl:string|null; divineValue:number }[]>([])
const sortOrder = ref<{ omens:'asc'|'desc'; abyss:'asc'|'desc' }>({ omens:'asc', abyss:'asc' })
const showMore = ref<{ omens:boolean; abyss:boolean }>({ omens:false, abyss:false })

const sortByDivine = (arr: any[], order: 'asc'|'desc') => {
  const sorted = [...arr].sort((a,b)=> order==='asc' ? a.divineValue - b.divineValue : b.divineValue - a.divineValue)
  return sorted
}

// Whitelist for "Show Less" view (specific omens to show)
const omenShowLessWhitelist = [
  'Omen of Homogenising Coronation',
  'Omen of Catalysing Exaltation',
  'Omen of Corruption',
  'Omen of Sinistral Necromancy',
  'Omen of Dextral Crystallisation',
  'Omen of Recombination',
  'Omen of Sinistral Crystallisation',
  'Omen of Abyssal Echoes',
  'Omen of Sanctification',
  'Omen of Dextral Erasure',
  'Omen of Whittling',
  'Omen of Dextral Annulment',
  'Omen of Sinistral Erasure',
  'Omen of Light',
  'Omen of Sinistral Annulment'
]

const displayedOmenList = computed(()=>{
  const sorted = sortByDivine(omenList.value, sortOrder.value.omens)
  if (showMore.value.omens) return sorted

  // Filter to whitelist, preserve sort order
  const filtered = sorted.filter(o => omenShowLessWhitelist.includes(o.name))
  return filtered
})
const displayedAbyssList = computed(()=>{
  const sorted = sortByDivine(abyssList.value, sortOrder.value.abyss)
  return showMore.value.abyss ? sorted : sorted.slice(0, 12)
})

const toggleSort = (which: 'omens'|'abyss') => {
  sortOrder.value[which] = sortOrder.value[which] === 'asc' ? 'desc' : 'asc'
}
const toggleShowMore = (which: 'omens'|'abyss') => {
  showMore.value[which] = !showMore.value[which]
}

async function fetchCategoryPrices(category: string) {
  try {
    const league = leagues.currentLeague.value?.value
    if (!league) return []
    const res = await poe2Api.getCurrency({ league, category, page: 1 })
    const dPrice = leagues.currentLeague.value?.divinePrice || 0
    const list = (res.items || [])
      .filter((it:any)=> it.currentPrice !== null)
      .map((it:any)=>({ name: it.text, iconUrl: it.iconUrl, divineValue: dPrice>0 ? (it.currentPrice!/dPrice) : 0 }))
    return list
  } catch (e) {
    console.error('fetchCategoryPrices error', category, e)
    return []
  }
}
const debugInfo = computed(() => ({
  connection: {
    isConnected: connection.isConnected.value,
    lastChecked: connection.lastChecked.value
  },
  leagues: {
    count: leagues.leagues.value.length,
    current: leagues.currentLeague.value?.value
  },
  currency: {
    count: currency.currencies.value.length
  },
  items: {
    count: items.items.value?.total || 0
  }
}))

// Initialize data on mount
onMounted(async () => {
  await initializeData()
  omenList.value = await fetchCategoryPrices("ritual")
  abyssList.value = await fetchCategoryPrices("abyss")
})
</script>

<style scoped>
.poe2-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.tab-button {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}

.tab-button:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab-button.active {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.tab-panel {
  padding: 0;
}

/* Connection Status */
.connection-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 2px solid;
}

.connection-status.connected {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.connection-status.disconnected {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.connected .dot {
  background-color: #10b981;
}

.disconnected .dot {
  background-color: #ef4444;
}

.actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  background-color: #f9fafb;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.primary {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

button.primary:hover:not(:disabled) {
  background-color: #2563eb;
}

/* Error Panel */
.error-panel {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin: 2rem;
}

.error-panel h3 {
  color: #dc2626;
  margin: 0 0 10px 0;
}

.error-panel ul {
  margin: 0;
  color: #991b1b;
}

/* Loading Panel */
.loading-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-left-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Data Grid */
.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  padding: 2rem;
}

.data-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.data-section h2 {
  margin: 0 0 16px 0;
  color: #374151;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 8px;
}

.data-section.league-section h2 {
  border-bottom: 2px solid white;
}

.league-section {
  background-color: #e7e7e7;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.currency-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-button, .toggle-button {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.sort-button:hover, .toggle-button:hover {
  border-color: #3b82f6;
  background-color: #f9fafb;
}

.sort-button.desc {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
.sort-button.desc:hover {
  color: #374151;
}

.toggle-button.active {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

/* League Cards */
.leagues-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.league-card {
  padding: 12px;
  border: 2px solid white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.league-card:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.league-card.current {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.league-card h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
}

/* Currency and Items */
.currency-list, .items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.currency-card, .item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #f3f4f6;
  border-radius: 6px;
  background-color: #fafafa;
}

.currency-icon, .item-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.currency-info, .item-info {
  flex: 1;
}

.currency-info h4, .item-info h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
}

.comparison-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.divine-cost {
  color: #f59e0b;
  font-weight: 600;
}

.exalt-cost, .exalt-equivalent {
  color: #8b5cf6;
  font-weight: 500;
}

.error-price {
  color: #ef4444;
  font-weight: 500;
}

.currency-note {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.error-rate {
  color: #ef4444;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 20px;
  font-style: italic;
}

/* Debug Panel */
.debug-panel {
  padding: 2rem;
}

.debug-panel h3 {
  margin-top: 0;
  color: #374151;
}

.debug-panel pre {
  background-color: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  color: #374151;
}

/* Responsive Design */
@media (max-width: 768px) {
  .poe2-dashboard {
    padding: 1rem;
  }
  
  .tab-navigation {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
  }
  
  .data-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .connection-status {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .actions {
    justify-content: center;
  }
}
</style>



