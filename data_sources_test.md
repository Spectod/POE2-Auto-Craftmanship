# POE2 Data Sources Analysis

Generated on: 2025-09-24T18:43:37.521Z

## Test Results

### 1. https://poedb.tw/json.php?l=en&cn=BaseItemTypes

**Status:** error

**Error:** Not JSON

---

### 2. https://poedb.tw/json.php?l=en&cn=ItemClasses

**Status:** error

**Error:** Not JSON

---

### 3. https://poedb.tw/api/poe2/BaseItemTypes.json

**Status:** error

**Error:** Not JSON

---

### 4. https://poedb.tw/api/poe2/weapons.json

**Status:** error

**Error:** Not JSON

---

### 5. https://poe2wiki.net/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:Weapons

**Status:** error

**Error:** Redirect 301

**Redirect:** https://www.poe2wiki.net/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:Weapons

---

### 6. https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/base_items.json

**Status:** success

**Data Type:** object

**Available Keys:** Metadata/Items/Amulet/AmuletAtlas1, Metadata/Items/Amulet/AmuletAtlas2, Metadata/Items/Amulet/AmuletAtlas3, Metadata/Items/Amulet/AmuletVictor1, Metadata/Items/Amulets/Amulet1, Metadata/Items/Amulets/Amulet10, Metadata/Items/Amulets/Amulet11, Metadata/Items/Amulets/Amulet12, Metadata/Items/Amulets/Amulet2, Metadata/Items/Amulets/Amulet3

**Sample Data:**
```json
{
  "Metadata/Items/Amulet/AmuletAtlas1": {
    "domain": "item",
    "drop_level": 77,
    "implicits": [
      "ManaRegenerationImplicitAmulet2"
    ],
    "inventory_height": 1,
    "inventory_width": 1,
    "item_class": "Amulet",
    "name": "Blue Pearl Amulet",
    "properties": {},
    "release_state": "released",
    "requirements": null,
    "tags": [
      "not_for_sale",
      "atlas_base_type",
      "amuletatlas1",
      "amulet",
      "default"
    ],
    "visual_identity": {
    ...
```

---

## Manual POE2 Weapon Categories

Based on the image provided by user, here are the weapon categories:

### One Handed Weapons
- Claws
- Daggers
- One Handed Axes
- One Handed Maces
- One Handed Swords
- Sceptres
- Wands

### Two Handed Weapons
- Bows
- Crossbows
- Quarterstaffs
- Staves
- Two Handed Axes
- Two Handed Maces
- Two Handed Swords

### Armour
- Helmets
- Body Armours
- Gloves
- Boots
- Shields

### Jewellery
- Amulets
- Rings
- Belts

## Recommendations

### Working Data Sources Found

- **https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/base_items.json**
  - Data available with keys: Metadata/Items/Amulet/AmuletAtlas1, Metadata/Items/Amulet/AmuletAtlas2, Metadata/Items/Amulet/AmuletAtlas3, Metadata/Items/Amulet/AmuletVictor1, Metadata/Items/Amulets/Amulet1, Metadata/Items/Amulets/Amulet10, Metadata/Items/Amulets/Amulet11, Metadata/Items/Amulets/Amulet12, Metadata/Items/Amulets/Amulet2, Metadata/Items/Amulets/Amulet3
