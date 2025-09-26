export type Rarity = 'normal' | 'magic' | 'rare' | 'unique';
export interface ItemState {
    baseType: string;
    ilvl: number;
    rarity: Rarity;
    prefixes: number;
    suffixes: number;
    fractured?: string[];
}
export type CraftActionType = 'transmute' | 'augment' | 'regal' | 'alchemy' | 'chaos' | 'exalt' | 'divine' | 'annul' | 'fracture';
export interface CraftAction {
    type: CraftActionType;
}
export interface ProbabilityResult {
    successProbability: number;
    expectedAttempts: number;
}
export declare function estimateActionSuccess(_state: ItemState, action: CraftAction): ProbabilityResult;
export declare function estimateSequence(state: ItemState, actions: CraftAction[]): ProbabilityResult;
export declare const SEQ_ALT_REGAL: CraftAction[];
export declare const SEQ_CHAOS_SPAM: CraftAction[];
export declare const SEQ_FRACTURE_THEN_CHAOS: CraftAction[];
//# sourceMappingURL=craftingProbability.d.ts.map