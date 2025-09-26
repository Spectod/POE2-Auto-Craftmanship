"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade2Service = void 0;
const axios_1 = __importDefault(require("axios"));
class Trade2Service {
    constructor() {
        this.baseURL = 'https://www.pathofexile.com';
        const poeSessId = process.env.POESESSID || process.env.POE_COOKIE;
        this.api = axios_1.default.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'POE2-Auto-Craftmanship/1.0.0 (+optimizer)',
                ...(poeSessId ? { 'Cookie': `POESESSID=${poeSessId}` } : {}),
                'Origin': 'https://www.pathofexile.com',
                'Referer': 'https://www.pathofexile.com/trade2',
            },
            decompress: true,
        });
    }
    async getLeagues() {
        const { data } = await this.api.get('/api/leagues', {
            params: { realm: 'poe2' },
        });
        return data;
    }
    async getItemsData() {
        const { data } = await this.api.get('/api/trade2/data/items');
        return data;
    }
    async getStatsData() {
        const { data } = await this.api.get('/api/trade2/data/stats');
        return data;
    }
    async search(league, body) {
        const { data } = await this.api.post(`/api/trade2/search/${encodeURIComponent(league)}`, body);
        return data;
    }
    async fetch(queryId, ids, chunkSize = 10) {
        const all = [];
        for (let i = 0; i < ids.length; i += chunkSize) {
            const chunk = ids.slice(i, i + chunkSize);
            const { data } = await this.api.get(`/api/trade2/fetch/${chunk.join(',')}`, { params: { query: queryId } });
            if (data?.result?.length)
                all.push(...data.result);
            await new Promise(r => setTimeout(r, 200));
        }
        return { result: all };
    }
}
exports.Trade2Service = Trade2Service;
exports.default = Trade2Service;
//# sourceMappingURL=trade2.service.js.map