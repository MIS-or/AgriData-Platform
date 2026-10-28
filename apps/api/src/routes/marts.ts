import { Hono } from 'hono';
import { aggregateCleanPricesToMarts, CleanPriceInput } from '../services/marts-aggregator.js';

export const martsRouter = new Hono();

// GET /api/v1/marts/weekly - Lấy chuỗi dữ liệu tổng hợp theo tuần cho Dashboard (Mã việc 2.8 & Giai đoạn 4)
martsRouter.get('/weekly', (c) => {
  const crop = c.req.query('crop') || 'bok_choy';
  const region = c.req.query('region') || 'vung_1_an_phu_tan';

  // Dữ liệu mẫu tầng sạch đã kiểm tra chất lượng
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

  return c.json({
    cropCode: crop,
    regionCode: region,
    totalWeeks: marts.length,
    marts,
  });
});
