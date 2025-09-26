# POE2 Auto-Craftmanship - System Roadmap (Early Access 0.3)

Living plan for the profit-driven crafting toolkit. Keep this document aligned with the latest research and implementation work.

## Vision
Create an end-to-end assistant that turns any crafting goal into an optimal strategy by combining live market data, exhaustive crafting options, and user-friendly presentation.

## Core User Capabilities
1. Base Acquisition Optimizer - find the cheapest way to obtain the desired base item.
2. Real-Time Market Alerts - notify when listings fall below configured thresholds with deep links to trade.
3. Craft Planner & Success Odds - let players choose item type, target mods, and constraints; compute success probability, cost, and time for every viable path.
4. Blueprint Library - save crafting plans, show required currency, steps, timing, and best methods.
5. Profitability Ranking - evaluate expected profit for crafted items using trade listings and currency prices.

## Current Foundations
- Data: Complete base item dataset (rings, gloves, armours, etc.) in `poe2_detailed_items.json` and frontend assets.
- Research: Comprehensive crafting method reference in `POE2_CRAFTING_METHODS.md` covering currencies, advanced chains, and gaps.
- External APIs:
  - poe2scout.com currency endpoints (live prices, exchange snapshots, pairs).
  - Official POE2 Trade endpoints (`/api/trade2/data/*`, `/search`, `/fetch`) confirmed via reverse engineering (`API_ANALYSIS.md`).
- Frontend: Vue SPA with composables for base data and early Profit Optimizer UI.
- Backend: Node/Express service with POE2Scout client (`poe2scout.service.ts`).

## Target System Architecture
- Data Layer: Unified fetcher for trade and currency APIs, with caching and database persistence for historical analysis.
- Computation Layer: Probability engines (craft action simulators, Monte Carlo), cost calculators, and profit estimators.
- Application Layer: REST/GraphQL endpoints and WebSocket alerts feeding the frontend dashboards.
- UI Layer: Interactive dashboards for base search, optimizer results, blueprint management, and alert configuration.

## Feature Roadmap (High Level)
- MVP Loop: Base acquisition search -> alert -> manual craft tracking.
- Optimizer Alpha: Deterministic path evaluation (Alteration + Regal, Chaos spam, Fracture flows) with estimated cost.
- Optimizer Beta: Full probabilistic modeling, scenario comparisons, ROI ranking, and blueprint exports.
- Live Operations: Scheduled data refresh, trend analytics, and player notification system.

## Immediate Implementation Priorities (Sprint)
1. Rewrite API Plan (this document) - ensure shared understanding.
2. Official Trade Client Service - TypeScript module to wrap `/data`, `/search`, `/fetch`, including compression, cookie management, and rate limits.
3. Data Pipeline Skeleton - background job or script to schedule search queries, fetch listings, and persist snapshots (disk or DB placeholder).
4. Craft Probability Module - start a library that ingests stat pools and currency actions to model success odds for core crafting sequences.
5. Documentation & Usage Notes - README updates or ADR summarising how to call the new services and planned extension points.

## Dependencies & Risks
- Authentication: Trade endpoints may require POE session cookies; need secure storage strategy.
- Rate Limits: Must respect throttling; queue requests and add exponential backoff.
- Data Quality: Ensure normalization between trade stats and internal mod definitions.
- Combinatorial Explosion: Optimizer must prune search space intelligently (weighting, heuristics).
- UI Alignment: Keep JSON keys and composables in sync with backend schemas to avoid blank sections.

## Next Review
Update this plan after completing the immediate priorities or when new league changes alter crafting mechanics.

