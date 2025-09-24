# POE2 Auto-Craftmanship API Summary

## 🌐 External API Source
- **Base URL**: `https://poe2scout.com/api`
- **Purpose**: Real-time POE2 currency exchange rates, item prices, and market data

## 🔧 Our Backend API Endpoints (localhost:3001)

### 📊 **Currency Price APIs**

#### 1. **GET /api/currency/crafting**
- **Purpose**: หาราคา currency ทั้งหมดสำหรับการคำนวณ crafting
- **Parameters**: `?league=<league_name>`
- **Response**: Array of `CraftingCurrency` objects with:
  - `apiId`: Currency identifier
  - `name`: Currency display name
  - `currentPrice`: Current market price
  - `divineValue`: Price in Divine Orbs
  - `chaosValue`: Price in Chaos Orbs
  - `iconUrl`: Currency icon URL
  - `lastUpdated`: Timestamp

#### 2. **GET /api/currency**
- **Purpose**: รายละเอียด currency items แบบ raw data
- **Parameters**: `?league=<league>&category=currency&page=1`
- **Response**: Paginated currency items with price logs

#### 3. **GET /api/currency/exchange**
- **Purpose**: Currency exchange snapshot ข้อมูลการแลกเปลี่ยน
- **Parameters**: `?league=<league_name>`
- **Response**: Exchange model with current rates

#### 4. **GET /api/currency/pairs**
- **Purpose**: Exchange pairs between currencies
- **Parameters**: `?league=<league_name>`
- **Response**: Array of currency pair data with relative prices

### 🏆 **League APIs**

#### 5. **GET /api/leagues**
- **Purpose**: รายชื่อ leagues ทั้งหมด (filtered)
- **Response**: Array of leagues with divine/chaos prices
- **Current Order**: 
  1. Rise Of the Abyssal
  2. HC Rise Of the Abyssal  
  3. Dawn of the Hunt
  4. HC Dawn of the Hunt

#### 6. **GET /api/leagues/current**
- **Purpose**: Current active league
- **Response**: Single league object

### 🎯 **Items APIs**

#### 7. **GET /api/items**
- **Purpose**: Item data with prices
- **Parameters**: `?league=<league>&page=1`
- **Response**: Paginated items with market prices

#### 8. **GET /api/items/categories**
- **Purpose**: Item categories and unique categories
- **Response**: Categories with API identifiers

## 🔄 **Data Processing Flow**

### Currency Price Calculation:
1. **Fetch Raw Data**: `/api/currency/crafting`
2. **Divine Value**: `currentPrice / leagueInfo.divinePrice`
3. **Chaos Value**: `currentPrice * leagueInfo.chaosDivinePrice`
4. **Filter Logic**: 
   - If `divineValue < 1` → Use `chaosValue > 50` (equivalent to exalted)
   - If `divineValue >= 1` → Use `divineValue > 0.1`

### League Management:
1. **Default League**: "Rise Of the Abyssal" (non-HC)
2. **Filtering**: Remove Standard/Hardcore (except HC Rise/HC Dawn)
3. **Sorting**: Non-HC leagues first, then HC versions

## 📦 **Data Types Available**

### Currency Data:
- ✅ Real-time market prices
- ✅ Divine Orb conversion rates
- ✅ Chaos Orb conversion rates  
- ✅ Price history logs
- ✅ Currency exchange pairs
- ✅ Icon URLs for display

### League Data:
- ✅ League names and identifiers
- ✅ Divine Orb prices per league
- ✅ Chaos/Divine exchange rates
- ✅ Current active league detection

### Item Data:
- ✅ Item prices and market values
- ✅ Item categories and types
- ✅ Expensive items filtering
- ✅ Unique item data
- ✅ Item icons and metadata

## 🎛️ **Frontend Integration**

### Vue Composables:
- `useLeagues()`: League management and selection
- `useCurrency()`: Currency data with price filtering
- `useItems()`: Item data and expensive items
- `usePOE2Data()`: Master composable orchestrating all data

### Key Features:
- 🔄 Auto-refresh data when league changes
- 📊 Top currencies with intelligent value comparison
- 💰 Expensive items tracking (>10 current price units)
- 🎯 League-specific currency data
- ⚡ Real-time price updates via POE2Scout API

## 🚀 **Current Capabilities**

### ✅ **Working Features**:
1. League selection with auto-currency refresh
2. Top currencies display (sorted by value)  
3. Expensive items listing
4. Real-time price data from POE2Scout
5. Intelligent currency value comparison (Divine vs Chaos)
6. League filtering (no Standard/Hardcore except Rise/Dawn HC)
7. Clickable league cards with hover effects

### 🔨 **Next Development Phase**:
1. **Crafting Simulation Engine**: Probability calculations for craft outcomes
2. **Cost-Effectiveness Analysis**: Compare crafting costs vs buying
3. **Drag & Drop Crafting Interface**: Visual crafting workflow
4. **Advanced Filtering**: Currency/item search and filters
5. **Historical Price Charts**: Price trend analysis
6. **Profit Calculator**: ROI analysis for crafting strategies

## 📈 **Cache & Performance**
- ⚡ 5-minute cache for API responses
- 🔄 Rate limiting protection
- 📊 Cache statistics endpoint: `/api/cache/stats`
- 🎯 Optimized currency value calculations