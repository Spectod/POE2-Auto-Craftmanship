export type ItemRarity = 'normal' | 'magic' | 'rare' | 'unique' | 'corrupted';
export interface CraftingCostComponent {
    currencyId: string;
    quantity: number;
    notes?: string;
}
export interface CraftingOutcome {
    description: string;
    resultingRarity?: ItemRarity;
    addsModifier?: boolean;
    removesModifier?: boolean;
    locksModifier?: boolean;
    corruptsItem?: boolean;
}
export interface CraftingMethodStep {
    action: string;
    consumes?: CraftingCostComponent[];
    successChance?: number;
    failureOutcome?: string;
    notes?: string;
}
export interface CraftingMethod {
    id: string;
    displayName: string;
    requiresRarity: ItemRarity;
    targetItemClasses?: string[];
    description: string;
    steps: CraftingMethodStep[];
    idealUseCases: string[];
    cautions?: string[];
    references?: string[];
}
//# sourceMappingURL=craftingMethod.d.ts.map