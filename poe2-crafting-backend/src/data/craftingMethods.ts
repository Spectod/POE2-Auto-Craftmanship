import currencyMetadata from '../shared/crafting_currency_metadata.json'
import { CraftingMethod } from '../schemas/craftingMethod'

const metadata = currencyMetadata as Record<string, { name?: string }>

export const craftingMethods: CraftingMethod[] = [
  {
    id: "classic-alteration-chain",
    displayName: "Transmute → Augment → Regal → Exalt Chain",
    requiresRarity: "normal",
    description: "Traditional progression for assembling a high-end rare item from a clean base.",
    targetItemClasses: ["weapon", "armour", "jewellery"],
    steps: [
      {
        action: "Upgrade base to magic",
        consumes: [
          {
            currencyId: "transmute",
            quantity: 1,
            notes: metadata['transmute']?.name,
          },
        ],
      },
      {
        action: "Fill second modifier slot",
        consumes: [
          {
            currencyId: "augment",
            quantity: 1,
            notes: metadata['augment']?.name,
          },
        ],
        notes: "Loop Alteration/Augmentation until desirable prefix/suffix pair is found.",
      },
      {
        action: "Promote to rare",
        consumes: [
          {
            currencyId: "regal",
            quantity: 1,
            notes: metadata['regal']?.name,
          },
        ],
        successChance: 1,
        failureOutcome: "Third mod may be undesirable; annul or restart as required.",
      },
      {
        action: "Add premium modifiers",
        consumes: [
          {
            currencyId: "exalted",
            quantity: 1,
            notes: metadata['exalted']?.name,
          },
        ],
        notes: "Repeat while open affix exists; combine with Hinekora’s Lock to preview results.",
      },
    ],
    idealUseCases: [
      "When alteration or essence pools are limited in EA 0.3",
      "Building precise rare items with known mod pools",
    ],
    cautions: [
      "High premium currency consumption",
      "Requires manual suffix/prefix management before exalting",
    ],
  },
  {
    id: "fracture-chaos-spam",
    displayName: "Fracture Lock then Chaos Spam",
    requiresRarity: "rare",
    description: "Lock a desired modifier with a Fracturing Orb, then roll the remaining affixes with Chaos Orbs.",
    targetItemClasses: ["weapon", "armour"],
    steps: [
      {
        action: "Lock key modifier",
        consumes: [
          {
            currencyId: "fracturing-orb",
            quantity: 1,
            notes: metadata['fracturing-orb']?.name,
          },
        ],
        successChance: 1,
        notes: "Works on non-influenced rare items with removable mods only.",
      },
      {
        action: "Reroll remaining mods",
        consumes: [
          {
            currencyId: "chaos",
            quantity: 1,
            notes: metadata['chaos']?.name,
          },
        ],
        notes: "Spam until suffix/prefix setup is acceptable. Follow up with Annul/Exalt for fine tuning.",
      },
    ],
    idealUseCases: [
      "Chasing +1 skill gems or tier-one defensive prefixes",
      "Preparing fractured trade bases with locked implicits",
    ],
    cautions: [
      "Chaos rolling remains random; budget for many attempts",
      "Cannot fracture influenced mods or items already fractured",
    ],
  },
  {
    id: "hinekoras-assisted-divine",
    displayName: "Hinekora's Lock + Divine",
    requiresRarity: "rare",
    description: "Use Hinekora’s Lock to preview Divine/Exalted outcomes and accept only the best rolls.",
    targetItemClasses: ["weapon", "armour", "jewellery", "unique"],
    steps: [
      {
        action: "Prime the craft with Hinekora’s Lock",
        consumes: [
          {
            currencyId: "hinekoras-lock",
            quantity: 1,
            notes: metadata['hinekoras-lock']?.name,
          },
        ],
        successChance: 1,
        notes: "Lock persists until the next crafting action resolves.",
      },
      {
        action: "Optimise numeric rolls",
        consumes: [
          {
            currencyId: "divine",
            quantity: 1,
            notes: metadata['divine']?.name,
          },
        ],
        successChance: 1,
        failureOutcome: "If preview is unfavourable, use a low-tier orb to cancel instead of accepting.",
      },
    ],
    idealUseCases: [
      "Finalising premium rares where each stat roll matters",
      "Working on uniques that cannot receive additional mods",
    ],
    cautions: [
      "Consumes a Hinekora’s Lock per attempt",
      "Requires spare currency to dismiss poor previews",
    ],
    references: ["POE2 Early Access 0.3 crafting benches"],
  },
]

export default craftingMethods
