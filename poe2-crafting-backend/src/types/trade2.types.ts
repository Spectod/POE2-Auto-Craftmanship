export interface TradeLeague {
  id: string;
  description?: string;
  rules?: any[];
}

export interface TradeSearchRequest {
  query: any;
  sort?: Record<string, any>;
}

export interface TradeSearchResponse {
  id: string;
  result: string[];
  total: number;
  complexity?: number;
}

export interface TradeListingPrice {
  amount: number;
  currency: string;
}

export interface TradeListing {
  price?: TradeListingPrice;
  indexed?: string;
  whisper?: string;
  account?: any;
}

export interface TradeItem {
  name?: string;
  typeLine?: string;
  ilvl?: number;
  frameType?: number;
  properties?: any[];
  // Additional fields are available but omitted for brevity
  [key: string]: any;
}

export interface TradeFetchEntry {
  id: string;
  item: TradeItem;
  listing: TradeListing;
}

export interface TradeFetchResponse {
  result: TradeFetchEntry[];
}

export type ItemsData = any;
export type StatsData = any;

