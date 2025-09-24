# 📊 สรุปข้อมูลจาก POE2 APIs ทั้งหมด

## 🔗 API Endpoints ที่ทดสอบแล้ว

### 🪙 **POE2Scout Currency APIs** (Community API)
1. `GET /api/currency?league=Rise%20of%20the%20Abyssal&category=currency&page=1`
2. `GET /api/currency/exchange?league=Rise%20of%20the%20Abyssal`
3. `GET /api/currency/pairs?league=Rise%20of%20the%20Abyssal`

### ⚔️ **POE2 Official Trade APIs** (Reverse Engineered - Undocumented)
4. `GET /api/trade2/data/items` - รายการ items ทั้งหมด
5. `GET /api/trade2/data/stats` - รายการ modifiers/stats  
6. `GET /api/leagues?realm=poe2` - POE2 leagues
7. `POST /api/trade2/search/{league}` - ค้นหา items ในตลาด
8. `GET /api/trade2/fetch/{ids}?query={queryId}` - ดึง item details

**⚠️ หมายเหตุ:** POE2 Trade APIs เป็น undocumented endpoints ที่ได้จาก reverse engineering

---

## 1️⃣ **GET /api/currency** - Raw Currency Items Data

### 📋 **โครงสร้างข้อมูล:**
```json
{
  "success": true,
  "data": {
    "currentPage": 1,
    "pages": 2,
    "total": 37,
    "items": [...]
  }
}
```

### 💰 **ข้อมูลใน items แต่ละตัว:**
- **Basic Info:**
  - `id`: Internal database ID
  - `itemId`: Item identifier
  - `apiId`: API identifier (เช่น "mirror", "vaal", "gcp")
  - `text`: ชื่อที่แสดง (เช่น "Mirror of Kalandra", "Vaal Orb")
  - `categoryApiId`: หมวดหมู่ ("currency")
  - `iconUrl`: URL รูป icon ของ currency

- **Metadata (รายละเอียด):**
  - `name`: ชื่อเต็ม
  - `base_type`: ประเภทพื้นฐาน  
  - `stack_size`: จำนวนใน stack ปัจจุบัน
  - `max_stack_size`: จำนวนสูงสุดใน stack
  - `description`: คำอธิบายการใช้งาน
  - `effect`: ผลที่เกิดขึ้นเมื่อใช้

- **Price Logs (ประวัติราคา):**
  ```json
  "priceLogs": [
    {
      "price": 392644.5087806669,
      "time": "2025-09-24T12:00:00", 
      "quantity": 10
    }
  ]
  ```

### 🎯 **ตัวอย่าง Currency ที่พบ:**
- **Mirror of Kalandra**: ~392,644 ราคาปัจจุบัน
- **Vaal Orb**: มี price logs ย้อนหลัง
- **Gemcutter's Prism**: อื่น ๆ...

---

## 2️⃣ **GET /api/currency/exchange** - Exchange Snapshot

### 📋 **โครงสร้างข้อมูล:**
```json
{
  "success": true,
  "data": {
    "Epoch": 1758711600,
    "Volume": "71764505.15872590",
    "MarketCap": "197157816.01973993"
  }
}
```

### 📈 **ข้อมูลที่ได้:**
- **Epoch**: Unix timestamp ของ snapshot นี้ (1758711600)
- **Volume**: ปริมาณการซื้อขายทั้งหมด (~71.7 ล้าน)
- **MarketCap**: มูลค่าตลาดรวม (~197.1 ล้าน)

### 🎯 **ประโยชน์:**
- ดูภาพรวมตลาด currency ในขณะนั้น
- เทียบปริมาณการซื้อขายระหว่าง snapshot
- วิเคราะห์ market cap สำหรับตลาด currency

---

## 3️⃣ **GET /api/currency/pairs** - Currency Exchange Pairs

### 📋 **โครงสร้างข้อมูล:**
```json
{
  "success": true,
  "data": [
    {
      "CurrencyExchangeSnapshotPairId": 10983786,
      "CurrencyExchangeSnapshotId": 51413,
      "Volume": "39.48916154",
      "CurrencyOne": {...},
      "CurrencyTwo": {...},
      "CurrencyOneData": {...},
      "CurrencyTwoData": {...}
    }
  ]
}
```

### 💱 **ข้อมูลใน Exchange Pair:**

#### **Currency Objects:**
- `CurrencyOne` และ `CurrencyTwo`: รายละเอียด currency ที่แลกเปลี่ยน
  - มี `apiId`, `text`, `iconUrl` เหมือน API แรก

#### **Trading Data:**
- **CurrencyOneData:**
  - `ValueTraded`: มูลค่าที่ซื้อขาย "39.48916154"
  - `RelativePrice`: ราคาเทียบ "0.51594262" 
  - `StockValue`: มูลค่า stock "5.09537568"
  - `VolumeTraded`: จำนวน transactions (31)
  - `HighestStock`: stock สูงสุด (4)

- **CurrencyTwoData:** 
  - ข้อมูลเดียวกันสำหรับ currency ที่สอง

### 🎯 **ตัวอย่าง Pair ที่พบ:**
- **Vaal Orb ↔ Gemcutter's Prism**
  - Volume: 39.48916154
  - Vaal Orb RelativePrice: 0.51594262
  - GCP RelativePrice: 0.84019493

---

## 🔍 **สรุปการใช้งาน APIs ทั้งหมด:**

### 🪙 **POE2Scout APIs (Community)**
#### 📊 **API #1 - /api/currency**
**ใช้เมื่อ:** ต้องการข้อมูลรายละเอียดของ currency แต่ละตัว
- ✅ รายชื่อ currency ทั้งหมดในลีค
- ✅ ประวัติราคา (price logs)
- ✅ Metadata และคำอธิบาย
- ✅ Icon URLs สำหรับแสดงผล

#### 📈 **API #2 - /api/currency/exchange**
**ใช้เมื่อ:** ต้องการภาพรวมตลาด currency
- ✅ ปริมาณการซื้อขายรวม
- ✅ Market cap
- ✅ Snapshot timestamp

#### 💱 **API #3 - /api/currency/pairs** 
**ใช้เมื่อ:** ต้องการข้อมูลการแลกเปลี่ยนระหว่าง currency
- ✅ อัตราแลกเปลี่ยนระหว่าง currency คู่ต่าง ๆ
- ✅ ปริมาณการซื้อขายแต่ละคู่
- ✅ Stock และ relative prices
- ✅ ข้อมูลสำหรับคำนวณ conversion rates

### ⚔️ **POE2 Official Trade APIs (Undocumented)**
#### 📦 **API #4 - /api/trade2/data/items**
**ใช้เมื่อ:** ต้องการรายชื่อ items ทั้งหมดในเกม
- ✅ 9 categories, 2,500+ items total
- ✅ Item types และ names
- ✅ สร้าง search filters

#### 📈 **API #5 - /api/trade2/data/stats**
**ใช้เมื่อ:** ต้องการ modifiers สำหรับ advanced search
- ✅ รายการ modifiers ทั้งหมด
- ✅ Stat categories
- ✅ Crafting probability calculations

#### 🏆 **API #6 - /api/leagues?realm=poe2**
**ใช้เมื่อ:** ต้องการรายชื่อ leagues ปัจจุบัน
- ✅ 16 leagues available
- ✅ League rules และ descriptions

#### 🔍 **API #7 - POST /api/trade2/search/{league}**
**ใช้เมื่อ:** ค้นหา items ในตลาด (เหมือน overlay tools)
- ✅ Advanced search filters
- ✅ Real-time market data
- ✅ Query IDs สำหรับ fetch details

#### 📦 **API #8 - GET /api/trade2/fetch/{ids}?query={queryId}**
**ใช้เมื่อ:** ดึงรายละเอียด items ที่ค้นพบ
- ✅ Item names, types, levels
- ✅ Prices และ currency
- ✅ Seller information

---

## 4️⃣ **GET /api/trade2/data/items** - Complete Items Database

### 📋 **โครงสร้างข้อมูล:**
```json
{
  "result": [
    {
      "id": "accessory",
      "label": "Accessories", 
      "entries": [
        {"type": "Crimson Amulet"},
        {"type": "Gold Amulet"}
      ]
    }
  ]
}
```

### 📦 **Categories ที่พบ (9 หมวด):**
- **Accessories**: 119 items (amulets, rings, belts)
- **Armour**: 718 items (chest, helmets, boots, etc.)
- **Currency**: 330 items (orbs, scrolls, essences)
- **Flasks**: 45 items (life, mana, utility flasks)
- **Gems**: 765 items (skill gems, supports)
- **Jewels**: 21 items (emerald, diamond, sapphire)
- **Maps**: 51 items (endgame content)
- **Weapons**: 348 items (swords, bows, staves, etc.)
- **Sanctum Research**: 13 items (relics)

---

## 5️⃣ **GET /api/trade2/data/stats** - Modifiers & Stats Database

### 📈 **ข้อมูล Modifiers:**
- รายการ modifiers ทั้งหมดในเกม
- Stat categories และ types
- ใช้สำหรับสร้าง search filters

### 🎯 **ประโยชน์:**
- สร้าง advanced search queries
- วิเคราะห์ modifiers บน items
- คำนวณ crafting probabilities

---

## 6️⃣ **GET /api/leagues?realm=poe2** - POE2 Leagues List

### 🏆 **Leagues ที่พบ (16 leagues):**
```json
[
  {"id": "Standard", "description": "The default game mode."},
  {"id": "Hardcore", "rules": ["Hardcore"]},
  {"id": "Solo Self-Found", "rules": ["Solo"]},
  {"id": "Mercenaries", "description": "Duel mercenaries..."}
]
```

### 📊 **League Types:**
- Standard variants (Standard, Hardcore)
- SSF variants (Solo Self-Found)
- Ruthless variants
- Mercenaries leagues

---

## 7️⃣ **POST /api/trade2/search/{league}** - Item Search

### 🔍 **Request Format:**
```json
{
  "query": {
    "status": {"option": "online"},
    "filters": {
      "type_filters": {
        "filters": {
          "category": {"option": "armour.chest"}
        }
      }
    }
  }
}
```

### ✅ **Successful Response:**
```json
{
  "id": "o8yVVkZil",
  "result": ["item_hash_1", "item_hash_2"],
  "total": 10000,
  "complexity": 5
}
```

### 🎯 **ตัวอย่างการใช้งาน:**
- ค้นหา armor: `category: "armour.chest"` → พบ 10,000 results
- ค้นหา currency: `type: "Divine Orb"` → พบ 149 results

---

## 8️⃣ **GET /api/trade2/fetch/{ids}?query={queryId}** - Item Details

### 📦 **Response Format:**
```json
{
  "result": [
    {
      "id": "item_hash",
      "item": {
        "name": "Wrath Ward",
        "typeLine": "Studded Vest", 
        "ilvl": 26
      },
      "listing": {
        "price": {
          "amount": 1,
          "currency": "aug"
        }
      }
    }
  ]
}
```

### 🎯 **ข้อมูลที่ได้:**
- Item name และ type
- Item level
- Price และ currency
- Seller information
- Item modifiers

## 🎯 **การประยุกต์ใช้:**

1. **แสดงรายการ Currency:** ใช้ API #1
2. **ภาพรวมตลาด:** ใช้ API #2  
3. **คำนวณอัตราแลกเปลี่ยน:** ใช้ API #3
4. **Crafting Cost Calculator:** รวม API #1 + #3
5. **Market Analysis Dashboard:** รวมทั้ง 3 APIs