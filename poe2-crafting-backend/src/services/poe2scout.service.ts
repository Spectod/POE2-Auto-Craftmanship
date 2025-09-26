import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LeagueResponse,
  GetCurrencyItemsResponse,
  GetUniqueItemsResponse,
  GetCurrencyExchangeModel,
  GetCurrentSnapshotPairModel,
  CategoryResponse,
  CraftingCurrency,
  HTTPValidationError,
  PriceLogEntry
} from '../types/poe2scout.types';

/**
 * POE2 Scout API Service
 * Handles all API calls to poe2scout.com
 */
export class POE2ScoutService {
  private api: AxiosInstance;
  private baseURL = 'https://poe2scout.com/api';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'POE2-Auto-Craftmanship/1.0.0'
      }
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 422) {
          console.error('[API] Validation Error:', error.response.data);
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== CACHE METHODS ====================

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}_${paramString}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`[CACHE] Hit: ${key}`);
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    console.log(`[CACHE] Set: ${key}`);
  }

  // ==================== LEAGUE METHODS ====================

  /**
   * Get all available leagues with currency rates
   */
  async getLeagues(): Promise<LeagueResponse[]> {
    const cacheKey = this.getCacheKey('/leagues');
    const cached = this.getFromCache<LeagueResponse[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse<LeagueResponse[]> = await this.api.get('/leagues');
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching leagues:', error);
      throw error;
    }
  }

  /**
   * Get current active league (usually the first one)
   */
  async getCurrentLeague(): Promise<LeagueResponse> {
    const leagues = await this.getLeagues();
    return leagues[0]; // First league is usually the current one
  }

  // ==================== CURRENCY METHODS ====================

  /**
   * Get currency items for a specific category and league
   */
  async getCurrencyItems(
    category: string = 'currency',
    league?: string,
    page: number = 1
  ): Promise<GetCurrencyItemsResponse> {
    if (!league) {
      const currentLeague = await this.getCurrentLeague();
      league = currentLeague.value;
    }

    const cacheKey = this.getCacheKey(`/items/currency/${category}`, { league, page });
    const cached = this.getFromCache<GetCurrencyItemsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse<GetCurrencyItemsResponse> = await this.api.get(
        `/items/currency/${category}`,
        { params: { league, page } }
      );
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching currency items:', error);
      throw error;
    }
  }

  /**
   * Get all currency items for crafting calculations
   */
  async getAllCurrencyForCrafting(league?: string): Promise<CraftingCurrency[]> {
    // Get league-specific currency data
    const currencyData = await this.getCurrencyItems('currency', league);
    
    // Get league-specific info for price calculations
    let leagueInfo: LeagueResponse;
    if (league) {
      // Find the specific league info
      const leagues = await this.getLeagues();
      leagueInfo = leagues.find(l => l.value === league) || leagues[0];
      console.log(`Using league info for: ${league}`, leagueInfo);
    } else {
      leagueInfo = await this.getCurrentLeague();
    }

    return currencyData.items
      .filter(item => item.currentPrice !== null)
      .map(item => ({
        apiId: item.apiId,
        name: item.text,
        currentPrice: item.currentPrice!,
        divineValue: item.currentPrice! / leagueInfo.divinePrice,
        chaosValue: item.currentPrice! * leagueInfo.chaosDivinePrice,
        iconUrl: item.iconUrl || '',
        lastUpdated: new Date().toISOString()
      }));
  }

  // ==================== CURRENCY EXCHANGE METHODS ====================

  /**
   * Get current currency exchange snapshot
   */
  async getCurrencyExchangeSnapshot(league?: string): Promise<GetCurrencyExchangeModel> {
    if (!league) {
      const currentLeague = await this.getCurrentLeague();
      league = currentLeague.value;
    }

    const cacheKey = this.getCacheKey('/currencyExchangeSnapshot', { league });
    const cached = this.getFromCache<GetCurrencyExchangeModel>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse<GetCurrencyExchangeModel> = await this.api.get(
        '/currencyExchangeSnapshot',
        { params: { league } }
      );
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching currency exchange snapshot:', error);
      throw error;
    }
  }

  /**
   * Get currency exchange pairs data
   */
  async getCurrencyExchangePairs(league?: string): Promise<GetCurrentSnapshotPairModel[]> {
    if (!league) {
      const currentLeague = await this.getCurrentLeague();
      league = currentLeague.value;
    }

    const cacheKey = this.getCacheKey('/currencyExchange/SnapshotPairs', { league });
    const cached = this.getFromCache<GetCurrentSnapshotPairModel[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse<GetCurrentSnapshotPairModel[]> = await this.api.get(
        '/currencyExchange/SnapshotPairs',
        { params: { league } }
      );
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching currency exchange pairs:', error);
      throw error;
    }
  }

  // ==================== ITEMS METHODS ====================

  /**
   * Get unique items for a specific league
   */
  async getUniqueItems(league?: string, page: number = 1): Promise<GetUniqueItemsResponse> {
    if (!league) {
      const currentLeague = await this.getCurrentLeague();
      league = currentLeague.value;
    }

    const cacheKey = this.getCacheKey('/items', { league, page });
    const cached = this.getFromCache<GetUniqueItemsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse<GetUniqueItemsResponse> = await this.api.get('/items', {
        params: { league, page }
      });
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching unique items:', error);
      throw error;
    }
  }

  /**
   * Get item categories
   */
  async getCategories(): Promise<CategoryResponse> {
    const cacheKey = this.getCacheKey('/items/categories');
    const cached = this.getFromCache<CategoryResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse<CategoryResponse> = await this.api.get('/items/categories');
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching categories:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get exchange rate between two currencies
   */
  async getCurrencyExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    league?: string
  ): Promise<number | null> {
    try {
      const pairs = await this.getCurrencyExchangePairs(league);
      
      const pair = pairs.find(p => 
        (p.CurrencyOne.apiId === fromCurrency && p.CurrencyTwo.apiId === toCurrency) ||
        (p.CurrencyOne.apiId === toCurrency && p.CurrencyTwo.apiId === fromCurrency)
      );

      if (!pair) return null;

      // Calculate exchange rate
      if (pair.CurrencyOne.apiId === fromCurrency) {
        return parseFloat(pair.CurrencyOneData.RelativePrice);
      } else {
        return 1 / parseFloat(pair.CurrencyTwoData.RelativePrice);
      }
    } catch (error) {
      console.error('[API] Error getting exchange rate:', error);
      return null;
    }
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[CACHE] Cleared all cache');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

