"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const trade2_service_1 = __importDefault(require("../services/trade2.service"));
async function main() {
    const trade = new trade2_service_1.default();
    const leagues = await trade.getLeagues();
    const preferred = process.env.POE2_LEAGUE || leagues[0]?.id || 'Standard';
    console.log(`[tradeSnapshot] Using league: ${preferred}`);
    const body = {
        query: {
            status: { option: 'online' },
            filters: {
                type_filters: { filters: { category: { option: 'armour.chest' } } },
            },
        },
        sort: { price: 'asc' },
    };
    const search = await trade.search(preferred, body);
    console.log(`[tradeSnapshot] QueryId=${search.id} total=${search.total} first=${search.result?.[0]}`);
    const slice = search.result.slice(0, 10);
    const details = await trade.fetch(search.id, slice);
    const preview = details.result.map(r => ({
        id: r.id,
        type: `${r.item?.name || ''} ${r.item?.typeLine || ''}`.trim(),
        ilvl: r.item?.ilvl,
        price: r.listing?.price,
    }));
    console.log('[tradeSnapshot] Preview:', preview);
}
main().catch(err => {
    console.error('[tradeSnapshot] Error:', err?.message || err);
    process.exitCode = 1;
});
//# sourceMappingURL=tradeSnapshot.job.js.map