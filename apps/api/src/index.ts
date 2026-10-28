import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CROP_DICTIONARY, CropCode } from '@agridata/contracts';
import { evaluateFarmerRecommendation } from './services/rule-engine.js';
import { sourcesRouter } from './routes/sources.js';
import { ingestRouter } from './routes/ingest.js';
import { martsRouter } from './routes/marts.js';
import { qualityRouter } from './routes/quality.js';
import { modelsRouter } from './routes/models.js';
import { fetchOpenMeteoWeather } from './services/weather.js';

export interface Env {
  DB?: any;          // Cloudflare D1
  KV_CACHE?: any;    // Cloudflare KV
  NEON_DATABASE_URL?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for Cloudflare Pages frontend
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'agridata-edge-api',
    platform: 'cloudflare-workers-free-tier',
    timestamp: new Date().toISOString(),
  });
});

// Gắn các sub-routers
app.route('/api/v1/sources', sourcesRouter);
app.route('/api/v1/ingest', ingestRouter);
app.route('/api/v1/marts', martsRouter);
app.route('/api/v1/quality', qualityRouter);
app.route('/api/v1/models', modelsRouter);

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
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`[CRON] Scheduled price crawler triggered at ${new Date().toISOString()}`);
  },
};
