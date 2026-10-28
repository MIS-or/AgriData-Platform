import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CROP_DICTIONARY, CropCode } from '@agridata/contracts';
import { Env, resolveEnvSecret } from './core/config/env.js';

// Import strictly through each Bounded Context's Public Facade (`./modules/<module>/index.js`)
import { sourcesRouter, ingestRouter, fetchOpenMeteoWeather } from './modules/ingestion/index.js';
import { qualityRouter, martsRouter } from './modules/data-quality/index.js';
import { modelsRouter } from './modules/market-intelligence/index.js';
import { farmerRouter, evaluateFarmerRecommendation } from './modules/farmer-advisory/index.js';
import { fieldAuditRouter } from './modules/field-experiment/index.js';
import { operationsRouter } from './modules/platform-ops/index.js';

export type { Env };
export { resolveEnvSecret };

const app = new Hono<{ Bindings: Env }>();

// Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// Enable CORS for Cloudflare Pages frontend
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 86400,
}));

// Production Global Error Handler (Never leaks secrets or stack traces)
app.onError((err, c) => {
  console.error(`[EDGE API ERROR] ${err.message}`);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
  }, 500);
});

// Production 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint Not Found',
    path: c.req.path,
    documentation: 'https://github.com/Joyce/AgriData-Platform/docs',
  }, 404);
});

app.get('/health', (c) => {
  const mode = resolveEnvSecret(c.env, 'NODE_ENV') || 'production';
  return c.json({
    status: 'ok',
    service: 'agridata-edge-api',
    architecture: 'modular-monolith',
    environment: mode,
    platform: 'cloudflare-workers-free-tier',
    timestamp: new Date().toISOString(),
  });
});

// Mount 6 Independent Bounded Context Routers
app.route('/api/v1/sources', sourcesRouter);
app.route('/api/v1/ingest', ingestRouter);
app.route('/api/v1/marts', martsRouter);
app.route('/api/v1/quality', qualityRouter);
app.route('/api/v1/models', modelsRouter);
app.route('/api/v1/farmer', farmerRouter);
app.route('/api/v1/field', fieldAuditRouter);
app.route('/api/v1/ops', operationsRouter);

// Endpoint trả về từ điển cây trồng thí điểm
app.get('/api/v1/crops', (c) => {
  return c.json({
    crops: Object.values(CROP_DICTIONARY),
  });
});

// Endpoint dự báo thời tiết vùng thí điểm từ Open-Meteo
app.get('/api/v1/weather/pilot', async (c) => {
  try {
    const { dailyMetrics, rawResult } = await fetchOpenMeteoWeather();
    return c.json({
      success: true,
      region: 'An Phú Tân',
      contentHash: rawResult.contentHash,
      dailyForecast: dailyMetrics,
    });
  } catch (err: any) {
    return c.json({
      success: false,
      error: 'Không thể kết nối API thời tiết',
      detail: err.message,
    }, 502);
  }
});

// Endpoint đề xuất hành động cho nông dân (Gate G5)
app.get('/api/v1/recommendations/farmer', (c) => {
  const cropCodeParam = (c.req.query('crop') || 'bok_choy') as CropCode;
  const registeredArea = Number(c.req.query('registered_area_m2') || '8000');
  const maxSafeArea = Number(c.req.query('max_safe_area_m2') || '10000');

  const breakevenMap: Record<CropCode, number> = {
    bok_choy: 7500,
    choi_sum: 8000,
    cucumber: 9500,
    lettuce: 12000,
  };

  const expectedPriceMap: Record<CropCode, [number, number]> = {
    bok_choy: [10000, 14000],
    choi_sum: [8500, 11000],
    cucumber: [6000, 8500],
    lettuce: [14000, 19000],
  };

  const recommendation = evaluateFarmerRecommendation({
    cropCode: cropCodeParam in CROP_DICTIONARY ? cropCodeParam : 'bok_choy',
    breakevenPriceVnd: breakevenMap[cropCodeParam] || 8000,
    expectedPriceVndRange: expectedPriceMap[cropCodeParam] || [9000, 12000],
    cooperativeRegisteredAreaM2: registeredArea,
    cooperativeMaxSafeAreaM2: maxSafeArea,
    cooperativeId: 'htx_an_phu_tan',
  });

  return c.json({
    data: recommendation,
  });
});

// Cloudflare Scheduled Worker (Cron Trigger handler)
export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext) {
    console.log(`[CRON] Scheduled price crawler triggered at ${new Date().toISOString()}`);
  },
};
