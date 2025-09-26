"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEQ_FRACTURE_THEN_CHAOS = exports.SEQ_CHAOS_SPAM = exports.SEQ_ALT_REGAL = void 0;
exports.estimateActionSuccess = estimateActionSuccess;
exports.estimateSequence = estimateSequence;
function estimateActionSuccess(_state, action) {
    switch (action.type) {
        case 'transmute':
            return { successProbability: 1.0, expectedAttempts: 1 };
        case 'augment':
            return { successProbability: 0.5, expectedAttempts: 2 };
        case 'regal':
            return { successProbability: 1.0, expectedAttempts: 1 };
        case 'alchemy':
            return { successProbability: 1.0, expectedAttempts: 1 };
        case 'chaos':
            return { successProbability: 0.02, expectedAttempts: 50 };
        case 'exalt':
            return { successProbability: 1.0, expectedAttempts: 1 };
        case 'fracture':
            return { successProbability: 0.2, expectedAttempts: 5 };
        case 'divine':
            return { successProbability: 0.33, expectedAttempts: 3 };
        case 'annul':
            return { successProbability: 0.5, expectedAttempts: 2 };
        default:
            return { successProbability: 0, expectedAttempts: Infinity };
    }
}
function estimateSequence(state, actions) {
    let p = 1;
    for (const a of actions) {
        const r = estimateActionSuccess(state, a);
        p *= r.successProbability;
    }
    return { successProbability: p, expectedAttempts: p > 0 ? 1 / p : Infinity };
}
exports.SEQ_ALT_REGAL = [
    { type: 'transmute' },
    { type: 'augment' },
    { type: 'regal' },
];
exports.SEQ_CHAOS_SPAM = [
    { type: 'alchemy' },
    { type: 'chaos' },
];
exports.SEQ_FRACTURE_THEN_CHAOS = [
    { type: 'fracture' },
    { type: 'chaos' },
];
//# sourceMappingURL=craftingProbability.js.map