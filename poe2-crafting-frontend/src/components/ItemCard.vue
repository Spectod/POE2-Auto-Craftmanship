<template>
  <div class="poe2-item-card" :class="[`rarity-${item.rarity}`, { selected: isSelected }]" @click="$emit('select', item)">
    <!-- Item Header -->
    <div class="item-header">
      <div class="item-icon">
        <div class="item-image">
          <!-- Placeholder for item image -->
          <div class="icon-placeholder">
            {{ iconForCategory }}
          </div>
        </div>
      </div>
      <div class="item-info">
        <h3 class="item-name">{{ item.name }}</h3>
        <div class="item-type">{{ formatCategory(item.category) }}</div>
      </div>
    </div>

    <!-- Item Stats -->
    <div class="item-stats">
      <!-- Dynamic Stats Display -->
      <div v-for="stat in displayStats" :key="stat.key" class="stat-line" :class="stat.cssClass">
        <span class="stat-label">{{ stat.label }}:</span>
        <span class="stat-value">{{ stat.value }}</span>
      </div>

      <!-- Special Properties -->
      <div v-if="hasSpecial" class="stat-line special">
        <span class="stat-value special-text">{{ combinedSpecial }}</span>
      </div>

      <!-- Requirements -->
      <div v-if="hasRequirements" class="requirements-section">
        <div class="requirements-label">Requires:</div>
        <div class="requirements-list">
          <span v-if="item.levelRequirement" class="requirement">
            Level {{ item.levelRequirement }}
          </span>
          <span v-if="item.statRequirements.str" class="requirement">
            {{ item.statRequirements.str }} Str
          </span>
          <span v-if="item.statRequirements.dex" class="requirement">
            {{ item.statRequirements.dex }} Dex
          </span>
          <span v-if="item.statRequirements.int" class="requirement">
            {{ item.statRequirements.int }} Int
          </span>
        </div>
      </div>

      <!-- Granted Skills -->
      <div v-if="item.grantedSkills && item.grantedSkills.length > 0" class="granted-skills">
        <div 
          v-for="skill in item.grantedSkills" 
          :key="skill.name"
          class="granted-skill"
          :class="`skill-${skill.color}`"
        >
          <div class="skill-icon" :class="`skill-${skill.color}`">
            {{ getSkillIcon(skill.color) }}
          </div>
          <span class="skill-text">{{ skill.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { getItemTypeIcon, getCategoryDisplayName } from '@/utils/itemIcons'

interface ItemRequirements {
  str?: number
  dex?: number
  int?: number
}

interface GrantedSkill {
  name: string
  level?: number | null
  color: string
}

interface DetailedItem {
  name: string
  category: string
  spirit?: number
  physicalDamage?: string
  fireDamage?: string
  lightningDamage?: string
  criticalHitChance?: string
  attacksPerSecond?: string
  weaponRange?: string
  levelRequirement?: number | null
  statRequirements: ItemRequirements
  grantedSkills?: GrantedSkill[]
  special?: string
  rarity: string
}

interface Props {
  item: DetailedItem
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

const emit = defineEmits<{
  select: [item: DetailedItem]
}>()

const hasRequirements = computed(() => {
  return props.item.levelRequirement || 
         props.item.statRequirements.str || 
         props.item.statRequirements.dex || 
         props.item.statRequirements.int
})

// Combine special properties with derived shield stats
const combinedSpecial = computed(() => {
  const parts: string[] = []
  const itemAny = props.item as any
  const raw = itemAny.special as string | undefined
  if (raw && raw.trim().length > 0) parts.push(raw.trim())

  // Ensure Block chance is shown consistently for off-hand shields/bucklers
  const hasBlockInParts = parts.some(p => p.toLowerCase().startsWith('block chance:'))
  let blockStr: string | null = null
  const bc = itemAny.blockChance as number | undefined
  if (bc !== undefined && bc !== null) {
    blockStr = `Block chance: ${bc}%`
  } else if (!hasBlockInParts) {
    // Fallback inference by category/name if blockChance missing from data
    const name = (props.item.name || '') as string
    if (props.item.category === 'shields') {
      if (/Tower Shield/i.test(name)) blockStr = 'Block chance: 26%'
      else if (/Targe|Crest Shield|Golden Shield/i.test(name)) blockStr = 'Block chance: 25%'
      else blockStr = 'Block chance: 25%'
    } else if (props.item.category === 'bucklers') {
      blockStr = 'Block chance: 20%'
    }
  }
  if (blockStr) parts.unshift(blockStr)

  // Append Base Movement Speed if available (for shields, targes, etc.)
  const msp = itemAny.movementSpeedPenalty
  if (msp !== undefined && msp !== null && msp !== '') {
    parts.push(`Base Movement Speed: ${msp}`)
  }

  return parts.filter(p => p && p.length > 0).join(' | ')
})

const hasSpecial = computed(() => combinedSpecial.value.trim().length > 0)

// Icon for item category (unified with weapon-type icons)
const iconForCategory = computed(() => getItemTypeIcon(props.item.category))

// Dynamic stats display - generic for all weapon types
const displayStats = computed(() => {
  const stats: Array<{
    key: string
    label: string
    value: string | number
    cssClass: string
  }> = []
  const item = props.item

  // Define stat mappings with labels and CSS classes
  const statMappings = [
    { key: 'spirit', property: 'spirit', label: 'Spirit', cssClass: 'spirit' },
    { key: 'physicalDamage', property: 'physicalDamage', label: 'Physical Damage', cssClass: 'damage' },
    { key: 'fireDamage', property: 'fireDamage', label: 'Fire Damage', cssClass: 'fire-damage' },
    { key: 'lightningDamage', property: 'lightningDamage', label: 'Lightning Damage', cssClass: 'lightning-damage' },
    { key: 'criticalHitChance', property: 'criticalHitChance', label: 'Critical Hit Chance', cssClass: 'crit-chance' },
    { key: 'attacksPerSecond', property: 'attacksPerSecond', label: 'Attacks per Second', cssClass: 'attack-speed' },
    { key: 'weaponRange', property: 'weaponRange', label: 'Weapon Range', cssClass: 'weapon-range' }
  ]

  // Add stats that exist on this item
  statMappings.forEach(mapping => {
    const value = (item as any)[mapping.property]
    if (value !== undefined && value !== null) {
      stats.push({
        key: mapping.key,
        label: mapping.label,
        value: value,
        cssClass: mapping.cssClass
      })
    }
  })

  // Jewellery-specific fields (amulets, rings, belts)
  if ((item as any).lifeRegeneration) {
    stats.push({ key: 'lifeRegen', label: 'Life Regeneration', value: (item as any).lifeRegeneration, cssClass: 'life-regen' })
  }
  // Physical damage added by rings (e.g., Iron Ring)
  if ((item as any).physicalDamageToAttacks) {
    stats.push({ key: 'physicalDamageToAttacks', label: 'Physical Damage to Attacks', value: (item as any).physicalDamageToAttacks, cssClass: 'damage' })
  }
  if ((item as any).accuracyRating) {
    stats.push({ key: 'accuracyRating', label: 'Accuracy Rating', value: (item as any).accuracyRating, cssClass: 'accuracy-rating' })
  }
  if ((item as any).castSpeed) {
    stats.push({ key: 'castSpeed', label: 'Cast Speed', value: (item as any).castSpeed, cssClass: 'cast-speed' })
  }
  if ((item as any).manaRegeneration) {
    stats.push({ key: 'manaRegen', label: 'Mana Regeneration', value: (item as any).manaRegeneration, cssClass: 'mana-regen' })
  }
  if ((item as any).maximumLife) {
    stats.push({ key: 'maxLife', label: 'Maximum Life', value: (item as any).maximumLife, cssClass: 'max-life' })
  }
  if ((item as any).maximumMana) {
    stats.push({ key: 'maxMana', label: 'Maximum Mana', value: (item as any).maximumMana, cssClass: 'max-mana' })
  }
  if ((item as any).maximumEnergyShield) {
    stats.push({ key: 'maxES', label: 'Maximum Energy Shield', value: (item as any).maximumEnergyShield, cssClass: 'max-es' })
  }
  if ((item as any).attributeBonus) {
    stats.push({ key: 'attrBonus', label: 'Attribute Bonus', value: (item as any).attributeBonus, cssClass: 'attr-bonus' })
  }
  if ((item as any).spiritBonus) {
    stats.push({ key: 'spiritBonus', label: 'Spirit Bonus', value: (item as any).spiritBonus, cssClass: 'spirit' })
  }
  if ((item as any).rarityBonus) {
    stats.push({ key: 'rarityBonus', label: 'Item Rarity Bonus', value: (item as any).rarityBonus, cssClass: 'rarity-bonus' })
  }
  if ((item as any).resistances) {
    const res = (item as any).resistances
    Object.keys(res).forEach(k => {
      stats.push({ key: `res_${k}`, label: `${k.charAt(0).toUpperCase() + k.slice(1)} Resistance`, value: res[k], cssClass: 'resistance' })
    })
  }
  if ((item as any).modifierLimits) {
    const ml = (item as any).modifierLimits
    if (ml.prefixModifier) stats.push({ key: 'mod_pref', label: 'Prefix Modifier', value: ml.prefixModifier, cssClass: 'modifier-limits' })
    if (ml.suffixModifier) stats.push({ key: 'mod_suf', label: 'Suffix Modifier', value: ml.suffixModifier, cssClass: 'modifier-limits' })
  }
  if ((item as any).charmSlots) {
    stats.push({ key: 'charmSlots', label: 'Charm Slots', value: (item as any).charmSlots, cssClass: 'charm-slots' })
  }
  if ((item as any).flaskEffects) {
    stats.push({ key: 'flaskEffects', label: 'Flask Effects', value: (item as any).flaskEffects, cssClass: 'flask-effects' })
  }

  // Armour / Evasion / Energy Shield for armour pieces (Gloves, Boots, Body, Helm)
  if ((item as any).armour !== undefined) {
    stats.push({ key: 'armour', label: 'Armour', value: (item as any).armour, cssClass: 'armour' })
  }
  if ((item as any).evasionRating !== undefined) {
    stats.push({ key: 'evasionRating', label: 'Evasion Rating', value: (item as any).evasionRating, cssClass: 'evasion' })
  }
  if ((item as any).energyShield !== undefined) {
    stats.push({ key: 'energyShield', label: 'Energy Shield', value: (item as any).energyShield, cssClass: 'energy-shield' })
  }

  return stats
})

const formatCategory = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    sceptres: 'Sceptre',
    wands: 'Wand',
    spears: 'Spear',
    maces: 'Mace',
    bows: 'Bow',
    staves: 'Staff',
    foci: 'Focus',
    shields: 'Shield',
    bucklers: 'Buckler',
    quivers: 'Quiver'
  }
  return categoryMap[category] || category
}

const getItemIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    sceptres: 'ðŸ”®',
    wands: 'ðŸª„',
    spears: 'ðŸ”±',
    maces: 'ðŸ”¨',
    bows: 'ðŸ¹',
    staves: 'ðŸª¶',
    foci: 'ðŸ”®',
    shields: 'ðŸ›¡ï¸',
    bucklers: 'âš¡',
    quivers: 'ðŸ¹'
  }
  return iconMap[category] || 'âš”ï¸'
}

const getSkillIcon = (color: string): string => {
  const skillIconMap: { [key: string]: string } = {
    green: '🟢',
    blue: '🔵',
    red: '🔴',
    orange: '🟠',
    purple: '🟣',
  }
  return skillIconMap[color] || '⚪'
}
</script>

<style scoped>
.poe2-item-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #0d1117 100%);
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: 280px;
  max-width: 320px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.poe2-item-card:hover {
  border-color: #f7931e;
  box-shadow: 0 4px 16px rgba(247, 147, 30, 0.3);
  transform: translateY(-2px);
}

.poe2-item-card.selected {
  border-color: #f7931e;
  box-shadow: 0 0 20px rgba(247, 147, 30, 0.5);
}

.poe2-item-card.rarity-normal {
  border-color: #c8aa6e;
}

.poe2-item-card.rarity-magic {
  border-color: #8888ff;
}

.poe2-item-card.rarity-rare {
  border-color: #ffff77;
}

.poe2-item-card.rarity-unique {
  border-color: #af6025;
}

/* Header Section */
.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #30363d;
}

.item-icon {
  flex-shrink: 0;
}

.item-image {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border: 1px solid #4a5568;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-placeholder {
  font-size: 24px;
  opacity: 0.8;
}

.item-info {
  flex-grow: 1;
  min-width: 0;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #c8aa6e;
  margin: 0 0 4px 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-type {
  font-size: 12px;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Stats Section */
.item-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.stat-line.spirit {
  color: #7c3aed;
  font-weight: 500;
}

.stat-line.damage {
  color: #dc2626;
  font-weight: 500;
}

.stat-line.fire-damage {
  color: #ea580c;
  font-weight: 500;
}

.stat-line.lightning-damage {
  color: #2563eb;
  font-weight: 500;
}

.stat-line.crit-chance {
  color: #f59e0b;
  font-weight: 500;
}

.stat-line.attack-speed {
  color: #10b981;
  font-weight: 500;
}

.stat-line.weapon-range {
  color: darkslateblue;
  font-weight: 500;
}

.stat-line.special {
  color: #f59e0b;
  font-style: italic;
}

.special-text {
  text-align: center;
  width: 100%;
  font-size: 13px;
}

.weapon-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 0;
  border-top: 1px solid #21262d;
  border-bottom: 1px solid #21262d;
}

.weapon-stats .stat-line {
  font-size: 13px;
  margin: 0;
}

.stat-label {
  color: #8b949e;
}

.stat-value {
  color: #f0f6fc;
  font-weight: 600;
}

/* Requirements */
.requirements-section {
  padding: 8px 0;
  border-top: 1px solid #21262d;
}

.requirements-label {
  font-size: 12px;
  color: #8b949e;
  margin-bottom: 6px;
}

.requirements-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.requirement {
  font-size: 12px;
  color: #f0f6fc;
  background: rgba(139, 148, 158, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #30363d;
}

/* Granted Skills */
.granted-skills {
  padding-top: 8px;
  border-top: 1px solid #21262d;
}

.granted-skill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
}

.skill-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
}

.skill-icon.skill-green {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid #22c55e;
}

.skill-icon.skill-blue {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid #3b82f6;
}

.skill-icon.skill-red {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
}

.skill-icon.skill-orange {
  background: rgba(249, 115, 22, 0.2);
  border: 1px solid #f97316;
}

.skill-icon.skill-purple {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid #a855f7;
}

.skill-text {
  color: #f0f6fc;
  font-weight: 500;
}

.granted-skill.skill-green .skill-text {
  color: #22c55e;
}

.granted-skill.skill-blue .skill-text {
  color: #3b82f6;
}

.granted-skill.skill-red .skill-text {
  color: #ef4444;
}

.granted-skill.skill-orange .skill-text {
  color: #f97316;
}

.granted-skill.skill-purple .skill-text {
  color: #a855f7;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .poe2-item-card {
    min-width: 260px;
    max-width: 100%;
  }
  
  .item-header {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .requirements-list {
    justify-content: center;
  }
}
</style>
