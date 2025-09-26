import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

// ==================== TYPES ====================

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface League {
  value: string
  divinePrice: number
  chaosDivinePrice: number
}

export interface CraftingCurrency {
  apiId: string
  name: string
  currentPrice: number
  divineValue: number
  chaosValue: number
  iconUrl: string
  lastUpdated: string
}

export interface CurrencyItem {
  id: number
  itemId: number
  currencyCategoryId: number
  apiId: string
  text: string
  categoryApiId: string
  iconUrl: string | null
  itemMetadata: object | null
  currentPrice: number | null
}

export interface CurrencyResponse {
  currentPage: number
  pages: number
  total: number
  items: CurrencyItem[]
}

export interface UniqueItem {
  id: number
  itemId: number
  iconUrl: string | null
  text: string
  name: string
  categoryApiId: string
  type: string
  currentPrice: number | null
}

export interface ItemsResponse {
  currentPage: number
  pages: number
  total: number
  items: UniqueItem[]
}

export interface Category {
  id: number
  apiId: string
  label: string
  icon: string
}

export interface CategoriesResponse {
  unique_categories: Category[]
  currency_categories: Category[]
}

// ==================== API CLIENT ====================

class POE2ApiClient {
  private api: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[API] Request error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[API] Response: ${response.status}`)
        return response
      },
      (error) => {
        console.error('[API] Response error:', error.response?.data || error.message)
        
        // Handle common errors
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please try again later.')
        }
        
        if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.')
        }
        
        throw error
      }
    )
  }

  // ==================== HEALTH & INFO ====================

  async checkHealth(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.get('/health')
      return response.data
    } catch (error) {
      console.error('[API] Health check failed:', error)
      throw error
    }
  }

  // ==================== LEAGUES ====================

  async getLeagues(): Promise<League[]> {
    try {
      const response: AxiosResponse<ApiResponse<League[]>> = await this.api.get('/api/leagues')
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching leagues:', error)
      throw error
    }
  }

  async getCurrentLeague(): Promise<League> {
    try {
      const response: AxiosResponse<ApiResponse<League>> = await this.api.get('/api/leagues/current')
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching current league:', error)
      throw error
    }
  }

  // ==================== CURRENCY ====================

  async getCurrency(params?: {
    league?: string
    category?: string
    page?: number
  }): Promise<CurrencyResponse> {
    try {
      const response: AxiosResponse<ApiResponse<CurrencyResponse>> = await this.api.get('/api/currency', {
        params
      })
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching currency:', error)
      throw error
    }
  }

  async getCraftingCurrency(league?: string): Promise<CraftingCurrency[]> {
    try {
      const response: AxiosResponse<ApiResponse<CraftingCurrency[]>> = await this.api.get('/api/currency/crafting', {
        params: { league }
      })
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching crafting currency:', error)
      throw error
    }
  }

  async getCurrencyExchange(league?: string): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/api/currency/exchange', {
        params: { league }
      })
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching currency exchange:', error)
      throw error
    }
  }

  async getCurrencyPairs(league?: string): Promise<any[]> {
    try {
      const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/api/currency/pairs', {
        params: { league }
      })
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching currency pairs:', error)
      throw error
    }
  }

  // ==================== ITEMS ====================

  async getItems(params?: {
    league?: string
    page?: number
  }): Promise<ItemsResponse> {
    try {
      const response: AxiosResponse<ApiResponse<ItemsResponse>> = await this.api.get('/api/items', {
        params
      })
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching items:', error)
      throw error
    }
  }
/*
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response: AxiosResponse<ApiResponse<CategoriesResponse>> = await this.api.get('/api/items/categories')
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching categories:', error)
      throw error
    }
  }
*/
  // ==================== UTILITY ====================

  async clearCache(): Promise<void> {
    try {
      await this.api.post('/api/cache/clear')
      console.log('[API] Cache cleared successfully')
    } catch (error) {
      console.error('[API] Error clearing cache:', error)
      throw error
    }
  }

  async getCacheStats(): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/api/cache/stats')
      return response.data.data
    } catch (error) {
      console.error('[API] Error fetching cache stats:', error)
      throw error
    }
  }

  // ==================== CONNECTION TEST ====================

  async testConnection(): Promise<boolean> {
    try {
      await this.checkHealth()
      return true
    } catch (error) {
      console.error('[API] Connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const poe2Api = new POE2ApiClient()
export default poe2Api
