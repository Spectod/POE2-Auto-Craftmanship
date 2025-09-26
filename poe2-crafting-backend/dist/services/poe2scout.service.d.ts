import { LeagueResponse, GetCurrencyItemsResponse, GetUniqueItemsResponse, GetCurrencyExchangeModel, GetCurrentSnapshotPairModel, CategoryResponse, CraftingCurrency } from '../types/poe2scout.types';
export declare class POE2ScoutService {
    private api;
    private baseURL;
    private cache;
    private cacheTimeout;
    constructor();
    private getCacheKey;
    private getFromCache;
    private setCache;
    getLeagues(): Promise<LeagueResponse[]>;
    getCurrentLeague(): Promise<LeagueResponse>;
    getCurrencyItems(category?: string, league?: string, page?: number): Promise<GetCurrencyItemsResponse>;
    getAllCurrencyForCrafting(league?: string): Promise<CraftingCurrency[]>;
    getCurrencyExchangeSnapshot(league?: string): Promise<GetCurrencyExchangeModel>;
    getCurrencyExchangePairs(league?: string): Promise<GetCurrentSnapshotPairModel[]>;
    getUniqueItems(league?: string, page?: number): Promise<GetUniqueItemsResponse>;
    getCategories(): Promise<CategoryResponse>;
    getCurrencyExchangeRate(fromCurrency: string, toCurrency: string, league?: string): Promise<number | null>;
    clearCache(): void;
    getCacheStats(): {
        size: number;
        keys: string[];
    };
}
//# sourceMappingURL=poe2scout.service.d.ts.map