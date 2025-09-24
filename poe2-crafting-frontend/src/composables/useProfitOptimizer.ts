import { ref, computed, type Ref } from 'vue'
import { usePOE2Data } from './usePOE2'

// ==================== PROFIT CALCULATION TYPES ====================

interface CraftingCost {
  baseCost: number // ราคาของ base item
  materialsCost: number // ราคา currency/materials ที่ใช้
  expectedAttempts: number // จำนวน attempts ที่คาดว่าจะใช้
  totalCost: number // รวมต้นทุนทั้งหมด
}

interface CraftingProbability {
  successRate: number // โอกาสสำเร็จต่อครั้ง (0-1)
  expectedAttempts: number // จำนวนครั้งที่คาดว่าจะใช้
  variance: number // ความแปรปรวนของความน่าจะเป็น
}

interface MarketAnalysis {
  currentPrice: number // ราคาตลาดปัจจุบัน
  averagePrice: number // ราคาเฉลี่ย
  minPrice: number // ราคาต่ำสุด
  maxPrice: number // ราคาสูงสุด
  listings: number // จำนวน listings ในตลาด
  demand: 'high' | 'medium' | 'low' // ระดับความต้องการ
}

interface ProfitAnalysis {
  expectedRevenue: number // รายได้ที่คาดว่าจะได้
  totalCost: number // ต้นทุนรวม
  expectedProfit: number // กำไรที่คาดว่าจะได้
  profitMargin: number // เปอร์เซ็นต์กำไร
  roi: number // Return on Investment
  riskLevel: 'low' | 'medium' | 'high' // ระดับความเสี่ยง
  confidence: number // ความมั่นใจในการคำนวณ (0-100)
}

interface CraftingStrategy {
  itemType: string
  baseItem: string
  targetModifiers: string[]
  method: 'chaos' | 'essence' | 'fossil' | 'other'
  estimatedCost: CraftingCost
  probability: CraftingProbability
  marketData: MarketAnalysis
  profitAnalysis: ProfitAnalysis
  recommendation: 'highly-recommended' | 'recommended' | 'neutral' | 'not-recommended'
}

// ==================== PROFIT OPTIMIZATION COMPOSABLE ====================

export function useProfitOptimizer() {
  const poe2Data = usePOE2Data()
  
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const strategies = ref<CraftingStrategy[]>([])
  const selectedStrategy = ref<CraftingStrategy | null>(null)

  // Market API Integration (ใช้ APIs ที่เรา reverse engineer ไว้)
  const fetchMarketPrice = async (itemName: string, modifiers: string[], league: string): Promise<MarketAnalysis> => {
    try {
      // ใช้ POE2 Trade API ที่เราค้นพบ
      const searchResponse = await fetch(`https://www.pathofexile.com/api/trade2/search/${league}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Encoding': 'gzip, deflate, br',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          query: {
            status: { option: "online" },
            type: itemName,
            stats: modifiers.map(mod => ({
              type: "and",
              filters: [{ id: mod }]
            }))
          },
          sort: { price: "asc" }
        })
      })

      if (!searchResponse.ok) {
        throw new Error(`Search API failed: ${searchResponse.status}`)
      }

      const searchData = await searchResponse.json()
      const queryId = searchData.id
      const resultIds = searchData.result.slice(0, 20) // เอา 20 รายการแรก

      // Fetch รายละเอียดของ items
      const fetchResponse = await fetch(
        `https://www.pathofexile.com/api/trade2/fetch/${resultIds.join(',')}?query=${queryId}`,
        {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )

      if (!fetchResponse.ok) {
        throw new Error(`Fetch API failed: ${fetchResponse.status}`)
      }

      const fetchData = await fetchResponse.json()
      const prices = fetchData.result.map((item: any) => {
        const listing = item.listing
        if (listing && listing.price) {
          return listing.price.amount || 0
        }
        return 0
      }).filter((price: number) => price > 0)

      if (prices.length === 0) {
        return {
          currentPrice: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          listings: 0,
          demand: 'low'
        }
      }

      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const averagePrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length

      return {
        currentPrice: prices[0] || 0,
        averagePrice,
        minPrice,
        maxPrice,
        listings: prices.length,
        demand: prices.length > 10 ? 'high' : prices.length > 5 ? 'medium' : 'low'
      }

    } catch (err) {
      console.error('Market price fetch error:', err)
      return {
        currentPrice: 0,
        averagePrice: 0,
        minPrice: 0,
        maxPrice: 0,
        listings: 0,
        demand: 'low'
      }
    }
  }

  // Probability calculation based on POE2 crafting mechanics
  const calculateCraftingProbability = (method: string, targetModifiers: string[]): CraftingProbability => {
    let baseSuccessRate = 0
    
    switch (method) {
      case 'chaos':
        // Chaos Orb มี chance ต่ำในการได้ modifiers ที่ต้องการ
        baseSuccessRate = 0.01 // 1% per attempt
        break
      case 'essence':
        // Essence มี chance สูงกว่าเพราะ guarantee modifier หนึ่งตัว
        baseSuccessRate = 0.05 // 5% per attempt
        break
      case 'fossil':
        // Fossil มี chance ปานกลางแต่มี bias ต่อ modifier บางตัว
        baseSuccessRate = 0.03 // 3% per attempt
        break
      default:
        baseSuccessRate = 0.02 // 2% default
    }

    // Adjust based on number of target modifiers (more mods = lower chance)
    const adjustedRate = baseSuccessRate / Math.pow(targetModifiers.length, 1.5)
    const expectedAttempts = 1 / adjustedRate
    const variance = expectedAttempts * 0.5 // 50% variance

    return {
      successRate: Math.min(adjustedRate, 0.1), // Cap at 10%
      expectedAttempts: Math.ceil(expectedAttempts),
      variance
    }
  }

  // Cost calculation
  const calculateCraftingCost = async (
    baseItemPrice: number, 
    method: string, 
    probability: CraftingProbability,
    league: string
  ): Promise<CraftingCost> => {
    // Get currency prices from our existing API
    const currencyData = poe2Data.currency.currencies.value
    
    let materialCostPerAttempt = 0
    
    switch (method) {
      case 'chaos':
        const chaosPrice = currencyData?.find(c => c.name === 'Chaos Orb')?.chaosValue || 1
        materialCostPerAttempt = chaosPrice
        break
      case 'essence':
        materialCostPerAttempt = 2 // Average essence cost
        break
      case 'fossil':
        materialCostPerAttempt = 1.5 // Average fossil cost
        break
      default:
        materialCostPerAttempt = 1
    }

    const totalMaterialsCost = materialCostPerAttempt * probability.expectedAttempts
    const totalCost = baseItemPrice + totalMaterialsCost

    return {
      baseCost: baseItemPrice,
      materialsCost: totalMaterialsCost,
      expectedAttempts: probability.expectedAttempts,
      totalCost
    }
  }

  // Main profit analysis function
  const analyzeProfitability = async (
    itemType: string,
    baseItem: string,
    targetModifiers: string[],
    method: string,
    league: string
  ): Promise<ProfitAnalysis> => {
    try {
      // 1. Get market data
      const marketData = await fetchMarketPrice(itemType, targetModifiers, league)
      
      // 2. Calculate probability
      const probability = calculateCraftingProbability(method, targetModifiers)
      
      // 3. Calculate costs
      const baseItemPrice = 10 // Placeholder - should get from market
      const costs = await calculateCraftingCost(baseItemPrice, method, probability, league)
      
      // 4. Calculate profit
      const expectedRevenue = marketData.averagePrice || marketData.currentPrice
      const expectedProfit = expectedRevenue - costs.totalCost
      const profitMargin = expectedRevenue > 0 ? (expectedProfit / expectedRevenue) * 100 : 0
      const roi = costs.totalCost > 0 ? (expectedProfit / costs.totalCost) * 100 : 0
      
      // 5. Risk assessment
      let riskLevel: 'low' | 'medium' | 'high' = 'medium'
      if (marketData.listings < 5) riskLevel = 'high'
      else if (marketData.listings > 15) riskLevel = 'low'
      
      // 6. Confidence calculation
      const confidence = Math.min(
        (marketData.listings / 20) * 50 + // Market data confidence
        (probability.successRate > 0.01 ? 30 : 10) + // Probability confidence
        20, // Base confidence
        100
      )

      return {
        expectedRevenue,
        totalCost: costs.totalCost,
        expectedProfit,
        profitMargin,
        roi,
        riskLevel,
        confidence
      }

    } catch (err) {
      console.error('Profit analysis error:', err)
      throw err
    }
  }

  // Generate optimized crafting strategies
  const generateStrategies = async (league: string): Promise<void> => {
    loading.value = true
    error.value = null
    strategies.value = []

    try {
      // Define common profitable crafting targets
      const targets = [
        {
          itemType: 'Two Hand Sword',
          baseItem: 'Iron Greatsword',
          modifiers: ['Physical Damage', 'Critical Strike Chance'],
          method: 'essence' as const
        },
        {
          itemType: 'Body Armour',
          baseItem: 'Plate Vest',
          modifiers: ['Life', 'Resistances'],
          method: 'chaos' as const
        },
        {
          itemType: 'Helmet',
          baseItem: 'Iron Hat',
          modifiers: ['Life', 'Resistances', 'Armour'],
          method: 'fossil' as const
        }
      ]

      const results: CraftingStrategy[] = []

      for (const target of targets) {
        try {
          const probability = calculateCraftingProbability(target.method, target.modifiers)
          const marketData = await fetchMarketPrice(target.itemType, target.modifiers, league)
          const costs = await calculateCraftingCost(10, target.method, probability, league) // 10 = base price
          const profitAnalysis = await analyzeProfitability(
            target.itemType,
            target.baseItem,
            target.modifiers,
            target.method,
            league
          )

          let recommendation: CraftingStrategy['recommendation'] = 'neutral'
          if (profitAnalysis.roi > 50 && profitAnalysis.riskLevel === 'low') {
            recommendation = 'highly-recommended'
          } else if (profitAnalysis.roi > 20) {
            recommendation = 'recommended'
          } else if (profitAnalysis.roi < 0) {
            recommendation = 'not-recommended'
          }

          results.push({
            itemType: target.itemType,
            baseItem: target.baseItem,
            targetModifiers: target.modifiers,
            method: target.method,
            estimatedCost: costs,
            probability,
            marketData,
            profitAnalysis,
            recommendation
          })
        } catch (err) {
          console.error(`Error analyzing ${target.itemType}:`, err)
        }
      }

      // Sort by profitability
      strategies.value = results.sort((a, b) => b.profitAnalysis.roi - a.profitAnalysis.roi)

    } catch (err: any) {
      error.value = err.message || 'Failed to generate strategies'
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const bestStrategy = computed(() => {
    return strategies.value[0] || null
  })

  const profitableStrategies = computed(() => {
    return strategies.value.filter(s => s.profitAnalysis.expectedProfit > 0)
  })

  const totalPotentialProfit = computed(() => {
    return strategies.value.reduce((sum, strategy) => sum + strategy.profitAnalysis.expectedProfit, 0)
  })

  return {
    // State
    loading,
    error,
    strategies,
    selectedStrategy,
    
    // Actions
    generateStrategies,
    analyzeProfitability,
    
    // Computed
    bestStrategy,
    profitableStrategies,
    totalPotentialProfit
  }
}