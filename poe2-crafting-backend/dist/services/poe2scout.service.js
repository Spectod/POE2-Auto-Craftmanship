"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POE2ScoutService = void 0;
const axios_1 = __importDefault(require("axios"));
class POE2ScoutService {
    constructor() {
        this.baseURL = 'https://poe2scout.com/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000;
        this.api = axios_1.default.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'POE2-Auto-Craftmanship/1.0.0'
            }
        });
        this.api.interceptors.request.use((config) => {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => Promise.reject(error));
        this.api.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 422) {
                console.error('[API] Validation Error:', error.response.data);
            }
            return Promise.reject(error);
        });
    }
    getCacheKey(endpoint, params) {
        const paramString = params ? JSON.stringify(params) : '';
        return `${endpoint}_${paramString}`;
    }
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log(`[CACHE] Hit: ${key}`);
            return cached.data;
        }
        return null;
    }
    setCache(key, data) {
        this.cache.set(key, { data, timestamp: Date.now() });
        console.log(`[CACHE] Set: ${key}`);
    }
    async getLeagues() {
        const cacheKey = this.getCacheKey('/leagues');
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.api.get('/leagues');
            this.setCache(cacheKey, response.data);
            return response.data;
        }
        catch (error) {
            console.error('[API] Error fetching leagues:', error);
            throw error;
        }
    }
    async getCurrentLeague() {
        const leagues = await this.getLeagues();
        return leagues[0];
    }
    async getCurrencyItems(category = 'currency', league, page = 1) {
        if (!league) {
            const currentLeague = await this.getCurrentLeague();
            league = currentLeague.value;
        }
        const cacheKey = this.getCacheKey(`/items/currency/${category}`, { league, page });
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.api.get(`/items/currency/${category}`, { params: { league, page } });
            this.setCache(cacheKey, response.data);
            return response.data;
        }
        catch (error) {
            console.error('[API] Error fetching currency items:', error);
            throw error;
        }
    }
    async getAllCurrencyForCrafting(league) {
        const currencyData = await this.getCurrencyItems('currency', league);
        let leagueInfo;
        if (league) {
            const leagues = await this.getLeagues();
            leagueInfo = leagues.find(l => l.value === league) || leagues[0];
            console.log(`Using league info for: ${league}`, leagueInfo);
        }
        else {
            leagueInfo = await this.getCurrentLeague();
        }
        return currencyData.items
            .filter(item => item.currentPrice !== null)
            .map(item => ({
            apiId: item.apiId,
            name: item.text,
            currentPrice: item.currentPrice,
            divineValue: item.currentPrice / leagueInfo.divinePrice,
            chaosValue: item.currentPrice * leagueInfo.chaosDivinePrice,
            iconUrl: item.iconUrl || '',
            lastUpdated: new Date().toISOString()
        }));
    }
    async getCurrencyExchangeSnapshot(league) {
        if (!league) {
            const currentLeague = await this.getCurrentLeague();
            league = currentLeague.value;
        }
        const cacheKey = this.getCacheKey('/currencyExchangeSnapshot', { league });
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.api.get('/currencyExchangeSnapshot', { params: { league } });
            this.setCache(cacheKey, response.data);
            return response.data;
        }
        catch (error) {
            console.error('[API] Error fetching currency exchange snapshot:', error);
            throw error;
        }
    }
    async getCurrencyExchangePairs(league) {
        if (!league) {
            const currentLeague = await this.getCurrentLeague();
            league = currentLeague.value;
        }
        const cacheKey = this.getCacheKey('/currencyExchange/SnapshotPairs', { league });
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.api.get('/currencyExchange/SnapshotPairs', { params: { league } });
            this.setCache(cacheKey, response.data);
            return response.data;
        }
        catch (error) {
            console.error('[API] Error fetching currency exchange pairs:', error);
            throw error;
        }
    }
    async getUniqueItems(league, page = 1) {
        if (!league) {
            const currentLeague = await this.getCurrentLeague();
            league = currentLeague.value;
        }
        const cacheKey = this.getCacheKey('/items', { league, page });
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.api.get('/items', {
                params: { league, page }
            });
            this.setCache(cacheKey, response.data);
            return response.data;
        }
        catch (error) {
            console.error('[API] Error fetching unique items:', error);
            throw error;
        }
    }
    async getCategories() {
        const cacheKey = this.getCacheKey('/items/categories');
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        try {
            const response = await this.api.get('/items/categories');
            this.setCache(cacheKey, response.data);
            return response.data;
        }
        catch (error) {
            console.error('[API] Error fetching categories:', error);
            throw error;
        }
    }
    async getCurrencyExchangeRate(fromCurrency, toCurrency, league) {
        try {
            const pairs = await this.getCurrencyExchangePairs(league);
            const pair = pairs.find(p => (p.CurrencyOne.apiId === fromCurrency && p.CurrencyTwo.apiId === toCurrency) ||
                (p.CurrencyOne.apiId === toCurrency && p.CurrencyTwo.apiId === fromCurrency));
            if (!pair)
                return null;
            if (pair.CurrencyOne.apiId === fromCurrency) {
                return parseFloat(pair.CurrencyOneData.RelativePrice);
            }
            else {
                return 1 / parseFloat(pair.CurrencyTwoData.RelativePrice);
            }
        }
        catch (error) {
            console.error('[API] Error getting exchange rate:', error);
            return null;
        }
    }
    clearCache() {
        this.cache.clear();
        console.log('[CACHE] Cleared all cache');
    }
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
exports.POE2ScoutService = POE2ScoutService;
//# sourceMappingURL=poe2scout.service.js.map