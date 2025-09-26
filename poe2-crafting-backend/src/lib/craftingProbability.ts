/**
 * Crafting Probability Module (alpha scaffold)
 *
 * Goal: Provide probability and expected cost estimations for core crafting sequences.
 * Data sources: `POE2_CRAFTING_METHODS.md`, trade stats (/api/trade2/data/stats), currency prices (poe2scout).
 */

export type Rarity = 'normal' | 'magic' | 'rare' | 'unique';

export interface ItemState {
  baseType: string;
  ilvl: number;
  rarity: Rarity;
  prefixes: number;
  suffixes: number;
  fractured?: string[]; // protected mods
}

export type CraftActionType =
  | 'transmute'
  | 'augment'
  | 'regal'
  | 'alchemy'
  | 'chaos'
  | 'exalt'
  | 'divine'
  | 'annul'
  | 'fracture';

export interface CraftAction {
  type: CraftActionType;
  // Optional params like target pools or weights could be added later
}

export interface ProbabilityResult {
  successProbability: number; // 0..1
  expectedAttempts: number;   // attempts for success (1/p)
}

/**
 * Placeholder single-step probability model.
 * Will be replaced with mod-pool aware calculations using /data/stats and item metadata.
 */
export function estimateActionSuccess(_state: ItemState, action: CraftAction): ProbabilityResult {
  switch (action.type) {
    case 'transmute':
      return { successProbability: 1.0, expectedAttempts: 1 };
    case 'augment':
      // Depends on open affix slots and pool size; placeholder
      return { successProbability: 0.5, expectedAttempts: 2 };
    case 'regal':
      return { successProbability: 1.0, expectedAttempts: 1 };
    case 'alchemy':
      return { successProbability: 1.0, expectedAttempts: 1 };
    case 'chaos':
      // Success = hitting target set; placeholder small probability
      return { successProbability: 0.02, expectedAttempts: 50 };
    case 'exalt':
      return { successProbability: 1.0, expectedAttempts: 1 };
    case 'fracture':
      // Placeholder: 1/number_of_mods chance to fracture desired mod
      return { successProbability: 0.2, expectedAttempts: 5 };
    case 'divine':
      // Depends on stat ranges; placeholder
      return { successProbability: 0.33, expectedAttempts: 3 };
    case 'annul':
      // Removing wrong mod risk; placeholder
      return { successProbability: 0.5, expectedAttempts: 2 };
    default:
      return { successProbability: 0, expectedAttempts: Infinity };
  }
}

/**
 * Combine independent attempts naively for a sequence. This is a stub.
 * Later: replace with stateful simulation (Markov/Monte Carlo) over mod pools.
 */
export function estimateSequence(state: ItemState, actions: CraftAction[]): ProbabilityResult {
  let p = 1;
  for (const a of actions) {
    const r = estimateActionSuccess(state, a);
    p *= r.successProbability;
  }
  return { successProbability: p, expectedAttempts: p > 0 ? 1 / p : Infinity };
}

// Common sequences (initial examples)
export const SEQ_ALT_REGAL: CraftAction[] = [
  { type: 'transmute' },
  { type: 'augment' },
  { type: 'regal' },
];

export const SEQ_CHAOS_SPAM: CraftAction[] = [
  { type: 'alchemy' },
  { type: 'chaos' },
];

export const SEQ_FRACTURE_THEN_CHAOS: CraftAction[] = [
  { type: 'fracture' },
  { type: 'chaos' },
];

