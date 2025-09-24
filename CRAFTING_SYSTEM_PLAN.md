# 🎯 POE2 Auto-Craftmanship System - Master Plan

## 📋 **Core Requirements (ที่คุณระบุไว้):**

### 1. 💰 **Cost Calculation System**
- คำนวณต้นทุนของการคราฟในแต่ละขั้นตอน
- รวมราคา currency ทั้งหมดที่ใช้
- คำนวณต้นทุนเฉลี่ย per attempt

### 2. 📊 **Probability & Statistics System**
- ความน่าจะเป็นในแต่ละ crafting process
- Standard Deviation ของผลลัพธ์
- Monte Carlo simulation สำหรับ complex crafting chains

### 3. 🏪 **Market Analysis System**
- จำนวนสินค้าที่มีใน market
- ราคาของสินค้าที่มี modifiers คล้ายคลึงกัน
- **Tier analysis** - วิเคราะห์คุณภาพของ modifiers

### 4. 🔧 **Crafting Recipe System** (Manual Input)
- User กำหนด crafting steps เอง
- Template system สำหรับ popular builds
- Meta tracking และ recipe recommendations

### 5. 📈 **Risk & Profit Analysis**

## 🚨 **ข้อจำกัดของ POE2 Official API (ปัจจุบัน):**

**Trade APIs ยังไม่พร้อม:**
- ❌ ไม่มี Trade/Market search endpoints
- ❌ ไม่มี Item listing APIs  
- ❌ ไม่มี Price history APIs

**APIs ที่ใช้งานได้:**
- ✅ Character data (`GET /character`)
- ✅ Account stashes (แต่เฉพาะ PoE1)
- ✅ League information (`GET /league`)
- ✅ Currency exchange rates (`GET /currency-exchange`)
- ✅ Item structure และ modifiers

**โซลูชันปัจจุบัน:**
- 🔄 ใช้ POE2Scout API สำหรับราคา currency
- 🔄 Community APIs สำหรับ trade data
- 🔄 Hybrid approach รองรับหลาย data sources
- Market saturation analysis
- Cost-to-profit ratio
- Risk assessment based on market competition
- Expected value calculations

---

## 🚀 **เพิ่มเติมที่ควรมี:**

### 6. 🎲 **Advanced Probability Models**
- **Weighted probabilities** - modifiers ที่หายากกว่า
- **Conditional probabilities** - ความน่าจะเป็นที่ขึ้นอยู่กับ modifiers ที่มีอยู่
- **Multi-step optimization** - หาลำดับ crafting ที่ดีที่สุด

### 7. ⏱️ **Time-to-Market Analysis**
- เวลาที่ใช้ในการ craft
- ความเร็วในการขาย
- Time-weighted profit calculations

### 8. 📊 **Portfolio Management**
- กระจายความเสี่ยงด้วยการ craft หลายๆ แบบ
- Budget allocation optimization
- ROI tracking across different strategies

### 9. 🔄 **Market Trend Analysis**
- ราคา historical trends
- Seasonal demand patterns
- Meta shift predictions

### 10. ⚡ **Real-time Notifications**
- Market opportunity alerts
- Price threshold notifications
- Crafting completion tracking

---

## 🌐 **POE2 Trade Site API Research:**

### **Official Trade API:**
```
Base URL: https://www.pathofexile.com/api/trade/search/poe2
```

### **Key Endpoints:**
1. **Search Items:**
   ```
   POST /search/{league}
   Body: {
     "query": {
       "filters": {
         "type_filters": {...},
         "misc_filters": {...}
       }
     }
   }
   ```

2. **Get Item Details:**
   ```
   GET /fetch/{item_ids}?query={query_id}
   ```

3. **Get Leagues:**
   ```
   GET /data/leagues
   ```

### **การดึงข้อมูล Modifiers & Tiers:**
```json
{
  "query": {
    "filters": {
      "type_filters": {
        "filters": {
          "category": {"option": "weapon.sword"}
        }
      },
      "misc_filters": {
        "filters": {
          "quality": {"min": 20},
          "ilvl": {"min": 70}
        }
      }
    },
    "stats": [
      {
        "type": "and",
        "filters": [
          {
            "id": "explicit.stat_1509134228", // Physical Damage
            "value": {"min": 100, "max": 200}
          }
        ]
      }
    ]
  }
}
```

---

## 🏗️ **Implementation Architecture:**

### **Frontend Components:**
```
src/components/
├── CraftingCalculator/
│   ├── CostCalculator.vue
│   ├── ProbabilityAnalyzer.vue
│   ├── MarketAnalyzer.vue
│   └── RiskAssessment.vue
├── TradeAnalysis/
│   ├── ItemSearch.vue
│   ├── PriceHistory.vue
│   └── MarketTrends.vue
└── CraftingPlanner/
    ├── RecipeBuilder.vue
    ├── StepOptimizer.vue
    └── ProgressTracker.vue
```

### **Backend Services:**
```
src/services/
├── poe2-trade.service.ts     // Trade API integration
├── crafting-calc.service.ts  // Probability calculations
├── market-analysis.service.ts // Market data processing
└── mod-database.service.ts   // Modifier database
```

### **Database Schema:**
```sql
-- Modifier Database
CREATE TABLE modifiers (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type ENUM('prefix', 'suffix'),
    tier INTEGER,
    min_value DECIMAL,
    max_value DECIMAL,
    weight INTEGER,
    item_classes JSON
);

-- Crafting Recipes
CREATE TABLE crafting_recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    steps JSON,
    expected_cost DECIMAL,
    success_rate DECIMAL,
    created_by INTEGER
);

-- Market History
CREATE TABLE market_history (
    id SERIAL PRIMARY KEY,
    item_hash VARCHAR,
    price DECIMAL,
    league VARCHAR,
    timestamp TIMESTAMP,
    modifiers JSON
);
```

---

## 📊 **Data Sources:**

### 1. **POE2Scout.com** (ปัจจุบัน)
- ✅ Currency prices
- ✅ Basic market data

### 2. **POE2 Official Trade API**
- ✅ Item listings
- ✅ Detailed modifier data
- ✅ Historical price data

### 3. **Community Resources**
- **PoE2DB.tw** - Modifier database
- **Craft of Exile** - Crafting simulations (reference)
- **Reddit/Discord** - Meta discussions

### 4. **Game Data Mining**
- **GGPK files** - Game assets และ data tables
- **Passive tree data**
- **Base item statistics**

---

## 🎯 **MVP Features Priority:**

### **Phase 1: Foundation**
1. ✅ Currency price tracking (Done)
2. 🔄 Basic trade API integration
3. 🔄 Simple cost calculator

### **Phase 2: Core Features**
4. Probability calculator
5. Market analysis dashboard
6. Basic crafting recipes

### **Phase 3: Advanced Features**
7. Risk assessment tools
8. Portfolio optimization
9. Real-time alerts

### **Phase 4: AI & Automation**
10. Meta prediction models
11. Auto-crafting recommendations
12. Market trend analysis

---

## 🔧 **Technical Implementation:**

### **Trade API Integration:**
```typescript
interface TradeSearchQuery {
  query: {
    filters: {
      type_filters?: any;
      misc_filters?: any;
      trade_filters?: any;
    };
    stats?: StatFilter[];
  };
  sort?: SortOption;
}

interface ModifierData {
  id: string;
  text: string;
  tier: number;
  values: number[];
  crafting_bench?: boolean;
}
```

### **Probability Calculator:**
```typescript
class CraftingProbabilityCalculator {
  calculateModifierProbability(
    baseItem: Item,
    desiredMods: Modifier[],
    craftingMethod: CraftingMethod
  ): ProbabilityResult {
    // Monte Carlo simulation
    // Weighted probability calculations
    // Multi-step optimization
  }
}
```

---

## 💡 **Next Steps:**

1. **Research POE2 Trade API** - ทำ reverse engineering
2. **Build modifier database** - scrape หรือ manually input
3. **Implement basic trade search** - proof of concept
4. **Create probability models** - mathematical foundations
5. **Design UI/UX** - user-friendly crafting interface

คุณอยากเริ่มจากส่วนไหนก่อนครับ? ผมแนะนำเริ่มจาก Trade API integration เพื่อให้เราได้ข้อมูล market มาใช้งานก่อน