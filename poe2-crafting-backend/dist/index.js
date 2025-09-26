"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const poe2scout_service_1 = require("./services/poe2scout.service");
const trade2_service_1 = __importDefault(require("./services/trade2.service"));
const craftingMethods_1 = __importDefault(require("./data/craftingMethods"));
const crafting_currency_metadata_json_1 = __importDefault(require("./shared/crafting_currency_metadata.json"));
dotenv_1.default.config();
const poe2Service = new poe2scout_service_1.POE2ScoutService();
const trade2Service = new trade2_service_1.default();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3002;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.API_WINDOW_MS || '900000'),
    max: parseInt(process.env.API_RATE_LIMIT || '100'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
    credentials: true
}));
app.use((0, compression_1.default)());
app.use('/api/', limiter);
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.json({
        message: 'POE2 Auto-Craftmanship Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            leagues: '/api/leagues',
            currency: '/api/currency',
            trade: {
                leagues: '/api/trade/leagues',
                itemsData: '/api/trade/data/items',
                statsData: '/api/trade/data/stats',
                search: '/api/trade/search/:league',
                fetch: '/api/trade/fetch/:queryId?ids=...'
            }
        }
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
app.get('/api/leagues', async (req, res, next) => {
    try {
        const leagues = await poe2Service.getLeagues();
        res.json({
            success: true,
            data: leagues
        });
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/leagues/current', async (req, res, next) => {
    try {
        const currentLeague = await poe2Service.getCurrentLeague();
        res.json({
            success: true,
            data: currentLeague
        });
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/currency', async (req, res, next) => {
    try {
        const { league, category = 'currency', page = '1' } = req.query;
        const currencyData = await poe2Service.getCurrencyItems(category, league, parseInt(page));
        res.json({
            success: true,
            data: currencyData
        });
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/currency/crafting', async (req, res, next) => {
    try {
        const { league } = req.query;
        const craftingCurrencies = await poe2Service.getAllCurrencyForCrafting(league);
        res.json({
            success: true,
            data: craftingCurrencies
        });
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/currency/exchange', async (req, res, next) => {
    try {
        const { league } = req.query;
        const exchangeData = await poe2Service.getCurrencyExchangeSnapshot(league);
        res.json({
            success: true,
            data: exchangeData
        });
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/currency/pairs', async (req, res, next) => {
    try {
        const { league } = req.query;
        const pairsData = await poe2Service.getCurrencyExchangePairs(league);
        res.json({
            success: true,
            data: pairsData
        });
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/currency/metadata', (req, res) => {
    res.json({
        success: true,
        data: crafting_currency_metadata_json_1.default
    });
});
app.get('/api/crafting/methods', (req, res) => {
    res.json({
        success: true,
        data: craftingMethods_1.default
    });
});
app.get('/api/trade/leagues', async (req, res, next) => {
    try {
        const leagues = await trade2Service.getLeagues();
        res.json({ success: true, data: leagues });
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/trade/data/items', async (req, res, next) => {
    try {
        const data = await trade2Service.getItemsData();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/trade/data/stats', async (req, res, next) => {
    try {
        const data = await trade2Service.getStatsData();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
});
app.post('/api/trade/search/:league', async (req, res, next) => {
    try {
        const { league } = req.params;
        const body = req.body;
        const search = await trade2Service.search(league, body);
        res.json({ success: true, data: search });
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/trade/fetch/:queryId', async (req, res, next) => {
    try {
        const { queryId } = req.params;
        const idsParam = req.query.ids || '';
        const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
        if (!ids.length)
            return res.status(400).json({ success: false, error: 'ids query param required' });
        const details = await trade2Service.fetch(queryId, ids);
        res.json({ success: true, data: details });
    }
    catch (err) {
        next(err);
    }
});
app.get('/api/cache/stats', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            error: 'This endpoint is only available in development mode'
        });
    }
    const stats = poe2Service.getCacheStats();
    res.json({
        success: true,
        data: stats
    });
});
app.post('/api/cache/clear', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            error: 'This endpoint is only available in development mode'
        });
    }
    poe2Service.clearCache();
    res.json({
        success: true,
        message: 'Cache cleared successfully'
    });
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});
app.listen(PORT, () => {
    console.log(`POE2 Auto-Craftmanship Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Base URL: http://localhost:${PORT}`);
    console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5174'}`);
});
//# sourceMappingURL=index.js.map