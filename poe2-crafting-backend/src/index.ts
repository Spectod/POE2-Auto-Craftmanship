import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { POE2ScoutService } from './services/poe2scout.service';
import Trade2Service from './services/trade2.service';
import craftingMethods from './data/craftingMethods';
// @ts-ignore - JSON import
import currencyMetadata from './shared/crafting_currency_metadata.json';

// Load environment variables
dotenv.config();

// Initialize services
const poe2Service = new POE2ScoutService();
const trade2Service = new Trade2Service();

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// ==================== MIDDLEWARE ====================

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.API_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true
}));

// Other middleware
app.use(compression());
app.use('/api/', limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

// Root route
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
      // items: '/api/items' // TODO: à¸£à¸­à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ base items à¹ƒà¸«à¸¡à¹ˆà¸ˆà¸²à¸à¸„à¸¸à¸“
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== LEAGUES ROUTES ====================

/**
 * GET /api/leagues - Get all available leagues
 */
app.get('/api/leagues', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagues = await poe2Service.getLeagues();
    res.json({
      success: true,
      data: leagues
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leagues/current - Get current active league
 */
app.get('/api/leagues/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentLeague = await poe2Service.getCurrentLeague();
    res.json({
      success: true,
      data: currentLeague
    });
  } catch (error) {
    next(error);
  }
});

// ==================== CURRENCY ROUTES ====================

/**
 * GET /api/currency - Get currency items for crafting
 */
app.get('/api/currency', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { league, category = 'currency', page = '1' } = req.query;
    
    const currencyData = await poe2Service.getCurrencyItems(
      category as string,
      league as string,
      parseInt(page as string)
    );
    
    res.json({
      success: true,
      data: currencyData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/currency/crafting - Get all currency formatted for crafting calculations
 */
app.get('/api/currency/crafting', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { league } = req.query;
    
    const craftingCurrencies = await poe2Service.getAllCurrencyForCrafting(league as string);
    
    res.json({
      success: true,
      data: craftingCurrencies
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/currency/exchange - Get currency exchange snapshot
 */
app.get('/api/currency/exchange', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { league } = req.query;
    
    const exchangeData = await poe2Service.getCurrencyExchangeSnapshot(league as string);
    
    res.json({
      success: true,
      data: exchangeData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/currency/pairs - Get currency exchange pairs
 */
app.get('/api/currency/pairs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { league } = req.query;
    
    const pairsData = await poe2Service.getCurrencyExchangePairs(league as string);
    
    res.json({
      success: true,
      data: pairsData
    });
  } catch (error) {
    next(error);
  }
});

// ==================== ITEMS ROUTES ====================
// TODO: à¸£à¸­à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ base items à¹ƒà¸«à¸¡à¹ˆà¸ˆà¸²à¸à¸„à¸¸à¸“

/*
/**
 * GET /api/items - Get unique items
 */
/*
app.get('/api/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { league, page = '1' } = req.query;
    
    const itemsData = await poe2Service.getUniqueItems(
      league as string,
      parseInt(page as string)
    );
    
    res.json({
      success: true,
      data: itemsData
    });
  } catch (error) {
    next(error);
  }
});
*/

/*
/**
 * GET /api/items/categories - Get item categories
 */
/*
app.get('/api/items/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await poe2Service.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});
*/


// ==================== CRAFTING METADATA ====================

app.get('/api/currency/metadata', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: currencyMetadata
  });
});

app.get('/api/crafting/methods', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: craftingMethods
  });
});

// ==================== OFFICIAL TRADE ROUTES ====================

/** GET /api/trade/leagues - leagues for poe2 realm */
app.get('/api/trade/leagues', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagues = await trade2Service.getLeagues();
    res.json({ success: true, data: leagues });
  } catch (err) { next(err as any); }
});

/** GET /api/trade/data/items - items catalog */
app.get('/api/trade/data/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await trade2Service.getItemsData();
    res.json({ success: true, data });
  } catch (err) { next(err as any); }
});

/** GET /api/trade/data/stats - stats catalog */
app.get('/api/trade/data/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await trade2Service.getStatsData();
    res.json({ success: true, data });
  } catch (err) { next(err as any); }
});

/** POST /api/trade/search/:league - create query */
app.post('/api/trade/search/:league', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { league } = req.params;
    const body = req.body;
    const search = await trade2Service.search(league, body);
    res.json({ success: true, data: search });
  } catch (err) { next(err as any); }
});

/** GET /api/trade/fetch/:queryId?ids=a,b,c - fetch results */
app.get('/api/trade/fetch/:queryId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { queryId } = req.params;
    const idsParam = (req.query.ids as string) || '';
    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) return res.status(400).json({ success: false, error: 'ids query param required' });
    const details = await trade2Service.fetch(queryId, ids);
    res.json({ success: true, data: details });
  } catch (err) { next(err as any); }
});

// ==================== UTILITY ROUTES ====================

/**
 * GET /api/cache/stats - Get cache statistics (development only)
 */
app.get('/api/cache/stats', (req: Request, res: Response) => {
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

/**
 * POST /api/cache/clear - Clear cache (development only)
 */
app.post('/api/cache/clear', (req: Request, res: Response) => {
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

// ==================== ERROR HANDLING ====================

interface ApiError extends Error {
  statusCode?: number;
}

// Error handling middleware
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log(`POE2 Auto-Craftmanship Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Base URL: http://localhost:${PORT}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5174'}`);
});
