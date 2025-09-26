import Trade2Service from '../services/trade2.service';
import type { TradeSearchRequest } from '../types/trade2.types';

async function main() {
  const trade = new Trade2Service();

  // 1) Determine league
  const leagues = await trade.getLeagues();
  const preferred = process.env.POE2_LEAGUE || leagues[0]?.id || 'Standard';
  console.log(`[tradeSnapshot] Using league: ${preferred}`);

  // 2) Example: simple armour chest search (online sellers)
  const body: TradeSearchRequest = {
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

  // 3) Fetch first few results
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

