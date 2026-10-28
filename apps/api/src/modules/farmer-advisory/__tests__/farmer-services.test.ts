import { describe, it, expect } from 'vitest';
import { generatePersonalizedRecommendations } from '../application/farmer-personalization.js';
import { generateZaloWeeklyBulletin, auditGateG5 } from '../application/zalo-bulletin.js';
import { FarmerProfile } from '@agridata/contracts';

describe('Module 4 [farmer-advisory]: Farmer Services & Zalo Integration (Gate G5)', () => {
  const baseFarmer: FarmerProfile = {
    farmerId: 'F_001',
    name: 'Chú Ba Đất Đỏ',
    phone: '0918123456',
    coopId: 'COOP_01',
    coopName: 'HTX Rau Sạch An Phú Tân',
    totalAreaM2: 3000,
    availableCapitalVnd: 20000000,
    soilType: 'alluvial',
    experienceYears: 15,
  };

  const defaultForecasts = {
    bok_choy: { q10: 11000, q50: 14500, q90: 17000 },
    choi_sum: { q10: 9000, q50: 12000, q90: 15000 },
    cucumber: { q10: 12500, q50: 15500, q90: 18500 },
    lettuce: { q10: 14000, q50: 17500, q90: 21000 },
  };

  it('generates personalized recommendations with "Nên trồng" when conditions are optimal', () => {
    const capacities = {
      bok_choy: { safeCapacityM2: 10000, currentRegisteredM2: 4000 },
      choi_sum: { safeCapacityM2: 8000, currentRegisteredM2: 3000 },
      cucumber: { safeCapacityM2: 5000, currentRegisteredM2: 2000 },
      lettuce: { safeCapacityM2: 6000, currentRegisteredM2: 2500 },
    };

    const recs = generatePersonalizedRecommendations(baseFarmer, capacities, defaultForecasts);
    expect(recs.length).toBe(4);
    expect(recs[0]!.recommendationTag).toBe('NEN_TRONG');
    expect(recs[0]!.vietnameseTag).toBe('Nên trồng');
    expect(recs[0]!.breakevenPriceVnd).toBeGreaterThan(0);
    expect(recs[0]!.antiHerdStatus).toBe('SAFE');
  });

  it('triggers anti-herd restriction ("Chưa nên") when registered area exceeds 120% of safe capacity', () => {
    const saturatedCapacities = {
      bok_choy: { safeCapacityM2: 10000, currentRegisteredM2: 13000 },
    };

    const recs = generatePersonalizedRecommendations(baseFarmer, saturatedCapacities, defaultForecasts);
    const bokChoy = recs.find((r) => r.cropCode === 'bok_choy');
    expect(bokChoy).toBeDefined();
    expect(bokChoy!.recommendationTag).toBe('CHUA_NEN');
    expect(bokChoy!.vietnameseTag).toBe('Chưa nên');
    expect(bokChoy!.antiHerdStatus).toBe('RESTRICTED');
    expect(bokChoy!.reasonSummary).toContain('120%');
  });

  it('flags "Cân nhắc" when farmer capital is lower than required investment', () => {
    const lowCapitalFarmer: FarmerProfile = {
      ...baseFarmer,
      availableCapitalVnd: 1000000,
    };
    const recs = generatePersonalizedRecommendations(lowCapitalFarmer, {}, defaultForecasts);
    const nonRestricted = recs.filter((r) => r.antiHerdStatus !== 'RESTRICTED');
    for (const r of nonRestricted) {
      expect(['CAN_NHAC', 'CHUA_NEN']).toContain(r.recommendationTag);
      if (r.recommendationTag === 'CAN_NHAC') {
        expect(r.reasonSummary).toContain('Vốn khả dụng chưa đủ');
      }
    }
  });

  it('generates Zalo weekly bulletin with short legal disclaimer', () => {
    const recs = generatePersonalizedRecommendations(baseFarmer, {}, defaultForecasts);
    const bulletin = generateZaloWeeklyBulletin(
      baseFarmer.coopId,
      baseFarmer.coopName,
      30,
      recs,
      '2026-W44',
      'Cảnh báo mưa to cuối tuần'
    );

    expect(bulletin.title).toContain('HTX Rau Sạch An Phú Tân');
    expect(bulletin.cropsSummary.length).toBeLessThanOrEqual(3);
    expect(bulletin.disclaimerText).toContain('tham khảo');
    expect(bulletin.weatherAlert).toContain('mưa');
  });

  it('passes Gate G5 compliance audit criteria', () => {
    const audit = auditGateG5();
    expect(audit.passed).toBe(true);
    expect(audit.comprehensionRate).toBeGreaterThanOrEqual(0.8);
    expect(audit.zaloConsecutiveWeeksSent).toBeGreaterThanOrEqual(4);
    expect(audit.zaloDeliveryFailureCount).toBe(0);
    expect(audit.legalVetted).toBe(true);
  });
});
