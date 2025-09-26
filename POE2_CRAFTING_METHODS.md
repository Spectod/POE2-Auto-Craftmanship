# Path of Exile 2 (0.3) Crafting Knowledge Base

Reference sheet for Early Access 0.3 (Rise of the Abyssal). Use this as the baseline for future crafting optimizer work.

---

## 1. Item Rarity & Currency Access

| Item Rarity | Allowed Currency Types | Notes |
| --- | --- | --- |
| Normal | Transmutation, Augmentation, Alchemy, Chance, quality currencies, socket/link currencies | Entry point for most chains; can increase quality and alter sockets before upgrading. |
| Magic | Augmentation, Regal, Chaos, Annulment, quality currencies, socket/link currencies | Chaos/Annul reroll or remove mods; Regal promotes to rare. |
| Rare | Chaos, Regal (while adding mods), Exalted, Divine, Fracturing, Annulment, Vaal, Hinekora’s Lock | Exalted/Greater/Perfect add new affixes, Divine rerolls values, Fracturing locks key mods. |
| Unique | Divine, Vaal, Hinekora’s Lock, applicable quality currencies | Cannot use Exalted/Chaos directly; focus on value rerolls, corruption and bench crafts. |

> Greater/Perfect currency variants behave like their base versions but with improved weighting or minimum values (per 0.3 patch notes).
---

## 2. Currency-Based Crafting Methods

| Currency | Usable On | Primary Effect | Details / Restrictions |
| --- | --- | --- | --- |
| **Orb of Transmutation** | Normal | Upgrades item to Magic (1-2 mods) | Starting point for alteration-style crafting. |
| **Orb of Augmentation** | Magic | Adds a random modifier to magic item | Only works if the item has open prefix/suffix slots. |
| **Orb of Chance** | Normal | Randomly upgrades to Magic/Rare/Unique | Target specific unique bases when they are cheap. |
| **Orb of Alchemy** | Normal | Upgrades to Rare with 4-6 mods | Standard approach for Chaos spam on good bases. |
| **Regal Orb** | Magic | Converts Magic to Rare and adds a mod | Common step after Alteration/Augmentation loops. |
| **Chaos Orb (Greater/Perfect)** | Rare | Rerolls all modifiers | Perfect versions lean toward higher tiers; still random. |
| **Exalted Orb (Greater/Perfect)** | Rare | Adds new modifier if an affix slot is open | Do not use when the item already has six mods. |
| **Divine Orb** | Rare/Unique | Randomises numeric values | Use at the end; safest when paired with Hinekora’s Lock. |
| **Orb of Annulment** | Magic/Rare | Removes a random modifier | Clears affix slots prior to multi-mod or Exalt. |
| **Fracturing Orb** | Rare | Fractures one mod permanently | Ideal for protecting key prefixes/suffixes before rerolling. |
| **Vaal Orb** | Rare/Unique | Corrupts item | High risk/high reward; prevents further standard crafting. |
| **Hinekora’s Lock** | Rare/Unique | Locks next crafting outcome for review | Allows accepting or rejecting Divine/Exalt results. |
| **Artificer’s Orb / Etcher** | Equipment | Applies or adds crafted modifiers | Requires unlocked bench recipes; limited uses. |
| **Chance/Regal/Exalt Shards** | Normal/Magic/Rare | Assemble into full orbs | Economic farming consideration. |
| **Quality currencies (Whetstone, Scrap, Bauble, GCP)** | Weapon/Armour/Flask/Gem | Increase quality | Apply before high-investment rerolls. |
| **Jeweller’s Orbs (Lesser/Greater/Perfect)** | Socketed items | Reroll sockets/links | Perfect gives best chance at 5-6 links. |
---

## 3. Advanced Craft Chains

1. **Alteration/Regal Chain**  
   Transmute → (Alteration/Augmentation loop) → Regal → Annul (if needed) → Exalted/Bench crafts.  
   *Usage:* deterministic mod hunting, early access where fossils/essences are scarce.

2. **Fracture + Chaos Spam**  
   Apply Fracturing Orb to lock core mod → Chaos spam for remaining affixes → Annul/Exalt to finish.  
   *Usage:* create fractured trade bases, secure +1 gems or high-tier resist prefixes.

3. **Hinekora Assisted Divine/Exalt**  
   Hinekora’s Lock → Divine/Exalt → accept only the desired preview; otherwise cancel with low-tier orb.  
   *Usage:* finalising rares or tuning uniques.

4. **Reforge Station (Item Fusion)**  
   Combine two rare items + catalytic cost → attempts to merge selected prefixes/suffixes.  
   *Usage:* blend influence-free affixes; success rate depends on item level/quality (exact % TBD).

5. **Corruption Route**  
   Finish item → Vaal Orb (or specialised altars in later patches) for implicit upgrades.  
   *Usage:* chase double corrupts or signature implicits; accept the risk of bricking the item.
---

## 4. Non-Currency Systems in 0.3

| System | Usage | Notes |
| --- | --- | --- |
| **Bench Crafting (Artisans)** | Unlock recipes from campaign/side content; spend Artificer’s Orb/Etcher | Limits per item; stored in hideout bench when feature unlocks. |
| **Reforge Station** | Fuse two rares | Transfers a subset of mods; failure removes one or more modifiers. |
| **Vendor Recipes** | 3 of a kind for quality, chromatic recipes, etc. | Useful for prepping bases pre-craft. |
| **Essences/Fossils** | Currently limited in EA 0.3 | Monitor future patches; not part of baseline yet. |
---

## 5. Outstanding Research

- Exact success chance for Reforge fusion (depends on item level/quality?).
- Numerical weighting differences for Greater/Perfect currency variants.
- Complete bench recipe list including multi-mod cost and caps.
- Confirmation of endgame corruption altars for 0.3.x.
---

## 6. Optimizer Implications
1. Model rarity transitions as a state machine (Normal → Magic → Rare → Corrupted).
2. Maintain live currency prices (via POE2Scout) mapped to `shared/crafting_currency_metadata.json`.
3. Add probability distributions for mod tiers/weighting to support expected value calculations.
4. Represent complex crafts (Reforge, Fracturing strategies) as multi-step methods with success/failure branches.
5. Enforce validation rules (affix slots, fractured limits, corruption lockouts) before simulation.

> Shared metadata file: `shared/crafting_currency_metadata.json`


