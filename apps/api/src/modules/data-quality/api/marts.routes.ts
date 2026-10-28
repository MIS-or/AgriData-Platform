import { Hono } from 'hono';
import { aggregateCleanPricesToMarts, CleanPriceInput } from '../application/marts-aggregator.js';
import { Env } from '../../../core/config/env.js';
import { edgeKvGet, edgeKvPut } from '../../../core/cloudflare/edge-services.js';

export const martsRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/marts/weekly - Lấy chuỗi dữ liệu tổng hợp theo tuần cho Dashboard (Mã việc 2.8 & Giai đoạn 4)
martsRouter.get('/weekly', async (c) => {
  const crop = c.req.query('crop') || 'bok_choy';
  const region = c.req.query('region') || 'vung_1_an_phu_tan';
  const cacheKey = `marts:weekly:${crop}:${region}`;

  // [Goal G4 & X6] Serve aggregated Tier-3 Weekly Marts from Cloudflare Workers KV Edge Cache (< 1ms)
  const cachedJson = await edgeKvGet(c.env, cacheKey);
  if (cachedJson) {
    return c.json({
      ...JSON.parse(cachedJson),
      cacheHit: true,
    });
  }

  const sampleCleanPrices: CleanPriceInput[] = [
    { cropCode: crop, regionCode: region, date: '2026-10-05', priceVndPerKg: 11000 },
    { cropCode: crop, regionCode: region, date: '2026-10-07', priceVndPerKg: 11500 },
    { cropCode: crop, regionCode: region, date: '2026-10-09', priceVndPerKg: 12000 },
    { cropCode: crop, regionCode: region, date: '2026-10-12', priceVndPerKg: 12200 },
    { cropCode: crop, regionCode: region, date: '2026-10-14', priceVndPerKg: 12500 },
    { cropCode: crop, regionCode: region, date: '2026-10-16', priceVndPerKg: 12800 },
    { cropCode: crop, regionCode: region, date: '2026-10-19', priceVndPerKg: 13000 },
    { cropCode: crop, regionCode: region, date: '2026-10-21', priceVndPerKg: 13200 },
    { cropCode: crop, regionCode: region, date: '2026-10-23', priceVndPerKg: 13500 },
    { cropCode: crop, regionCode: region, date: '2026-10-26', priceVndPerKg: 12500 },
    { cropCode: crop, regionCode: region, date: '2026-10-28', priceVndPerKg: 12800 },
  ];

  const marts = aggregateCleanPricesToMarts(sampleCleanPrices);
  const payload = {
    cropCode: crop,
    regionCode: region,
    totalWeeks: marts.length,
    marts,
  };

  await edgeKvPut(c.env, cacheKey, JSON.stringify(payload), 3600);

  return c.json({
    ...payload,
    cacheHit: false,
  });
});
