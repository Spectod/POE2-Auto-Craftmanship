import type { ItemsData, StatsData, TradeFetchResponse, TradeLeague, TradeSearchRequest, TradeSearchResponse } from '../types/trade2.types';
export declare class Trade2Service {
    private api;
    private baseURL;
    constructor();
    getLeagues(): Promise<TradeLeague[]>;
    getItemsData(): Promise<ItemsData>;
    getStatsData(): Promise<StatsData>;
    search(league: string, body: TradeSearchRequest): Promise<TradeSearchResponse>;
    fetch(queryId: string, ids: string[], chunkSize?: number): Promise<TradeFetchResponse>;
}
export default Trade2Service;
//# sourceMappingURL=trade2.service.d.ts.map