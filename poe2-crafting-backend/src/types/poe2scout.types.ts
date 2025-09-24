/**
 * POE2 Scout API Type Definitions
 * Generated from API Schema Documentation
 */

// ==================== BASIC TYPES ====================

export interface Category {
  id: number;
  apiId: string;
  label: string;
  icon: string;
}

export interface PriceLogEntry {
  price: number;
  time: string; // date-time format
  quantity: number;
}

// ==================== CURRENCY TYPES ====================

export interface CurrencyItem {
  id: number;
  itemId: number;
  currencyCategoryId: number;
  apiId: string;
  text: string;
  categoryApiId: string;
  iconUrl: string | null;
  itemMetadata: object | null;
}

export interface CurrencyItemExtended extends CurrencyItem {
  priceLogs: (PriceLogEntry | null)[];
  currentPrice: number | null;
}

export interface CurrencyItemResponse {
  itemId: number;
  apiId: string;
  text: string;
  categoryApiId: string;
  priceLogs: (PriceLogEntry | null)[];
  currentPrice: number;
  iconUrl: string | null;
}

export interface GetCurrencyItemsResponse {
  currentPage: number;
  pages: number;
  total: number;
  items: CurrencyItemExtended[];
}

// ==================== CURRENCY EXCHANGE TYPES ====================

export interface GetCurrencyExchangeModel {
  Epoch: number;
  Volume: string;
  MarketCap: string;
}

export interface PairDataDetails {
  CurrencyItemId: number;
  ValueTraded: string;
  RelativePrice: string;
  StockValue: string;
  VolumeTraded: number;
  HighestStock: number;
}

export interface PairData {
  CurrencyOneData: PairDataDetails;
  CurrencyTwoData: PairDataDetails;
}

export interface GetCurrentSnapshotPairModel {
  CurrencyExchangeSnapshotPairId: number;
  CurrencyExchangeSnapshotId: number;
  Volume: string;
  CurrencyOne: CurrencyItem;
  CurrencyTwo: CurrencyItem;
  CurrencyOneData: PairDataDetails;
  CurrencyTwoData: PairDataDetails;
}

export interface GetPairHistoryModel {
  History: {
    Epoch: number;
    Data: PairData;
  }[];
  Meta: Record<string, any>;
}

export interface GetCurrencyExchangeHistoryModel {
  Data: {
    Epoch: number;
    MarketCap: number;
    Volume: number;
  }[];
  Meta: Record<string, boolean>;
}

// ==================== ITEMS TYPES ====================

export interface UniqueItemExtended {
  id: number;
  itemId: number;
  iconUrl: string | null;
  text: string;
  name: string;
  categoryApiId: string;
  itemMetadata: object | null;
  type: string;
  isChanceable: boolean | null;
  priceLogs: (PriceLogEntry | null)[];
  currentPrice: number | null;
}

export interface UniqueItemResponse {
  itemId: number;
  name: string;
  type: string;
  categoryApiId: string;
  priceLogs: (PriceLogEntry | null)[];
  currentPrice: number;
  iconUrl: string | null;
}

export interface GetUniqueItemsResponse {
  currentPage: number;
  pages: number;
  total: number;
  items: UniqueItemExtended[];
}

// ==================== LEAGUE TYPES ====================

export interface LeagueResponse {
  value: string;
  divinePrice: number;
  chaosDivinePrice: number;
}

// ==================== CATEGORY TYPES ====================

export interface CategoryResponse {
  unique_categories: Category[];
  currency_categories: Category[];
}

// ==================== LANDING/GENERAL TYPES ====================

export interface LandingSplashInfoResponse {
  items: CurrencyItemExtended[];
}

// ==================== ERROR TYPES ====================

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// ==================== API RESPONSE WRAPPERS ====================

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  currentPage: number;
  pages: number;
  total: number;
  items: T[];
}

// ==================== CRAFTING SPECIFIC TYPES ====================

/**
 * Currency value with price information for crafting calculations
 */
export interface CraftingCurrency {
  apiId: string;
  name: string;
  currentPrice: number;
  divineValue: number; // Price in Divine Orbs
  chaosValue: number;  // Price in Chaos Orbs
  iconUrl: string;
  lastUpdated: string;
}

/**
 * Item with crafting potential information
 */
export interface CraftingItem {
  itemId: number;
  name: string;
  type: string;
  baseValue: number;
  potentialValue: number; // After crafting
  iconUrl: string;
  category: string;
}

/**
 * Crafting cost calculation result
 */
export interface CraftingCostAnalysis {
  totalCostDivine: number;
  totalCostChaos: number;
  successProbability: number;
  expectedValue: number;
  profitMargin: number;
  recommendedAction: 'CRAFT' | 'BUY' | 'SKIP';
}