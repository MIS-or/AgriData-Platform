import { Hono } from 'hono';
import { FarmerProfileSchema } from '@agridata/contracts';
import { generatePersonalizedRecommendations } from '../services/farmer-personalization';
import { generateZaloWeeklyBulletin, auditGateG5 } from '../services/zalo-bulletin';

export const farmerRouter = new Hono();

// POST /api/v1/farmer/personalized - calculate personalized recommendations
farmerRouter.post('/personalized', async (c) => {
  try {
    const body = await c.req.json();
    const profile = FarmerProfileSchema.parse(body.profile);
    const regionalCapacities = body.regionalCapacities || {};
    const marketForecasts = body.marketForecasts || {
      bok_choy: { q10: 11000, q50: 14000, q90: 17000 },
      choi_sum: { q10: 9500, q50: 12500, q90: 15500 },
      cucumber: { q10: 12000, q50: 15000, q90: 18500 },
      lettuce: { q10: 14000, q50: 17500, q90: 21000 },
    };
    const weatherCaution = body.weatherCaution;

    const recommendations = generatePersonalizedRecommendations(
      profile,
      regionalCapacities,
      marketForecasts,
      weatherCaution
    );

    return c.json({
      success: true,
      farmerId: profile.farmerId,
      coopId: profile.coopId,
      recommendations,
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

// GET /api/v1/farmer/zalo-bulletin - weekly bulletin payload
farmerRouter.get('/zalo-bulletin', (c) => {
  const dummyRecs = generatePersonalizedRecommendations(
    {
      farmerId: 'F_DEMO',
      name: 'Nông hộ Hợp tác xã An Phú Tân',
      phone: '0912345678',
      coopId: 'COOP_AN_PHU_TAN',
      coopName: 'HTX Nông nghiệp An Phú Tân',
      totalAreaM2: 2000,
      availableCapitalVnd: 15000000,
      soilType: 'alluvial',
      experienceYears: 10,
    },
    {
      bok_choy: { safeCapacityM2: 10000, currentRegisteredM2: 4500 },
      choi_sum: { safeCapacityM2: 8000, currentRegisteredM2: 3000 },
    },
    {
      bok_choy: { q10: 12000, q50: 14500, q90: 17000 },
      choi_sum: { q10: 10000, q50: 12500, q90: 15000 },
      cucumber: { q10: 13000, q50: 16000, q90: 19000 },
      lettuce: { q10: 15000, q50: 18000, q90: 22000 },
    }
  );

  const bulletin = generateZaloWeeklyBulletin(
    'COOP_AN_PHU_TAN',
    'HTX Nông nghiệp An Phú Tân',
    25,
    dummyRecs,
    '2026-W44',
    'Thời tiết có mưa nhỏ ngày thứ 4, bà con lưu ý kiểm tra mương liếp.',
    'Nguồn cung Cải thìa và Dưa leo tuần này đang ở mức an toàn.'
  );

  return c.json({
    success: true,
    bulletin,
  });
});

// GET /api/v1/farmer/gate-g5-audit - Gate G5 verification
farmerRouter.get('/gate-g5-audit', (c) => {
  const audit = auditGateG5();
  return c.json({
    gate: 'G5',
    ...audit,
  });
});
