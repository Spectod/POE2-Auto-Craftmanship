import axios, { AxiosInstance } from 'axios';
import type {
  ItemsData,
  StatsData,
  TradeFetchResponse,
  TradeLeague,
  TradeSearchRequest,
  TradeSearchResponse,
} from '../types/trade2.types';

/**
 * Official POE2 Trade client (reverse-engineered endpoints)
 * Wraps /api/trade2/data/*, /search, /fetch and leagues.
 *
 * Notes:
 * - Some endpoints may work without auth, but authenticated requests are more stable.
 * - If available, set env POESESSID to include logged-in session cookie.
 */
export class Trade2Service {
  private api: AxiosInstance;
  private baseURL = 'https://www.pathofexile.com';

  constructor() {
    const poeSessId = process.env.POESESSID || process.env.POE_COOKIE;

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'POE2-Auto-Craftmanship/1.0.0 (+optimizer)',
        ...(poeSessId ? { 'Cookie': `POESESSID=${poeSessId}` } : {}),
        'Origin': 'https://www.pathofexile.com',
        'Referer': 'https://www.pathofexile.com/trade2',
      },
      decompress: true,
      // axios auto-decompresses gzip when header present
    });
  }

  async getLeagues(): Promise<TradeLeague[]> {
    const { data } = await this.api.get<TradeLeague[]>('/api/leagues', {
      params: { realm: 'poe2' },
    });
    return data;
  }

  async getItemsData(): Promise<ItemsData> {
    const { data } = await this.api.get<ItemsData>('/api/trade2/data/items');
    return data;
  }

  async getStatsData(): Promise<StatsData> {
    const { data } = await this.api.get<StatsData>('/api/trade2/data/stats');
    return data;
  }

  async search(league: string, body: TradeSearchRequest): Promise<TradeSearchResponse> {
    const { data } = await this.api.post<TradeSearchResponse>(`/api/trade2/search/${encodeURIComponent(league)}` , body);
    return data;
  }

  /**
   * Fetch details for a list of result ids from a previous search.
   * Automatically chunks requests to avoid overly long URLs.
   */
  async fetch(queryId: string, ids: string[], chunkSize: number = 10): Promise<TradeFetchResponse> {
    const all: TradeFetchResponse['result'] = [];
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const { data } = await this.api.get<TradeFetchResponse>(
        `/api/trade2/fetch/${chunk.join(',')}`,
        { params: { query: queryId } }
      );
      if (data?.result?.length) all.push(...data.result);
      // Basic polite throttle
      await new Promise(r => setTimeout(r, 200));
    }
    return { result: all };
  }
}

export default Trade2Service;

