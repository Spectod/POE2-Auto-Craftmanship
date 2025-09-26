# Official Trade Client Usage (POE2)

Minimal example for using the reverse-engineered trade client.

## Prerequisites
- Node 18+
- Optional: set environment variable `POESESSID` for authenticated requests.

## Example (TypeScript)

```ts
import Trade2Service from '../../poe2-crafting-backend/src/services/trade2.service';

async function run() {
  const trade = new Trade2Service();
  const leagues = await trade.getLeagues();
  const league = process.env.POE2_LEAGUE || leagues[0]?.id || 'Standard';

  const query = {
    query: {
      status: { option: 'online' },
      filters: { type_filters: { filters: { category: { option: 'armour.gloves' } } } },
    },
    sort: { price: 'asc' },
  };

  const search = await trade.search(league, query);
  const details = await trade.fetch(search.id, search.result.slice(0, 10));
  console.log(details.result.map(r => ({ type: r.item?.typeLine, price: r.listing?.price })));
}

run();
```

## Notes
- Respect rate limits; the client adds a small delay between fetch chunks.
- For stable access, login in a browser and copy your `POESESSID` cookie to an environment variable.
- See also: `poe2-crafting-backend/src/jobs/tradeSnapshot.job.ts` for a runnable example.

