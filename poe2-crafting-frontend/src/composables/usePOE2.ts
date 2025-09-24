import { ref, computed, type Ref } from 'vue'
import { poe2Api, type League, type CraftingCurrency, type CurrencyResponse, type ItemsResponse, type CategoriesResponse } from '../services/api'

// ==================== COMPOSABLE TYPES ====================

interface UseApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  refresh: () => Promise<void>
}

// ==================== LEAGUES COMPOSABLE ====================

export function useLeagues() {
  const leagues = ref<League[]>([])
  const currentLeague = ref<League | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchLeagues = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await poe2Api.getLeagues()
      
      // Filter out Standard and Hardcore leagues, but keep HC Rise and HC Dawn
      const filteredLeagues = data.filter(league => {
        const name = league.value.toLowerCase()
        
        // Keep HC Rise of the Abyssal and HC Dawn of the Hunt
        if (name.includes('hardcore rise of the abyssal') || name.includes('hardcore dawn of the hunt')) {
          return true
        }
        
        // Remove all other Hardcore and Standard leagues
        if (name.includes('standard') || name.includes('hardcore')) {
          return false
        }
        
        // Keep all other leagues
        return true
      })
      
      // Sort leagues in specific order: Non-HC first, then HC versions
      const sortedLeagues = filteredLeagues.sort((a, b) => {
        const aName = a.value.toLowerCase()
        const bName = b.value.toLowerCase()
        
        // Define priority order
        const getOrderPriority = (name: string) => {
          if (name.includes('rise of the abyssal') && !name.includes('hardcore')) return 1 // Rise Of the Abyssal
          if (name.includes('hardcore rise of the abyssal')) return 2                        // HC Rise Of the Abyssal
          if (name.includes('dawn of the hunt') && !name.includes('hardcore')) return 3     // Dawn of the Hunt
          if (name.includes('hardcore dawn of the hunt')) return 4                          // HC Dawn of the Hunt
          return 999 // Other leagues at the end
        }
        
        const aPriority = getOrderPriority(aName)
        const bPriority = getOrderPriority(bName)
        
        return aPriority - bPriority
      })
      
      leagues.value = sortedLeagues
      
      // Set current league (Rise of the Abyssal by default)
      if (sortedLeagues.length > 0) {
        currentLeague.value = sortedLeagues[0]
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch leagues'
      console.error('Error fetching leagues:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCurrentLeague = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await poe2Api.getCurrentLeague()
      currentLeague.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch current league'
      console.error('Error fetching current league:', err)
    } finally {
      loading.value = false
    }
  }

  // Function to change current league
  const changeLeague = (league: League) => {
    currentLeague.value = league
  }

  // Computed properties
  const leagueNames = computed(() => leagues.value?.map(league => league.value) || [])
  const currentLeagueName = computed(() => currentLeague.value?.value || '')

  return {
    // State
    leagues,
    currentLeague,
    loading,
    error,
    
    // Actions
    fetchLeagues,
    fetchCurrentLeague,
    changeLeague,
    
    // Computed
    leagueNames,
    currentLeagueName
  }
}

// ==================== CURRENCY COMPOSABLE ====================

export function useCurrency(league?: string) {
  const currencies = ref<CraftingCurrency[]>([])
  const currencyData = ref<CurrencyResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('asc') // Default: low to high
  const showExtended = ref(false) // Show extended currency list

  // Define currency lists
  const basicCurrencyIds = [
    'divine', 'chaos', 'exalted', 'ancient', 'fusing',
    'alchemy', 'chromatic', 'jewellers', 'regal',
    'mirror', 'hinekoras-lock'  // ใช้ 'mirror' ตาม API ID จาก list
  ]

  const extendedCurrencyIds = [
    'chance', 'vaal', 'annul', 'fracturing-orb', 
    'perfect-jewellers-orb', 'artificers-orb', 'greater-chaos-orb', 'greater-exalted-orb'
  ]

  const fetchCraftingCurrency = async (leagueName?: string) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('Fetching crafting currency for league:', leagueName)
      const data = await poe2Api.getCraftingCurrency(leagueName)
      currencies.value = data
      console.log('Successfully fetched', data.length, 'currencies for league:', leagueName)
      console.log('Available currency apiIds:', data.map(c => c.apiId).sort())
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch crafting currency'
      console.error('Error fetching crafting currency:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCurrency = async (params?: {
    league?: string
    category?: string
    page?: number
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await poe2Api.getCurrency({
        league: league,
        ...params
      })
      currencyData.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch currency'
      console.error('Error fetching currency:', err)
    } finally {
      loading.value = false
    }
  }

  // Get currency by API ID
  const getCurrencyByApiId = (apiId: string) => {
    return currencies.value.find(currency => currency.apiId === apiId)
  }

  // Get currency price in divine only
  const getCurrencyPrice = (apiId: string) => {
    const currency = getCurrencyByApiId(apiId)
    if (!currency) return -1 // error fallback - don't assume any price
    
    return currency.divineValue
  }

  // Helper function to get comparison value (divine only)
  const getComparisonValue = (currency: CraftingCurrency) => {
    // Use divineValue directly for all currencies
    return currency.divineValue
  }

  // Get currencies to display based on current settings
  const displayedCurrencyIds = computed(() => {
    return showExtended.value 
      ? [...basicCurrencyIds, ...extendedCurrencyIds]
      : basicCurrencyIds
  })

  // Filter and sort currencies for display
  const topCurrencies = computed(() => {
    if (!currencies.value) return []
    
    // Filter currencies by the displayed IDs
    const filtered = currencies.value.filter(currency => 
      displayedCurrencyIds.value.includes(currency.apiId)
    )
    
    // Sort based on current sort order
    const sorted = [...filtered].sort((a, b) => {
      const aValue = getComparisonValue(a)
      const bValue = getComparisonValue(b)
      
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    return sorted
  })

  // Toggle sort order function
  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  // Toggle extended currency list
  const toggleExtendedList = () => {
    showExtended.value = !showExtended.value
  }

  // Legacy computed properties for backward compatibility
  const sortedCurrencies = computed(() => topCurrencies.value)
  const expensiveCurrencies = computed(() => topCurrencies.value)

  return {
    // State
    currencies,
    currencyData,
    loading,
    error,
    sortOrder,
    showExtended,
    
    // Actions
    fetchCraftingCurrency,
    fetchCurrency,
    getCurrencyByApiId,
    getCurrencyPrice,
    toggleSortOrder,
    toggleExtendedList,
    
    // Computed
    topCurrencies,
    sortedCurrencies,
    expensiveCurrencies,
    displayedCurrencyIds
  }
}

// ==================== ITEMS COMPOSABLE ====================

export function useItems(league?: string) {
  const items = ref<ItemsResponse | null>(null)
  const categories = ref<CategoriesResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchItems = async (params?: {
    league?: string
    page?: number
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const data = await poe2Api.getItems({
        league: league,
        ...params
      })
      items.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch items'
      console.error('Error fetching items:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    
    try {
      const data = await poe2Api.getCategories()
      categories.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Get item by name
  const getItemByName = (name: string) => {
    if (!items.value?.items) return null
    return items.value.items.find(item => item.name.toLowerCase() === name.toLowerCase())
  }

  // Filter items by category
  const getItemsByCategory = (categoryApiId: string) => {
    if (!items.value?.items) return []
    return items.value.items.filter(item => item.categoryApiId === categoryApiId)
  }

  // Computed properties
  const uniqueCategories = computed(() => categories.value?.unique_categories || [])
  const currencyCategories = computed(() => categories.value?.currency_categories || [])
  
  const expensiveItems = computed(() => {
    if (!items.value || !items.value.items) {
      return []
    }
    return items.value.items.filter(item => 
      item.currentPrice !== null && item.currentPrice > 10
    )
  })

  return {
    // State
    items,
    categories,
    loading,
    error,
    
    // Actions
    fetchItems,
    fetchCategories,
    getItemByName,
    getItemsByCategory,
    
    // Computed
    uniqueCategories,
    currencyCategories,
    expensiveItems
  }
}

// ==================== CONNECTION COMPOSABLE ====================

export function useConnection() {
  const isConnected = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastChecked = ref<Date | null>(null)

  const checkConnection = async () => {
    loading.value = true
    error.value = null
    
    try {
      const connected = await poe2Api.testConnection()
      isConnected.value = connected
      lastChecked.value = new Date()
      
      if (!connected) {
        error.value = 'Unable to connect to backend API'
      }
    } catch (err: any) {
      error.value = err.message || 'Connection check failed'
      isConnected.value = false
      console.error('Connection check error:', err)
    } finally {
      loading.value = false
    }
  }

  const clearCache = async () => {
    try {
      await poe2Api.clearCache()
    } catch (err: any) {
      error.value = err.message || 'Failed to clear cache'
      throw err
    }
  }

  // Auto-check connection on mount
  checkConnection()

  return {
    // State
    isConnected,
    loading,
    error,
    lastChecked,
    
    // Actions
    checkConnection,
    clearCache
  }
}

// ==================== GLOBAL COMPOSABLE ====================

export function usePOE2Data() {
  const leagues = useLeagues()
  const currency = useCurrency()
  const items = useItems()
  const connection = useConnection()

  // Initialize data when connected
  const initializeData = async () => {
    if (!connection.isConnected.value) {
      await connection.checkConnection()
    }

    if (connection.isConnected.value) {
      // Step 1: Load leagues first
      await leagues.fetchLeagues()
      
      // Step 2: Load currency for the current league (after leagues are loaded)
      if (leagues.currentLeague.value) {
        await currency.fetchCraftingCurrency(leagues.currentLeague.value.value)
      } else {
        // Fallback: load without league parameter
        await currency.fetchCraftingCurrency()
      }
      
      // Step 3: Load other data
      await Promise.all([
        items.fetchCategories(),
        leagues.currentLeague.value ? items.fetchItems({
          league: leagues.currentLeague.value.value
        }) : Promise.resolve()
      ])
    }
  }

  return {
    // Sub-composables
    leagues: {
      ...leagues,
      changeLeague: leagues.changeLeague
    },
    currency,
    items,
    connection,
    
    // Global actions
    initializeData
  }
}